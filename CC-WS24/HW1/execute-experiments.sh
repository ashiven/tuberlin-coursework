#!/bin/bash


MACHINE_PREFIX=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/machine-type | awk -F'/' '{print $NF}' | cut -c1-2)


# 1) execute benchmark script on native platform and append result to file
if [ ! -f "${MACHINE_PREFIX}-native-results.csv" ]; then
    echo "time,cpu,mem,diskRand,diskSeq" > "${MACHINE_PREFIX}-native-results.csv"
fi

sudo sh benchmark.sh >> "${MACHINE_PREFIX}-native-results.csv"


# 2) execute benchmark on docker container and append the result
if [ ! -f "${MACHINE_PREFIX}-docker-results.csv" ]; then
    echo "time,cpu,mem,diskRand,diskSeq" > "${MACHINE_PREFIX}-docker-results.csv"
fi

sudo docker exec benchmark-container /benchmark.sh >> "${MACHINE_PREFIX}-docker-results.csv"


# 3) execute the benchmark on kvm vm and append the result
if [ ! -f "${MACHINE_PREFIX}-kvm-results.csv" ]; then
    echo "time,cpu,mem,diskRand,diskSeq" > "${MACHINE_PREFIX}-kvm-results.csv"
fi

KVM_MAC=$(sudo virsh dumpxml kvm-vm | grep -oP "mac address='([a-f0-9:]+)'" | cut -d"'" -f2)
KVM_IP=$(sudo virsh net-dhcp-leases default | grep $KVM_MAC | awk '{print $5}' | cut -d'/' -f1)

ssh -i ./id_rsa -o StrictHostKeyChecking=no "ccuser@${KVM_IP}" 'sudo sh /home/ccuser/benchmark.sh' >> "${MACHINE_PREFIX}-kvm-results.csv"


# 4) execute the benchmark on qemu vm and append the result
if [ ! -f "${MACHINE_PREFIX}-qemu-results.csv" ]; then
    echo "time,cpu,mem,diskRand,diskSeq" > "${MACHINE_PREFIX}-qemu-results.csv"
fi

QEMU_MAC=$(sudo virsh dumpxml qemu-vm | grep -oP "mac address='([a-f0-9:]+)'" | cut -d"'" -f2)
QEMU_IP=$(sudo virsh net-dhcp-leases default | grep $QEMU_MAC | awk '{print $5}' | cut -d'/' -f1)

ssh -i ./id_rsa -o StrictHostKeyChecking=no "ccuser@${QEMU_IP}" 'sudo sh /home/ccuser/benchmark.sh' >> "${MACHINE_PREFIX}-qemu-results.csv"
