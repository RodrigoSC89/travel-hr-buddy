#!/bin/bash
# Dependency Audit Script
# Nauti One v4.0
#
# Checks for unused, outdated, and vulnerable dependencies
#
# Usage: ./scripts/check-dependencies.sh

set -e

echo ""
echo "📦 Nauti One Dependency Audit"
echo "=============================="
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install Node.js"
  exit 1
fi

# 1. Check for unused dependencies
echo "🔍 Checking for unused dependencies..."
echo ""

if command -v npx &> /dev/null; then
  # Run depcheck
  echo "Running depcheck..."
  npx depcheck --json 2>/dev/null > /tmp/depcheck-result.json || true
  
  if [ -f /tmp/depcheck-result.json ]; then
    unused_deps=$(cat /tmp/depcheck-result.json | grep -o '"dependencies":\[.*\]' | grep -o '\[.*\]' | tr -d '[]"' | tr ',' '\n' | grep -v '^$' | wc -l)
    unused_dev=$(cat /tmp/depcheck-result.json | grep -o '"devDependencies":\[.*\]' | grep -o '\[.*\]' | tr -d '[]"' | tr ',' '\n' | grep -v '^$' | wc -l)
    
    if [ "$unused_deps" -gt 0 ] || [ "$unused_dev" -gt 0 ]; then
      echo "⚠️  Found potentially unused dependencies:"
      echo "   - Production: $unused_deps"
      echo "   - Development: $unused_dev"
      echo ""
      echo "   Run 'npx depcheck' for details"
    else
      echo "✅ No unused dependencies detected"
    fi
    
    rm -f /tmp/depcheck-result.json
  fi
else
  echo "⚠️  npx not available, skipping depcheck"
fi

echo ""

# 2. Check for outdated dependencies
echo "🕐 Checking for outdated dependencies..."
echo ""

npm outdated --json 2>/dev/null > /tmp/outdated.json || true

if [ -f /tmp/outdated.json ] && [ -s /tmp/outdated.json ]; then
  outdated_count=$(cat /tmp/outdated.json | grep -c '"current"' || echo 0)
  
  if [ "$outdated_count" -gt 0 ]; then
    echo "📊 $outdated_count packages are outdated"
    echo ""
    
    # Show major updates (potentially breaking)
    echo "Major updates (breaking changes possible):"
    npm outdated 2>/dev/null | head -20 || true
    
    echo ""
    echo "Run 'npm outdated' for full list"
  else
    echo "✅ All dependencies are up to date"
  fi
  
  rm -f /tmp/outdated.json
else
  echo "✅ All dependencies are up to date"
fi

echo ""

# 3. Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
echo ""

npm audit --json 2>/dev/null > /tmp/audit.json || true

if [ -f /tmp/audit.json ]; then
  # Parse vulnerabilities
  critical=$(cat /tmp/audit.json | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' | head -1 || echo 0)
  high=$(cat /tmp/audit.json | grep -o '"high":[0-9]*' | grep -o '[0-9]*' | head -1 || echo 0)
  moderate=$(cat /tmp/audit.json | grep -o '"moderate":[0-9]*' | grep -o '[0-9]*' | head -1 || echo 0)
  low=$(cat /tmp/audit.json | grep -o '"low":[0-9]*' | grep -o '[0-9]*' | head -1 || echo 0)
  
  total=$((critical + high + moderate + low))
  
  if [ "$total" -gt 0 ]; then
    echo "⚠️  Found $total vulnerabilities:"
    echo "   🔴 Critical: $critical"
    echo "   🟠 High: $high"
    echo "   🟡 Moderate: $moderate"
    echo "   🟢 Low: $low"
    echo ""
    
    if [ "$critical" -gt 0 ] || [ "$high" -gt 0 ]; then
      echo "🚨 Critical/High vulnerabilities found!"
      echo "   Run 'npm audit fix' to attempt auto-fix"
      echo "   Run 'npm audit' for details"
    fi
  else
    echo "✅ No security vulnerabilities found"
  fi
  
  rm -f /tmp/audit.json
fi

echo ""

# 4. Check bundle size impact
echo "📏 Analyzing bundle size impact..."
echo ""

if [ -f "package.json" ]; then
  # Count dependencies
  deps=$(cat package.json | grep -o '"dependencies"' | wc -l)
  dev_deps=$(cat package.json | grep -o '"devDependencies"' | wc -l)
  
  # Estimate large dependencies
  echo "Potentially large dependencies (check bundle analyzer):"
  
  large_deps=("@tensorflow" "three" "chart.js" "mapbox-gl" "firebase" "openai" "@sentry")
  
  for dep in "${large_deps[@]}"; do
    if grep -q "\"$dep" package.json 2>/dev/null; then
      echo "   - $dep (large bundle impact)"
    fi
  done
  
  echo ""
  echo "💡 Run 'npm run build -- --analyze' for detailed bundle analysis"
fi

echo ""

# Summary
echo "=============================="
echo "📋 Dependency Audit Summary"
echo ""
echo "Next steps:"
echo "  1. Review unused dependencies: npx depcheck"
echo "  2. Update outdated packages: npm update"
echo "  3. Fix vulnerabilities: npm audit fix"
echo "  4. Analyze bundle: npm run build -- --analyze"
echo ""
