# Service Accounts and IAM Configuration

# Service Account for GKE nodes
resource "google_service_account" "gke_service_account" {
  account_id   = "${var.application_name}-gke-sa"
  display_name = "GKE Service Account for ${var.application_name}"
  project      = var.project_id
}

# Service Account for Secret Manager
resource "google_service_account" "secret_manager_sa" {
  account_id   = "${var.application_name}-secrets-sa"
  display_name = "Secret Manager Service Account for ${var.application_name}"
  project      = var.project_id
}

# Vertex AI Service Account
resource "google_service_account" "vertex_ai_sa" {
  account_id   = "vertex-ai-sa"
  display_name = "vertex-ai-sa"
  project      = var.project_id
}

# IAM roles for GKE service account
resource "google_project_iam_member" "gke_service_account_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
    "roles/storage.objectViewer"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gke_service_account.email}"
}
