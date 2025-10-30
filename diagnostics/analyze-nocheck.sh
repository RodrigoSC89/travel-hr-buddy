#!/bin/bash
# PATCH 496: Analyze and categorize @ts-nocheck usage

echo "📋 Analyzing @ts-nocheck usage patterns..."

DIAGNOSTICS_DIR="./diagnostics"
mkdir -p "$DIAGNOSTICS_DIR"

# Count by directory
echo "=== @ts-nocheck by Directory ===" > "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
grep -r '@ts-nocheck' src/ 2>/dev/null | cut -d':' -f1 | while IFS= read -r file; do dirname "$file"; done | sort | uniq -c | sort -rn >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"

echo "" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "=== @ts-nocheck by Module Type ===" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "AI Modules: $(grep -r '@ts-nocheck' src/ai/ 2>/dev/null | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Services: $(grep -r '@ts-nocheck' src/services/ 2>/dev/null | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Pages: $(grep -r '@ts-nocheck' src/pages/ 2>/dev/null | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Modules: $(grep -r '@ts-nocheck' src/modules/ 2>/dev/null | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Components: $(grep -r '@ts-nocheck' src/components/ 2>/dev/null | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Other: $(grep -r '@ts-nocheck' src/ 2>/dev/null | grep -v -E '(src/ai/|src/services/|src/pages/|src/modules/|src/components/)' | wc -l)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"

echo "" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "=== Recommendation ===" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Priority modules for @ts-nocheck removal:" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "1. Core services (mission-control, mission-engine)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "2. High-traffic pages (dashboard, control-hub)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "3. Frequently used modules (dp-intelligence, crew)" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "" >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "Note: Many @ts-nocheck directives are in validation and legacy code." >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
echo "These can remain for now but should be reviewed in future patches." >> "$DIAGNOSTICS_DIR/nocheck-analysis.txt"

cat "$DIAGNOSTICS_DIR/nocheck-analysis.txt"
