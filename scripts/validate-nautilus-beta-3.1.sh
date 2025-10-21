#!/bin/bash

# Nautilus Beta 3.1 Validation Script
# Validates all components are properly installed and configured

set -e

echo "🔍 Validating Nautilus Beta 3.1 Implementation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2 (file not found: $1)"
        FAILED=1
    fi
}

# Function to check dependency
check_dependency() {
    if npm list "$1" &> /dev/null; then
        VERSION=$(npm list "$1" | grep "$1" | sed 's/.*@//' | cut -d' ' -f1)
        echo -e "${GREEN}✓${NC} $1@$VERSION"
    else
        echo -e "${RED}✗${NC} $1 (not installed)"
        FAILED=1
    fi
}

echo "📦 Checking Dependencies..."
check_dependency "mqtt"
check_dependency "onnxruntime-web"
echo ""

echo "📄 Checking Documentation..."
check_file "NAUTILUS_BETA_3.1_QUICKREF.md" "Quick Reference Guide"
check_file "NAUTILUS_BETA_3.1_VISUAL_SUMMARY.md" "Visual Summary"
check_file "NAUTILUS_BETA_3.1_README.md" "README"
echo ""

echo "📁 Checking Core Modules..."
check_file "src/core/BridgeLink.ts" "BridgeLink Event Bus"
check_file "src/core/MQTTClient.ts" "MQTT Client"
check_file "src/core/index.ts" "Core Module Exports"
echo ""

echo "🧠 Checking AI Modules..."
check_file "src/ai/nautilus-inference.ts" "Nautilus Inference Engine"
check_file "src/ai/index.ts" "AI Module Exports"
echo ""

echo "🛠️ Checking Utilities..."
check_file "src/utils/safeLazyImport.tsx" "Safe Lazy Import Utility"
echo ""

echo "🎛️ Checking UI Components..."
check_file "src/modules/control-hub/ControlHubPanel.tsx" "Control Hub Panel with Telemetry"
echo ""

echo "🧪 Checking Tests..."
check_file "src/tests/bridgelink-event-bus.test.ts" "BridgeLink Tests"
check_file "src/tests/mqtt-client.test.ts" "MQTT Client Tests"
check_file "src/tests/nautilus-inference.test.ts" "Nautilus Inference Tests"
echo ""

echo "⚙️ Checking Environment Configuration..."
if grep -q "VITE_MQTT_URL" .env.example; then
    echo -e "${GREEN}✓${NC} VITE_MQTT_URL in .env.example"
else
    echo -e "${YELLOW}⚠${NC} VITE_MQTT_URL not in .env.example"
fi
echo ""

# Run specific tests
echo "🧪 Running Nautilus Beta 3.1 Tests..."
if npm run test -- src/tests/nautilus-inference.test.ts src/tests/mqtt-client.test.ts src/tests/bridgelink-event-bus.test.ts --run &> /dev/null; then
    echo -e "${GREEN}✓${NC} All Nautilus tests passed"
else
    echo -e "${RED}✗${NC} Some tests failed"
    FAILED=1
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Nautilus Beta 3.1 validation successful!${NC}"
    echo ""
    echo "All components are properly installed and configured."
    echo "Version: Nautilus Beta 3.1"
    echo "Status: Production Ready"
    exit 0
else
    echo -e "${RED}❌ Validation failed!${NC}"
    echo ""
    echo "Some components are missing or not configured correctly."
    echo "Please review the errors above."
    exit 1
fi
