---
title: Home
description: Professional RSS feed generator for League of Legends news
hide:
  - navigation
---

<div class="hero">
  <h1>⚡ LoL Stonks RSS</h1>
  <p>Professional-grade RSS feed generator for League of Legends news</p>
  <p style="font-size: 1.1rem;">Stay updated with the latest LoL news through clean, reliable RSS feeds</p>
  <div class="hero-buttons">
    <a href="getting-started/quickstart/" class="hero-button">Get Started</a>
    <a href="demo/tester/" class="hero-button secondary">Try Live Demo</a>
    <a href="https://github.com/yourusername/lolstonksrss" class="hero-button secondary">View on GitHub</a>
  </div>
</div>

## 🚀 Features

<div class="feature-grid">
  <div class="feature-card">
    <h3><span class="feature-icon">📡</span> RSS 2.0 Compliant</h3>
    <p>Generates fully compliant RSS 2.0 feeds that work with all major RSS readers and aggregators.</p>
  </div>

  <div class="feature-card">
    <h3><span class="feature-icon">⚡</span> Real-time Updates</h3>
    <p>Automated scheduled fetching of the latest League of Legends news with configurable intervals.</p>
  </div>

  <div class="feature-card">
    <h3><span class="feature-icon">🐳</span> Docker Ready</h3>
    <p>Fully containerized with Docker support for easy deployment on Windows and Linux servers.</p>
  </div>

  <div class="feature-card">
    <h3><span class="feature-icon">🔒</span> Production-Ready</h3>
    <p>Built with security, performance, and reliability in mind. Rate limiting, caching, and error handling included.</p>
  </div>

  <div class="feature-card">
    <h3><span class="feature-icon">⚙️</span> Highly Configurable</h3>
    <p>Extensive configuration options via environment variables for maximum flexibility.</p>
  </div>

  <div class="feature-card">
    <h3><span class="feature-icon">📊</span> FastAPI Backend</h3>
    <p>Modern Python FastAPI framework with async support, automatic documentation, and excellent performance.</p>
  </div>
</div>

## 📡 Live RSS Feed Preview

<div class="rss-preview">
  <h3>Test the RSS Feed</h3>
  <p>Try loading a sample RSS feed (requires running server):</p>

  <div class="rss-input-group">
    <input type="text" class="rss-input rss-feed-url" value="http://localhost:8000/feed" placeholder="Enter RSS feed URL">
    <button class="rss-button rss-load-button">Load Feed</button>
  </div>

  <div class="rss-output">
    <div class="rss-loading">Click "Load Feed" to preview the RSS feed</div>
  </div>
</div>

!!! tip "Need a running server?"
    Start the server locally with `docker run -p 8000:8000 lolstonksrss` or follow the [Quick Start Guide](getting-started/quickstart.md).

## 🎯 Quick Start

Get up and running in minutes:

=== "Docker (Recommended)"

    ```bash
    # Pull and run the Docker image
    docker pull yourusername/lolstonksrss:latest
    docker run -p 8000:8000 lolstonksrss

    # Access the RSS feed
    curl http://localhost:8000/feed
    ```

=== "Docker Compose"

    ```yaml
    # docker-compose.yml
    version: '3.8'
    services:
      lolstonksrss:
        image: yourusername/lolstonksrss:latest
        ports:
          - "8000:8000"
        environment:
          - FEED_TITLE=My LoL News Feed
          - UPDATE_INTERVAL=3600
    ```

    ```bash
    docker-compose up -d
    ```

=== "Python (Development)"

    ```bash
    # Clone the repository
    git clone https://github.com/yourusername/lolstonksrss.git
    cd lolstonksrss

    # Install dependencies with uv
    uv pip install -e ".[dev]"

    # Run the application
    python main.py
    ```

=== "Windows Server"

    ```powershell
    # Using Docker Desktop for Windows
    docker pull yourusername/lolstonksrss:latest
    docker run -d -p 8000:8000 --name lolstonks lolstonksrss

    # Or install Python and run directly
    pip install -r requirements.txt
    python main.py
    ```

## 📊 Project Stats

<div class="stats-container">
  <div class="stat-card">
    <span class="stat-value">100%</span>
    <span class="stat-label">Type Coverage</span>
  </div>
  <div class="stat-card">
    <span class="stat-value">95%+</span>
    <span class="stat-label">Test Coverage</span>
  </div>
  <div class="stat-card">
    <span class="stat-value">RSS 2.0</span>
    <span class="stat-label">Compliant</span>
  </div>
  <div class="stat-card">
    <span class="stat-value">Python 3.11+</span>
    <span class="stat-label">Modern Stack</span>
  </div>
</div>

## 🛠️ Tech Stack

<div class="tech-stack">
  <span class="tech-badge">Python 3.11+</span>
  <span class="tech-badge">FastAPI</span>
  <span class="tech-badge">Uvicorn</span>
  <span class="tech-badge">feedgen</span>
  <span class="tech-badge">httpx</span>
  <span class="tech-badge">aiosqlite</span>
  <span class="tech-badge">Pydantic</span>
  <span class="tech-badge">Docker</span>
  <span class="tech-badge">APScheduler</span>
  <span class="tech-badge">pytest</span>
  <span class="tech-badge">mypy</span>
  <span class="tech-badge">black</span>
  <span class="tech-badge">ruff</span>
</div>

## 🎓 What's Next?

<div class="feature-grid">
  <div class="feature-card">
    <h3>📚 Read the Docs</h3>
    <p>Explore comprehensive documentation covering installation, configuration, and deployment.</p>
    <a href="getting-started/">Get Started →</a>
  </div>

  <div class="feature-card">
    <h3>🔧 API Reference</h3>
    <p>Detailed API documentation with endpoint specifications and examples.</p>
    <a href="api/">View API Docs →</a>
  </div>

  <div class="feature-card">
    <h3>🏗️ Architecture</h3>
    <p>Learn about the system architecture, components, and design decisions.</p>
    <a href="architecture/">Explore Architecture →</a>
  </div>

  <div class="feature-card">
    <h3>💻 Developer Guide</h3>
    <p>Contributing guidelines, development setup, and testing procedures.</p>
    <a href="development/">Start Contributing →</a>
  </div>
</div>

## 💬 Community & Support

!!! question "Need Help?"
    - 📖 Check the [FAQ](faq.md) for common questions
    - 🐛 Report issues on [GitHub Issues](https://github.com/yourusername/lolstonksrss/issues)
    - 💡 Request features or improvements
    - 📝 Read the [Troubleshooting Guide](guides/troubleshooting.md)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/yourusername/lolstonksrss/blob/main/LICENSE) file for details.

---

<div style="text-align: center; padding: 2rem 0; color: var(--md-default-fg-color--light);">
  <p>Built with ❤️ for the League of Legends community</p>
  <p>
    <a href="https://github.com/yourusername/lolstonksrss">GitHub</a> •
    <a href="https://github.com/yourusername/lolstonksrss/blob/main/CHANGELOG.md">Changelog</a> •
    <a href="https://github.com/yourusername/lolstonksrss/blob/main/CONTRIBUTING.md">Contributing</a>
  </p>
</div>
