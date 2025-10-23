#!/bin/bash
# PATCH 66.0 - Phase 3: Archive Deprecated Modules

set -e

echo "🗄️  PATCH 66.0 - Phase 3: Archive Deprecated"
echo "============================================"
echo ""

# Create archive directory
ARCHIVE_DIR="archive/deprecated-modules-patch66"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Archive directory: $ARCHIVE_DIR"
echo ""

# Function to archive module
archive_module() {
  local module=$1
  local src="src/modules/$module"
  
  if [ -d "$src" ]; then
    echo "  🗄️  Archiving: $module"
    mv "$src" "$ARCHIVE_DIR/"
    return 0
  else
    echo "  ⏭️  Skipped (not found): $module"
    return 1
  fi
}

ARCHIVED_COUNT=0

echo "🗄️  Archiving deprecated modules..."
echo ""

# Duplicates
archive_module "control_hub" && ((ARCHIVED_COUNT++))
archive_module "controlhub" && ((ARCHIVED_COUNT++))
archive_module "peodp_ai" && ((ARCHIVED_COUNT++))

# Legacy systems
archive_module "peotram" && ((ARCHIVED_COUNT++))
archive_module "assistente-ia" && ((ARCHIVED_COUNT++))

# Merged modules
archive_module "ia-inovacao" && ((ARCHIVED_COUNT++))
archive_module "automacao-ia" && ((ARCHIVED_COUNT++))
archive_module "analytics-avancado" && ((ARCHIVED_COUNT++))
archive_module "analytics-tempo-real" && ((ARCHIVED_COUNT++))
archive_module "business-intelligence" && ((ARCHIVED_COUNT++))
archive_module "monitor-avancado" && ((ARCHIVED_COUNT++))
archive_module "monitor-sistema" && ((ARCHIVED_COUNT++))
archive_module "sistema-maritimo" && ((ARCHIVED_COUNT++))
archive_module "colaboracao" && ((ARCHIVED_COUNT++))
archive_module "configuracoes" && ((ARCHIVED_COUNT++))
archive_module "centro-ajuda" && ((ARCHIVED_COUNT++))
archive_module "hub-integracoes" && ((ARCHIVED_COUNT++))
archive_module "incident-reports" && ((ARCHIVED_COUNT++))
archive_module "maintenance-planner" && ((ARCHIVED_COUNT++))
archive_module "otimizacao" && ((ARCHIVED_COUNT++))
archive_module "otimizacao-mobile" && ((ARCHIVED_COUNT++))
archive_module "reservas" && ((ARCHIVED_COUNT++))
archive_module "risk-audit" && ((ARCHIVED_COUNT++))
archive_module "smart-workflow" && ((ARCHIVED_COUNT++))
archive_module "task-automation" && ((ARCHIVED_COUNT++))
archive_module "templates" && ((ARCHIVED_COUNT++))
archive_module "vault_ai" && ((ARCHIVED_COUNT++))
archive_module "viagens" && ((ARCHIVED_COUNT++))
archive_module "visao-geral" && ((ARCHIVED_COUNT++))
archive_module "weather-dashboard" && ((ARCHIVED_COUNT++))
archive_module "alertas-precos" && ((ARCHIVED_COUNT++))
archive_module "finance-hub" && ((ARCHIVED_COUNT++))
archive_module "forecast" && ((ARCHIVED_COUNT++))
archive_module "checklists-inteligentes" && ((ARCHIVED_COUNT++))

echo ""
echo "✅ Phase 3 Complete!"
echo "===================="
echo "📊 Total archived: $ARCHIVED_COUNT modules"
echo "📁 Archive location: $ARCHIVE_DIR"
echo ""
echo "🔜 Next Phase: Update import paths"
echo "   Run: npm run patch66:update-imports"
