#!/bin/bash
#
# DP ASOG Service - Deployment Script (Bash)
# 
# Deploy automatizado do DP ASOG Service (Python FastAPI) via Docker
# 
# Uso:
#   ./deploy-dp-asog.sh dev
#   ./deploy-dp-asog.sh prod --port 8000
#   ./deploy-dp-asog.sh staging --skip-build

set -e

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT=${1:-dev}
PORT=${PORT:-8000}
SERVICE_PATH=${SERVICE_PATH:-./dp-asog-service}
IMAGE_NAME="dp-asog-service"
CONTAINER_NAME="dp-asog-$ENVIRONMENT"
CONFIG_FILE="asog.$ENVIRONMENT.yml"
SKIP_BUILD=false
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}DP ASOG Service - Deploy Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Port: $PORT${NC}"
echo -e "${YELLOW}Container: $CONTAINER_NAME${NC}"
echo ""

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo -e "${GREEN}[1/6] Pre-flight checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}  ✗ Docker not found! Please install Docker.${NC}"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}  ✓ Docker installed: $DOCKER_VERSION${NC}"

# Check service path
if [ ! -d "$SERVICE_PATH" ]; then
    echo -e "${RED}  ✗ Service path not found: $SERVICE_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Service path found: $SERVICE_PATH${NC}"

# Check config file
CONFIG_PATH="$SERVICE_PATH/$CONFIG_FILE"
if [ ! -f "$CONFIG_PATH" ]; then
    echo -e "${YELLOW}  ⚠ Config file not found: $CONFIG_FILE (using default)${NC}"
    CONFIG_PATH="$SERVICE_PATH/asog.example.yml"
fi

echo -e "${GREEN}  ✓ Config file: $CONFIG_FILE${NC}"
echo ""

# ============================================================================
# Stop existing container
# ============================================================================

echo -e "${GREEN}[2/6] Stopping existing container...${NC}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if [ "$FORCE" = true ]; then
        echo -e "${YELLOW}  → Stopping and removing $CONTAINER_NAME...${NC}"
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
        echo -e "${GREEN}  ✓ Container removed${NC}"
    else
        echo -e "${YELLOW}  ⚠ Container $CONTAINER_NAME already exists!${NC}"
        read -p "  Replace existing container? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
            docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
            echo -e "${GREEN}  ✓ Container removed${NC}"
        else
            echo -e "${RED}  ✗ Deploy cancelled${NC}"
            exit 0
        fi
    fi
else
    echo -e "  → No existing container found"
fi

echo ""

# ============================================================================
# Build Docker image
# ============================================================================

if [ "$SKIP_BUILD" = false ]; then
    echo -e "${GREEN}[3/6] Building Docker image...${NC}"
    
    cd "$SERVICE_PATH"
    
    BUILD_START=$(date +%s)
    docker build -t "${IMAGE_NAME}:${ENVIRONMENT}" -t "${IMAGE_NAME}:latest" .
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    
    cd - > /dev/null
    
    echo -e "${GREEN}  ✓ Build completed in ${BUILD_TIME}s${NC}"
else
    echo -e "${YELLOW}[3/6] Skipping build (using existing image)${NC}"
fi

echo ""

# ============================================================================
# Run container
# ============================================================================

echo -e "${GREEN}[4/6] Starting container...${NC}"

DOCKER_RUN_ARGS=(
    "-d"
    "--name" "$CONTAINER_NAME"
    "-p" "${PORT}:8000"
    "-v" "${CONFIG_PATH}:/app/asog.yml:ro"
    "--restart" "unless-stopped"
)

# Environment-specific settings
if [ "$ENVIRONMENT" = "prod" ]; then
    DOCKER_RUN_ARGS+=("--memory" "2g" "--cpus" "2")
    echo -e "${YELLOW}  → Production mode: 2GB RAM, 2 CPUs${NC}"
elif [ "$ENVIRONMENT" = "staging" ]; then
    DOCKER_RUN_ARGS+=("--memory" "1g" "--cpus" "1")
    echo -e "${YELLOW}  → Staging mode: 1GB RAM, 1 CPU${NC}"
fi

docker run "${DOCKER_RUN_ARGS[@]}" "${IMAGE_NAME}:${ENVIRONMENT}" > /dev/null

echo -e "${GREEN}  ✓ Container started: $CONTAINER_NAME${NC}"
echo ""

# ============================================================================
# Health check
# ============================================================================

echo -e "${GREEN}[5/6] Health check...${NC}"

sleep 3

HEALTH_URL="http://localhost:${PORT}/docs"
MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$HEALTHY" = false ]; do
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        HEALTHY=true
        echo -e "${GREEN}  ✓ Service is healthy!${NC}"
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "  → Waiting for service... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    fi
done

if [ "$HEALTHY" = false ]; then
    echo -e "${YELLOW}  ⚠ Health check timeout!${NC}"
    echo -e "${YELLOW}  → Check logs: docker logs $CONTAINER_NAME${NC}"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${GREEN}[6/6] Deployment complete!${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Container Info:${NC}"
echo -e "${CYAN}========================================${NC}"
echo "Name:        $CONTAINER_NAME"
echo "Image:       ${IMAGE_NAME}:${ENVIRONMENT}"
echo "Port:        $PORT"
echo "Config:      $CONFIG_FILE"
echo ""
echo -e "${CYAN}URLs:${NC}"
echo "  Swagger UI:  http://localhost:${PORT}/docs"
echo "  Kp Index:    http://localhost:${PORT}/spaceweather/kp"
echo "  PDOP:        http://localhost:${PORT}/gnss/pdop?lat=-22.9&lon=-43.2&hours=6"
echo "  Status:      http://localhost:${PORT}/status?lat=-22.9&lon=-43.2&hours=6"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo "  Logs:        docker logs -f $CONTAINER_NAME"
echo "  Stop:        docker stop $CONTAINER_NAME"
echo "  Restart:     docker restart $CONTAINER_NAME"
echo "  Remove:      docker rm -f $CONTAINER_NAME"
echo ""

# ============================================================================
# Quick test
# ============================================================================

if [ "$HEALTHY" = true ]; then
    echo -e "${CYAN}Quick Test:${NC}"
    
    KP_URL="http://localhost:${PORT}/spaceweather/kp"
    KP_RESPONSE=$(curl -s "$KP_URL")
    
    if [ -n "$KP_RESPONSE" ]; then
        KP_VALUE=$(echo "$KP_RESPONSE" | grep -o '"kp":[0-9.]*' | cut -d':' -f2)
        echo -e "${GREEN}  Kp Index: $KP_VALUE${NC}"
    else
        echo -e "${YELLOW}  ⚠ Quick test failed${NC}"
    fi
    
    echo ""
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Deploy completed successfully! 🚀${NC}"
echo -e "${CYAN}========================================${NC}"
