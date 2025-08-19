# Secret Manager Configuration

# Secret for database password
resource "google_secret_manager_secret" "db_password" {
  count = var.enable_database ? 1 : 0

  secret_id = "${var.application_name}-${var.environment}-db-password"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    application = var.application_name
    managed_by  = "terraform"
  }
}

# Secret version for database password
resource "google_secret_manager_secret_version" "db_password" {
  count = var.enable_database ? 1 : 0

  secret      = google_secret_manager_secret.db_password[0].id
  secret_data = random_password.db_password.result
}

# Secret for database connection string
resource "google_secret_manager_secret" "db_connection" {
  count = var.enable_database ? 1 : 0

  secret_id = "${var.application_name}-${var.environment}-db-connection"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    application = var.application_name
    managed_by  = "terraform"
  }
}

# Secret version for database connection string
resource "google_secret_manager_secret_version" "db_connection" {
  count = var.enable_database ? 1 : 0

  secret = google_secret_manager_secret.db_connection[0].id
  secret_data = jsonencode({
    host     = google_sql_database_instance.postgres[0].private_ip_address
    port     = "5432"
    database = google_sql_database.database[0].name
    username = google_sql_user.database_user[0].name
    password = random_password.db_password.result
    connection_name = google_sql_database_instance.postgres[0].connection_name
  })
}

# IAM access for database password secret
resource "google_secret_manager_secret_iam_member" "db_password_access" {
  count = var.enable_database ? 1 : 0

  secret_id = google_secret_manager_secret.db_password[0].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.secret_manager_sa.email}"
  project   = var.project_id
}

# IAM access for database connection secret
resource "google_secret_manager_secret_iam_member" "db_connection_access" {
  count = var.enable_database ? 1 : 0

  secret_id = google_secret_manager_secret.db_connection[0].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.secret_manager_sa.email}"
  project   = var.project_id
}
