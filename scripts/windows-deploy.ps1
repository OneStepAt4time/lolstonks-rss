# Windows Server Deployment Script for LoL Stonks RSS
# This script automates the deployment process on Windows

param(
    [switch]$SkipBuild,
    [switch]$NoBrowser,
    [string]$Port = "8000"
)

$ErrorActionPreference = "Stop"

Write-Host "=== LoL Stonks RSS Deployment ===" -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (-not (Test-Command docker)) {
    Write-Host "Error: Docker not found. Please install Docker Desktop for Windows." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    exit 1
}

# Verify Docker is running
try {
    docker ps > $null 2>&1
    Write-Host "  Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Docker Compose
if (-not (Test-Command docker-compose)) {
    Write-Host "Warning: docker-compose not found as standalone command." -ForegroundColor Yellow
    Write-Host "  Will use 'docker compose' instead." -ForegroundColor Yellow
    $composeCmd = "docker compose"
} else {
    $composeCmd = "docker-compose"
}

# Create data directory
Write-Host "`nCreating data directory..." -ForegroundColor Yellow
$dataDir = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dataDir)) {
    New-Item -Path $dataDir -ItemType Directory -Force | Out-Null
    Write-Host "  Created: $dataDir" -ForegroundColor Green
} else {
    Write-Host "  Already exists: $dataDir" -ForegroundColor Green
}

# Check for .env file
$envFile = Join-Path $PSScriptRoot "..\.env"
$envExample = Join-Path $PSScriptRoot "..\.env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Write-Host "`nCreating .env file from template..." -ForegroundColor Yellow
        Copy-Item $envExample $envFile
        Write-Host "  Created .env file" -ForegroundColor Green
        Write-Host "  Please review and edit .env file with your configuration." -ForegroundColor Cyan
    } else {
        Write-Host "`nWarning: No .env or .env.example file found." -ForegroundColor Yellow
        Write-Host "  Application will use default settings." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n.env file exists" -ForegroundColor Green
}

# Build image
if (-not $SkipBuild) {
    Write-Host "`nBuilding Docker image..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "..")
    try {
        docker build -t lolstonksrss:latest .
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed"
        }
        Write-Host "  Build successful" -ForegroundColor Green
    } catch {
        Write-Host "Error: Docker build failed." -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host "`nSkipping build (--SkipBuild flag set)" -ForegroundColor Yellow
}

# Stop existing container if running
Write-Host "`nChecking for existing containers..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=lolstonksrss" --format "{{.Names}}"
if ($existingContainer) {
    Write-Host "  Stopping and removing existing container..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "..")
    Invoke-Expression "$composeCmd down"
    Pop-Location
}

# Start container
Write-Host "`nStarting container..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "..")
try {
    Invoke-Expression "$composeCmd up -d"
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start container"
    }
    Write-Host "  Container started" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to start container." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Wait for health check
Write-Host "`nWaiting for service to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempt++

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json
            if ($healthData.status -eq "healthy") {
                $healthy = $true
                break
            }
        }
    } catch {
        # Service not ready yet, continue waiting
    }

    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if ($healthy) {
    Write-Host "`n=== Deployment Successful! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service is running at:" -ForegroundColor Cyan
    Write-Host "  Health Check:  http://localhost:$Port/health" -ForegroundColor White
    Write-Host "  RSS Feed:      http://localhost:$Port/feed.xml" -ForegroundColor White
    Write-Host "  API Docs:      http://localhost:$Port/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Available feeds:" -ForegroundColor Cyan
    Write-Host "  English:       http://localhost:$Port/feeds/en-us.xml" -ForegroundColor White
    Write-Host "  Italian:       http://localhost:$Port/feeds/it-it.xml" -ForegroundColor White
    Write-Host ""
    Write-Host "Management commands:" -ForegroundColor Cyan
    Write-Host "  View logs:     $composeCmd logs -f" -ForegroundColor White
    Write-Host "  Stop:          $composeCmd down" -ForegroundColor White
    Write-Host "  Restart:       $composeCmd restart" -ForegroundColor White
    Write-Host ""

    # Open browser
    if (-not $NoBrowser) {
        Write-Host "Opening browser..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:$Port/docs"
    }
} else {
    Write-Host "`nWarning: Service started but health check failed." -ForegroundColor Yellow
    Write-Host "  Container may still be initializing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check logs with:" -ForegroundColor Cyan
    Write-Host "  $composeCmd logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Check container status:" -ForegroundColor Cyan
    Write-Host "  docker ps" -ForegroundColor White
}

exit 0
