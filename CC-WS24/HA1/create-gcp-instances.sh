#!/bin/bash


# ------optionally create new ssh keypair and upload it------
if [ -f "./id_rsa.pub" ]; then
  echo "id_rsa.pub already exists. Skipping key generation steps."
else
  KEY_PATH="./id_rsa"

  ssh-keygen -t rsa -b 2048 -f "$KEY_PATH" -N "" -q
  PUBLIC_KEY=$(awk '{print $1 " " $2}' "${KEY_PATH}.pub")
  USERNAME=$(awk '{print $3}' "${KEY_PATH}.pub")

  gcloud compute project-info add-metadata \
    --metadata ssh-keys="${USERNAME}:${PUBLIC_KEY}"
fi


# ------create firewall rule------
gcloud compute firewall-rules create allow-ssh-icmp-cc \
  --network default \
  --action ALLOW \
  --direction INGRESS \
  --priority 1000 \
  --target-tags cc \
  --source-ranges 0.0.0.0/0 \
  --rules tcp:22,icmp


# ------enable nested virtualization via vm image------
DISK_NAME="nested-vm-disk"
DISK_TYPE="pd-standard"
DISK_SIZE="100GB"
IMAGE_NAME="nested-ubuntu-2204"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
TAG="cc"
ZONE="us-central1-a"

gcloud compute disks create "$DISK_NAME" \
  --type="$DISK_TYPE" \
  --zone="$ZONE" \
  --image-family="$IMAGE_FAMILY" \
  --image-project="$IMAGE_PROJECT"
  
gcloud compute images create "$IMAGE_NAME" \
  --source-disk "$DISK_NAME" \
  --source-disk-zone "$ZONE" \
  --licenses "https://www.googleapis.com/compute/v1/projects/vm-options/global/licenses/enable-vmx"
  
gcloud compute disks delete "$DISK_NAME" \
  --zone="$ZONE" \
  --quiet


# ------create three vms from the vm image------
for MACHINE_TYPE in c3-standard-4 c4-standard-4 n4-standard-4; do
  INSTANCE_NAME="${MACHINE_TYPE}-instance-$(date +%s)"

  gcloud compute instances create "$INSTANCE_NAME" \
    --zone="$ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --tags="$TAG" \
    --boot-disk-size="$DISK_SIZE" \
    --image "$IMAGE_NAME"
done
