#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# NAUTI ONE v4.0 - Rollback Script
# ═══════════════════════════════════════════════════════════════
# Usage: ./scripts/rollback.sh <version_or_commit>
# Example: ./scripts/rollback.sh v3.9.0
# Example: ./scripts/rollback.sh abc1234
# ═══════════════════════════════════════════════════════════════

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: Version or commit hash required"
    echo "Usage: ./scripts/rollback.sh <version_or_commit>"
    echo ""
    echo "Recent versions:"
    git tag --sort=-creatordate | head -5
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "🔄 NAUTI ONE ROLLBACK"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Target: $VERSION"
echo ""

# Confirm
read -p "⚠️  Are you sure you want to rollback to $VERSION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Create backup branch
BACKUP_BRANCH="backup-before-rollback-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup branch: $BACKUP_BRANCH"
git branch $BACKUP_BRANCH

# Checkout target version
echo "🔄 Checking out $VERSION..."
git checkout $VERSION

# Build
echo "🏗️  Building application..."
if command -v bun &> /dev/null; then
    bun install
    bun run build
else
    npm install
    npm run build
fi

# Validate build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    echo "Restoring previous state..."
    git checkout -
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ ROLLBACK COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Current version: $VERSION"
echo "Backup branch: $BACKUP_BRANCH"
echo ""
echo "Next steps:"
echo "1. Test the application locally: bun run preview"
echo "2. Deploy via Lovable or your CI/CD"
echo "3. Monitor for issues"
echo ""
echo "To restore: git checkout main && git merge $BACKUP_BRANCH"
