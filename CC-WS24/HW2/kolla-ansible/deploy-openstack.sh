#!/bin/bash

# Generate all openstack passwords and keys and copy the file to working dir (this assumes a venv named 'venv'; change if required)
# kolla-genpwd -p ../venv/share/kolla-ansible/etc_examples/kolla/passwords.yml && cp ../venv/share/kolla-ansible/etc_examples/kolla/passwords.yml ./

# Prepare VMs for kolla-ansible
ansible-playbook -i ./multinode ./pre-bootstrap.yml | tee ../logs/pre-bootstrap.log

# Prepare VMs for OpenStack installation
kolla-ansible bootstrap-servers --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode | tee ../logs/bootstrap-servers.log

# Fix a common bug in /etc/hosts (this is not an idempotent operation! only execute this once)
ansible-playbook -i ./multinode ./fix-hosts-file.yml

# Pull the new images on target hosts (optional operation, but recommended)
kolla-ansible pull --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode

# Run prechecks to verify that the VMs are ready for OpenStack deployment
kolla-ansible prechecks --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode --skip-tags haproxy | tee ../logs/prechecks.log

# Deploy OpenStack
kolla-ansible deploy --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode | tee ../logs/deploy.log

# create ./admin-rc.sh (you might need to change the ownership of ./admin-rc.sh)
kolla-ansible post-deploy --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode

# Destroy OpenStack deployment
# kolla-ansible destroy --passwords ./passwords.yml --configdir "$(readlink -e ./)" --inventory ./multinode --yes-i-really-really-mean-it
