#!/bin/bash
# PATCH 66.0 - Phase 2: Module Migration
# Moves active modules to new group structure

set -e

echo "🚀 PATCH 66.0 - Phase 2: Module Migration"
echo "=========================================="
echo ""

# Create backup first
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="archive/pre-patch66-backup-$TIMESTAMP"

echo "📦 Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r src/modules "$BACKUP_DIR/"
echo "✅ Backup created"
echo ""

# Create new group directories
echo "📁 Creating 15 logical groups..."
mkdir -p src/modules/{core,operations,compliance,intelligence,emergency,planning,logistics,hr,connectivity,control,workspace,assistants,monitoring,ui,shared}
echo "✅ Group directories created"
echo ""

# Function to move module
move_module() {
  local src=$1
  local dest=$2
  local name=$(basename "$src")
  
  if [ -d "$src" ]; then
    echo "  📦 Moving: $name → $dest"
    mv "$src" "$dest/"
    return 0
  else
    echo "  ⏭️  Skipped (not found): $name"
    return 1
  fi
}

MOVED_COUNT=0

echo "🚚 Phase 2A: Moving CORE modules..."
move_module "src/modules/system-kernel" "src/modules/core" && ((MOVED_COUNT++))
move_module "src/modules/auth" "src/modules/core" && ((MOVED_COUNT++))
move_module "src/modules/copilot" "src/modules/core" && ((MOVED_COUNT++))
move_module "src/modules/logger" "src/modules/core" && ((MOVED_COUNT++))
move_module "src/modules/monitoring" "src/modules/core" && ((MOVED_COUNT++))
echo "  ✅ CORE: $MOVED_COUNT modules moved"
echo ""

echo "🚚 Phase 2B: Moving OPERATIONS modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/crew" "src/modules/operations" && ((MOVED_COUNT++))
move_module "src/modules/fleet" "src/modules/operations" && ((MOVED_COUNT++))
move_module "src/modules/performance" "src/modules/operations" && ((MOVED_COUNT++))
move_module "src/modules/feedback" "src/modules/operations" && ((MOVED_COUNT++))
move_module "src/modules/crew-wellbeing" "src/modules/operations" && ((MOVED_COUNT++))
move_module "src/modules/user-management" "src/modules/operations" && ((MOVED_COUNT++))
echo "  ✅ OPERATIONS: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2C: Moving COMPLIANCE modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/audit-center" "src/modules/compliance" && ((MOVED_COUNT++))
move_module "src/modules/compliance-hub" "src/modules/compliance" && ((MOVED_COUNT++))
move_module "src/modules/sgso" "src/modules/compliance" && ((MOVED_COUNT++))
move_module "src/modules/reports" "src/modules/compliance" && ((MOVED_COUNT++))
# Rename documentos-ia to documents
if [ -d "src/modules/documentos-ia" ]; then
  echo "  📦 Moving & Renaming: documentos-ia → documents"
  mv "src/modules/documentos-ia" "src/modules/compliance/documents"
  ((MOVED_COUNT++))
fi
echo "  ✅ COMPLIANCE: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2D: Moving INTELLIGENCE modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/ai-insights" "src/modules/intelligence" && ((MOVED_COUNT++))
move_module "src/modules/dp-intelligence" "src/modules/intelligence" && ((MOVED_COUNT++))
move_module "src/modules/analytics-core" "src/modules/intelligence" && ((MOVED_COUNT++))
move_module "src/modules/automation" "src/modules/intelligence" && ((MOVED_COUNT++))
# Rename ai to ai-core
if [ -d "src/modules/ai" ]; then
  echo "  📦 Moving & Renaming: ai → ai-core"
  mv "src/modules/ai" "src/modules/intelligence/ai-core"
  ((MOVED_COUNT++))
fi
echo "  ✅ INTELLIGENCE: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2E: Moving EMERGENCY modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/emergency-response" "src/modules/emergency" && ((MOVED_COUNT++))
move_module "src/modules/mission-logs" "src/modules/emergency" && ((MOVED_COUNT++))
move_module "src/modules/risk-management" "src/modules/emergency" && ((MOVED_COUNT++))
move_module "src/modules/mission-control" "src/modules/emergency" && ((MOVED_COUNT++))
echo "  ✅ EMERGENCY: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2F: Moving PLANNING modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/mmi" "src/modules/planning" && ((MOVED_COUNT++))
move_module "src/modules/voyage-planner" "src/modules/planning" && ((MOVED_COUNT++))
move_module "src/modules/fmea" "src/modules/planning" && ((MOVED_COUNT++))
move_module "src/modules/project-timeline" "src/modules/planning" && ((MOVED_COUNT++))
echo "  ✅ PLANNING: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2G: Moving LOGISTICS modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/logistics-hub" "src/modules/logistics" && ((MOVED_COUNT++))
move_module "src/modules/fuel-optimizer" "src/modules/logistics" && ((MOVED_COUNT++))
move_module "src/modules/satellite-tracker" "src/modules/logistics" && ((MOVED_COUNT++))
echo "  ✅ LOGISTICS: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2H: Moving HR modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/peo-dp" "src/modules/hr" && ((MOVED_COUNT++))
move_module "src/modules/training-academy" "src/modules/hr" && ((MOVED_COUNT++))
# Rename portal-funcionario to portal
if [ -d "src/modules/portal-funcionario" ]; then
  echo "  📦 Moving & Renaming: portal-funcionario → portal"
  mv "src/modules/portal-funcionario" "src/modules/hr/portal"
  ((MOVED_COUNT++))
fi
echo "  ✅ HR: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2I: Moving CONNECTIVITY modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/channel-manager" "src/modules/connectivity" && ((MOVED_COUNT++))
move_module "src/modules/notifications-center" "src/modules/connectivity" && ((MOVED_COUNT++))
move_module "src/modules/api-gateway" "src/modules/connectivity" && ((MOVED_COUNT++))
echo "  ✅ CONNECTIVITY: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2J: Moving CONTROL modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/control-hub" "src/modules/control" && ((MOVED_COUNT++))
move_module "src/modules/bridgelink" "src/modules/control" && ((MOVED_COUNT++))
move_module "src/modules/forecast-global" "src/modules/control" && ((MOVED_COUNT++))
echo "  ✅ CONTROL: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2K: Moving WORKSPACE modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/real-time-workspace" "src/modules/workspace" && ((MOVED_COUNT++))
# Rename comunicacao to communication
if [ -d "src/modules/comunicacao" ]; then
  echo "  📦 Moving & Renaming: comunicacao → communication"
  mv "src/modules/comunicacao" "src/modules/workspace/communication"
  ((MOVED_COUNT++))
fi
echo "  ✅ WORKSPACE: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2L: Moving ASSISTANTS modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/voice-assistant" "src/modules/assistants" && ((MOVED_COUNT++))
echo "  ✅ ASSISTANTS: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "🚚 Phase 2M: Moving UI modules..."
PHASE_START=$MOVED_COUNT
move_module "src/modules/dashboard" "src/modules/ui" && ((MOVED_COUNT++))
echo "  ✅ UI: $((MOVED_COUNT - PHASE_START)) modules moved"
echo ""

echo "✅ Phase 2 Complete!"
echo "====================="
echo "📊 Total modules moved: $MOVED_COUNT"
echo "📁 Backup location: $BACKUP_DIR"
echo ""
echo "🔜 Next Phase: Archive deprecated modules"
echo "   Run: bash scripts/patch66-execute-phase3.sh"
