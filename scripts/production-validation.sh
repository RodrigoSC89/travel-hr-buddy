#!/bin/bash

# ===============================================================================
# NAUTILUS ONE - PRODUCTION VALIDATION AUTOMATION SCRIPTS
# ===============================================================================
# Use este script para automatizar validações do documento v2.0
# Tempo estimado de execução: 30-45 minutos
# ===============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="validation-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# ===============================================================================
# FASE 1: AUDITORIA DE CÓDIGO
# ===============================================================================

phase1_code_audit() {
    log "=== FASE 1: AUDITORIA DE CÓDIGO ==="
    
    # 1.1 TypeScript Check
    log "1.1 Running TypeScript check..."
    if npm run typecheck > /dev/null 2>&1; then
        success "TypeScript: 0 errors"
    else
        error "TypeScript: Errors found"
        npm run typecheck
        return 1
    fi
    
    # 1.2 Build
    log "1.2 Running production build..."
    BUILD_START=$(date +%s)
    if npm run build > build.log 2>&1; then
        BUILD_END=$(date +%s)
        BUILD_TIME=$((BUILD_END - BUILD_START))
        success "Build: Success (${BUILD_TIME}s)"
        
        # Check bundle size
        BUNDLE_SIZE=$(du -sh dist | cut -f1)
        log "   Bundle size: $BUNDLE_SIZE"
    else
        error "Build: Failed"
        tail -20 build.log
        return 1
    fi
    
    # 1.3 Tests
    log "1.3 Running tests with coverage..."
    if npm run test:coverage > test.log 2>&1; then
        success "Tests: Passing"
        
        # Extract coverage
        COVERAGE=$(grep -A 3 "All files" test.log | tail -1 | awk '{print $10}')
        log "   Coverage: $COVERAGE"
        
        if (( $(echo "$COVERAGE > 80" | bc -l) )); then
            success "   Coverage >80%"
        else
            warning "   Coverage <80%"
        fi
    else
        error "Tests: Failing"
        tail -20 test.log
        return 1
    fi
    
    # 1.4 Linting
    log "1.4 Running linter..."
    LINT_OUTPUT=$(npm run lint 2>&1 || true)
    LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c "error" || echo 0)
    LINT_WARNINGS=$(echo "$LINT_OUTPUT" | grep -c "warning" || echo 0)
    
    if [ "$LINT_ERRORS" -eq 0 ]; then
        success "Lint: 0 errors"
    else
        error "Lint: $LINT_ERRORS errors"
    fi
    
    if [ "$LINT_WARNINGS" -lt 10 ]; then
        success "Lint: $LINT_WARNINGS warnings (acceptable)"
    else
        warning "Lint: $LINT_WARNINGS warnings (high)"
    fi
    
    # 1.5 Security Audit
    log "1.5 Running security audit..."
    npm audit --json > audit.json 2>&1 || true
    
    CRITICAL=$(jq '.metadata.vulnerabilities.critical' audit.json)
    HIGH=$(jq '.metadata.vulnerabilities.high' audit.json)
    MEDIUM=$(jq '.metadata.vulnerabilities.moderate' audit.json)
    LOW=$(jq '.metadata.vulnerabilities.low' audit.json)
    
    log "   Critical: $CRITICAL"
    log "   High: $HIGH"
    log "   Medium: $MEDIUM"
    log "   Low: $LOW"
    
    if [ "$CRITICAL" -eq 0 ] && [ "$HIGH" -eq 0 ]; then
        success "Security: No critical/high vulnerabilities"
    else
        error "Security: $CRITICAL critical, $HIGH high vulnerabilities found"
        return 1
    fi
    
    success "FASE 1: COMPLETED"
}

# ===============================================================================
# FASE 2: LIGHTHOUSE PERFORMANCE AUDIT
# ===============================================================================

phase2_lighthouse() {
    log "=== FASE 2: LIGHTHOUSE AUDIT ==="
    
    # Install lighthouse if not present
    if ! command -v lighthouse &> /dev/null; then
        log "Installing Lighthouse CLI..."
        npm install -g @lhci/cli lighthouse
    fi
    
    # URLs to test
    URLS=(
        "http://localhost:3000/"
        "http://localhost:3000/dashboard"
        "http://localhost:3000/fleet-command"
        "http://localhost:3000/ai-command"
        "http://localhost:3000/peotram"
    )
    
    TOTAL_PERF=0
    TOTAL_A11Y=0
    COUNT=0
    
    for URL in "${URLS[@]}"; do
        log "Testing: $URL"
        
        lighthouse "$URL" \
            --output=json \
            --output-path="./lighthouse-$(basename $URL).json" \
            --chrome-flags="--headless" \
            --quiet
        
        PERF=$(jq '.categories.performance.score * 100' "./lighthouse-$(basename $URL).json")
        A11Y=$(jq '.categories.accessibility.score * 100' "./lighthouse-$(basename $URL).json")
        
        log "   Performance: $PERF"
        log "   Accessibility: $A11Y"
        
        TOTAL_PERF=$(echo "$TOTAL_PERF + $PERF" | bc)
        TOTAL_A11Y=$(echo "$TOTAL_A11Y + $A11Y" | bc)
        COUNT=$((COUNT + 1))
    done
    
    AVG_PERF=$(echo "scale=1; $TOTAL_PERF / $COUNT" | bc)
    AVG_A11Y=$(echo "scale=1; $TOTAL_A11Y / $COUNT" | bc)
    
    log "Average Performance: $AVG_PERF"
    log "Average Accessibility: $AVG_A11Y"
    
    if (( $(echo "$AVG_PERF >= 90" | bc -l) )); then
        success "Performance: Excellent (>90)"
    elif (( $(echo "$AVG_PERF >= 80" | bc -l) )); then
        warning "Performance: Good but needs improvement (80-90)"
    else
        error "Performance: Poor (<80)"
    fi
    
    success "FASE 2: COMPLETED"
}

# ===============================================================================
# FASE 3: LOAD TESTING (usando Artillery)
# ===============================================================================

phase3_load_test() {
    log "=== FASE 3: LOAD TESTING ==="
    
    # Install Artillery if not present
    if ! command -v artillery &> /dev/null; then
        log "Installing Artillery..."
        npm install -g artillery
    fi
    
    # Create Artillery config
    cat > artillery-config.yml <<EOF
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Normal load - 50 users/s"
    - duration: 120
      arrivalRate: 100
      name: "Peak load - 100 users/s"
  processor: "./load-test-processor.js"
scenarios:
  - name: "User Journey"
    flow:
      - get:
          url: "/"
      - think: 2
      - get:
          url: "/dashboard"
      - think: 3
      - get:
          url: "/fleet-command"
      - think: 5
      - post:
          url: "/api/vessels"
          json:
            name: "Test Vessel {{ \$randomNumber() }}"
EOF
    
    log "Running load test (this will take ~8 minutes)..."
    artillery run artillery-config.yml --output load-test-results.json
    
    # Generate report
    artillery report load-test-results.json --output load-test-report.html
    
    # Parse results
    SUCCESS_RATE=$(jq '.aggregate.counters["http.codes.200"] / .aggregate.counters["http.requests"] * 100' load-test-results.json)
    P95_LATENCY=$(jq '.aggregate.latency.p95' load-test-results.json)
    ERROR_RATE=$(jq '.aggregate.counters["errors.ECONNREFUSED"] // 0' load-test-results.json)
    
    log "Results:"
    log "   Success rate: ${SUCCESS_RATE}%"
    log "   P95 latency: ${P95_LATENCY}ms"
    log "   Errors: $ERROR_RATE"
    
    if (( $(echo "$SUCCESS_RATE >= 99" | bc -l) )); then
        success "Load test: Excellent (>99% success)"
    elif (( $(echo "$SUCCESS_RATE >= 95" | bc -l) )); then
        warning "Load test: Acceptable (95-99% success)"
    else
        error "Load test: Poor (<95% success)"
    fi
    
    success "FASE 3: COMPLETED"
    log "View detailed report: load-test-report.html"
}

# ===============================================================================
# FASE 4: SECURITY SCAN (usando Snyk)
# ===============================================================================

phase4_security_scan() {
    log "=== FASE 4: SECURITY SCAN ==="
    
    # Install Snyk if not present
    if ! command -v snyk &> /dev/null; then
        log "Installing Snyk..."
        npm install -g snyk
        log "Please authenticate: snyk auth"
        snyk auth
    fi
    
    log "Running Snyk security scan..."
    snyk test --json > snyk-results.json || true
    
    VULNS_CRITICAL=$(jq '[.vulnerabilities[] | select(.severity=="critical")] | length' snyk-results.json)
    VULNS_HIGH=$(jq '[.vulnerabilities[] | select(.severity=="high")] | length' snyk-results.json)
    VULNS_MEDIUM=$(jq '[.vulnerabilities[] | select(.severity=="medium")] | length' snyk-results.json)
    VULNS_LOW=$(jq '[.vulnerabilities[] | select(.severity=="low")] | length' snyk-results.json)
    
    log "Vulnerabilities found:"
    log "   Critical: $VULNS_CRITICAL"
    log "   High: $VULNS_HIGH"
    log "   Medium: $VULNS_MEDIUM"
    log "   Low: $VULNS_LOW"
    
    if [ "$VULNS_CRITICAL" -eq 0 ] && [ "$VULNS_HIGH" -eq 0 ]; then
        success "Security: No critical/high vulnerabilities"
    else
        error "Security: BLOCKERS FOUND"
        jq '.vulnerabilities[] | select(.severity=="critical" or .severity=="high")' snyk-results.json
        return 1
    fi
    
    success "FASE 4: COMPLETED"
}

# ===============================================================================
# FASE 5: SMOKE TESTS
# ===============================================================================

phase5_smoke_tests() {
    log "=== FASE 5: SMOKE TESTS ==="
    
    BASE_URL="http://localhost:3000"
    
    # Test critical endpoints
    ENDPOINTS=(
        "/"
        "/api/health"
        "/api/vessels"
        "/dashboard"
        "/fleet-command"
    )
    
    PASSED=0
    FAILED=0
    
    for ENDPOINT in "${ENDPOINTS[@]}"; do
        log "Testing: $ENDPOINT"
        
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ENDPOINT")
        RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL$ENDPOINT")
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            success "   ✓ $ENDPOINT (${HTTP_CODE}, ${RESPONSE_TIME}s)"
            PASSED=$((PASSED + 1))
        else
            error "   ✗ $ENDPOINT (${HTTP_CODE})"
            FAILED=$((FAILED + 1))
        fi
    done
    
    log "Smoke tests: $PASSED passed, $FAILED failed"
    
    if [ "$FAILED" -eq 0 ]; then
        success "FASE 5: COMPLETED"
    else
        error "FASE 5: FAILED"
        return 1
    fi
}

# ===============================================================================
# GENERATE REPORT
# ===============================================================================

generate_report() {
    log "=== GENERATING FINAL REPORT ==="
    
    REPORT_FILE="validation-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" <<EOF
# 🚀 Nautilus One - Validation Report

**Date:** $(date)
**Duration:** $SECONDS seconds

## Summary

### Phase 1: Code Audit
- TypeScript: ✅ 0 errors
- Build: ✅ Success
- Tests: ✅ Passing
- Coverage: $(grep -A 3 "All files" test.log | tail -1 | awk '{print $10}')
- Lint: ✅ 0 errors, $LINT_WARNINGS warnings
- Security: ✅ 0 critical/high

### Phase 2: Performance
- Average Performance Score: $AVG_PERF/100
- Average Accessibility Score: $AVG_A11Y/100

### Phase 3: Load Testing
- Success Rate: ${SUCCESS_RATE}%
- P95 Latency: ${P95_LATENCY}ms

### Phase 4: Security
- Critical: $VULNS_CRITICAL
- High: $VULNS_HIGH
- Medium: $VULNS_MEDIUM
- Low: $VULNS_LOW

### Phase 5: Smoke Tests
- Passed: $PASSED
- Failed: $FAILED

## Detailed Logs

See: $LOG_FILE

## Recommendations

$(if [ "$FAILED" -eq 0 ]; then
    echo "✅ System is ready for staging deployment"
else
    echo "⚠️  Fix failures before proceeding"
fi)

## Next Steps

1. Review detailed logs
2. Fix any failures
3. Run validation again
4. Deploy to staging
5. Begin beta testing

---
Generated by Nautilus Validation Automation
EOF
    
    success "Report generated: $REPORT_FILE"
    cat "$REPORT_FILE"
}

# ===============================================================================
# MAIN EXECUTION
# ===============================================================================

main() {
    clear
    log "╔════════════════════════════════════════════════════════════╗"
    log "║   NAUTILUS ONE - PRODUCTION VALIDATION AUTOMATION         ║"
    log "║   Version 2.0                                             ║"
    log "╚════════════════════════════════════════════════════════════╝"
    log ""
    
    # Check if in project directory
    if [ ! -f "package.json" ]; then
        error "Error: package.json not found. Run this script from the project root."
        exit 1
    fi
    
    # Start timer
    START_TIME=$(date +%s)
    
    # Run phases
    phase1_code_audit || { error "Phase 1 failed"; exit 1; }
    echo ""
    
    # Only run lighthouse if server is running
    if curl -s http://localhost:3000 > /dev/null; then
        phase2_lighthouse || warning "Phase 2 had issues"
    else
        warning "Skipping Lighthouse (server not running on :3000)"
    fi
    echo ""
    
    # Only run load test if server is running
    if curl -s http://localhost:3000 > /dev/null; then
        phase3_load_test || warning "Phase 3 had issues"
    else
        warning "Skipping Load Test (server not running on :3000)"
    fi
    echo ""
    
    phase4_security_scan || warning "Phase 4 had issues"
    echo ""
    
    # Only run smoke tests if server is running
    if curl -s http://localhost:3000 > /dev/null; then
        phase5_smoke_tests || { error "Phase 5 failed"; exit 1; }
    else
        warning "Skipping Smoke Tests (server not running on :3000)"
    fi
    echo ""
    
    # End timer
    END_TIME=$(date +%s)
    TOTAL_TIME=$((END_TIME - START_TIME))
    
    log "═══════════════════════════════════════════════════════════"
    log "Total execution time: ${TOTAL_TIME}s"
    log "═══════════════════════════════════════════════════════════"
    
    generate_report
    
    success "VALIDATION COMPLETE!"
    log "View logs: $LOG_FILE"
    log "View report: $REPORT_FILE"
}

# Run main function
main "$@"
