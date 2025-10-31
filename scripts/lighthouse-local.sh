#!/bin/bash
echo "🚦 PATCH 543 - Lighthouse Audit Local"
echo "======================================"

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
  echo "📦 Installing Lighthouse CLI..."
  npm install -g @lhci/cli lighthouse
fi

# Build the project
echo "🔨 Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Start preview server in background
echo "🌐 Starting preview server..."
npm run preview -- --port 4173 &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 10

# Create reports directory
mkdir -p lighthouse-reports

# Run Lighthouse audits
echo "🚦 Running Lighthouse audits..."

URLS=(
  "http://localhost:4173"
  "http://localhost:4173/dashboard"
  "http://localhost:4173/admin/control-center"
  "http://localhost:4173/admin/image-optimization"
)

for URL in "${URLS[@]}"; do
  PAGE_NAME=$(echo "$URL" | sed 's/http:\/\/localhost:4173//' | sed 's/\//-/g')
  if [ -z "$PAGE_NAME" ]; then
    PAGE_NAME="home"
  fi
  
  echo "📊 Auditing: $URL"
  
  lighthouse "$URL" \
    --output=html \
    --output=json \
    --output-path="./lighthouse-reports/report-${PAGE_NAME}" \
    --preset=desktop \
    --only-categories=performance,accessibility,best-practices,seo,pwa \
    --chrome-flags="--headless --no-sandbox" \
    --quiet
  
  echo "✅ Report saved: lighthouse-reports/report-${PAGE_NAME}.html"
done

# Kill preview server
echo "🧹 Stopping preview server..."
kill $SERVER_PID

# Generate summary
echo ""
echo "========================================"
echo "✅ Lighthouse Audit Complete!"
echo "========================================"
echo ""
echo "📊 Reports saved in: lighthouse-reports/"
echo ""
echo "Open reports:"
for REPORT in lighthouse-reports/*.html; do
  echo "  - $REPORT"
done
echo ""
echo "💡 Tip: Open reports in browser to view detailed results"
echo "💡 JSON reports available for CI/CD integration"
