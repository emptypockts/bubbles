#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="/mnt/docker-storage/bubbles/data"

echo "=========================================="
echo "  Bubbles Docker Compose Setup"
echo "=========================================="

# Verify storage is ready
if ! df /mnt/docker-storage > /dev/null 2>&1; then
  echo "❌ Error: /mnt/docker-storage is not mounted!"
  echo "Please run the storage setup first."
  exit 1
fi

# Create data directory
echo "Creating data directory at $DATA_DIR..."
sudo mkdir -p "$DATA_DIR"
sudo chown -R 1001:1001 "$DATA_DIR"
sudo chmod -R 775 "$DATA_DIR"

# Backup existing database
if [ -f "$PROJECT_DIR/bubbles.db" ]; then
  echo "Backing up existing bubbles.db..."
  sudo cp "$PROJECT_DIR/bubbles.db" "$DATA_DIR/bubbles.db.backup"
  sudo cp "$PROJECT_DIR/bubbles.db" "$DATA_DIR/bubbles.db"
  sudo chown 1001:1001 "$DATA_DIR/bubbles.db"
fi

# Stop existing systemd services
echo ""
echo "Stopping systemd services..."
sudo systemctl stop bubbles_nuxt.service 2>/dev/null || true
sudo systemctl stop bubbles_backend.service 2>/dev/null || true
sudo systemctl stop bubbles_ws.service 2>/dev/null || true

# Build images
echo ""
echo "Building Docker images..."
echo "  - Frontend (Nuxt on port 3001)"
echo "  - API (Express/dbTransaction.js on port 3000)"
echo "  - WebSocket (on port 3003)"
docker compose build --no-cache

# Start services
echo ""
echo "Starting Bubbles application..."
docker compose up -d

# Wait for services to stabilize
echo ""
echo "Waiting for services to become healthy..."
sleep 10

# Show status
docker compose ps

echo ""
echo "=========================================="
echo "✓ Bubbles is running in Docker!"
echo "=========================================="
echo ""
echo "Service Mapping (Docker vs Systemd):"
echo "  Frontend  (Port 3001):  docker container bubbles-frontend"
echo "  API       (Port 3000):  docker container bubbles-api (dbTransaction.js)"
echo "  WebSocket (Port 3003):  docker container bubbles-websocket"
echo ""
echo "Access URLs:"
echo "  Frontend:   http://raspberrypi.local:3001"
echo "  API:        http://localhost:3000"
echo "  WebSocket:  ws://localhost:3003"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  View frontend:    docker-compose logs -f frontend"
echo "  View API:         docker-compose logs -f api"
echo "  View WebSocket:   docker-compose logs -f websocket"
echo ""
echo "  View status:      docker-compose ps"
echo "  Stop services:    docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""
echo "To restore systemd services:"
echo "  sudo systemctl start bubbles_nuxt.service"
echo "  sudo systemctl start bubbles_backend.service"
echo "  sudo systemctl start bubbles_ws.service"
echo ""

