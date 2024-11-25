#!/bin/bash

gcloud compute instances list --format="value(name,zone)" | while IFS= read -r line; do
    INSTANCE_NAME=$(echo "$line" | awk '{print $1}')
    INSTANCE_ZONE=$(echo "$line" | awk '{print $2}')
    gcloud compute instances delete "$INSTANCE_NAME" --zone="$INSTANCE_ZONE" --quiet
done
