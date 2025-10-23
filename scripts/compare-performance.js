#!/usr/bin/env node

/**
 * Performance Comparison Script
 * Compares current performance metrics with baseline
 */

const fs = require('fs');
const path = require('path');

// Load current performance results
const currentResultsPath = path.join(__dirname, '../performance-results/latest.json');
const baselineResultsPath = path.join(__dirname, '../performance-results/baseline.json');

if (!fs.existsSync(currentResultsPath)) {
  console.error('❌ Current performance results not found');
  process.exit(1);
}

const currentResults = JSON.parse(fs.readFileSync(currentResultsPath, 'utf8'));
let baselineResults = {};

if (fs.existsSync(baselineResultsPath)) {
  baselineResults = JSON.parse(fs.readFileSync(baselineResultsPath, 'utf8'));
} else {
  console.log('⚠️  No baseline found, creating new baseline');
  fs.writeFileSync(baselineResultsPath, JSON.stringify(currentResults, null, 2));
  baselineResults = currentResults;
}

// Compare metrics
function calculateChange(current, baseline) {
  if (!baseline || baseline === 0) return 0;
  return ((current - baseline) / baseline * 100).toFixed(2);
}

const metrics = {
  fcp: currentResults.fcp || 0,
  baselineFcp: baselineResults.fcp || 0,
  fcpChange: calculateChange(currentResults.fcp, baselineResults.fcp),
  
  lcp: currentResults.lcp || 0,
  baselineLcp: baselineResults.lcp || 0,
  lcpChange: calculateChange(currentResults.lcp, baselineResults.lcp),
  
  tti: currentResults.tti || 0,
  baselineTti: baselineResults.tti || 0,
  ttiChange: calculateChange(currentResults.tti, baselineResults.tti),
  
  tbt: currentResults.tbt || 0,
  baselineTbt: baselineResults.tbt || 0,
  tbtChange: calculateChange(currentResults.tbt, baselineResults.tbt),
  
  bundleSize: currentResults.bundleSize || 0,
  baselineBundleSize: baselineResults.bundleSize || 0,
  bundleSizeChange: calculateChange(currentResults.bundleSize, baselineResults.bundleSize),
};

// Detect regressions (more than 10% increase)
const REGRESSION_THRESHOLD = 10;
metrics.hasRegression = 
  Math.abs(parseFloat(metrics.fcpChange)) > REGRESSION_THRESHOLD ||
  Math.abs(parseFloat(metrics.lcpChange)) > REGRESSION_THRESHOLD ||
  Math.abs(parseFloat(metrics.ttiChange)) > REGRESSION_THRESHOLD ||
  Math.abs(parseFloat(metrics.tbtChange)) > REGRESSION_THRESHOLD ||
  Math.abs(parseFloat(metrics.bundleSizeChange)) > REGRESSION_THRESHOLD;

// Save summary
const summaryPath = path.join(__dirname, '../performance-results/summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(metrics, null, 2));

console.log('\n📊 Performance Comparison Results:\n');
console.log(`FCP: ${metrics.fcp}ms (baseline: ${metrics.baselineFcp}ms, ${metrics.fcpChange}%)`);
console.log(`LCP: ${metrics.lcp}ms (baseline: ${metrics.baselineLcp}ms, ${metrics.lcpChange}%)`);
console.log(`TTI: ${metrics.tti}ms (baseline: ${metrics.baselineTti}ms, ${metrics.ttiChange}%)`);
console.log(`TBT: ${metrics.tbt}ms (baseline: ${metrics.baselineTbt}ms, ${metrics.tbtChange}%)`);
console.log(`Bundle: ${metrics.bundleSize}KB (baseline: ${metrics.baselineBundleSize}KB, ${metrics.bundleSizeChange}%)`);

if (metrics.hasRegression) {
  console.log('\n⚠️  Performance regression detected!');
  process.exit(1);
} else {
  console.log('\n✅ No significant performance regressions');
  process.exit(0);
}
