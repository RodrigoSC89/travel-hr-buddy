#!/usr/bin/env tsx
/**
 * PATCH 565 - Quality Metrics Aggregation Script
 * 
 * Aggregates QA metrics from:
 * - Load tests (PATCH 561)
 * - Beta feedback (PATCH 562)
 * - Regression tests (PATCH 564)
 * 
 * Generates: public/api/quality-metrics.json
 * 
 * Run with: npm run quality:metrics
 */

import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'api');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'quality-metrics.json');

// Paths to data sources
const PERF_METRICS_DIR = path.join(process.cwd(), 'performance_metrics');
const TEST_RESULTS_DIR = path.join(process.cwd(), 'tests', 'results');
const FEEDBACK_DIR = path.join(process.cwd(), 'feedback', 'beta-phase-1');

interface QualityMetrics {
  timestamp: string;
  overall: {
    health: number;
    risk: number;
    confidence: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    lastRun: string;
  };
  performance: {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
    successRate: number;
    totalSessions: number;
    lastRun: string;
  };
  feedback: {
    totalResponses: number;
    averageRating: number;
    averageUsability: number;
    averagePerformance: number;
    lastUpdated: string;
  };
  coverage: {
    modules: number;
    totalModules: number;
    percentage: number;
  };
}

/**
 * Load latest stress test results (PATCH 561)
 */
function loadStressTestResults(): any {
  try {
    if (!fs.existsSync(PERF_METRICS_DIR)) {
      console.log('⚠️  Performance metrics directory not found');
      return null;
    }

    const files = fs.readdirSync(PERF_METRICS_DIR)
      .filter(f => f.startsWith('stress-core-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('⚠️  No stress test results found');
      return null;
    }

    const latestFile = path.join(PERF_METRICS_DIR, files[0]);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    console.log(`✅ Loaded stress test: ${files[0]}`);
    return data;
  } catch (error) {
    console.error('Error loading stress test results:', error);
    return null;
  }
}

/**
 * Load latest regression test results (PATCH 564)
 */
function loadRegressionTestResults(): any {
  try {
    const regressionFile = path.join(TEST_RESULTS_DIR, 'regression-561.json');
    
    if (!fs.existsSync(regressionFile)) {
      console.log('⚠️  Regression test results not found');
      return null;
    }

    const data = JSON.parse(fs.readFileSync(regressionFile, 'utf-8'));
    console.log('✅ Loaded regression tests');
    return data;
  } catch (error) {
    console.error('Error loading regression test results:', error);
    return null;
  }
}

/**
 * Load latest feedback data (PATCH 562)
 */
function loadFeedbackData(): any {
  try {
    const exportsDir = path.join(FEEDBACK_DIR, 'exports');
    
    if (!fs.existsSync(exportsDir)) {
      console.log('⚠️  Feedback exports directory not found');
      return null;
    }

    const files = fs.readdirSync(exportsDir)
      .filter(f => f.startsWith('beta-feedback-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('⚠️  No feedback data found');
      return null;
    }

    const latestFile = path.join(exportsDir, files[0]);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    console.log(`✅ Loaded feedback: ${files[0]}`);
    return data;
  } catch (error) {
    console.error('Error loading feedback data:', error);
    return null;
  }
}

/**
 * Calculate health score (0-100)
 * Based on weighted test results
 */
function calculateHealthScore(
  regressionData: any,
  stressData: any
): number {
  let score = 0;
  let weight = 0;

  // Regression tests weight: 60%
  if (regressionData?.summary) {
    const successRate = regressionData.summary.passed / regressionData.summary.total;
    score += successRate * 60;
    weight += 60;
  }

  // Stress test weight: 40%
  if (stressData?.summary) {
    const successRate = stressData.summary.successfulSessions / stressData.summary.totalSessions;
    score += successRate * 40;
    weight += 40;
  }

  return weight > 0 ? Math.round(score) : 0;
}

/**
 * Calculate risk score (0-100)
 * Higher = more risk
 */
function calculateRiskScore(
  regressionData: any,
  stressData: any,
  feedbackData: any
): number {
  let risk = 0;

  // Failed tests increase risk
  if (regressionData?.summary?.failed > 0) {
    risk += Math.min(regressionData.summary.failed * 5, 40);
  }

  // Failed sessions increase risk
  if (stressData?.summary?.failedSessions > 0) {
    risk += Math.min(stressData.summary.failedSessions, 30);
  }

  // Low feedback ratings increase risk
  if (feedbackData?.metadata) {
    const avgRating = parseFloat(feedbackData.metadata.averageRating || '5');
    if (avgRating < 3) {
      risk += 30;
    } else if (avgRating < 4) {
      risk += 15;
    }
  }

  return Math.min(risk, 100);
}

/**
 * Calculate confidence score (0-100)
 * Based on test coverage, success rates, and feedback
 */
function calculateConfidenceScore(
  healthScore: number,
  riskScore: number,
  feedbackData: any
): number {
  let confidence = healthScore;

  // Reduce confidence based on risk
  confidence -= riskScore * 0.5;

  // Boost confidence with positive feedback
  if (feedbackData?.metadata) {
    const avgRating = parseFloat(feedbackData.metadata.averageRating || '0');
    if (avgRating >= 4) {
      confidence += 10;
    }
  }

  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Determine overall status
 */
function determineStatus(healthScore: number, riskScore: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (healthScore >= 90 && riskScore < 20) return 'excellent';
  if (healthScore >= 75 && riskScore < 40) return 'good';
  if (healthScore >= 50 && riskScore < 60) return 'warning';
  return 'critical';
}

/**
 * Calculate latency percentiles
 */
function calculatePercentiles(durations: number[], percentile: number): number {
  if (durations.length === 0) return 0;
  const sorted = [...durations].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Aggregate all metrics
 */
function aggregateMetrics(): QualityMetrics {
  console.log('📊 Aggregating quality metrics...\n');

  const stressData = loadStressTestResults();
  const regressionData = loadRegressionTestResults();
  const feedbackData = loadFeedbackData();

  console.log('');

  // Calculate scores
  const healthScore = calculateHealthScore(regressionData, stressData);
  const riskScore = calculateRiskScore(regressionData, stressData, feedbackData);
  const confidenceScore = calculateConfidenceScore(healthScore, riskScore, feedbackData);
  const status = determineStatus(healthScore, riskScore);

  // Test metrics
  const tests = {
    total: regressionData?.summary?.total || 0,
    passed: regressionData?.summary?.passed || 0,
    failed: regressionData?.summary?.failed || 0,
    successRate: regressionData?.summary?.total 
      ? Math.round((regressionData.summary.passed / regressionData.summary.total) * 100)
      : 0,
    lastRun: regressionData?.summary?.timestamp || new Date().toISOString(),
  };

  // Performance metrics
  const durations = stressData?.sessions?.map((s: any) => s.duration) || [];
  const performance = {
    avgLatency: durations.length 
      ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
      : 0,
    p95Latency: Math.round(calculatePercentiles(durations, 95)),
    p99Latency: Math.round(calculatePercentiles(durations, 99)),
    successRate: stressData?.summary?.totalSessions
      ? Math.round((stressData.summary.successfulSessions / stressData.summary.totalSessions) * 100)
      : 0,
    totalSessions: stressData?.summary?.totalSessions || 0,
    lastRun: stressData?.summary?.timestamp || new Date().toISOString(),
  };

  // Feedback metrics
  const feedback = {
    totalResponses: feedbackData?.metadata?.totalResponses || 0,
    averageRating: parseFloat(feedbackData?.metadata?.averageRating || '0'),
    averageUsability: parseFloat(feedbackData?.metadata?.averageUsability || '0'),
    averagePerformance: parseFloat(feedbackData?.metadata?.averagePerformance || '0'),
    lastUpdated: feedbackData?.metadata?.exportDate || new Date().toISOString(),
  };

  // Module coverage (calculated from test categories)
  const modulesWithTests = new Set();
  if (regressionData?.results) {
    regressionData.results.forEach((r: any) => {
      if (r.category) modulesWithTests.add(r.category);
    });
  }
  
  const coverage = {
    modules: modulesWithTests.size,
    totalModules: 20, // From problem statement: 20 primary routes
    percentage: Math.round((modulesWithTests.size / 20) * 100),
  };

  return {
    timestamp: new Date().toISOString(),
    overall: {
      health: healthScore,
      risk: riskScore,
      confidence: confidenceScore,
      status,
    },
    tests,
    performance,
    feedback,
    coverage,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 PATCH 565 - Quality Metrics Aggregation\n');
  console.log('='.repeat(70));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Aggregate metrics
  const metrics = aggregateMetrics();

  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metrics, null, 2));

  console.log('\n='.repeat(70));
  console.log('📈 QUALITY METRICS SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n🏥 Overall Health: ${metrics.overall.health}/100 (${metrics.overall.status.toUpperCase()})`);
  console.log(`⚠️  Risk Score: ${metrics.overall.risk}/100`);
  console.log(`✨ Confidence: ${metrics.overall.confidence}/100`);
  
  console.log(`\n🧪 Tests:`);
  console.log(`   Total: ${metrics.tests.total}`);
  console.log(`   Passed: ${metrics.tests.passed} ✅`);
  console.log(`   Failed: ${metrics.tests.failed} ❌`);
  console.log(`   Success Rate: ${metrics.tests.successRate}%`);

  console.log(`\n⚡ Performance:`);
  console.log(`   Total Sessions: ${metrics.performance.totalSessions}`);
  console.log(`   Success Rate: ${metrics.performance.successRate}%`);
  console.log(`   Avg Latency: ${metrics.performance.avgLatency}ms`);
  console.log(`   P95 Latency: ${metrics.performance.p95Latency}ms`);
  console.log(`   P99 Latency: ${metrics.performance.p99Latency}ms`);

  console.log(`\n📝 Feedback:`);
  console.log(`   Responses: ${metrics.feedback.totalResponses}`);
  console.log(`   Avg Rating: ${metrics.feedback.averageRating.toFixed(2)}/5`);
  console.log(`   Avg Usability: ${metrics.feedback.averageUsability.toFixed(2)}/5`);
  console.log(`   Avg Performance: ${metrics.feedback.averagePerformance.toFixed(2)}/5`);

  console.log(`\n📊 Coverage:`);
  console.log(`   Modules Tested: ${metrics.coverage.modules}/${metrics.coverage.totalModules}`);
  console.log(`   Coverage: ${metrics.coverage.percentage}%`);

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Metrics saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(70));

  // Check acceptance criteria
  console.log('\n✅ ACCEPTANCE CRITERIA:');
  console.log(`   ✓ Test results aggregated: ${metrics.tests.total > 0 ? 'PASSED ✅' : 'NO DATA ⚠️'}`);
  console.log(`   ✓ Performance metrics included: ${metrics.performance.totalSessions > 0 ? 'PASSED ✅' : 'NO DATA ⚠️'}`);
  console.log(`   ✓ Feedback data included: ${metrics.feedback.totalResponses > 0 ? 'PASSED ✅' : 'NO DATA ⚠️'}`);
  console.log(`   ✓ Health score computed: PASSED ✅`);
  console.log(`   ✓ Risk score computed: PASSED ✅`);
  console.log(`   ✓ Confidence score computed: PASSED ✅`);
  console.log(`   ✓ JSON output generated: PASSED ✅`);
  console.log('');
}

main();
