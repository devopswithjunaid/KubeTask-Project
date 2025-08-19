# KubeTask Google Cloud Platform (GCP) Kubernetes Deployment Guide

This guide will help you deploy the KubeTask application to your GKE cluster **after** the Terraform infrastructure has been provisioned.

## 🏗️ Architecture Overview

The GCP deployment includes:
- **GKE Cluster**: Managed Kubernetes cluster with Workload Identity
- **In-Cluster PostgreSQL**: Database running inside Kubernetes
- **In-Cluster Redis**: Cache running inside Kubernetes  
- **GCP Load Balancer**: HTTP(S) load balancing with static IP
- **Cloudflare SSL**: SSL termination handled by Cloudflare
- **Network Policies**: Pod-to-pod communication security

## 📋 Prerequisites

### ✅ Infrastructure Requirements
**IMPORTANT**: Before proceeding, ensure your Terraform infrastructure is deployed:

1. **Terraform Applied**: Run `terraform apply` in `/terraform/gcp/` directory
2. **GKE Cluster Ready**: Cluster `kubetask-production-gke` is running
3. **Static IP Reserved**: `kubetask-production-static-ip` is allocated
4. **DNS Configured**: Domain points to the static IP address

### Required Tools
- [kubectl](https://kubernetes.io/docs/tasks/tools/) - Kubernetes CLI
- [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) - GCP CLI
- [Docker](https://docs.docker.com/get-docker/) - For building images (optional)

## 🚀 Quick Deployment

### 1. Connect to Your GKE Cluster

After Terraform deployment, connect to your cluster:

```bash
# Get cluster credentials (replace with your project ID)
gcloud container clusters get-credentials kubetask-production-gke \
    --zone africa-south1-a \
    --project YOUR_PROJECT_ID

# Verify connection
kubectl get nodes
```

### 2. Configure Environment Variables

```bash
export PROJECT_ID="your-gcp-project-id"
export CLUSTER_NAME="kubetask-production-gke"
export REGION="africa-south1"
export DOMAIN="kubetask.volo.pk"
export STATIC_IP_NAME="kubetask-production-static-ip"
```

### 3. Deploy Kubernetes Resources

Deploy in the following order:

```bash
cd k8s/gcp

# 1. Create namespace and basic resources
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# 2. Deploy database and cache
kubectl apply -f database.yaml
kubectl apply -f redis.yaml

# Wait for database and redis to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n kubetask --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n kubetask --timeout=300s

# 3. Deploy applications
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Wait for applications to be ready
kubectl wait --for=condition=ready pod -l component=backend -n kubetask --timeout=300s
kubectl wait --for=condition=ready pod -l component=frontend -n kubetask --timeout=300s

# 4. Deploy ingress and monitoring
kubectl apply -f ingress.yaml
kubectl apply -f hpa-monitoring.yaml
```

### 4. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n kubetask

# Check services
kubectl get services -n kubetask

# Check ingress
kubectl get ingress -n kubetask

# Get the load balancer IP (should match your static IP)
kubectl get ingress kubetask-ingress -n kubetask -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## 📁 Deployment Order & Dependencies

### Phase 1: Foundation
```bash
kubectl apply -f namespace.yaml      # Creates kubetask namespace
kubectl apply -f configmap.yaml     # Application configuration
kubectl apply -f secrets.yaml       # Database credentials, JWT secrets
```

### Phase 2: Data Layer
```bash
kubectl apply -f database.yaml      # PostgreSQL database
kubectl apply -f redis.yaml         # Redis cache
```
**Wait**: Ensure database and Redis pods are ready before proceeding.

### Phase 3: Application Layer
```bash
kubectl apply -f backend-deployment.yaml   # FastAPI backend
kubectl apply -f frontend-deployment.yaml  # React frontend
```
**Wait**: Ensure application pods are ready before proceeding.

### Phase 4: Traffic & Monitoring
```bash
kubectl apply -f ingress.yaml       # Load balancer configuration
kubectl apply -f hpa-monitoring.yaml # Auto-scaling and monitoring
```

## 🔧 Configuration Updates Required

### 1. Update Image References

If using custom images, update the image references in:

**backend-deployment.yaml:**
```yaml
containers:
- name: backend
  image: gcr.io/YOUR_PROJECT_ID/kubetask-backend:latest  # Update this
```

**frontend-deployment.yaml:**
```yaml
containers:
- name: frontend
  image: gcr.io/YOUR_PROJECT_ID/kubetask-frontend:latest  # Update this
```

### 2. Update Domain Configuration

**ingress.yaml:**
```yaml
spec:
  rules:
  - host: your-domain.com  # Update this
```

### 3. Update Static IP Reference

The ingress already references the Terraform-created static IP:
```yaml
annotations:
  kubernetes.io/ingress.global-static-ip-name: "kubetask-production-static-ip"
```

## 🗄️ Database Setup

### In-Cluster PostgreSQL (Default)

The deployment uses an in-cluster PostgreSQL database:

- **Service**: `postgres.kubetask.svc.cluster.local`
- **Port**: `5432`
- **Database**: `kubetask`
- **User**: `kubetask`
- **Password**: Stored in `kubetask-database-secret`

### Database Initialization

The backend automatically creates tables on startup. No manual database setup required.

### Accessing Database (for debugging)

```bash
# Port forward to database
kubectl port-forward service/postgres 5432:5432 -n kubetask

# Connect with psql (in another terminal)
PGPASSWORD=your_password psql -h localhost -U kubetask -d kubetask
```

## 🔴 Redis Setup

### In-Cluster Redis (Default)

The deployment uses an in-cluster Redis cache:

- **Service**: `redis.kubetask.svc.cluster.local`
- **Port**: `6379`
- **No authentication** (internal cluster communication)

### Accessing Redis (for debugging)

```bash
# Port forward to Redis
kubectl port-forward service/redis 6379:6379 -n kubetask

# Connect with redis-cli (in another terminal)
redis-cli -h localhost -p 6379
```

## 📊 Monitoring and Scaling

### Horizontal Pod Autoscaler (HPA)

Auto-scaling is configured for both services:

**Backend HPA:**
- Min replicas: 2
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

**Frontend HPA:**
- Min replicas: 2
- Max replicas: 6
- CPU threshold: 70%
- Memory threshold: 80%

### Check HPA Status

```bash
# View HPA status
kubectl get hpa -n kubetask

# Detailed HPA information
kubectl describe hpa kubetask-backend-hpa -n kubetask
kubectl describe hpa kubetask-frontend-hpa -n kubetask
```

### Monitoring with Google Cloud

Access monitoring through:
1. [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Kubernetes Engine > Workloads**
3. Select your cluster to view metrics

## 🔒 Security Features

### Network Policies
- Pod-to-pod communication is restricted
- Only necessary ports are exposed
- Ingress traffic is controlled

### Workload Identity
- Enabled on the GKE cluster (via Terraform)
- Secure access to GCP services without service account keys

### Secrets Management
- Database credentials stored in Kubernetes secrets
- JWT secrets properly encoded
- No hardcoded credentials in manifests

## 🛠️ Troubleshooting

### Common Issues

#### 1. Pods Not Starting
```bash
# Check pod status
kubectl get pods -n kubetask

# Describe problematic pod
kubectl describe pod POD_NAME -n kubetask

# Check logs
kubectl logs POD_NAME -n kubetask
```

#### 2. Database Connection Issues
```bash
# Check database pod
kubectl logs deployment/postgres -n kubetask

# Check backend logs for database errors
kubectl logs deployment/kubetask-backend -n kubetask
```

#### 3. Load Balancer Not Ready
```bash
# Check ingress status
kubectl describe ingress kubetask-ingress -n kubetask

# Verify static IP is assigned
gcloud compute addresses describe kubetask-production-static-ip --global
```

#### 4. Image Pull Errors
```bash
# If using custom images, ensure they're pushed to GCR
gcloud container images list --repository=gcr.io/YOUR_PROJECT_ID

# Check if cluster has access to pull images
kubectl describe pod POD_NAME -n kubetask
```

### Useful Commands

```bash
# Check all resources in namespace
kubectl get all -n kubetask

# Check resource usage
kubectl top pods -n kubetask
kubectl top nodes

# Scale deployments manually
kubectl scale deployment kubetask-backend --replicas=3 -n kubetask

# Update image (rolling update)
kubectl set image deployment/kubetask-backend \
  backend=gcr.io/YOUR_PROJECT_ID/kubetask-backend:v2 -n kubetask

# Port forward for local testing
kubectl port-forward service/kubetask-frontend 8080:80 -n kubetask
kubectl port-forward service/kubetask-backend 8000:8000 -n kubetask

# Check events for debugging
kubectl get events -n kubetask --sort-by='.lastTimestamp'
```

## 🔄 Updates and Maintenance

### Rolling Updates

Update application images:

```bash
# Update backend
kubectl set image deployment/kubetask-backend \
  backend=abraiz/backend:v2 -n kubetask

# Update frontend  
kubectl set image deployment/kubetask-frontend \
  frontend=abraiz/frontend:v2 -n kubetask

# Check rollout status
kubectl rollout status deployment/kubetask-backend -n kubetask
kubectl rollout status deployment/kubetask-frontend -n kubetask
```

### Rollback

If something goes wrong:

```bash
# Rollback to previous version
kubectl rollout undo deployment/kubetask-backend -n kubetask

# Check rollout history
kubectl rollout history deployment/kubetask-backend -n kubetask
```

### Configuration Updates

Update ConfigMap or Secrets:

```bash
# Apply updated configuration
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# Restart deployments to pick up changes
kubectl rollout restart deployment/kubetask-backend -n kubetask
kubectl rollout restart deployment/kubetask-frontend -n kubetask
```

## 🧹 Cleanup

### Remove Application Only (Keep Infrastructure)
```bash
# Delete Kubernetes resources
kubectl delete namespace kubetask

# This preserves the GKE cluster and other Terraform-managed resources
```

### Remove Everything (Including Infrastructure)
```bash
# Delete Kubernetes resources first
kubectl delete namespace kubetask

# Then destroy Terraform infrastructure
cd ../../terraform/gcp
terraform destroy
```

## 📋 Pre-Deployment Checklist

Before deploying to a new GCP account:

### ✅ Terraform Infrastructure
- [ ] Terraform applied successfully
- [ ] GKE cluster is running
- [ ] Static IP is reserved
- [ ] DNS points to static IP
- [ ] kubectl can connect to cluster

### ✅ Configuration Updates
- [ ] Update domain in `ingress.yaml`
- [ ] Update image references (if using custom images)
- [ ] Generate new secrets in `secrets.yaml`
- [ ] Update project ID references

### ✅ Access Requirements
- [ ] `gcloud` CLI authenticated
- [ ] `kubectl` configured for cluster
- [ ] Docker configured (if building images)

## 🆘 Support

If you encounter issues:

1. **Check Prerequisites**: Ensure Terraform infrastructure is deployed
2. **Verify Connectivity**: Confirm kubectl can access the cluster
3. **Check Logs**: Use kubectl logs to debug issues
4. **Review Events**: Check Kubernetes events for error details
5. **Validate Configuration**: Ensure all placeholders are updated

### Getting Help

```bash
# Cluster information
kubectl cluster-info

# Node status
kubectl get nodes -o wide

# All resources in namespace
kubectl get all -n kubetask -o wide

# Recent events
kubectl get events -n kubetask --sort-by='.lastTimestamp' | tail -20
```

---

## 🎉 Success!

Once deployed successfully, your KubeTask application will be available at:

- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api`
- **API Documentation**: `https://your-domain.com/docs`
- **Health Check**: `https://your-domain.com/health`

The application is now running on your GKE cluster with:
- ✅ Auto-scaling enabled
- ✅ Load balancing configured
- ✅ SSL termination via Cloudflare
- ✅ Monitoring and logging active
- ✅ High availability with multiple replicas

**Your KubeTask application is production-ready on Google Cloud Platform!**
