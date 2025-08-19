# KubeTask GCP Terraform Configuration

This directory contains the Terraform configuration to recreate the KubeTask infrastructure on Google Cloud Platform.

## Infrastructure Components

- **GKE Cluster**: `kubetask-production-gke` in `africa-south1-a`
- **Cloud SQL**: PostgreSQL 15 database with private networking
- **VPC Network**: Custom VPC with subnets and firewall rules
- **Static IP**: `34.107.193.61` for load balancer
- **Service Accounts**: For GKE and Secret Manager access
- **Monitoring**: Dashboards, alerts, and uptime checks
- **Secret Manager**: Database credentials and connection strings

## Prerequisites

1. **GCP Authentication**: Ensure you're authenticated with GCP
   ```bash
   gcloud auth login
   gcloud config set project n8n-workflow-461719
   ```

2. **Terraform**: Install Terraform >= 1.0

## Deployment

1. **Initialize Terraform**:
   ```bash
   cd terraform/gcp
   terraform init
   ```

2. **Review the plan**:
   ```bash
   terraform plan
   ```

3. **Apply the configuration**:
   ```bash
   terraform apply
   ```

## Important Notes

- The infrastructure is already running on GCP
- This configuration matches the **live** production infrastructure and can be used for drift detection or disaster recovery
- The static IP `34.107.193.61` is already allocated and in use
- Domain `kubetask.volo.pk` should point to the static IP

## Configuration Files

- `main.tf`: Provider configuration and API enablement
- `variables.tf`: Input variables and defaults
- `outputs.tf`: Output values for other systems
- `networking.tf`: VPC, subnets, firewall rules, and NAT
- `gke.tf`: GKE cluster and node pool configuration
- `database.tf`: Cloud SQL PostgreSQL setup
- `iam.tf`: Service accounts and IAM roles
- `monitoring.tf`: Monitoring dashboards and alerts
- `secrets.tf`: Secret Manager configuration
- `terraform.tfvars`: Environment-specific values

## Post-Deployment

After applying Terraform, configure kubectl:
```bash
gcloud container clusters get-credentials kubetask-production-gke --region africa-south1 --project n8n-workflow-461719
```

Then apply Kubernetes manifests from the `k8s/gcp/` directory.
