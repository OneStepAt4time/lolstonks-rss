# Backup Script for LoL Stonks RSS
# Creates backups of the database and configuration

param(
    [string]$BackupDir = "..\backups",
    [switch]$SkipStop,
    [int]$KeepDays = 30
)

$ErrorActionPreference = "Stop"

Write-Host "=== LoL Stonks RSS Backup ===" -ForegroundColor Green
Write-Host ""

# Navigate to project root
$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
Push-Location $projectRoot

try {
    # Create backup directory
    $backupDate = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $BackupDir "backup-$backupDate"

    Write-Host "Creating backup directory..." -ForegroundColor Yellow
    New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
    Write-Host "  Created: $backupPath" -ForegroundColor Green

    # Stop container if requested
    if (-not $SkipStop) {
        Write-Host "`nStopping container for clean backup..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "  Container stopped" -ForegroundColor Green
    } else {
        Write-Host "`nWarning: Creating backup while service is running (--SkipStop flag)" -ForegroundColor Yellow
        Write-Host "  This may result in inconsistent backup if database is being written to" -ForegroundColor Yellow
    }

    # Backup data directory
    Write-Host "`nBacking up data directory..." -ForegroundColor Yellow
    $dataDir = Join-Path $projectRoot "data"
    if (Test-Path $dataDir) {
        $dataBackup = Join-Path $backupPath "data"
        Copy-Item -Path $dataDir -Destination $dataBackup -Recurse -Force

        # Get backup size
        $size = (Get-ChildItem $dataBackup -Recurse | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        Write-Host "  Backed up data directory ($sizeMB MB)" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Data directory not found" -ForegroundColor Yellow
    }

    # Backup .env file
    Write-Host "`nBacking up configuration..." -ForegroundColor Yellow
    $envFile = Join-Path $projectRoot ".env"
    if (Test-Path $envFile) {
        Copy-Item -Path $envFile -Destination (Join-Path $backupPath ".env") -Force
        Write-Host "  Backed up .env file" -ForegroundColor Green
    } else {
        Write-Host "  No .env file found (using defaults)" -ForegroundColor Yellow
    }

    # Create backup manifest
    $manifest = @{
        timestamp = $backupDate
        version = "1.0"
        files = @()
    }

    Get-ChildItem $backupPath -Recurse -File | ForEach-Object {
        $manifest.files += @{
            path = $_.FullName.Replace($backupPath, "")
            size = $_.Length
            modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }

    $manifest | ConvertTo-Json -Depth 3 | Out-File (Join-Path $backupPath "manifest.json")
    Write-Host "  Created backup manifest" -ForegroundColor Green

    # Restart container if we stopped it
    if (-not $SkipStop) {
        Write-Host "`nRestarting container..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "  Container restarted" -ForegroundColor Green
    }

    # Clean up old backups
    if ($KeepDays -gt 0) {
        Write-Host "`nCleaning up old backups (keeping last $KeepDays days)..." -ForegroundColor Yellow
        $cutoffDate = (Get-Date).AddDays(-$KeepDays)

        Get-ChildItem $BackupDir -Directory | Where-Object {
            $_.Name -match "backup-(\d{8})-(\d{6})" -and $_.CreationTime -lt $cutoffDate
        } | ForEach-Object {
            Write-Host "  Removing old backup: $($_.Name)" -ForegroundColor Gray
            Remove-Item $_.FullName -Recurse -Force
        }
    }

    Write-Host "`n=== Backup Completed Successfully ===" -ForegroundColor Green
    Write-Host "  Location: $backupPath" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host "`nError during backup: $($_.Exception.Message)" -ForegroundColor Red

    # Try to restart container if we stopped it
    if (-not $SkipStop) {
        Write-Host "Attempting to restart container..." -ForegroundColor Yellow
        try {
            docker-compose up -d
        } catch {
            Write-Host "Failed to restart container. Please start manually." -ForegroundColor Red
        }
    }

    exit 1
} finally {
    Pop-Location
}

exit 0
