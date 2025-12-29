---
title: Frequently Asked Questions
description: Common questions about LoL Stonks RSS
---

# Frequently Asked Questions

## General Questions

### What is LoL Stonks RSS?

LoL Stonks RSS is a professional-grade RSS feed generator for League of Legends news. It automatically fetches the latest LoL news from official sources and provides it as a clean, RSS 2.0 compliant feed that you can subscribe to with any RSS reader.

### Why use LoL Stonks RSS?

- **Centralized News**: Get all LoL news in one place
- **RSS Format**: Use your favorite RSS reader
- **Real-time Updates**: Automatic scheduled updates
- **Self-hosted**: Full control over your data
- **Free & Open Source**: MIT licensed

### What news sources does it support?

Currently supports:
- League of Legends official website (EN-US)
- More sources coming soon!

### Is it free?

Yes! LoL Stonks RSS is completely free and open source under the MIT license.

## Installation & Setup

### What are the system requirements?

**Docker (Recommended):**
- Docker Desktop 4.0+ or Docker Engine 20.10+
- 2GB RAM
- 1GB disk space

**Python:**
- Python 3.11 or higher
- 500MB disk space
- Windows, macOS, or Linux

### How do I install it?

See the [Quick Start Guide](getting-started/quickstart.md) for detailed instructions.

Quickest method:
```bash
docker run -d -p 8000:8000 lolstonksrss
```

### Can I run it on Windows Server?

Yes! See the [Windows Deployment Guide](guides/deployment/windows.md) for detailed instructions.

### Does it work on Raspberry Pi?

Yes, but you'll need to build the Docker image for ARM architecture or use Python installation.

## Configuration

### How do I change the feed title?

Set the `FEED_TITLE` environment variable:

```bash
docker run -d -p 8000:8000 \
  -e FEED_TITLE="My LoL News" \
  lolstonksrss
```

Or in `.env` file:
```bash
FEED_TITLE=My LoL News
```

### How often does it update?

Default: Every hour (3600 seconds)

Change with `UPDATE_INTERVAL`:
```bash
UPDATE_INTERVAL=1800  # 30 minutes
```

### How many items are in the feed?

Default: 50 items

Change with `RSS_MAX_ITEMS`:
```bash
RSS_MAX_ITEMS=100
```

### Where is the database stored?

Default: `./data/articles.db`

Change with `DATABASE_PATH`:
```bash
DATABASE_PATH=/custom/path/articles.db
```

### Can I use a custom port?

Yes, change the `PORT` variable:
```bash
docker run -d -p 9000:8000 \
  -e PORT=8000 \
  lolstonksrss
```

Note: Internal port is 8000, external can be anything.

## Usage

### How do I access the RSS feed?

The feed is available at:
```
http://localhost:8000/feed
```

Replace `localhost` with your server IP for remote access.

### How do I subscribe with an RSS reader?

1. Copy the feed URL: `http://localhost:8000/feed`
2. Open your RSS reader
3. Add new feed/subscription
4. Paste the URL
5. Done!

Popular readers:
- Feedly
- Inoreader
- NetNewsWire
- FreshRSS

### Can I use it with Feedly?

Yes! Add this URL to Feedly:
```
https://feedly.com/i/subscription/feed/http://YOUR_SERVER:8000/feed
```

### How do I manually trigger an update?

```bash
curl -X POST http://localhost:8000/api/v1/update
```

### Is there a JSON API?

Yes! Get articles as JSON:
```bash
curl http://localhost:8000/api/v1/articles
```

See [API Reference](api/) for all endpoints.

## Troubleshooting

### The feed is empty

**Solutions:**

1. Wait for first update (default: 1 hour)
2. Trigger manual update:
   ```bash
   curl -X POST http://localhost:8000/api/v1/update
   ```
3. Check logs:
   ```bash
   docker logs lolstonks
   ```

### Server won't start

**Solutions:**

1. Check port availability:
   ```bash
   netstat -an | grep 8000
   ```
2. Use different port:
   ```bash
   docker run -p 9000:8000 lolstonksrss
   ```
3. Check Docker status:
   ```bash
   docker ps -a
   ```

### RSS reader can't find the feed

**Checklist:**

- [ ] Server is running
- [ ] Correct URL format
- [ ] Firewall allows access
- [ ] Using correct IP/domain
- [ ] Port is accessible

### Feed loads slowly

**Solutions:**

1. Reduce max items:
   ```bash
   RSS_MAX_ITEMS=25
   ```
2. Check cache settings
3. Monitor server resources
4. Enable compression

### Articles aren't updating

**Check:**

1. Update interval setting
2. Scheduler is running
3. No errors in logs
4. Network connectivity

See [Troubleshooting Guide](guides/troubleshooting.md) for more help.

## Development

### How can I contribute?

See [Contributing Guide](development/contributing.md) for details.

Quick start:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### How do I run tests?

```bash
pytest
```

With coverage:
```bash
pytest --cov=src --cov-report=html
```

### What's the tech stack?

- **Python 3.11+**
- **FastAPI** - Web framework
- **feedgen** - RSS generation
- **httpx** - HTTP client
- **aiosqlite** - Async database
- **APScheduler** - Task scheduling
- **Docker** - Containerization

### Where can I report bugs?

Report issues on [GitHub Issues](https://github.com/yourusername/lolstonksrss/issues).

### Can I request features?

Yes! Open a [feature request](https://github.com/yourusername/lolstonksrss/issues/new) on GitHub.

## Performance

### How much memory does it use?

Typical usage:
- **Docker**: ~100-200MB
- **Python**: ~50-100MB

### How fast is it?

- Feed generation: \<100ms
- API responses: \<50ms
- Update cycle: 5-30 seconds

### Can it handle high traffic?

Yes, with proper configuration:
- Enable caching
- Use reverse proxy (nginx)
- Scale with Docker Compose
- Monitor resources

See [Performance Guide](architecture/performance.md).

### Should I use a reverse proxy?

Recommended for production:
- SSL/TLS termination
- Load balancing
- Caching
- DDoS protection

## Security

### Is it secure?

Yes, with proper configuration:
- Rate limiting enabled
- Input validation
- SQL injection protection
- Regular security updates

See [Security Guide](architecture/security.md).

### Should I use HTTPS?

Yes! Use a reverse proxy (nginx/Caddy) with Let's Encrypt for HTTPS.

### How do I secure the API?

Currently public. API authentication coming in future release.

## Deployment

### Can I deploy to production?

Yes! See [Production Checklist](guides/deployment/production-checklist.md).

### What about Docker Compose?

Recommended! See example in [Docker Guide](guides/deployment/docker.md).

### Can I use Kubernetes?

Yes, though not officially documented yet. Standard Kubernetes deployment patterns apply.

### How do I backup data?

Backup the database file:
```bash
docker cp lolstonks:/app/data/articles.db ./backup/
```

Or use Docker volumes:
```yaml
volumes:
  - ./data:/app/data
```

## Legal

### What's the license?

MIT License - see [LICENSE](https://github.com/yourusername/lolstonksrss/blob/main/LICENSE).

### Can I use it commercially?

Yes, the MIT license allows commercial use.

### Is it affiliated with Riot Games?

No, this is an independent project. League of Legends and Riot Games are trademarks of Riot Games, Inc.

## Still Have Questions?

- Check the [Documentation](getting-started/)
- Read the [Troubleshooting Guide](guides/troubleshooting.md)
- Ask on [GitHub Discussions](https://github.com/yourusername/lolstonksrss/discussions)
- Open an [Issue](https://github.com/yourusername/lolstonksrss/issues)
