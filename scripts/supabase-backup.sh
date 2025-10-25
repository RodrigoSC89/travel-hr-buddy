#!/bin/bash

# Nautilus One - Supabase Backup Script
# PATCH 160.0 - Database Backup Automation
#
# This script creates automated backups of Supabase databases
# Supports all environments: development, staging, production
#
# Usage: ./scripts/supabase-backup.sh [environment]
# Example: ./scripts/supabase-backup.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/supabase"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🔄 Nautilus One - Supabase Backup${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo "================================================"

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}❌ Invalid environment. Use: development, staging, or production${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment-specific configuration
if [ "$ENVIRONMENT" == "development" ]; then
    ENV_FILE=".env.development"
elif [ "$ENVIRONMENT" == "staging" ]; then
    ENV_FILE=".env.staging"
else
    ENV_FILE=".env.production"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
    exit 1
fi

# Source environment variables
source <(grep -v '^#' "$ENV_FILE" | sed 's/^/export /')

# Extract Supabase connection details
SUPABASE_URL=${SUPABASE_URL:-$VITE_SUPABASE_URL}
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Could not extract Supabase project reference${NC}"
    exit 1
fi

echo "Project Reference: $PROJECT_REF"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/${ENVIRONMENT}_${PROJECT_REF}_${TIMESTAMP}.sql"

echo -e "\n${YELLOW}📦 Creating backup...${NC}"
echo "Backup file: $BACKUP_FILE"

# Create the backup using Supabase CLI
# Note: This requires proper authentication
if supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Backup created successfully${NC}"
    
    # Get file size
    FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "File size: $FILESIZE"
    
    # Compress the backup
    echo -e "\n${YELLOW}🗜️  Compressing backup...${NC}"
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo -e "${GREEN}✅ Compression complete${NC}"
    echo "Compressed size: $COMPRESSED_SIZE"
    
    # Create backup metadata
    METADATA_FILE="$BACKUP_DIR/${ENVIRONMENT}_${PROJECT_REF}_${TIMESTAMP}_metadata.json"
    cat > "$METADATA_FILE" << EOF
{
  "environment": "$ENVIRONMENT",
  "project_ref": "$PROJECT_REF",
  "timestamp": "$TIMESTAMP",
  "backup_date": "$(date -Iseconds)",
  "backup_file": "$COMPRESSED_FILE",
  "original_size": "$FILESIZE",
  "compressed_size": "$COMPRESSED_SIZE",
  "supabase_url": "$SUPABASE_URL"
}
EOF
    
    echo -e "\n${GREEN}📝 Metadata saved: $METADATA_FILE${NC}"
    
    # List recent backups
    echo -e "\n${YELLOW}📋 Recent backups for ${ENVIRONMENT}:${NC}"
    ls -lht "$BACKUP_DIR/${ENVIRONMENT}"*  2>/dev/null | head -5 || echo "No previous backups found"
    
    # Cleanup old backups (keep last 7)
    echo -e "\n${YELLOW}🧹 Cleaning up old backups...${NC}"
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR/${ENVIRONMENT}"*.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 7 ]; then
        OLD_BACKUPS=$(ls -1t "$BACKUP_DIR/${ENVIRONMENT}"*.gz | tail -n +8)
        for OLD_BACKUP in $OLD_BACKUPS; do
            rm -f "$OLD_BACKUP"
            rm -f "${OLD_BACKUP%.gz}_metadata.json"
            echo "Removed: $OLD_BACKUP"
        done
        echo -e "${GREEN}✅ Cleanup complete${NC}"
    else
        echo "No cleanup needed (${BACKUP_COUNT} backups)"
    fi
    
    # Success summary
    echo -e "\n${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Backup file: $COMPRESSED_FILE"
    echo "Metadata: $METADATA_FILE"
    echo ""
    echo "To restore this backup, use:"
    echo "  ./scripts/init-system.sh restore $COMPRESSED_FILE"
    
else
    echo -e "${RED}❌ Backup failed${NC}"
    echo "This may be due to:"
    echo "  1. Missing Supabase authentication"
    echo "  2. Invalid project reference"
    echo "  3. Network connectivity issues"
    echo ""
    echo "Please ensure you're logged in to Supabase CLI:"
    echo "  supabase login"
    exit 1
fi
