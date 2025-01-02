#! /bin/bash

for INSTANCE_NAME in vm1 vm2 vm3; do
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone=europe-west10-a \
        --machine-type=n2-standard-2 \
        --tags=cc \
        --boot-disk-size=100GB \
        --image-project=ubuntu-os-cloud \
        --image-family=ubuntu-2204-lts
done

gcloud compute firewall-rules create allow-tcp-icmp-cc \
    --network default \
    --target-tags cc \
    --source-ranges 0.0.0.0/0 \
    --allow tcp,icmp
