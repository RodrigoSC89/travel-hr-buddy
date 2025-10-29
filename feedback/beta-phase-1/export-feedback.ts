/**
 * PATCH 562 - Beta Feedback Export Tool
 * CLI tool for exporting feedback data to CSV and JSON
 * 
 * Run with: npx tsx feedback/beta-phase-1/export-feedback.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface BetaFeedback {
  userId: string;
  email?: string;
  sessionId: string;
  currentRoute: string;
  overallRating: string;
  usabilityRating: string;
  performanceRating: string;
  comments: string;
  featuresUsed: string[];
  issuesEncountered: string[];
  suggestions: string;
  wouldRecommend: string;
  timestamp: string;
  userAgent: string;
  screenResolution: string;
  viewport: string;
}

const FEEDBACK_DIR = path.join(process.cwd(), 'feedback', 'beta-phase-1');
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback-data.json');

/**
 * Load feedback data
 */
function loadFeedback(): BetaFeedback[] {
  if (!fs.existsSync(FEEDBACK_FILE)) {
    console.log('⚠️  No feedback data found');
    return [];
  }

  const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Generate summary statistics
 */
function generateSummary(feedback: BetaFeedback[]) {
  if (feedback.length === 0) {
    return null;
  }

  const uniqueUsers = new Set(feedback.map((f) => f.userId)).size;
  const avgOverallRating =
    feedback.reduce((sum, f) => sum + parseInt(f.overallRating), 0) / feedback.length;
  const avgUsabilityRating =
    feedback.reduce((sum, f) => sum + parseInt(f.usabilityRating), 0) / feedback.length;
  const avgPerformanceRating =
    feedback.reduce((sum, f) => sum + parseInt(f.performanceRating), 0) / feedback.length;

  const recommendYes = feedback.filter((f) => f.wouldRecommend === 'yes').length;
  const recommendMaybe = feedback.filter((f) => f.wouldRecommend === 'maybe').length;
  const recommendNo = feedback.filter((f) => f.wouldRecommend === 'no').length;

  // Most used features
  const featuresCount: Record<string, number> = {};
  feedback.forEach((f) => {
    f.featuresUsed.forEach((feature) => {
      featuresCount[feature] = (featuresCount[feature] || 0) + 1;
    });
  });

  // Most common issues
  const issuesCount: Record<string, number> = {};
  feedback.forEach((f) => {
    f.issuesEncountered.forEach((issue) => {
      issuesCount[issue] = (issuesCount[issue] || 0) + 1;
    });
  });

  return {
    totalFeedbackEntries: feedback.length,
    uniqueUsers: uniqueUsers,
    ratings: {
      overall: avgOverallRating.toFixed(2),
      usability: avgUsabilityRating.toFixed(2),
      performance: avgPerformanceRating.toFixed(2),
    },
    recommendation: {
      yes: `${recommendYes} (${((recommendYes / feedback.length) * 100).toFixed(1)}%)`,
      maybe: `${recommendMaybe} (${((recommendMaybe / feedback.length) * 100).toFixed(1)}%)`,
      no: `${recommendNo} (${((recommendNo / feedback.length) * 100).toFixed(1)}%)`,
    },
    mostUsedFeatures: Object.entries(featuresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count })),
    mostCommonIssues: Object.entries(issuesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count })),
  };
}

/**
 * Export to CSV
 */
function exportToCSV(feedback: BetaFeedback[]): string {
  if (feedback.length === 0) {
    return '';
  }

  const headers = [
    'Timestamp',
    'User ID',
    'Email',
    'Session ID',
    'Route',
    'Overall Rating',
    'Usability Rating',
    'Performance Rating',
    'Would Recommend',
    'Features Used',
    'Issues Encountered',
    'Comments',
    'Suggestions',
    'User Agent',
    'Screen Resolution',
    'Viewport',
  ];

  const rows = feedback.map((f) => [
    f.timestamp,
    f.userId,
    f.email || '',
    f.sessionId,
    f.currentRoute,
    f.overallRating,
    f.usabilityRating,
    f.performanceRating,
    f.wouldRecommend,
    f.featuresUsed.join('; '),
    f.issuesEncountered.join('; '),
    `"${f.comments.replace(/"/g, '""')}"`,
    `"${f.suggestions.replace(/"/g, '""')}"`,
    `"${f.userAgent.replace(/"/g, '""')}"`,
    f.screenResolution,
    f.viewport,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Export to JSON
 */
function exportToJSON(feedback: BetaFeedback[]) {
  return {
    exportDate: new Date().toISOString(),
    totalFeedback: feedback.length,
    summary: generateSummary(feedback),
    feedback: feedback,
  };
}

/**
 * Export for AI Analyzer (Lovable AI Analyzer format)
 */
function exportForAIAnalyzer(feedback: BetaFeedback[]) {
  return {
    metadata: {
      exportDate: new Date().toISOString(),
      totalFeedback: feedback.length,
      phase: 'beta-phase-1',
      version: '3.5',
    },
    summary: generateSummary(feedback),
    insights: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    feedbackEntries: feedback.map((f) => ({
      timestamp: f.timestamp,
      ratings: {
        overall: parseInt(f.overallRating),
        usability: parseInt(f.usabilityRating),
        performance: parseInt(f.performanceRating),
      },
      sentiment: determineSentiment(f),
      comments: f.comments,
      suggestions: f.suggestions,
      featuresUsed: f.featuresUsed,
      issuesEncountered: f.issuesEncountered,
      wouldRecommend: f.wouldRecommend,
    })),
  };
}

/**
 * Determine sentiment based on ratings and comments
 */
function determineSentiment(feedback: BetaFeedback): 'positive' | 'neutral' | 'negative' {
  const avgRating =
    (parseInt(feedback.overallRating) +
      parseInt(feedback.usabilityRating) +
      parseInt(feedback.performanceRating)) /
    3;

  if (avgRating >= 4) return 'positive';
  if (avgRating >= 3) return 'neutral';
  return 'negative';
}

/**
 * Print summary report
 */
function printSummary(feedback: BetaFeedback[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PATCH 562 - BETA FEEDBACK SUMMARY');
  console.log('='.repeat(80));

  if (feedback.length === 0) {
    console.log('\n⚠️  No feedback data collected yet');
    return;
  }

  const summary = generateSummary(feedback);

  if (summary) {
    console.log('\n📈 OVERALL STATISTICS:');
    console.log(`   Total Feedback Entries: ${summary.totalFeedbackEntries}`);
    console.log(`   Unique Users: ${summary.uniqueUsers}`);

    console.log('\n⭐ AVERAGE RATINGS:');
    console.log(`   Overall Experience: ${summary.ratings.overall} / 5`);
    console.log(`   Usability: ${summary.ratings.usability} / 5`);
    console.log(`   Performance: ${summary.ratings.performance} / 5`);

    console.log('\n💡 RECOMMENDATION:');
    console.log(`   Yes: ${summary.recommendation.yes}`);
    console.log(`   Maybe: ${summary.recommendation.maybe}`);
    console.log(`   No: ${summary.recommendation.no}`);

    console.log('\n🔥 MOST USED FEATURES:');
    summary.mostUsedFeatures.forEach((f, idx) => {
      console.log(`   ${idx + 1}. ${f.feature} (${f.count} users)`);
    });

    console.log('\n⚠️  MOST COMMON ISSUES:');
    summary.mostCommonIssues.forEach((i, idx) => {
      console.log(`   ${idx + 1}. ${i.issue} (${i.count} reports)`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Main export function
 */
function main() {
  console.log('🚀 PATCH 562 - Beta Feedback Export Tool\n');

  // Ensure directory exists
  if (!fs.existsSync(FEEDBACK_DIR)) {
    fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
    console.log(`✅ Created directory: ${FEEDBACK_DIR}\n`);
  }

  // Load feedback
  const feedback = loadFeedback();
  console.log(`📥 Loaded ${feedback.length} feedback entries\n`);

  if (feedback.length === 0) {
    console.log('⚠️  No feedback to export. Exiting...');
    return;
  }

  // Print summary
  printSummary(feedback);

  // Export to CSV
  const csvContent = exportToCSV(feedback);
  const csvFile = path.join(FEEDBACK_DIR, `feedback-export-${Date.now()}.csv`);
  fs.writeFileSync(csvFile, csvContent);
  console.log(`\n💾 CSV Export: ${csvFile}`);

  // Export to JSON
  const jsonContent = exportToJSON(feedback);
  const jsonFile = path.join(FEEDBACK_DIR, `feedback-export-${Date.now()}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(jsonContent, null, 2));
  console.log(`💾 JSON Export: ${jsonFile}`);

  // Export for AI Analyzer
  const aiContent = exportForAIAnalyzer(feedback);
  const aiFile = path.join(FEEDBACK_DIR, `ai-analyzer-input-${Date.now()}.json`);
  fs.writeFileSync(aiFile, JSON.stringify(aiContent, null, 2));
  console.log(`💾 AI Analyzer Input: ${aiFile}`);

  console.log('\n✅ Export completed successfully!\n');

  // Acceptance criteria check
  console.log('📋 ACCEPTANCE CRITERIA:');
  const uniqueUsers = new Set(feedback.map((f) => f.userId)).size;
  console.log(
    `   ${uniqueUsers >= 10 ? '✅' : '❌'} Feedback collected from ${uniqueUsers}/10 users`
  );
  console.log(`   ✅ Data exported in CSV format`);
  console.log(`   ✅ Data exported in JSON format`);
  console.log(`   ✅ AI analyzer input generated`);

  if (uniqueUsers < 10) {
    console.log('\n⚠️  Note: Target is 10 users. Continue collecting feedback.');
  }
}

// Run the export
main();
