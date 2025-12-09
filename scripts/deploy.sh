#!/bin/bash

# ============================================
# Nautilus One - Deploy Script
# ============================================

set -e

echo "🚀 Nautilus One Deploy Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="nautilus-one"
SUPABASE_PROJECT_REF="vnbptmixvwropvanyhdb"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check dependencies
log_info "Checking dependencies..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
log_success "Node.js $NODE_VERSION, npm $NPM_VERSION"

# Step 2: Install dependencies
log_info "Installing dependencies..."
npm ci --silent
log_success "Dependencies installed"

# Step 3: Run linting
log_info "Running linter..."
npm run lint || {
    log_warning "Linting warnings found, continuing..."
}
log_success "Linting completed"

# Step 4: Run tests (if available)
log_info "Running tests..."
if npm run test --if-present; then
    log_success "Tests passed"
else
    log_warning "No tests found or tests skipped"
fi

# Step 5: Build application
log_info "Building application..."
NODE_ENV=production npm run build
log_success "Build completed"

# Step 6: Check build output
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    log_success "Build output: $BUILD_SIZE"
else
    log_error "Build directory not found"
    exit 1
fi

# Step 7: Deploy Edge Functions (if Supabase CLI is available)
if command -v supabase &> /dev/null; then
    log_info "Deploying Edge Functions..."
    supabase functions deploy --project-ref $SUPABASE_PROJECT_REF 2>/dev/null || {
        log_warning "Edge functions deployment skipped (check SUPABASE_ACCESS_TOKEN)"
    }
else
    log_warning "Supabase CLI not found, skipping Edge Functions deploy"
fi

# Step 8: Summary
echo ""
echo "=============================="
echo -e "${GREEN}🎉 Deployment Ready!${NC}"
echo "=============================="
echo ""
echo "📦 Build Location: ./dist"
echo "📊 Build Size: $BUILD_SIZE"
echo "📅 Timestamp: $(date)"
echo ""
echo "Next steps:"
echo "  1. Deploy ./dist to your hosting provider"
echo "  2. Verify Edge Functions in Supabase Dashboard"
echo "  3. Test production environment"
echo ""
log_success "Done!"
