#! /bin/bash

# create a new security group open-all
openstack security group create open-all

# allow all TCP, ICMP and UDP traffic
openstack security group rule create --protocol tcp --dst-port 1:65535 --remote-ip 0.0.0.0/0 open-all
openstack security group rule create --protocol tcp --dst-port 1:65535 --remote-ip 0.0.0.0/0 --egress open-all
openstack security group rule create --protocol icmp --remote-ip 0.0.0.0/0 open-all
openstack security group rule create --protocol icmp --remote-ip 0.0.0.0/0 --egress open-all
openstack security group rule create --protocol udp --dst-port 1:65535 --remote-ip 0.0.0.0/0 open-all
openstack security group rule create --protocol udp --dst-port 1:65535 --remote-ip 0.0.0.0/0 --egress open-all

# create an ssh key pair and import it to openstack
ssh-keygen -t rsa -b 2048 -f "./mykey" -N "" -q
openstack keypair create --public-key ./mykey.pub mykey

# copy the private key to controller vm and set it's permissions to 400
KEY_PATH=./id_rsa
USERNAME=$(awk '{print $3}' "${KEY_PATH}.pub")
ZONE=europe-west10-a
CONTROLLER_IP=$(gcloud compute instances describe controller --zone=$ZONE --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

scp -i "$KEY_PATH" -o StrictHostKeyChecking=no ./mykey "$USERNAME@$CONTROLLER_IP:/home/$USERNAME/mykey"
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$CONTROLLER_IP" "chmod 400 /home/$USERNAME/mykey"

# create a new instance with the open-all security group and the mykey ssh key
openstack server create \
    --flavor m1.medium \
    --image ubuntu-16.04 \
    --nic net-id=admin-net \
    --security-group open-all \
    --key-name mykey \
    openstack-instance

# create a floating ip and associate it with the new instance
FLOATING_IP=$(openstack floating ip create public --format="value" -c "floating_ip_address")
openstack server add floating ip openstack-instance "$FLOATING_IP"
