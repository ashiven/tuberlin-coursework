#! /bin/bash

#  create two VPC networks cc-network1 and cc-network2
gcloud compute networks create cc-network1 --subnet-mode=custom
gcloud compute networks create cc-network2 --subnet-mode=custom

# create subnets in cc-network1 and cc-network2
gcloud compute networks subnets create cc-subnet1 \
    --network=cc-network1 \
    --range=10.0.0.0/24 \
    --region=us-central1

gcloud compute networks subnets create cc-subnet2 \
    --network=cc-network2 \
    --range=10.0.1.0/24 \
    --region=us-central1

# create nested virtualization image
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
    --size="$DISK_SIZE" \
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

# create three VM instances of type n2-standard-2 named controller, compute1, and compute2
# with each of them having two NIC's connected to cc-subnet1 and cc-subnet2
for INSTANCE_NAME in controller compute1 compute2; do
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="n2-standard-2" \
        --network-interface subnet=cc-subnet1 \
        --network-interface subnet=cc-subnet2 \
        --tags="$TAG" \
        --boot-disk-size="$DISK_SIZE" \
        --image "$IMAGE_NAME"
done

# create firewall rules to allow TCP, ICMP, and UDP traffic
# for the ip ranges of cc-subnet1 and cc-subnet2 restricted to the cc tag
gcloud compute firewall-rules create allow-tcp-icmp-udp-cc-sn1 \
    --network=cc-subnet1 \
    --source-ranges=10.0.0.0/24 \
    --target-tags=cc \
    --allow=tcp,icmp,udp

gcloud compute firewall-rules create allow-tcp-icmp-udp-cc-sn2 \
    --network=cc-subnet2 \
    --source-ranges=10.0.0.1/24 \
    --target-tags=cc \
    --allow=tcp,icmp,udp

# create a firewall rule for cc-network1 that allows all TCP and ICMP traffic from external IPs to the cc tag
gcloud compute firewall-rules create allow-tcp-icmp-cc-nw1 \
    --network=cc-network1 \
    --direction=INGRESS \
    --source-ranges=0.0.0.0/0 \
    --target-tags=cc \
    --allow=tcp,icmp
