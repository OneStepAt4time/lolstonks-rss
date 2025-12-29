# Health Monitoring Script for LoL Stonks RSS
# Continuously monitors the health of the RSS service

param(
    [int]$IntervalSeconds = 60,
    [string]$Port = "8000",
    [string]$LogFile = ""
)

$ErrorActionPreference = "Continue"

Write-Host "=== LoL Stonks RSS Health Monitor ===" -ForegroundColor Green
Write-Host "Monitoring http://localhost:$Port/health" -ForegroundColor Cyan
Write-Host "Interval: $IntervalSeconds seconds" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$consecutiveFailures = 0
$totalChecks = 0
$totalSuccess = 0
$totalFailures = 0

function Write-Log {
    param($Message, $Color = "White", $IsError = $false)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"

    Write-Host $logMessage -ForegroundColor $Color

    if ($LogFile) {
        Add-Content -Path $LogFile -Value $logMessage
    }
}

while ($true) {
    $totalChecks++

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 10

        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json

            if ($healthData.status -eq "healthy") {
                $totalSuccess++
                $consecutiveFailures = 0

                $uptime = if ($healthData.uptime) { " | Uptime: $($healthData.uptime)s" } else { "" }
                Write-Log "Service healthy$uptime" -Color Green
            } else {
                $totalFailures++
                $consecutiveFailures++
                Write-Log "Service unhealthy - Status: $($healthData.status)" -Color Yellow -IsError $true
            }
        } else {
            $totalFailures++
            $consecutiveFailures++
            Write-Log "Service unhealthy - HTTP Status: $($response.StatusCode)" -Color Yellow -IsError $true
        }
    } catch {
        $totalFailures++
        $consecutiveFailures++
        Write-Log "Service unreachable - Error: $($_.Exception.Message)" -Color Red -IsError $true
    }

    # Alert on consecutive failures
    if ($consecutiveFailures -eq 3) {
        Write-Log "ALERT: 3 consecutive failures detected!" -Color Red -IsError $true
    } elseif ($consecutiveFailures -eq 10) {
        Write-Log "CRITICAL: 10 consecutive failures detected!" -Color Red -IsError $true
    }

    # Show statistics every 10 checks
    if ($totalChecks % 10 -eq 0) {
        $successRate = [math]::Round(($totalSuccess / $totalChecks) * 100, 2)
        Write-Host ""
        Write-Host "--- Statistics ---" -ForegroundColor Cyan
        Write-Host "Total Checks: $totalChecks" -ForegroundColor White
        Write-Host "Success: $totalSuccess ($successRate%)" -ForegroundColor Green
        Write-Host "Failures: $totalFailures" -ForegroundColor Red
        Write-Host "Consecutive Failures: $consecutiveFailures" -ForegroundColor Yellow
        Write-Host ""
    }

    Start-Sleep -Seconds $IntervalSeconds
}
