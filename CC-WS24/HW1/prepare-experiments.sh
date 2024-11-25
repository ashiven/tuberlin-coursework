#!/bin/bash

KEY_PATH="./id_rsa"
USERNAME=$(awk '{print $3}' "${KEY_PATH}.pub")

gcloud compute instances list --filter="status=RUNNING" --format="get(networkInterfaces[0].accessConfigs[0].natIP)" | while IFS= read -r line; do
INSTANCE_IP=$(echo "$line" | awk '{print $1}')

# copy over the benchmark script and execution script and Dockerfile
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no ./benchmark.sh "$USERNAME@$INSTANCE_IP:/home/$USERNAME/benchmark.sh"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no ./execute-experiments.sh "$USERNAME@$INSTANCE_IP:/home/$USERNAME/execute-experiments.sh"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no ./Dockerfile "$USERNAME@$INSTANCE_IP:/home/$USERNAME/Dockerfile"

# run preparations (in the background)
(
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP" <<'EOF'
# ------UPDATE AND DOWNLOAD NECESSARY TOOLS------
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager cloud-image-utils docker.io


# ------DOWNLOAD AND CREATE IMAGES FOR THE VMS------
UBUNTU_IMAGE_URL="https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img"
IMAGE_FILE_NAME="jammy-server-cloudimg-amd64.img"
sudo curl -o $IMAGE_FILE_NAME $UBUNTU_IMAGE_URL

sudo qemu-img create -b $IMAGE_FILE_NAME -f qcow2 -F qcow2 kvm.img 10G
sudo qemu-img create -b $IMAGE_FILE_NAME -f qcow2 -F qcow2 qemu.img 10G


# ------CREATE SSH KEYPAIR AND ISO FILE TO CONFIGURE THE VMS------
ssh-keygen -t rsa -b 2048 -f ./id_rsa -N "" -q
PUBLIC_KEY=$(cat ./id_rsa.pub)

cat <<EOT > user-data
#cloud-config
users:
  - default
  - name: ccuser
    ssh_authorized_keys:
      - $PUBLIC_KEY
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash
    
ssh_authorized_keys:
  - $PUBLIC_KEY
EOT

cat <<EOT > meta-data
instance-id: ccvm
local-hostname: ccvm
EOT

sudo genisoimage -output cidata.iso -V cidata -r -J user-data meta-data


# ------LAUNCH THE KVM-VM AND THE QEMU-VM------
USERNAME=$(whoami)
sudo chmod o+rx /home/$USERNAME

MEMORY="2048"
CPU_CORES=$(nproc) 

sudo virt-install \
    --name kvm-vm \
    --virt-type kvm \
    --memory "$MEMORY" \
    --vcpus "$CPU_CORES" \
    --disk path=kvm.img,format=qcow2 \
    --disk path=cidata.iso,device=cdrom \
    --os-variant ubuntu22.04 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=0.0.0.0 \
    --import \
    --noautoconsole

sudo virt-install \
    --name qemu-vm \
    --virt-type qemu \
    --memory "$MEMORY" \
    --vcpus "$CPU_CORES" \
    --disk path=qemu.img,format=qcow2 \
    --disk path=cidata.iso,device=cdrom \
    --os-variant ubuntu22.04 \
    --network bridge=virbr0,model=virtio \
    --graphics vnc,listen=0.0.0.0 \
    --import \
    --noautoconsole
    
sleep 150

    
# ------COPY THE BENCHMARK SCRIPT TO THE VMS------
sudo virsh net-dhcp-leases default | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | while read -r ip; do
scp -i ./id_rsa -o StrictHostKeyChecking=no ./benchmark.sh "ccuser@$ip:/home/ccuser/benchmark.sh"
done


# ------CREATE AND LAUNCH A DOCKER CONTAINER------
sudo systemctl start docker
sudo systemctl enable docker

sudo docker build -t benchmark-image .
sudo docker run -d --name benchmark-container benchmark-image


# ------ADD CRONJOB FOR EXECUTION OF BENCHMARKS------
chmod +x /home/$USERNAME/benchmark.sh
chmod +x /home/$USERNAME/execute-experiments.sh

echo "*/30 * * * * /bin/bash /home/$USERNAME/execute-experiments.sh" | crontab -
EOF
) &

done
