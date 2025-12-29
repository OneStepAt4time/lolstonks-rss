---
title: Quick Start
description: Get started with LoL Stonks RSS in 5 minutes
---

# Quick Start Guide

Get up and running with LoL Stonks RSS in under 5 minutes!

## 🎯 Choose Your Method

=== "Docker (Easiest)"

    **Recommended for production use**

    ```bash
    # Pull and run
    docker run -d -p 8000:8000 --name lolstonks yourusername/lolstonksrss:latest

    # Verify
    curl http://localhost:8000/health
    ```

=== "Docker Compose"

    **Best for configuration management**

    Create `docker-compose.yml`:
    ```yaml
    version: '3.8'
    services:
      lolstonksrss:
        image: yourusername/lolstonksrss:latest
        ports:
          - "8000:8000"
        environment:
          - FEED_TITLE=My LoL News Feed
          - UPDATE_INTERVAL=3600
          - RSS_MAX_ITEMS=50
        restart: unless-stopped
    ```

    ```bash
    # Start
    docker-compose up -d

    # View logs
    docker-compose logs -f
    ```

=== "Python (Development)"

    **For development and customization**

    ```bash
    # Clone repository
    git clone https://github.com/yourusername/lolstonksrss.git
    cd lolstonksrss

    # Install with UV (recommended)
    uv sync

    # Or with pip
    pip install -r requirements.txt

    # Run
    python main.py
    ```

=== "Windows Server"

    **Production deployment on Windows**

    ```powershell
    # Using Docker Desktop
    docker pull yourusername/lolstonksrss:latest
    docker run -d -p 8000:8000 `
      --name lolstonks `
      --restart unless-stopped `
      yourusername/lolstonksrss:latest

    # Or Python installation
    git clone https://github.com/yourusername/lolstonksrss.git
    cd lolstonksrss
    pip install -r requirements.txt
    python main.py
    ```

## ✅ Verify Installation

Once the server is running, test these endpoints:

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 42
}
```

### 2. RSS Feed
```bash
curl http://localhost:8000/feed
```

Expected: Valid RSS 2.0 XML

### 3. API Documentation
Open in browser: `http://localhost:8000/docs`

!!! success "All Working?"
    Congratulations! Your LoL Stonks RSS server is running.

## 📡 Using the RSS Feed

### Subscribe with RSS Readers

Add this URL to your favorite RSS reader:
```
http://localhost:8000/feed
```

Popular RSS readers:
- **Feedly** - Web-based
- **Inoreader** - Cross-platform
- **NetNewsWire** - macOS/iOS
- **FreshRSS** - Self-hosted

### Test the Feed

```bash
# Get feed as XML
curl http://localhost:8000/feed

# Get feed as JSON
curl http://localhost:8000/api/v1/articles

# Get specific article
curl http://localhost:8000/api/v1/articles/{guid}
```

## ⚙️ Basic Configuration

Configure via environment variables:

=== "Docker"
    ```bash
    docker run -d -p 8000:8000 \
      -e FEED_TITLE="My LoL News" \
      -e FEED_DESCRIPTION="Latest League news" \
      -e UPDATE_INTERVAL=3600 \
      -e RSS_MAX_ITEMS=50 \
      lolstonksrss
    ```

=== "Docker Compose"
    ```yaml
    environment:
      - FEED_TITLE=My LoL News
      - FEED_DESCRIPTION=Latest League news
      - UPDATE_INTERVAL=3600
      - RSS_MAX_ITEMS=50
    ```

=== ".env File"
    ```bash
    # Copy example
    cp .env.example .env

    # Edit .env
    FEED_TITLE=My LoL News
    FEED_DESCRIPTION=Latest League news
    UPDATE_INTERVAL=3600
    RSS_MAX_ITEMS=50
    ```

Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `FEED_TITLE` | LoL Stonks RSS | Feed title |
| `UPDATE_INTERVAL` | 3600 | Update interval (seconds) |
| `RSS_MAX_ITEMS` | 50 | Max items in feed |
| `PORT` | 8000 | Server port |

See [Configuration Guide](configuration.md) for all options.

## 🧪 Running Tests

Verify everything works:

```bash
# Run all tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific tests
pytest tests/test_rss.py -v
```

## 🔄 Updates and Maintenance

### View Logs

=== "Docker"
    ```bash
    docker logs lolstonks -f
    ```

=== "Docker Compose"
    ```bash
    docker-compose logs -f
    ```

### Update to Latest Version

=== "Docker"
    ```bash
    docker pull yourusername/lolstonksrss:latest
    docker stop lolstonks
    docker rm lolstonks
    docker run -d -p 8000:8000 --name lolstonks lolstonksrss
    ```

=== "Git"
    ```bash
    git pull origin main
    pip install -r requirements.txt
    ```

## 🎓 Next Steps

<div class="feature-grid">
  <div class="feature-card">
    <h3>📝 Configuration</h3>
    <p>Customize your RSS feed</p>
    <a href="configuration/">Configure →</a>
  </div>

  <div class="feature-card">
    <h3>🚀 Deployment</h3>
    <p>Deploy to production</p>
    <a href="../guides/deployment/">Deploy →</a>
  </div>

  <div class="feature-card">
    <h3>🔧 API Reference</h3>
    <p>Explore all endpoints</p>
    <a href="../api/">API Docs →</a>
  </div>

  <div class="feature-card">
    <h3>📊 Monitoring</h3>
    <p>Monitor your feed</p>
    <a href="../guides/advanced/">Advanced →</a>
  </div>
</div>

## ❓ Common Issues

### Port Already in Use
```bash
# Use different port
docker run -p 9000:8000 lolstonksrss
```

### No Articles Showing
Wait for first update cycle (default: 1 hour) or trigger manually:
```bash
curl -X POST http://localhost:8000/api/v1/update
```

### Connection Refused
Ensure server is running:
```bash
docker ps  # Should show lolstonks container
```

For more help, see [Troubleshooting Guide](../guides/troubleshooting.md).

## 📚 Additional Resources

- [Full Installation Guide](installation.md)
- [Configuration Reference](configuration.md)
- [API Documentation](../api/)
- [Docker Deployment](../guides/deployment/docker.md)
- [Windows Deployment](../guides/deployment/windows.md)
