import logging
import os
import random
import time

import kopf
import requests
import yaml
from kubernetes import client, config

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Constants
CARBON_INTENSITY_URL = "https://wj38sqbq69.execute-api.us-east-1.amazonaws.com/Prod/row"
DEFAULT_SCHEDULING_PERIOD = 10
WORKLOAD_TEMPLATE = "workload.yaml"
NODES_TO_REGIONS = {
    "k8s-node-1": "DE",
    "k8s-node-2": "ERCOT",
    "k8s-node-3": "NL",
}

# Load kubeconfig
config.load_kube_config()
k8s_api = client.CoreV1Api()


def get_carbon_intensity():
    """Fetch carbon intensity values for regions."""
    try:
        response = requests.get(CARBON_INTENSITY_URL)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"Failed to fetch carbon intensity: {e}")
        return {}


def get_lowest_intensity_node(carbon_data):
    """Determine the node with the lowest carbon intensity."""
    min_intensity = float("inf")
    best_node = None

    for node, region in NODES_TO_REGIONS.items():
        intensity = carbon_data.get(region, float("inf"))
        if intensity < min_intensity:
            min_intensity = intensity
            best_node = node

    return best_node, min_intensity


def generate_unique_workload_name():
    """Generate a unique name for the workload."""
    return f"workload-{int(time.time())}"


def create_pod_spec(workload_name, node_name, execution_time):
    """Read the workload template and modify it for scheduling."""
    with open(WORKLOAD_TEMPLATE, "r") as file:
        pod_spec = yaml.safe_load(file)

    pod_spec["metadata"]["name"] = workload_name
    pod_spec["metadata"]["labels"]["app"] = workload_name
    pod_spec["spec"]["affinity"] = {
        "nodeAffinity": {
            "requiredDuringSchedulingIgnoredDuringExecution": {
                "nodeSelectorTerms": [
                    {
                        "matchExpressions": [
                            {
                                "key": "kubernetes.io/hostname",
                                "operator": "In",
                                "values": [node_name],
                            }
                        ]
                    }
                ]
            }
        }
    }
    pod_spec["spec"]["containers"][0]["command"][
        -1
    ] = f"sysbench cpu --cpu-max-prime=10000 --time={execution_time} run"

    return pod_spec


def deploy_pod(pod_spec):
    """Deploy the Pod to the Kubernetes cluster."""
    try:
        k8s_api.create_namespaced_pod(namespace="default", body=pod_spec)
        logging.info(f"Pod {pod_spec['metadata']['name']} deployed successfully.")
    except Exception as e:
        logging.error(f"Failed to deploy pod: {e}")


@kopf.on.create("pods")
def monitor_pod_creation(spec, status, meta, **kwargs):
    """Monitor the actual placement of the Pod."""
    pod_name = meta["name"]
    node_name = status.get("hostIP", "unknown")
    logging.info(f"Pod {pod_name} placed on node: {node_name}")


def main():
    scheduling_period = int(os.getenv("SCHEDULING_PERIOD", DEFAULT_SCHEDULING_PERIOD))
    carbon_aware = os.getenv("CARBON_AWARE", "true").lower() == "true"

    while True:
        # Fetch carbon intensity data
        carbon_data = get_carbon_intensity()
        if not carbon_data:
            logging.warning("No carbon data available. Skipping scheduling cycle.")
            time.sleep(scheduling_period)
            continue

        # Determine the best node
        if carbon_aware:
            logging.info("Running carbon-aware placement strategy.")
            best_node, intensity = get_lowest_intensity_node(carbon_data)
        else:
            logging.info("Running default scheduling strategy (no carbon-awareness).")
            best_node, intensity = random.choice(list(NODES_TO_REGIONS.keys())), "N/A"

        if not best_node:
            logging.warning("No suitable node found. Skipping scheduling cycle.")
            time.sleep(scheduling_period)
            continue

        # Generate workload name and execution time
        workload_name = generate_unique_workload_name()
        execution_time = random.randint(20, 60)

        logging.info(
            f"New workload: {workload_name}, Carbon Intensity: {intensity}, Recommended Node: {best_node}"
        )

        # Create pod specification
        pod_spec = create_pod_spec(workload_name, best_node, execution_time)

        # Deploy the pod
        deploy_pod(pod_spec)

        # Wait for the next scheduling cycle
        time.sleep(scheduling_period)


if __name__ == "__main__":
    main()
