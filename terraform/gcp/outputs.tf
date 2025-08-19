# Outputs for KubeTask GCP Infrastructure

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "vpc_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "vpc_id" {
  description = "VPC network ID"
  value       = google_compute_network.vpc.id
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

output "subnet_cidr" {
  description = "Subnet CIDR range"
  value       = google_compute_subnetwork.subnet.ip_cidr_range
}

output "gke_cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.primary.name
}

output "gke_cluster_location" {
  description = "GKE cluster location"
  value       = google_container_cluster.primary.location
}

output "gke_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "gke_cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = google_container_cluster.primary.master_auth.0.cluster_ca_certificate
  sensitive   = true
}

output "kubectl_config_command" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} --project ${var.project_id}"
}

output "static_ip_address" {
  description = "Static IP address"
  value       = google_compute_global_address.static_ip.address
}

output "static_ip_name" {
  description = "Static IP name"
  value       = google_compute_global_address.static_ip.name
}

output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "gke_service_account_email" {
  description = "GKE service account email"
  value       = google_service_account.gke_service_account.email
}

output "secret_manager_service_account_email" {
  description = "Secret Manager service account email"
  value       = google_service_account.secret_manager_sa.email
}

# Database outputs (conditional)
output "database_instance_name" {
  description = "Database instance name"
  value       = var.enable_database ? google_sql_database_instance.postgres[0].name : null
}

output "database_connection_name" {
  description = "Database connection name"
  value       = var.enable_database ? google_sql_database_instance.postgres[0].connection_name : null
}

output "database_private_ip" {
  description = "Database private IP"
  value       = var.enable_database ? google_sql_database_instance.postgres[0].private_ip_address : null
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = var.enable_database ? google_sql_database.database[0].name : null
}

output "database_user" {
  description = "Database user"
  value       = var.enable_database ? google_sql_user.database_user[0].name : null
}

output "db_password_secret_name" {
  description = "Database password secret name"
  value       = var.enable_database ? google_secret_manager_secret.db_password[0].secret_id : null
}

output "db_connection_secret_name" {
  description = "Database connection secret name"
  value       = var.enable_database ? google_secret_manager_secret.db_connection[0].secret_id : null
}

# Monitoring outputs (conditional)
output "monitoring_notification_channel" {
  description = "Monitoring notification channel"
  value       = var.enable_monitoring && var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : null
}

# Application URLs
output "application_urls" {
  description = "Application URLs"
  value = {
    frontend = "https://${var.domain_name}"
    backend  = "https://${var.domain_name}/api"
    docs     = "https://${var.domain_name}/docs"
    health   = "https://${var.domain_name}/health"
  }
}

output "backend_image" {
  description = "Backend Docker image"
  value       = var.backend_image
}

output "frontend_image" {
  description = "Frontend Docker image"
  value       = var.frontend_image
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    cluster_name     = google_container_cluster.primary.name
    static_ip        = google_compute_global_address.static_ip.address
    dns_setup        = "Point ${var.domain_name} to ${google_compute_global_address.static_ip.address}"
    kubectl_command  = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} --project ${var.project_id}"
    k8s_manifests    = "Apply Kubernetes manifests from k8s/gcp/ directory"
  }
}

output "security_info" {
  description = "Security configuration information"
  value = {
    private_nodes         = true
    network_policy        = true
    workload_identity     = false
    binary_authorization  = false
    secret_manager        = "Enabled for credential management"
  }
}

output "cost_estimation" {
  description = "Estimated monthly costs"
  value = {
    gke_cluster      = "~$73/month (cluster management fee)"
    compute_nodes    = "~$50-150/month (depending on node count and type)"
    cloud_sql        = "~$10-50/month (depending on tier)"
    load_balancer    = "~$18/month"
    static_ip        = "~$3/month"
    monitoring       = "Free tier available, then usage-based"
    redis           = "Not enabled"
    total_estimated = "~$184-394/month (varies by usage)"
  }
}
