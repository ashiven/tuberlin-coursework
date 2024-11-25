#!/bin/bash

KEY_PATH="./id_rsa"
USERNAME=$(awk '{print $3}' "${KEY_PATH}.pub")

gcloud compute instances list --filter="status=RUNNING" | tail -n +2 | while IFS= read -r line; do

INSTANCE_IP=$(echo "$line" | awk '{print $5}')
MACHINE_PREFIX=$(echo "$line" | awk '{print $1}' | cut -c1-2)

scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP:/home/$USERNAME/$MACHINE_PREFIX-native-results.csv" "./results/$MACHINE_PREFIX-native-results.csv"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP:/home/$USERNAME/$MACHINE_PREFIX-docker-results.csv" "./results/$MACHINE_PREFIX-docker-results.csv"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP:/home/$USERNAME/$MACHINE_PREFIX-kvm-results.csv" "./results/$MACHINE_PREFIX-kvm-results.csv"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP:/home/$USERNAME/$MACHINE_PREFIX-qemu-results.csv" "./results/$MACHINE_PREFIX-qemu-results.csv"

done
