# LoL Stonks RSS - Quick Deployment Guide

Fast-track guide to deploy LoL Stonks RSS on Windows Server with Docker.

## Prerequisites (5 minutes)

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and restart computer
   - Verify: `docker --version`

2. **Get the Code**
   ```powershell
   cd C:\
   # Copy project folder or clone from git
   cd lolstonksrss
   ```

## One-Command Deployment (2 minutes)

```powershell
.\scripts\windows-deploy.ps1
```

That's it! The script will:
- Check Docker installation
- Create data directory
- Build Docker image
- Start container
- Wait for health check
- Open browser

## Manual Deployment (3 minutes)

If you prefer manual control:

```powershell
# 1. Create data directory
New-Item -Path ".\data" -ItemType Directory -Force

# 2. Build Docker image
docker build -t lolstonksrss:latest .

# 3. Start container
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f
```

## Verify Deployment (1 minute)

```powershell
# Health check
Invoke-WebRequest http://localhost:8000/health

# RSS feed
Start-Process http://localhost:8000/feed.xml

# API docs
Start-Process http://localhost:8000/docs
```

## Available Endpoints

- **Health:** http://localhost:8000/health
- **Main RSS Feed:** http://localhost:8000/feed.xml
- **English Feed:** http://localhost:8000/feeds/en-us.xml
- **Italian Feed:** http://localhost:8000/feeds/it-it.xml
- **API Docs:** http://localhost:8000/docs
- **Scheduler Status:** http://localhost:8000/admin/scheduler/status

## Firewall Configuration (1 minute)

Open PowerShell as Administrator:

```powershell
New-NetFirewallRule `
  -DisplayName "LoL Stonks RSS" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow
```

## Common Commands

```powershell
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Backup
.\scripts\backup.ps1

# Monitor health
.\scripts\monitor.ps1
```

## Troubleshooting

**Port 8000 already in use?**
```powershell
# Find what's using it
netstat -ano | Select-String ":8000"

# Or use different port
.\scripts\windows-deploy.ps1 -Port 8001
```

**Container won't start?**
```powershell
# Check logs
docker logs lolstonksrss

# Check Docker is running
docker ps
```

**Permission denied?**
```powershell
# Run PowerShell as Administrator
# Or fix permissions
icacls ".\data" /grant Everyone:(OI)(CI)F /T
```

## Configuration (Optional)

Edit `.env` file to customize:

```env
# Server
PORT=8000
HOST=0.0.0.0

# Updates
UPDATE_INTERVAL_MINUTES=30

# RSS
RSS_MAX_ITEMS=50

# Logging
LOG_LEVEL=INFO
```

Then restart:
```powershell
docker-compose restart
```

## Scheduled Backup (Optional)

1. Open **Task Scheduler**
2. Create Basic Task: "LoL RSS Backup"
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-File C:\lolstonksrss\scripts\backup.ps1`
   - Start in: `C:\lolstonksrss\scripts`

## Continuous Monitoring (Optional)

Run in separate PowerShell window:

```powershell
.\scripts\monitor.ps1
```

Or with logging:

```powershell
.\scripts\monitor.ps1 -LogFile "C:\logs\monitor.log"
```

## Need Help?

- **Full Guide:** docs\WINDOWS_DEPLOYMENT.md
- **Docker Reference:** docs\DOCKER.md
- **Production Checklist:** docs\PRODUCTION_CHECKLIST.md
- **Scripts Help:** scripts\README.md

## Quick Health Check

```powershell
# One-liner to check everything
$health = (Invoke-WebRequest http://localhost:8000/health).Content | ConvertFrom-Json
Write-Host "Status: $($health.status)" -ForegroundColor $(if($health.status -eq 'healthy'){'Green'}else{'Red'})
Write-Host "Database: $($health.database)" -ForegroundColor $(if($health.database -eq 'connected'){'Green'}else{'Red'})
Write-Host "Scheduler: $($health.scheduler)" -ForegroundColor $(if($health.scheduler -eq 'running'){'Green'}else{'Red'})
```

## Production Checklist

Before going live:
- [ ] Docker Desktop installed and running
- [ ] Firewall rule configured
- [ ] Application deployed and healthy
- [ ] All RSS feeds accessible
- [ ] Backup script tested
- [ ] Monitoring configured
- [ ] Documentation reviewed

## Typical Resource Usage

- **Memory:** ~100-150MB
- **CPU:** <5%
- **Disk:** ~500MB total
- **Network:** Minimal (periodic updates)

## Update Procedure

```powershell
# Pull latest (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Verify
docker-compose logs
```

## Complete Uninstall

```powershell
# Stop and remove container
docker-compose down

# Remove image
docker rmi lolstonksrss:latest

# Remove data (careful!)
# Remove-Item .\data -Recurse -Force

# Remove Docker Desktop (if desired)
# Use Windows Settings > Apps
```

---

**Total deployment time: ~10 minutes**

For detailed information, see the complete documentation in the `docs/` folder.
