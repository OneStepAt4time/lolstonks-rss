# Deployment Guide

How to deploy and release LoL Stonks RSS.

## Overview

There are two deployment paths:

| Path | What | How | When |
|------|------|-----|------|
| **GitHub Pages** | Frontend + RSS feeds | Automatic via GitHub Actions | Every 15 minutes (news) + on push (frontend) |
| **Docker (self-hosted)** | Full API server | Pull from GHCR, run with docker-compose | On demand |

## GitHub Pages (Automatic)

The frontend and RSS feeds are deployed to GitHub Pages automatically. No manual steps required.

### How It Works

**Frontend deployment** (`deploy-frontend.yml`):
- Triggers on push to master when `frontend/` files change
- Builds the React/Vite frontend
- Generates RSS feeds and news pages
- Deploys to GitHub Pages

**News publishing** (`publish-news.yml`):
- Runs every 15 minutes on a cron schedule
- Fetches latest LoL news from Riot API
- Generates RSS XML feeds for all enabled locales
- Generates HTML news pages
- Commits and deploys to GitHub Pages
- Gracefully skips if no new content

### Monitored Locales

The publish-news workflow generates feeds for 8 validated locales:
`en-us`, `ko-kr`, `de-de`, `es-es`, `fr-fr`, `ja-jp`, `pt-br`, `it-it`

## Docker Self-Hosted Deployment

For running your own instance of the API server.

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/OneStepAt4time/lolstonks-rss.git
cd lolstonks-rss

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Create data directory for the database
mkdir -p data

# Start the service
docker-compose up -d
```

The API will be available at `http://localhost:8002`.

### Using a Pre-built Image

Instead of building locally, pull from GitHub Container Registry:

```bash
docker pull ghcr.io/onestepat4time/lolstonks-rss:latest

# Or a specific version
docker pull ghcr.io/onestepat4time/lolstonks-rss:2.0.0
```

To use GHCR images with docker-compose, update `docker-compose.yml`:

```yaml
services:
  lolstonksrss:
    image: ghcr.io/onestepat4time/lolstonks-rss:latest
    # Remove or comment out the 'build:' section
```

### Configuration

All configuration is via environment variables. See `.env.example` for the full list.

Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Internal container port |
| `HOST` | `0.0.0.0` | Bind address |
| `DATABASE_PATH` | `data/articles.db` | SQLite database path |
| `UPDATE_INTERVAL_MINUTES` | `5` | How often to fetch new articles |
| `SUPPORTED_LOCALES` | `en-us,...` | Comma-separated locale list |
| `ALLOWED_ORIGINS` | `http://localhost:8002` | CORS allowed origins |
| `LOG_LEVEL` | `INFO` | Logging verbosity |
| `RSS_MAX_ITEMS` | `50` | Max items per RSS feed |
| `CACHE_TTL_SECONDS` | `21600` | Cache duration (6 hours) |

**Note**: The docker-compose.yml maps port `8002` on the host to `8000` in the container. Set `ALLOWED_ORIGINS` to match the host port you access the API on.

## Creating a Release

Releases publish Docker images to GitHub Container Registry (GHCR).

### Steps

1. Ensure master is stable (all CI checks passing)
2. Create and push a version tag:
   ```bash
   git tag -a v2.1.0 -m "Release v2.1.0"
   git push origin v2.1.0
   ```
3. This automatically triggers:
   - `release.yml` — creates a GitHub Release with auto-generated changelog
   - `docker-publish.yml` — builds and pushes multi-platform Docker images to GHCR

### What Gets Published

- Docker images tagged: `2.1.0`, `2.1`, `2`, `latest`, and the commit SHA
- Multi-architecture: `linux/amd64` and `linux/arm64`
- Build provenance attestation for supply chain security

### Version Tags

Follow [Semantic Versioning](https://semver.org/):
- `vMAJOR.MINOR.PATCH` (e.g., `v2.1.0`)
- Pre-release: `v2.1.0-beta.1`, `v2.1.0-rc.1`

## Container Management

### Health Check

The container includes a built-in health check on `/health`:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' lolstonksrss

# Manual health check
curl http://localhost:8002/health
```

### Logs

```bash
# Follow logs
docker logs -f lolstonksrss

# Last 100 lines
docker logs --tail 100 lolstonksrss
```

Log rotation is configured in docker-compose.yml (max 10MB, 3 files).

### Updating

```bash
# Pull latest image
docker pull ghcr.io/onestepat4time/lolstonks-rss:latest

# Restart with new image
docker-compose down
docker-compose up -d
```

### Backup

The SQLite database is stored in the `data/` volume mount:

```bash
# Backup the database (container can stay running)
cp data/articles.db data/articles.db.backup
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs lolstonksrss

# Verify port isn't in use
# Linux/Mac:
lsof -i :8002
# Windows:
netstat -ano | findstr :8002
```

### Health check failing

```bash
# Test health endpoint directly inside the container
docker exec lolstonksrss python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/health').read())"
```

### CORS errors in browser

Ensure `ALLOWED_ORIGINS` in your `.env` or `docker-compose.yml` matches the URL you're accessing from. If accessing via `http://localhost:8002`, set `ALLOWED_ORIGINS=http://localhost:8002`.

### Database issues

```bash
# Reset the database (articles will be re-fetched)
docker-compose down
rm data/articles.db
docker-compose up -d
```

### Docker image pull requires authentication

```bash
# Login to GHCR with a GitHub Personal Access Token (read:packages scope)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

## CI/CD Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `ci.yml` | Push/PR | Tests, linting, type checking |
| Security Scan | `security-scan.yml` | Push/PR/schedule | Vulnerability scanning |
| Deploy Frontend | `deploy-frontend.yml` | Push to master | Build and deploy frontend to GitHub Pages |
| Publish News | `publish-news.yml` | Cron (15 min) | Fetch news, generate RSS, deploy to Pages |
| Release | `release.yml` | Tag push (`v*.*.*`) | Create GitHub Release |
| Docker Publish | `docker-publish.yml` | Called by release | Build and push Docker images to GHCR |
