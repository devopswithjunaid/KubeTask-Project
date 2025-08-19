# GKE Cluster and Node Pool Configuration

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = "${var.application_name}-${var.environment}-gke"
  location = var.zone
  project  = var.project_id

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable private nodes
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # IP allocation policy for secondary ranges
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Master authorized networks (allow all for now)
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All networks"
    }
  }

  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Addons
  addons_config {
    http_load_balancing {
      disabled = false
    }

    horizontal_pod_autoscaling {
      disabled = false
    }

    network_policy_config {
      disabled = false
    }
  }

  # Maintenance policy - Use daily maintenance window instead of recurring window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "02:00"
    }
  }

  # Resource labels
  resource_labels = {
    environment = var.environment
    application = var.application_name
    managed_by  = "terraform"
    project     = var.application_name
  }

  depends_on = [
    google_project_service.required_apis,
  ]
}

# GKE Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.application_name}-${var.environment}-nodes"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = var.gke_node_count
  project    = var.project_id

  node_config {
    preemptible  = false
    machine_type = var.gke_machine_type

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_service_account.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]

    labels = {
      environment = var.environment
      application = var.application_name
      managed_by  = "terraform"
      node_pool   = "primary"
      project     = "kubetask"
    }

    tags = ["gke-node", "kubetask-production-gke-node"]

    disk_size_gb = 20  # Updated to match current infrastructure
    disk_type    = "pd-standard"
    image_type   = "COS_CONTAINERD"

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  # Auto-scaling configuration - Updated to match current infrastructure
  autoscaling {
    min_node_count = 1
    max_node_count = 3  # Current max is 3 nodes
  }

  # Auto-upgrade and auto-repair
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  # Upgrade settings
  upgrade_settings {
    strategy        = "SURGE"
    max_surge       = 1
    max_unavailable = 0
  }
}
