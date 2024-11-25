#!/bin/bash

KEY_PATH="./id_rsa"
USERNAME=$(awk '{print $3}' "${KEY_PATH}.pub")

gcloud compute instances list --filter="status=RUNNING" --format="get(networkInterfaces[0].accessConfigs[0].natIP)" | while IFS= read -r line; do

INSTANCE_IP=$(echo "$line" | awk '{print $1}')

scp -i "$KEY_PATH" -o StrictHostKeyChecking=no ./benchmark.sh "$USERNAME@$INSTANCE_IP:/home/$USERNAME/benchmark.sh"

(
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USERNAME@$INSTANCE_IP" <<'EOF'
for i in {1..48}; do
    sudo sh execute-experiments.sh
done
EOF
) &

done
