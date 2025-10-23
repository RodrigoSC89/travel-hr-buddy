#!/bin/bash
# PATCH 66.0 - Module Reorganization Script
# Reorganizes 74 folders into 15 logical groups

set -e

echo "🧱 PATCH 66.0 - Module Reorganization"
echo "====================================="
echo ""

# Create backup
BACKUP_DIR="archive/pre-patch66-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r src/modules "$BACKUP_DIR/"
echo "✅ Backup created"
echo ""

# Create new group directories
echo "📁 Creating group directories..."
GROUPS=(
  "core"
  "operations"
  "compliance"
  "intelligence"
  "emergency"
  "planning"
  "logistics"
  "hr"
  "connectivity"
  "control"
  "workspace"
  "assistants"
  "monitoring"
  "ui"
)

for group in "${GROUPS[@]}"; do
  mkdir -p "src/modules/$group"
  echo "  ✅ src/modules/$group"
done
echo ""

# Move modules to their groups
echo "🚚 Moving modules..."

# Core group
mv_module() {
  local src=$1
  local dest=$2
  if [ -d "$src" ]; then
    echo "  📦 $src → $dest"
    mv "$src" "$dest"
  else
    echo "  ⏭️  Skipped (not found): $src"
  fi
}

# Core
mv_module "src/modules/system-kernel" "src/modules/core/"
mv_module "src/modules/auth" "src/modules/core/"
mv_module "src/modules/copilot" "src/modules/core/"
mv_module "src/modules/logger" "src/modules/core/"

# Operations
mv_module "src/modules/crew" "src/modules/operations/"
mv_module "src/modules/fleet" "src/modules/operations/"
mv_module "src/modules/performance" "src/modules/operations/"
mv_module "src/modules/feedback" "src/modules/operations/"
mv_module "src/modules/crew-scheduler" "src/modules/operations/"
mv_module "src/modules/crew-wellbeing" "src/modules/operations/"

# Compliance
mv_module "src/modules/audit-center" "src/modules/compliance/"
mv_module "src/modules/compliance-hub" "src/modules/compliance/"
mv_module "src/modules/documents" "src/modules/compliance/"
mv_module "src/modules/sgso" "src/modules/compliance/"

# Intelligence
mv_module "src/modules/ai-insights" "src/modules/intelligence/"
mv_module "src/modules/dp-intelligence" "src/modules/intelligence/"
mv_module "src/modules/analytics-core" "src/modules/intelligence/"

# Emergency
mv_module "src/modules/emergency-response" "src/modules/emergency/"
mv_module "src/modules/mission-logs" "src/modules/emergency/"
mv_module "src/modules/risk-management" "src/modules/emergency/"

# Planning
mv_module "src/modules/mmi" "src/modules/planning/"
mv_module "src/modules/voyage-planner" "src/modules/planning/"
mv_module "src/modules/fmea" "src/modules/planning/"

# Logistics
mv_module "src/modules/logistics-hub" "src/modules/logistics/"
mv_module "src/modules/fuel-optimizer" "src/modules/logistics/"

# HR
mv_module "src/modules/portal-funcionario" "src/modules/hr/"
mv_module "src/modules/peo-dp" "src/modules/hr/"
mv_module "src/modules/training-academy" "src/modules/hr/"

# Connectivity
mv_module "src/modules/channel-manager" "src/modules/connectivity/"
mv_module "src/modules/notifications-center" "src/modules/connectivity/"
mv_module "src/modules/api-gateway" "src/modules/connectivity/"

# Control
mv_module "src/modules/control-hub" "src/modules/control/"
mv_module "src/modules/bridgelink" "src/modules/control/"
mv_module "src/modules/forecast-global" "src/modules/control/"

# Workspace
mv_module "src/modules/real-time-workspace" "src/modules/workspace/"

# Assistants
mv_module "src/modules/voice-assistant" "src/modules/assistants/"

# UI
mv_module "src/modules/dashboard" "src/modules/ui/"

echo ""
echo "✅ Module reorganization complete!"
echo ""
echo "📊 Summary:"
echo "  - Backup: $BACKUP_DIR"
echo "  - New structure: 15 logical groups"
echo "  - Legacy modules: archived separately"
echo ""
echo "🔜 Next steps:"
echo "  1. Run: npm run patch66:update-imports"
echo "  2. Run: npm run test"
echo "  3. Review: logs/patch66-module-mapping.md"
