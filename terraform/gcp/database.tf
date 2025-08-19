# Cloud SQL PostgreSQL Database Configuration

# Cloud SQL Database Instance
resource "google_sql_database_instance" "postgres" {
  count = var.enable_database ? 1 : 0

  name             = "${var.application_name}-${var.environment}-postgres"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id

  deletion_protection = false

  settings {
    tier                        = var.db_tier
    activation_policy          = "ALWAYS"
    availability_type          = "ZONAL"
    disk_size                  = var.db_disk_size
    disk_type                  = "PD_HDD"
    disk_autoresize           = true
    disk_autoresize_limit     = 0
    pricing_plan              = "PER_USE"
    edition                   = "ENTERPRISE"

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
    }

    maintenance_window {
      day          = 7
      hour         = 2
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    user_labels = {
      environment = var.environment
      application = var.application_name
      managed_by  = "terraform"
      project     = var.application_name
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.required_apis
  ]
}

# Database
resource "google_sql_database" "database" {
  count = var.enable_database ? 1 : 0

  name            = var.application_name
  instance        = google_sql_database_instance.postgres[0].name
  charset         = "UTF8"
  collation       = "en_US.UTF8"
  deletion_policy = "DELETE"
  project         = var.project_id
}

# Database User
resource "google_sql_user" "database_user" {
  count = var.enable_database ? 1 : 0

  name     = var.application_name
  instance = google_sql_database_instance.postgres[0].name
  password = random_password.db_password.result
  project  = var.project_id
}
