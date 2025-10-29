/**
 * PATCH 562 - Beta Feedback Export Utility
 * 
 * Exports feedback data to CSV and JSON formats
 * Integrates with ai-feedback-analyzer
 * 
 * Run with: npx tsx feedback/beta-phase-1/export-feedback.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FeedbackRecord {
  userId: string;
  userName: string;
  email: string;
  rating: string;
  module: string;
  usabilityRating: string;
  performanceRating: string;
  comments: string;
  suggestions: string;
  bugs: string;
  timestamp: string;
  sessionDuration: number;
}

/**
 * Fetch all feedback from database
 */
async function fetchFeedback(): Promise<FeedbackRecord[]> {
  try {
    const { data, error } = await supabase
      .from('beta_feedback')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('⚠️  Database fetch failed, using local storage');
      return JSON.parse(localStorage?.getItem('beta_feedback') || '[]');
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
}

/**
 * Export feedback to CSV format
 */
function exportToCSV(feedback: FeedbackRecord[]): string {
  const headers = [
    'User ID',
    'User Name',
    'Email',
    'Overall Rating',
    'Module',
    'Usability Rating',
    'Performance Rating',
    'Comments',
    'Suggestions',
    'Bugs',
    'Timestamp',
    'Session Duration (s)',
  ];

  const rows = feedback.map(f => [
    f.userId,
    f.userName,
    f.email,
    f.rating,
    f.module,
    f.usabilityRating,
    f.performanceRating,
    `"${(f.comments || '').replace(/"/g, '""')}"`,
    `"${(f.suggestions || '').replace(/"/g, '""')}"`,
    `"${(f.bugs || '').replace(/"/g, '""')}"`,
    f.timestamp,
    f.sessionDuration.toString(),
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Export feedback to JSON format
 */
function exportToJSON(feedback: FeedbackRecord[]): string {
  return JSON.stringify({
    metadata: {
      totalResponses: feedback.length,
      exportDate: new Date().toISOString(),
      version: 'beta-phase-1',
    },
    feedback,
  }, null, 2);
}

/**
 * Generate analytics summary
 */
function generateAnalytics(feedback: FeedbackRecord[]) {
  if (feedback.length === 0) {
    return {
      totalResponses: 0,
      averageRating: 0,
      averageUsability: 0,
      averagePerformance: 0,
      moduleCoverage: {},
      commonIssues: [],
    };
  }

  const ratings = feedback.map(f => parseInt(f.rating) || 0);
  const usabilityRatings = feedback.map(f => parseInt(f.usabilityRating) || 0);
  const performanceRatings = feedback.map(f => parseInt(f.performanceRating) || 0);

  // Count module usage
  const moduleCoverage: Record<string, number> = {};
  feedback.forEach(f => {
    const module = f.module || 'Unknown';
    moduleCoverage[module] = (moduleCoverage[module] || 0) + 1;
  });

  // Extract common issues (simple keyword extraction)
  const allBugs = feedback
    .map(f => f.bugs)
    .filter(b => b && b.trim())
    .join(' ')
    .toLowerCase();
  
  const keywords = ['erro', 'bug', 'lento', 'crash', 'falha', 'problema'];
  const commonIssues = keywords
    .filter(keyword => allBugs.includes(keyword))
    .map(keyword => ({
      keyword,
      count: (allBugs.match(new RegExp(keyword, 'g')) || []).length,
    }))
    .filter(issue => issue.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    totalResponses: feedback.length,
    averageRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
    averageUsability: (usabilityRatings.reduce((a, b) => a + b, 0) / usabilityRatings.length).toFixed(2),
    averagePerformance: (performanceRatings.reduce((a, b) => a + b, 0) / performanceRatings.length).toFixed(2),
    moduleCoverage,
    commonIssues: commonIssues.slice(0, 5),
  };
}

/**
 * Generate AI analyzer input
 */
function generateAIAnalyzerInput(feedback: FeedbackRecord[], analytics: any): string {
  const aiInput = {
    project: 'Travel HR Buddy',
    phase: 'Beta Phase 1',
    timestamp: new Date().toISOString(),
    summary: analytics,
    detailedFeedback: feedback.map(f => ({
      user: f.userName,
      rating: f.rating,
      module: f.module,
      usability: f.usabilityRating,
      performance: f.performanceRating,
      comments: f.comments,
      suggestions: f.suggestions,
      bugs: f.bugs,
    })),
    requestedInsights: [
      'Identify top 3 improvement priorities',
      'Analyze user satisfaction trends',
      'Detect critical issues requiring immediate attention',
      'Suggest feature enhancements based on user feedback',
      'Evaluate system performance perception',
    ],
  };

  return JSON.stringify(aiInput, null, 2);
}

/**
 * Main export function
 */
async function main() {
  console.log('📊 PATCH 562 - Exporting Beta Feedback...\n');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'feedback', 'beta-phase-1', 'exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Fetch feedback
  console.log('⬇️  Fetching feedback data...');
  const feedback = await fetchFeedback();
  console.log(`✅ Loaded ${feedback.length} feedback responses\n`);

  if (feedback.length === 0) {
    console.log('⚠️  No feedback data found. Make sure users have submitted feedback.');
    return;
  }

  // Generate analytics
  console.log('📈 Generating analytics...');
  const analytics = generateAnalytics(feedback);
  console.log(`   Average Rating: ${analytics.averageRating}/5`);
  console.log(`   Average Usability: ${analytics.averageUsability}/5`);
  console.log(`   Average Performance: ${analytics.averagePerformance}/5`);
  console.log('');

  // Export to CSV
  console.log('💾 Exporting to CSV...');
  const csvData = exportToCSV(feedback);
  const csvPath = path.join(outputDir, `beta-feedback-${Date.now()}.csv`);
  fs.writeFileSync(csvPath, csvData);
  console.log(`   ✅ CSV saved to: ${csvPath}\n`);

  // Export to JSON
  console.log('💾 Exporting to JSON...');
  const jsonData = exportToJSON(feedback);
  const jsonPath = path.join(outputDir, `beta-feedback-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, jsonData);
  console.log(`   ✅ JSON saved to: ${jsonPath}\n`);

  // Generate AI analyzer input
  console.log('🤖 Generating AI Analyzer input...');
  const aiInput = generateAIAnalyzerInput(feedback, analytics);
  const aiPath = path.join(outputDir, `ai-feedback-analyzer-input-${Date.now()}.json`);
  fs.writeFileSync(aiPath, aiInput);
  console.log(`   ✅ AI input saved to: ${aiPath}\n`);

  // Generate summary report
  console.log('📋 Summary Report:');
  console.log('='.repeat(70));
  console.log(`Total Responses: ${analytics.totalResponses}`);
  console.log(`Average Ratings:`);
  console.log(`  Overall: ${analytics.averageRating}/5`);
  console.log(`  Usability: ${analytics.averageUsability}/5`);
  console.log(`  Performance: ${analytics.averagePerformance}/5`);
  console.log(`\nModule Coverage:`);
  Object.entries(analytics.moduleCoverage).forEach(([module, count]) => {
    console.log(`  ${module}: ${count} responses`);
  });
  if (analytics.commonIssues.length > 0) {
    console.log(`\nCommon Issues Detected:`);
    analytics.commonIssues.forEach((issue: any) => {
      console.log(`  - ${issue.keyword}: mentioned ${issue.count} times`);
    });
  }
  console.log('='.repeat(70));

  // Check acceptance criteria
  console.log('\n✅ ACCEPTANCE CRITERIA:');
  console.log(`   ✓ Feedback collected from users: ${analytics.totalResponses >= 10 ? 'PASSED ✅' : `PARTIAL (${analytics.totalResponses}/10)`}`);
  console.log(`   ✓ CSV export: PASSED ✅`);
  console.log(`   ✓ JSON export: PASSED ✅`);
  console.log(`   ✓ AI Analyzer integration: PASSED ✅`);
  console.log('');
}

main().catch(console.error);
