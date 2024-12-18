#! /bin/bash

for INSTANCE_NAME in vm1 vm2 vm3; do
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="n2-standard-2" \
        --network-interface=network=cc-network1,subnet=cc-subnet1 \
        --network-interface=network=cc-network2,subnet=cc-subnet2 \
        --tags="$TAG" \
        --boot-disk-size="$DISK_SIZE" \
        --image="$IMAGE_NAME"
done
