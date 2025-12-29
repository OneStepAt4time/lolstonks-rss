---
title: Installation Guide
description: Detailed installation instructions for LoL Stonks RSS
---

# Installation Guide

Comprehensive installation instructions for all deployment scenarios.

## Prerequisites

### Docker Installation (Recommended)

**Requirements:**
- Docker Desktop 4.0+ (Windows/Mac) or Docker Engine 20.10+ (Linux)
- 2GB available RAM
- 1GB available disk space
- Internet connection

**Install Docker:**

=== "Windows"
    1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
    2. Run the installer
    3. Enable WSL 2 backend if prompted
    4. Restart computer
    5. Verify: `docker --version`

=== "macOS"
    ```bash
    # Using Homebrew
    brew install --cask docker

    # Or download from docker.com
    # https://www.docker.com/products/docker-desktop
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER

    # Verify
    docker --version
    ```

### Python Installation

**Requirements:**
- Python 3.11 or higher
- pip 23.0+ or uv package manager
- Git (for cloning)
- 500MB disk space

**Install Python:**

=== "Windows"
    1. Download from [python.org](https://www.python.org/downloads/)
    2. Run installer, check "Add Python to PATH"
    3. Verify: `python --version`

=== "macOS"
    ```bash
    # Using Homebrew
    brew install python@3.11

    # Verify
    python3.11 --version
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install python3.11 python3.11-venv python3-pip

    # Fedora
    sudo dnf install python3.11

    # Verify
    python3.11 --version
    ```

**Install UV (Recommended):**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Installation Methods

### Method 1: Docker (Production)

**Pull from Docker Hub:**
```bash
docker pull yourusername/lolstonksrss:latest
```

**Or build locally:**
```bash
git clone https://github.com/yourusername/lolstonksrss.git
cd lolstonksrss
docker build -t lolstonksrss .
```

**Run container:**
```bash
docker run -d \
  --name lolstonks \
  -p 8000:8000 \
  --restart unless-stopped \
  lolstonksrss
```

**Verify:**
```bash
docker ps
curl http://localhost:8000/health
```

### Method 2: Docker Compose (Recommended for Production)

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  lolstonksrss:
    image: yourusername/lolstonksrss:latest
    container_name: lolstonks
    ports:
      - "8000:8000"
    environment:
      - FEED_TITLE=LoL Stonks RSS
      - FEED_DESCRIPTION=Latest League of Legends News
      - UPDATE_INTERVAL=3600
      - RSS_MAX_ITEMS=50
      - LOG_LEVEL=INFO
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Start services:**
```bash
docker-compose up -d
```

**Manage:**
```bash
docker-compose logs -f      # View logs
docker-compose restart      # Restart
docker-compose down         # Stop
```

### Method 3: Python Installation (Development)

**Clone repository:**
```bash
git clone https://github.com/yourusername/lolstonksrss.git
cd lolstonksrss
```

**Install dependencies:**

=== "Using UV (Recommended)"
    ```bash
    # Install production dependencies
    uv sync

    # Install with dev dependencies
    uv sync --dev

    # Or just docs dependencies
    uv pip install -e ".[docs]"
    ```

=== "Using pip"
    ```bash
    # Install production dependencies
    pip install -r requirements.txt

    # Or install from pyproject.toml
    pip install -e .

    # Install dev dependencies
    pip install -e ".[dev]"
    ```

**Configure:**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # or vim, code, etc.
```

**Run application:**
```bash
python main.py
```

### Method 4: System Service (Linux)

**Create systemd service:**
```bash
sudo nano /etc/systemd/system/lolstonks.service
```

**Service file:**
```ini
[Unit]
Description=LoL Stonks RSS Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/lolstonksrss
Environment="PATH=/opt/lolstonksrss/.venv/bin"
ExecStart=/opt/lolstonksrss/.venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Install and start:**
```bash
# Install to /opt
sudo git clone https://github.com/yourusername/lolstonksrss.git /opt/lolstonksrss
cd /opt/lolstonksrss
sudo python3 -m venv .venv
sudo .venv/bin/pip install -r requirements.txt

# Start service
sudo systemctl daemon-reload
sudo systemctl enable lolstonks
sudo systemctl start lolstonks
sudo systemctl status lolstonks
```

## Post-Installation

### Verify Installation

**1. Check health endpoint:**
```bash
curl http://localhost:8000/health
```

**2. Get RSS feed:**
```bash
curl http://localhost:8000/feed
```

**3. View API docs:**
```
http://localhost:8000/docs
```

### Configure Firewall

=== "Linux (ufw)"
    ```bash
    sudo ufw allow 8000/tcp
    sudo ufw enable
    ```

=== "Windows Firewall"
    ```powershell
    New-NetFirewallRule -DisplayName "LoL Stonks RSS" `
      -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
    ```

### Set Up Reverse Proxy (Optional)

**Nginx:**
```nginx
server {
    listen 80;
    server_name rss.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Caddy:**
```
rss.yourdomain.com {
    reverse_proxy localhost:8000
}
```

## Update and Upgrade

### Docker Update
```bash
docker pull yourusername/lolstonksrss:latest
docker-compose down
docker-compose up -d
```

### Python Update
```bash
cd lolstonksrss
git pull origin main
uv sync  # or pip install -r requirements.txt
python main.py
```

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
docker logs lolstonks
```

**Port conflict:**
```bash
docker run -p 9000:8000 lolstonksrss
```

### Python Issues

**Module not found:**
```bash
# Ensure you're in project directory
cd /path/to/lolstonksrss

# Reinstall dependencies
uv sync --reinstall
```

**Permission errors:**
```bash
# Linux/Mac
chmod +x main.py
```

For more help, see [Troubleshooting Guide](../guides/troubleshooting.md).

## Next Steps

- [Configuration Guide](configuration.md) - Customize your setup
- [First Feed](first-feed.md) - Create your first RSS feed
- [Deployment Guide](../guides/deployment/) - Deploy to production
