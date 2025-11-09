# DP ASOG Service - Deployment Script (Windows PowerShell)
# 
# Deploy automatizado do DP ASOG Service (Python FastAPI) via Docker
# 
# Uso:
#   .\deploy-dp-asog.ps1 -Environment dev
#   .\deploy-dp-asog.ps1 -Environment prod -Port 8000

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment,
    
    [int]$Port = 8000,
    
    [string]$ServicePath = ".\dp-asog-service",
    
    [switch]$SkipBuild,
    
    [switch]$Force
)

# ============================================================================
# Configuration
# ============================================================================

$ImageName = "dp-asog-service"
$ContainerName = "dp-asog-$Environment"
$ConfigFile = "asog.$Environment.yml"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DP ASOG Service - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Port: $Port" -ForegroundColor Yellow
Write-Host "Container: $ContainerName" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# Pre-flight Checks
# ============================================================================

Write-Host "[1/6] Pre-flight checks..." -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker not found! Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if service path exists
if (-not (Test-Path $ServicePath)) {
    Write-Host "  ✗ Service path not found: $ServicePath" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Service path found: $ServicePath" -ForegroundColor Green

# Check if config file exists
$ConfigPath = Join-Path $ServicePath $ConfigFile
if (-not (Test-Path $ConfigPath)) {
    Write-Host "  ⚠ Config file not found: $ConfigFile (using default)" -ForegroundColor Yellow
    $ConfigPath = Join-Path $ServicePath "asog.example.yml"
}

Write-Host "  ✓ Config file: $ConfigFile" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Stop existing container
# ============================================================================

Write-Host "[2/6] Stopping existing container..." -ForegroundColor Green

$existingContainer = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}"

if ($existingContainer -eq $ContainerName) {
    if ($Force) {
        Write-Host "  → Stopping and removing $ContainerName..." -ForegroundColor Yellow
        docker stop $ContainerName | Out-Null
        docker rm $ContainerName | Out-Null
        Write-Host "  ✓ Container removed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Container $ContainerName already exists!" -ForegroundColor Yellow
        Write-Host "    Use -Force to replace it." -ForegroundColor Yellow
        $response = Read-Host "  Replace existing container? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            docker stop $ContainerName | Out-Null
            docker rm $ContainerName | Out-Null
            Write-Host "  ✓ Container removed" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Deploy cancelled" -ForegroundColor Red
            exit 0
        }
    }
} else {
    Write-Host "  → No existing container found" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# Build Docker image
# ============================================================================

if (-not $SkipBuild) {
    Write-Host "[3/6] Building Docker image..." -ForegroundColor Green
    
    Push-Location $ServicePath
    
    $buildStart = Get-Date
    docker build -t "${ImageName}:${Environment}" -t "${ImageName}:latest" .
    $buildEnd = Get-Date
    $buildTime = ($buildEnd - $buildStart).TotalSeconds
    
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Build completed in $($buildTime.ToString('F1'))s" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Build failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[3/6] Skipping build (using existing image)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Run container
# ============================================================================

Write-Host "[4/6] Starting container..." -ForegroundColor Green

$dockerRunArgs = @(
    "run",
    "-d",
    "--name", $ContainerName,
    "-p", "${Port}:8000",
    "-v", "${ServicePath}/${ConfigFile}:/app/asog.yml:ro",
    "--restart", "unless-stopped"
)

# Environment-specific settings
if ($Environment -eq "prod") {
    $dockerRunArgs += "--memory", "2g"
    $dockerRunArgs += "--cpus", "2"
    Write-Host "  → Production mode: 2GB RAM, 2 CPUs" -ForegroundColor Yellow
} elseif ($Environment -eq "staging") {
    $dockerRunArgs += "--memory", "1g"
    $dockerRunArgs += "--cpus", "1"
    Write-Host "  → Staging mode: 1GB RAM, 1 CPU" -ForegroundColor Yellow
}

$dockerRunArgs += "${ImageName}:${Environment}"

docker @dockerRunArgs | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Container started: $ContainerName" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# Health check
# ============================================================================

Write-Host "[5/6] Health check..." -ForegroundColor Green

Start-Sleep -Seconds 3

$healthCheckUrl = "http://localhost:${Port}/docs"
$maxRetries = 10
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries -and -not $healthy) {
    try {
        $response = Invoke-WebRequest -Uri $healthCheckUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            Write-Host "  ✓ Service is healthy!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "  → Waiting for service... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $healthy) {
    Write-Host "  ⚠ Health check timeout!" -ForegroundColor Yellow
    Write-Host "  → Check logs: docker logs $ContainerName" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Summary
# ============================================================================

Write-Host "[6/6] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Container Info:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Name:        $ContainerName" -ForegroundColor White
Write-Host "Image:       ${ImageName}:${Environment}" -ForegroundColor White
Write-Host "Port:        $Port" -ForegroundColor White
Write-Host "Config:      $ConfigFile" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Swagger UI:  http://localhost:${Port}/docs" -ForegroundColor White
Write-Host "  Kp Index:    http://localhost:${Port}/spaceweather/kp" -ForegroundColor White
Write-Host "  PDOP:        http://localhost:${Port}/gnss/pdop?lat=-22.9&lon=-43.2&hours=6" -ForegroundColor White
Write-Host "  Status:      http://localhost:${Port}/status?lat=-22.9&lon=-43.2&hours=6" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  Logs:        docker logs -f $ContainerName" -ForegroundColor White
Write-Host "  Stop:        docker stop $ContainerName" -ForegroundColor White
Write-Host "  Restart:     docker restart $ContainerName" -ForegroundColor White
Write-Host "  Remove:      docker rm -f $ContainerName" -ForegroundColor White
Write-Host ""

# ============================================================================
# Quick test
# ============================================================================

if ($healthy) {
    Write-Host "Quick Test:" -ForegroundColor Cyan
    
    try {
        $kpUrl = "http://localhost:${Port}/spaceweather/kp"
        $kpResponse = Invoke-RestMethod -Uri $kpUrl -UseBasicParsing
        
        Write-Host "  Kp Index: $($kpResponse.kp)" -ForegroundColor Green
        Write-Host "  Timestamp: $($kpResponse.timestamp)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Quick test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy completed successfully! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
