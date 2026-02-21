#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define project and data directories
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="/mnt/docker-storage/bubbles/data"
STACK_NAME="bubbles-app" # Define your Docker Swarm stack name

echo "=========================================="
echo "  Bubbles Docker Swarm Management Script"
echo "=========================================="

# --- FUNCTIONS ---

# Function to display stack status
display_status() {
  echo ""
  echo ">>> Displaying Docker Swarm Stack Status for '$STACK_NAME' <<<"
  docker stack ps "$STACK_NAME"
  echo ""
  echo ">>> Displaying Docker Service Status for '$STACK_NAME' <<<"
  docker service ls --filter name="${STACK_NAME}"
  echo ""
  echo ">>> Displaying Docker Container Status for '$STACK_NAME' services <<<"
  # This command lists all containers that are part of the stack.
  docker ps --filter "label=com.docker.swarm.service.name=${STACK_NAME}_api" \
            --filter "label=com.docker.swarm.service.name=${STACK_NAME}_frontend" \
            --filter "label=com.docker.swarm.service.name=${STACK_NAME}_websocket-service" \
            --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}"
}

# Function to display logs for all services in the stack
display_logs() {
  echo ""
  echo ">>> Displaying Logs for All Services in '$STACK_NAME' (last 50 lines) <<<"
  # -f (follow) is usually not good for a script, use --tail for specific lines
  docker service logs "$STACK_NAME" --tail 50 --timestamps --since 1h
}

# Function to prune unused Docker images
prune_images() {
  echo ""
  echo ">>> Pruning unused Docker images <<<"
  echo "WARNING: This will remove all dangling images and images not associated with a container."
  read -rp "Are you sure you want to prune Docker images? (y/N): " confirm_prune
  if [[ "$confirm_prune" =~ ^[Yy]$ ]]; then
    docker image prune -f
    echo "Docker images pruned."
  else
    echo "Image pruning cancelled."
  fi
}

# --- SCRIPT EXECUTION ---

# Verify storage is ready
if ! df /mnt/docker-storage > /dev/null 2>&1; then
  echo "❌ Error: /mnt/docker-storage is not mounted!"
  echo "Please run the storage setup first."
  exit 1
fi

# Create data directory and set permissions
echo "Creating data directory at $DATA_DIR..."
sudo mkdir -p "$DATA_DIR"
# Assuming 'appuser' will have UID/GID 1001. Adjust if your non-root user has a different UID/GID.
sudo chown -R 1001:1001 "$DATA_DIR"
sudo chmod -R 775 "$DATA_DIR"

# Backup existing database and copy to persistent storage
if [ -f "$PROJECT_DIR/bubbles.db" ]; then
  echo "Backing up existing bubbles.db..."
  sudo cp "$PROJECT_DIR/bubbles.db" "$DATA_DIR/bubbles.db.backup"
  echo "Copying bubbles.db to persistent storage..."
  sudo cp "$PROJECT_DIR/bubbles.db" "$DATA_DIR/bubbles.db"
  sudo chown 1001:1001 "$DATA_DIR/bubbles.db"
else
  echo "No existing bubbles.db found in project directory. Starting fresh or assuming it's already in $DATA_DIR."
  # If bubbles.db doesn't exist in PROJECT_DIR but might exist in DATA_DIR, ensure correct ownership
  if [ -f "$DATA_DIR/bubbles.db" ]; then
    sudo chown 1001:1001 "$DATA_DIR/bubbles.db"
  fi
fi

# Stop existing systemd services (if any)
echo ""
echo "Stopping systemd services (if running)..."
sudo systemctl stop bubbles_nuxt.service 2>/dev/null || true
sudo systemctl stop bubbles_backend.service 2>/dev/null || true
sudo systemctl stop bubbles_ws.service 2>/dev/null || true

# Navigate to the project directory for Docker operations
cd "$PROJECT_DIR" || { echo "Error: Could not navigate to $PROJECT_DIR"; exit 1; }

# Build Docker images
echo ""
echo ">>> Building Docker Images <<<"
docker build -t bubbles-frontend:latest -f Dockerfile.frontend .
docker build -t bubbles-api:latest -f server/Dockerfile.api server
docker build -t bubbles-websocket:latest -f server/Dockerfile.ws server

# Redeploy Docker Swarm stack
echo ""
echo ">>> Redeploying Docker Swarm Stack '$STACK_NAME' <<<"
# The 'docker stack deploy' command will use environment variables
# (SECRET_KEY, GEMINI_API) that are already present in your shell's environment.
# It's crucial that these are set before you run this script for deployment.
docker stack deploy -c docker-compose.yml "$STACK_NAME"

echo ""
echo "=========================================="
echo "  Deployment Complete. Checking Status..."
echo "=========================================="

# Automatically display status and logs after deployment
display_status
display_logs

echo ""
echo "=========================================="
echo "  Script Finished"
echo "=========================================="
echo "To check status again: $0 status"
echo "To view logs again: $0 logs"
echo "To prune images: $0 prune"
echo "To redeploy: $0 deploy"
echo "=========================================="

# --- Command Line Arguments for functions ---
case "$1" in
  status)
    display_status
    ;;
  logs)
    display_logs
    ;;
  prune)
    prune_images
    ;;
  deploy)
    echo "Running full deployment sequence again..."
    # The script already runs deploy by default, this just explicitly shows the intention
    ;;
  *)
    # Default behavior: run full deploy then status/logs if no argument or unrecognized argument
    ;;
esac

