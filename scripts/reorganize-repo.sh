#!/bin/bash
# Repository Reorganization Script
# Nauti One v4.0 - Structure Cleanup
#
# Usage: ./scripts/reorganize-repo.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "⚠️  DRY RUN MODE - No changes will be made"
fi

echo ""
echo "🔄 Nauti One Repository Reorganization"
echo "========================================"
echo ""

# Helper function
run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] $1"
  else
    eval "$1"
  fi
}

# 1. Create required directory structure
echo "📁 Creating directory structure..."

DIRS=(
  "docs/api"
  "docs/architecture"
  "docs/setup"
  "docs/troubleshooting"
  "src/components/ui"
  "src/components/layout"
  "src/components/features"
  "src/lib"
  "src/styles"
  "tests/unit"
  "tests/integration"
  "tests/e2e"
  "scripts"
  "public/images"
  "public/fonts"
)

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    run_cmd "mkdir -p $dir"
    echo "  ✓ Created $dir"
  fi
done

# 2. Clean temporary files
echo ""
echo "🧹 Cleaning temporary files..."

TEMP_PATTERNS=(
  ".DS_Store"
  "Thumbs.db"
  "*.log"
  "*.tmp"
  ".*.swp"
  ".*.swo"
  "*~"
)

for pattern in "${TEMP_PATTERNS[@]}"; do
  count=$(find . -name "$pattern" 2>/dev/null | wc -l)
  if [ "$count" -gt 0 ]; then
    run_cmd "find . -name \"$pattern\" -delete 2>/dev/null || true"
    echo "  ✓ Removed $count $pattern files"
  fi
done

# 3. Remove orphaned node_modules
echo ""
echo "🗑️  Checking for orphaned node_modules..."

orphaned=$(find . -name "node_modules" -type d -prune ! -path "./node_modules" 2>/dev/null | wc -l)
if [ "$orphaned" -gt 0 ]; then
  echo "  Found $orphaned orphaned node_modules directories"
  run_cmd "find . -name \"node_modules\" -type d -prune ! -path \"./node_modules\" -exec rm -rf {} + 2>/dev/null || true"
  echo "  ✓ Cleaned orphaned node_modules"
else
  echo "  ✓ No orphaned node_modules found"
fi

# 4. Clean build artifacts
echo ""
echo "🏗️  Cleaning build artifacts..."

BUILD_DIRS=("dist" "build" ".cache" ".parcel-cache" ".next" ".turbo")

for dir in "${BUILD_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    run_cmd "rm -rf $dir"
    echo "  ✓ Removed $dir"
  fi
done

# 5. Clean coverage reports
if [ -d "coverage" ]; then
  run_cmd "rm -rf coverage"
  echo "  ✓ Removed coverage directory"
fi

# 6. Remove analysis output files
echo ""
echo "📊 Cleaning analysis output files..."

ANALYSIS_FILES=(
  "dead-routes.json"
  "unused-components.json"
  "dead-code-report.json"
  "codebase-audit.json"
  "conformity-report.json"
  "tables-validation-report.json"
  "files-to-delete.txt"
  "route-audit-report.txt"
)

for file in "${ANALYSIS_FILES[@]}"; do
  if [ -f "$file" ]; then
    run_cmd "rm -f $file"
    echo "  ✓ Removed $file"
  fi
done

# 7. Verify critical files exist
echo ""
echo "✅ Verifying critical files..."

CRITICAL_FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  "tailwind.config.ts"
  "src/App.tsx"
  "src/main.tsx"
  "index.html"
)

missing=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ❌ MISSING: $file"
    missing=$((missing + 1))
  fi
done

# 8. Calculate disk space
echo ""
echo "📦 Disk space summary..."

if [ "$DRY_RUN" = false ]; then
  src_size=$(du -sh src/ 2>/dev/null | cut -f1)
  public_size=$(du -sh public/ 2>/dev/null | cut -f1)
  total_size=$(du -sh . 2>/dev/null | cut -f1)
  
  echo "  src/:    $src_size"
  echo "  public/: $public_size"
  echo "  Total:   $total_size"
fi

# Summary
echo ""
echo "========================================"
echo "✅ Reorganization complete!"
echo ""

if [ "$missing" -gt 0 ]; then
  echo "⚠️  Warning: $missing critical files missing"
fi

if [ "$DRY_RUN" = true ]; then
  echo "💡 Run without --dry-run to apply changes"
fi

echo ""
