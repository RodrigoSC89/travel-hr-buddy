#!/bin/bash

###############################################################################
# Quick Dashboard Check - Fast validation without full test suite
# Use this for rapid iteration during development
###############################################################################

echo "🚀 Quick Dashboard Check"
echo "======================="
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
  echo "⚠️  No build found - run: npm run build"
  exit 1
fi

# Start preview server in background
echo "Starting preview server..."
npm run preview &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Quick curl check
echo ""
echo "Testing dashboard route..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/dashboard)

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Dashboard responds: HTTP $RESPONSE"
else
  echo "❌ Dashboard error: HTTP $RESPONSE"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null

echo ""
echo "For full validation, run: ./scripts/validate-dashboard-preview.sh"
