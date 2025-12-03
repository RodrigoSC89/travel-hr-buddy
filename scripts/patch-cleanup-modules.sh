#!/bin/bash
# PATCH 68.5 - Module Cleanup Script
# Archives unused module folders based on registry analysis

echo "🧹 PATCH 68.5 - Module Cleanup"
echo "=============================="

# Create archive directory
ARCHIVE_DIR="archive/unused-modules-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Archive directory: $ARCHIVE_DIR"
echo ""

# Modules that ARE referenced in registry.ts (KEEP THESE):
# - admin, ai, analytics, api-gateway, assistant, assistants, auto-sub
# - communication, communication-center, compliance, configuration, control, core
# - deep-risk-ai, document-hub, drone-commander
# - features, finance, finance-hub, fleet, forecast
# - hr, incident-reports, integrations, intelligence
# - logs-center, maintenance-planner, mission-control
# - ocean-sonar, operations
# - performance, planning, price-alerts, project-timeline
# - shared, sonar-ai, system-watchdog
# - task-automation, templates, training, travel
# - ui, underwater-drone, user-management
# - vault_ai, voice-assistant, weather-dashboard, workspace

# Modules NOT referenced (candidates for archival):
UNUSED_MODULES=(
  "adaptive-ui"
  "ai-coordination"
  "ai-evolution"
  "ai-logging"
  "ai-training"
  "ai-translator"
  "ai-vision-core"
  "audit"
  "auto-reconfig"
  "auto-tuning"
  "autodocs"
  "autoexec"
  "awareness-dashboard"
  "beta-users"
  "blockchain-integration"
  "certification-center"
  "connectivity"
  "consolidation"
  "coordination"
  "coordination-ai"
  "copilot-presenter"
  "crew"
  "decision-simulator"
  "digital-signature"
  "drone-fleet"
  "emergency"
  "emotion-feedback"
  "empathy"
  "esg-dashboard"
  "evolution-tracker"
  "executive-summary"
  "forecast-engine"
  "governance"
  "health-monitor"
  "i18n-dashboard"
  "i18n-hooks"
  "incident-center"
  "incident-replay"
  "incident-replayer"
  "incident-timeline"
  "incidents"
  "ism-audits"
  "joint-decision"
  "llm-multilingual"
  "logistics"
  "lsa-ffa-inspections"
  "mission-engine"
  "mission-intelligence"
  "mission-mobile"
  "mission-replay"
  "missions"
  "multilingual-logs"
  "navigation-copilot"
  "neural-governance"
  "neuro-adapter"
  "ocean-sonar-ai"
  "pattern-recognition"
  "pre-psc"
  "predictive-strategy"
  "price-predictor"
  "quality-dashboard"
  "reaction-mapper"
  "reflective-core"
  "regression"
  "release-notes"
  "remote-audits"
  "reporting-engine"
  "resilience-tracker"
  "risk-analysis"
  "risk-audit"
  "risk-operations"
  "route-planner"
  "satcom"
  "satellite"
  "satellite-tracker"
  "security-validation"
  "self-diagnosis"
  "sensors"
  "sensors-hub"
  "signal-collector"
  "situational-awareness"
  "smart-drills"
  "smart-scheduler"
  "sociocognitive"
  "strategic-consensus"
  "stress-test"
  "surface-bot"
  "system-status"
  "system-sweep"
  "tactical-response"
  "testing"
  "theme-manager"
  "travel-intelligence"
  "travel-search"
  "travel-system"
  "trust-analysis"
  "validation"
  "watchdog"
)

ARCHIVED_COUNT=0
SKIPPED_COUNT=0

echo "🔍 Analyzing ${#UNUSED_MODULES[@]} candidate modules..."
echo ""

for module in "${UNUSED_MODULES[@]}"; do
  SOURCE="src/modules/$module"
  
  if [ -d "$SOURCE" ]; then
    echo "📦 Archiving: $module"
    mv "$SOURCE" "$ARCHIVE_DIR/"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
  else
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
  fi
done

echo ""
echo "✅ Cleanup Complete!"
echo "===================="
echo "📊 Archived: $ARCHIVED_COUNT folders"
echo "⏭️  Skipped: $SKIPPED_COUNT folders (not found)"
echo "📁 Archive location: $ARCHIVE_DIR"
echo ""
echo "🔜 Next Steps:"
echo "   1. Run: npm run build"
echo "   2. Test the application"
echo "   3. If issues found, restore from: $ARCHIVE_DIR"
