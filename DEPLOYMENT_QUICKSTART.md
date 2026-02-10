# Deployment Quick Start

Get LoL Stonks RSS running on production in 5 minutes.

## Prerequisites

- Windows Server 2019+ or Windows 10/11
- Docker Desktop installed
- Git installed

## Quick Deployment (Windows)

### Option 1: Docker Compose (Recommended)

```powershell
# Clone repository
git clone https://github.com/OneStepAt4time/lolstonks-rss.git
cd lolstonksrss

# Start with Docker Compose
docker-compose up -d

# Verify it's running
docker-compose ps
```

### Option 2: Docker Run

```powershell
# Clone repository
git clone https://github.com/OneStepAt4time/lolstonks-rss.git
cd lolstonksrss

# Build image
docker build -t lolstonksrss:latest .

# Run container
docker run -d -p 8000:8000 --name lolstonksrss lolstonksrss:latest
```

## Verify Deployment

```powershell
# Check health endpoint
Invoke-WebRequest -Uri http://localhost:8000/health

# View logs
docker logs lolstonksrss
```

## Access Your Feeds

| Feed | URL |
|------|-----|
| All Articles | http://localhost:8000/feed.xml |
| English (US) | http://localhost:8000/rss/en-us.xml |
| Japanese | http://localhost:8000/rss/ja-jp.xml |
| Korean | http://localhost:8000/rss/ko-kr.xml |

**All 20 Riot locales supported**: `en-us`, `en-gb`, `es-es`, `es-mx`, `fr-fr`, `de-de`, `it-it`, `pt-br`, `ru-ru`, `tr-tr`, `pl-pl`, `ja-jp`, `ko-kr`, `zh-cn`, `zh-tw`, `ar-ae`, `vi-vn`, `th-th`, `id-id`, `ph-ph`

## Configuration (Optional)

Create a `.env` file for custom settings:

```env
# Server
BASE_URL=http://your-domain.com
PORT=8000

# RSS Settings
RSS_FEED_TITLE=My LoL News Feed
RSS_MAX_ITEMS=100

# Updates
UPDATE_INTERVAL_MINUTES=5
```

Then restart:
```powershell
docker-compose down
docker-compose up -d
```

## Firewall Setup (Windows Server)

```powershell
# Allow application port
New-NetFirewallRule -DisplayName "LoL Stonks RSS" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## Next Steps

- **[Full Deployment Guide](docs/DEPLOYMENT.md)** - Automated deployment with GitHub Actions
- **[Windows Deployment Guide](docs/WINDOWS_DEPLOYMENT.md)** - Complete Windows Server setup
- **[Docker Reference](docs/DOCKER.md)** - Docker configuration details

## Troubleshooting

### Port Already in Use
```powershell
# Use different port
docker run -d -p 9000:8000 lolstonksrss:latest
```

### Container Won't Start
```powershell
# View logs
docker logs lolstonksrss

# Restart container
docker restart lolstonksrss
```

### No Articles Showing
Wait for first update cycle (5 minutes) or trigger manually:
```powershell
curl -X POST http://localhost:8000/admin/update
```

For more help, see the [Troubleshooting Guide](docs/TROUBLESHOOTING.md).
