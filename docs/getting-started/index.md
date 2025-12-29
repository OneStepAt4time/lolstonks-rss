---
title: Getting Started
description: Quick start guide for LoL Stonks RSS
---

# Getting Started with LoL Stonks RSS

Welcome to LoL Stonks RSS! This guide will help you get up and running quickly.

## 📋 Overview

LoL Stonks RSS is a professional RSS feed generator for League of Legends news. It automatically fetches and formats the latest LoL news into a clean RSS feed that you can subscribe to with any RSS reader.

## 🎯 Prerequisites

Before you begin, ensure you have one of the following:

=== "Docker (Recommended)"
    - Docker Desktop (Windows/Mac) or Docker Engine (Linux)
    - Port 8000 available
    - Internet connection for fetching news

=== "Python Installation"
    - Python 3.11 or higher
    - pip or uv package manager
    - Git (for cloning the repository)

## 🚀 Quick Installation

Choose your preferred method:

### Docker Installation

The easiest way to get started:

```bash
# Pull the image
docker pull yourusername/lolstonksrss:latest

# Run the container
docker run -d -p 8000:8000 --name lolstonks lolstonksrss

# Verify it's running
curl http://localhost:8000/health
```

### Python Installation

For development or customization:

```bash
# Clone the repository
git clone https://github.com/yourusername/lolstonksrss.git
cd lolstonksrss

# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py
```

## ✅ Verify Installation

Once running, verify the installation:

1. **Health Check**: Visit `http://localhost:8000/health`
2. **RSS Feed**: Visit `http://localhost:8000/feed`
3. **API Docs**: Visit `http://localhost:8000/docs`

!!! success "Installation Complete!"
    If you see the RSS feed, you're all set! Continue to the [Configuration Guide](configuration.md) to customize your setup.

## 📚 Next Steps

<div class="feature-grid">
  <div class="feature-card">
    <h3>🔧 Configuration</h3>
    <p>Learn how to customize your RSS feed</p>
    <a href="configuration/">Configure →</a>
  </div>

  <div class="feature-card">
    <h3>📡 First Feed</h3>
    <p>Create your first RSS feed</p>
    <a href="first-feed/">Create Feed →</a>
  </div>

  <div class="feature-card">
    <h3>🚀 Deployment</h3>
    <p>Deploy to production</p>
    <a href="../guides/deployment/">Deploy →</a>
  </div>
</div>

## ❓ Troubleshooting

Having issues? Check these common solutions:

- **Port already in use**: Change the port with `-p 9000:8000`
- **Connection refused**: Ensure Docker/Python is running
- **No news items**: Wait for the first scheduled update (default: 1 hour)

For more help, see the [Troubleshooting Guide](../guides/troubleshooting.md).
