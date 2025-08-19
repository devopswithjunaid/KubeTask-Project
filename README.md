# KubeTask v1.0.0 - Production Task Management Application

A modern, scalable task management application built with React frontend and FastAPI backend, deployed on Google Cloud Platform (GCP) with production-grade infrastructure managed by Terraform.

## 🌟 Live Application

- **Frontend**: https://kubetask.volo.pk
- **Backend API**: https://kubetask.volo.pk/api
- **API Documentation**: https://kubetask.volo.pk/docs
- **Health Check**: https://kubetask.volo.pk/health

## 🏗️ Architecture Overview

KubeTask is deployed using a production-grade, Infrastructure as Code approach on Google Cloud Platform (GCP):

### Infrastructure Components

- **☸️ GKE Cluster**: Kubernetes orchestration with 2 nodes (e2-standard-2)
- **🗄️ In-Cluster PostgreSQL**: Database running inside Kubernetes
- **⚡ In-Cluster Redis**: Caching layer within the cluster
- **🌐 GCP Load Balancer**: HTTP(S) load balancing with static IP
- **🔧 Terraform**: Infrastructure as Code management
- **📊 Cloud Monitoring**: GKE and application monitoring
- **☁️ Cloudflare**: SSL termination, CDN, and DNS management
- **🔒 Workload Identity**: Secure GCP service access

### Application Features

- ✅ **Task Management**: Create, update, delete, and organize tasks
- ✅ **Real-time Updates**: Live task status synchronization
- ✅ **Responsive Design**: Mobile-first UI with modern React
- ✅ **RESTful API**: FastAPI backend with automatic documentation
- ✅ **Database Integration**: PostgreSQL with connection pooling
- ✅ **Caching Layer**: Redis for improved performance
- ✅ **Health Monitoring**: Built-in health checks and metrics
- ✅ **Auto-scaling**: Horizontal Pod Autoscaler for dynamic scaling

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Query** for state management

### Backend
- **FastAPI** with Python 3.11
- **SQLAlchemy** ORM with PostgreSQL
- **Alembic** for database migrations
- **Redis** for caching and sessions
- **Pydantic** for data validation
- **Uvicorn** ASGI server

### Infrastructure
- **GKE** - Google Kubernetes Engine
- **In-Cluster PostgreSQL** - Containerized database
- **In-Cluster Redis** - Containerized cache
- **GCP Load Balancer** - Application load balancing
- **Terraform** - Infrastructure as Code
- **Cloudflare** - SSL termination and CDN
- **Cloud Monitoring** - Observability and alerting

## 📁 Project Structure

```
KubeTask/
├── 🏗️ terraform/gcp/           # Infrastructure as Code
│   ├── main.tf                # Main Terraform configuration
│   ├── variables.tf           # Variable definitions
│   ├── terraform.tfvars       # Environment-specific values
│   ├── networking.tf          # VPC and networking setup
│   ├── gke.tf                # GKE cluster configuration
│   ├── iam.tf                # Service accounts and IAM
│   ├── monitoring.tf         # Monitoring and alerting
│   ├── outputs.tf            # Infrastructure outputs
│   └── README.md             # Terraform deployment guide
├── ☸️ k8s/gcp/               # Kubernetes manifests
│   ├── namespace.yaml        # Kubernetes namespaces
│   ├── configmap.yaml        # Application configuration
│   ├── secrets.yaml          # Secrets management
│   ├── database.yaml         # PostgreSQL deployment
│   ├── redis.yaml            # Redis deployment
│   ├── backend-deployment.yaml   # Backend deployment
│   ├── frontend-deployment.yaml  # Frontend deployment
│   ├── ingress.yaml          # Load balancer configuration
│   ├── hpa-monitoring.yaml   # Auto-scaling and monitoring
│   └── README-GCP.md         # Kubernetes deployment guide
├── 📱 frontend/              # React application
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── Dockerfile            # Container configuration
├── 🔧 backend/               # FastAPI application
│   ├── app/                  # Application code
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Container configuration
│   └── alembic/              # Database migrations
└── 📚 docs/                  # Documentation
    └── deployment/           # Deployment guides
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL (optional, can use Docker)
- Redis (optional, can use Docker)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abraizdev/KubeTask-Application.git
   cd KubeTask-Application
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Production Deployment

### Prerequisites

- **Google Cloud SDK** (`gcloud`) installed and configured
- **Terraform** >= 1.0 installed
- **kubectl** for Kubernetes management
- **Docker** for image building (optional)
- **GCP Project** with billing enabled

### Deployment Process

#### Phase 1: Infrastructure Deployment

1. **Configure Terraform:**
   ```bash
   cd terraform/gcp
   
   # Update terraform.tfvars with your values
   cp terraform.tfvars.example terraform.tfvars
   # Edit: project_id, domain_name, etc.
   ```

2. **Deploy Infrastructure:**
   ```bash
   # Initialize Terraform
   terraform init
   
   # Plan deployment
   terraform plan
   
   # Apply infrastructure
   terraform apply
   ```

3. **Verify Infrastructure:**
   ```bash
   # Check GKE cluster
   gcloud container clusters get-credentials kubetask-production-gke \
     --zone africa-south1-a --project YOUR_PROJECT_ID
   
   kubectl get nodes
   ```

#### Phase 2: Kubernetes Deployment

1. **Deploy Applications:**
   ```bash
   cd k8s/gcp
   
   # Follow the deployment guide
   # See k8s/gcp/README-GCP.md for detailed steps
   
   # Quick deployment:
   kubectl apply -f namespace.yaml
   kubectl apply -f configmap.yaml
   kubectl apply -f secrets.yaml
   kubectl apply -f database.yaml
   kubectl apply -f redis.yaml
   kubectl apply -f backend-deployment.yaml
   kubectl apply -f frontend-deployment.yaml
   kubectl apply -f ingress.yaml
   kubectl apply -f hpa-monitoring.yaml
   ```

2. **Configure DNS:**
   ```bash
   # Get static IP address
   gcloud compute addresses describe kubetask-production-static-ip --global
   
   # Add A record in Cloudflare:
   # kubetask.volo.pk → [STATIC_IP_ADDRESS]
   # Enable proxy (orange cloud) for SSL termination
   ```

3. **Verify Deployment:**
   ```bash
   kubectl get pods -n kubetask
   curl https://kubetask.volo.pk/health
   ```

### Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cloudflare    │────│  GCP Load        │────│   GKE Cluster   │
│   (SSL + CDN)   │    │  Balancer        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌────────────────────────────────┼────────────────────────────────┐
                       │                                │                                │
                ┌──────▼──────┐                 ┌──────▼──────┐                 ┌──────▼──────┐
                │  Frontend   │                 │   Backend   │                 │  Database   │
                │   Pods      │◄────────────────┤    Pods     │◄────────────────┤    & Redis  │
                │ (React App) │                 │ (FastAPI)   │                 │    Pods     │
                └─────────────┘                 └─────────────┘                 └─────────────┘
```

## 📊 Monitoring & Observability

### Google Cloud Monitoring
- **GKE Metrics**: Cluster and node performance
- **Application Metrics**: Pod CPU, memory, and network usage
- **Custom Metrics**: Application-specific monitoring
- **Uptime Monitoring**: Website availability checks

### Health Checks
- **Backend**: `/health` endpoint with database connectivity
- **Frontend**: Nginx health check
- **Database**: PostgreSQL connection monitoring
- **Redis**: Cache availability monitoring

### Auto-scaling
- **Horizontal Pod Autoscaler**: Scales based on CPU/memory usage
- **Cluster Autoscaler**: Scales GKE nodes based on demand
- **Thresholds**: CPU > 70%, Memory > 80%

## 🔒 Security Features

### Infrastructure Security
- **Private GKE Nodes**: No public IP addresses
- **Network Policies**: Restricted pod-to-pod communication
- **Workload Identity**: Secure GCP service access
- **VPC**: Isolated network environment
- **Firewall Rules**: Restrictive network access

### Application Security
- **HTTPS**: SSL/TLS encryption via Cloudflare
- **CORS**: Configured for specific origins
- **Input Validation**: Pydantic models for API validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **Secrets Management**: Kubernetes secrets for credentials

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# Database (in-cluster)
POSTGRES_SERVER=postgres.kubetask.svc.cluster.local
POSTGRES_USER=kubetask
POSTGRES_PASSWORD=<from-secret>
POSTGRES_DB=kubetask

# Redis (in-cluster)
REDIS_HOST=redis.kubetask.svc.cluster.local
REDIS_PORT=6379

# Application
SECRET_KEY=<from-secret>
```

#### Frontend Configuration
```bash
VITE_API_URL=https://kubetask.volo.pk/api
NODE_ENV=production
```

### Terraform Variables
```hcl
# terraform/gcp/terraform.tfvars
project_id       = "your-gcp-project-id"
region          = "africa-south1"
zone            = "africa-south1-a"
domain_name     = "kubetask.volo.pk"
gke_node_count  = 2
gke_machine_type = "e2-standard-2"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

### Integration Tests
```bash
# Test deployed application
curl https://kubetask.volo.pk/health
curl https://kubetask.volo.pk/api/docs
```

## 📈 Performance Optimization

### Current Performance
- **Frontend Load Time**: < 2s initial load
- **API Response Time**: < 200ms average
- **Database Query Time**: < 50ms average
- **Uptime Target**: 99.9% availability

### Optimization Features
- **Cloudflare CDN**: Global edge caching
- **Redis Caching**: Database query caching
- **Auto-scaling**: Dynamic resource allocation
- **Load Balancing**: Multi-pod traffic distribution
- **Connection Pooling**: Efficient database connections

## 🛠️ Maintenance & Operations

### Scaling Operations
```bash
# Scale application pods
kubectl scale deployment kubetask-backend --replicas=5 -n kubetask
kubectl scale deployment kubetask-frontend --replicas=3 -n kubetask

# Check auto-scaling status
kubectl get hpa -n kubetask
```

### Rolling Updates
```bash
# Update backend image
kubectl set image deployment/kubetask-backend \
  backend=abraiz/backend:v2 -n kubetask

# Check rollout status
kubectl rollout status deployment/kubetask-backend -n kubetask

# Rollback if needed
kubectl rollout undo deployment/kubetask-backend -n kubetask
```

### Infrastructure Updates
```bash
cd terraform/gcp

# Plan infrastructure changes
terraform plan

# Apply updates
terraform apply

# Check cluster status
kubectl get nodes
```

## 🆘 Troubleshooting

### Common Issues

1. **Pods Not Starting**
   ```bash
   kubectl get pods -n kubetask
   kubectl describe pod <pod-name> -n kubetask
   kubectl logs <pod-name> -n kubetask
   ```

2. **Database Connection Issues**
   ```bash
   kubectl logs deployment/postgres -n kubetask
   kubectl exec -it deployment/kubetask-backend -n kubetask -- env | grep POSTGRES
   ```

3. **Load Balancer Issues**
   ```bash
   kubectl describe ingress kubetask-ingress -n kubetask
   gcloud compute addresses describe kubetask-production-static-ip --global
   ```

4. **DNS/SSL Issues**
   ```bash
   nslookup kubetask.volo.pk
   curl -I https://kubetask.volo.pk
   ```

### Useful Commands
```bash
# Check all resources
kubectl get all -n kubetask

# Check resource usage
kubectl top pods -n kubetask
kubectl top nodes

# Check events
kubectl get events -n kubetask --sort-by='.lastTimestamp'

# Port forward for debugging
kubectl port-forward service/kubetask-backend 8000:8000 -n kubetask
```

## 🧹 Cleanup

### Remove Application Only
```bash
# Delete Kubernetes resources
kubectl delete namespace kubetask
```

### Remove Complete Infrastructure
```bash
# Delete Kubernetes resources first
kubectl delete namespace kubetask

# Destroy Terraform infrastructure
cd terraform/gcp
terraform destroy
```

## 💰 Cost Optimization

### Current Infrastructure Costs
- **GKE Cluster**: ~$73/month (management fee)
- **Compute Nodes**: ~$40-60/month (2 x e2-standard-2)
- **Load Balancer**: ~$18/month
- **Static IP**: ~$3/month
- **Total Estimated**: ~$134-154/month

### Cost Optimization Tips
- Use **preemptible nodes** for development
- Enable **cluster autoscaler** to scale down during low usage
- Monitor **resource requests/limits** to avoid over-provisioning
- Use **regional persistent disks** instead of zonal for better cost

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Test locally before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨💻 Author

**Abraiz Bashir** - [@abraizdev](https://github.com/abraizdev)

- 🌐 Website: [abraiz.dev](https://abraiz.dev)
- 📧 Email: muhammadabraiz489@gmail.com
- 💼 LinkedIn: [abraiz-bashir](https://linkedin.com/in/abraiz-bashir)

## 🙏 Acknowledgments

- Google Cloud Platform for robust cloud infrastructure
- Kubernetes community for container orchestration
- React and FastAPI communities for excellent frameworks
- Cloudflare for CDN and security services
- Terraform for Infrastructure as Code
- Open source contributors and maintainers

---

## 📚 Additional Resources

- **[Terraform Deployment Guide](terraform/gcp/README.md)** - Infrastructure setup
- **[Kubernetes Deployment Guide](k8s/gcp/README-GCP.md)** - Application deployment
- **[API Documentation](https://kubetask.volo.pk/docs)** - Backend API reference
- **[Google Cloud Documentation](https://cloud.google.com/docs)** - GCP services
- **[Kubernetes Documentation](https://kubernetes.io/docs/)** - K8s reference

---

**🎉 KubeTask v1.0.0 - Production-ready task management with enterprise-grade infrastructure!**

*Built with ❤️ using modern technologies and best practices for scalability, security, and maintainability.*
