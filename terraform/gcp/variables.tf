# Variables for KubeTask GCP Infrastructure

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "n8n-workflow-461719"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "africa-south1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "africa-south1-a"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "application_name" {
  description = "Application name"
  type        = string
  default     = "kubetask"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "kubetask.volo.pk"
}

variable "backend_image" {
  description = "Backend Docker image"
  type        = string
  default     = "abraiz/backend:latest"
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
  default     = "abraiz/frontend:latest"
}

variable "enable_monitoring" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = false  # Temporarily disable to avoid alert policy issues
}

variable "enable_database" {
  description = "Enable Cloud SQL database"
  type        = bool
  default     = true
}

variable "enable_redis" {
  description = "Enable Redis instance"
  type        = bool
  default     = false
}

variable "notification_email" {
  description = "Email for monitoring notifications"
  type        = string
  default     = ""
}

variable "gke_node_count" {
  description = "Number of GKE nodes"
  type        = number
  default     = 2  # Updated to match current infrastructure (2 nodes)
}

variable "gke_machine_type" {
  description = "GKE node machine type"
  type        = string
  default     = "e2-standard-2"  # Updated to match current infrastructure
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 20
}
