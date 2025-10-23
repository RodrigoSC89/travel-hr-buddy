#!/bin/bash
# PATCH 61.0 - Module Consolidation Script
# Archives deprecated folders and consolidates module structure

echo "🧹 PATCH 61.0 - Consolidating Module Structure"
echo "================================================"

# Create archive directory
ARCHIVE_DIR="archive/deprecated-modules-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Archive directory: $ARCHIVE_DIR"
echo ""

# Deprecated folders to archive
DEPRECATED_FOLDERS=(
  "control_hub"
  "controlhub"
  "peodp_ai"
  "peotram"
  "assistente-ia"
  "ia-inovacao"
  "automacao-ia"
  "analytics-avancado"
  "analytics-tempo-real"
  "business-intelligence"
  "monitor-avancado"
  "monitor-sistema"
  "sistema-maritimo"
  "colaboracao"
  "configuracoes"
  "centro-ajuda"
  "hub-integracoes"
  "incident-reports"
  "maintenance-planner"
  "mission-logs"
  "otimizacao"
  "otimizacao-mobile"
  "project-timeline"
  "reservas"
  "risk-audit"
  "risk-management"
  "smart-workflow"
  "task-automation"
  "templates"
  "vault_ai"
  "viagens"
  "visao-geral"
  "weather-dashboard"
  "alertas-precos"
  "finance-hub"
  "forecast"
  "ai"
)

ARCHIVED_COUNT=0
SKIPPED_COUNT=0

# Archive each deprecated folder
for folder in "${DEPRECATED_FOLDERS[@]}"; do
  SOURCE="src/modules/$folder"
  
  if [ -d "$SOURCE" ]; then
    echo "📦 Archiving: $folder"
    mv "$SOURCE" "$ARCHIVE_DIR/"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
  else
    echo "⏭️  Skipping (not found): $folder"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
  fi
done

echo ""
echo "✅ Consolidation Complete!"
echo "=========================="
echo "📊 Archived: $ARCHIVED_COUNT folders"
echo "⏭️  Skipped: $SKIPPED_COUNT folders (not found)"
echo "📁 Archive location: $ARCHIVE_DIR"
echo ""
echo "🔜 Next Steps:"
echo "   1. Review archived folders in: $ARCHIVE_DIR"
echo "   2. Update any broken imports"
echo "   3. Run: npm run build"
echo "   4. Test all module routes"
echo ""
echo "💡 To restore a module:"
echo "   mv $ARCHIVE_DIR/<folder-name> src/modules/"
