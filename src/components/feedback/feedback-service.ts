/**
 * PATCH 562 - Beta Feedback Service
 * Handles feedback collection, storage, and export
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BetaFeedback {
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

const FEEDBACK_DIR = 'feedback/beta-phase-1';
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback-data.json');

/**
 * Ensure feedback directory exists
 */
function ensureFeedbackDir() {
  if (typeof window === 'undefined') {
    // Node.js environment
    if (!fs.existsSync(FEEDBACK_DIR)) {
      fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
    }
  }
}

/**
 * Save feedback to storage
 */
export async function saveFeedback(feedback: BetaFeedback): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: Save to file
    ensureFeedbackDir();

    let feedbackData: BetaFeedback[] = [];
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      feedbackData = JSON.parse(data);
    }

    feedbackData.push(feedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));
  } else {
    // Client-side: Save to localStorage and send to server
    const storedFeedback = localStorage.getItem('beta-feedback') || '[]';
    const feedbackData = JSON.parse(storedFeedback);
    feedbackData.push(feedback);
    localStorage.setItem('beta-feedback', JSON.stringify(feedbackData));

    // In a real implementation, send to backend API
    // await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedback),
    // });
  }
}

/**
 * Get all feedback
 */
export async function getAllFeedback(): Promise<BetaFeedback[]> {
  if (typeof window === 'undefined') {
    // Server-side: Read from file
    ensureFeedbackDir();

    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } else {
    // Client-side: Read from localStorage
    const storedFeedback = localStorage.getItem('beta-feedback') || '[]';
    return JSON.parse(storedFeedback);
  }
}

/**
 * Export feedback to CSV format
 */
export async function exportFeedbackToCSV(): Promise<string> {
  const feedback = await getAllFeedback();

  if (feedback.length === 0) {
    return 'No feedback data available';
  }

  // CSV headers
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

  // CSV rows
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
    `"${f.userAgent}"`,
    f.screenResolution,
    f.viewport,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Save to file if in Node.js environment
  if (typeof window === 'undefined') {
    ensureFeedbackDir();
    const csvFile = path.join(FEEDBACK_DIR, `feedback-export-${Date.now()}.csv`);
    fs.writeFileSync(csvFile, csvContent);
    console.log(`✅ Feedback exported to CSV: ${csvFile}`);
  }

  return csvContent;
}

/**
 * Export feedback to JSON format
 */
export async function exportFeedbackToJSON(): Promise<string> {
  const feedback = await getAllFeedback();

  const jsonContent = JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalFeedback: feedback.length,
      feedback: feedback,
      summary: generateSummary(feedback),
    },
    null,
    2
  );

  // Save to file if in Node.js environment
  if (typeof window === 'undefined') {
    ensureFeedbackDir();
    const jsonFile = path.join(FEEDBACK_DIR, `feedback-export-${Date.now()}.json`);
    fs.writeFileSync(jsonFile, jsonContent);
    console.log(`✅ Feedback exported to JSON: ${jsonFile}`);
  }

  return jsonContent;
}

/**
 * Generate feedback summary for AI analysis
 */
function generateSummary(feedback: BetaFeedback[]) {
  if (feedback.length === 0) {
    return null;
  }

  const totalUsers = new Set(feedback.map((f) => f.userId)).size;
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
    uniqueUsers: totalUsers,
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
 * Generate AI feedback analyzer input
 */
export async function exportForAIAnalyzer(): Promise<void> {
  const feedback = await getAllFeedback();

  const aiInput = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalFeedback: feedback.length,
      phase: 'beta-phase-1',
    },
    summary: generateSummary(feedback),
    feedbackEntries: feedback.map((f) => ({
      timestamp: f.timestamp,
      ratings: {
        overall: parseInt(f.overallRating),
        usability: parseInt(f.usabilityRating),
        performance: parseInt(f.performanceRating),
      },
      comments: f.comments,
      suggestions: f.suggestions,
      featuresUsed: f.featuresUsed,
      issuesEncountered: f.issuesEncountered,
      wouldRecommend: f.wouldRecommend,
    })),
  };

  if (typeof window === 'undefined') {
    ensureFeedbackDir();
    const aiFile = path.join(FEEDBACK_DIR, `ai-analyzer-input-${Date.now()}.json`);
    fs.writeFileSync(aiFile, JSON.stringify(aiInput, null, 2));
    console.log(`✅ AI analyzer input exported: ${aiFile}`);
  }
}

/**
 * Monitor user session (track page views and interactions)
 */
export class SessionMonitor {
  private sessionId: string;
  private startTime: number;
  private pageViews: Array<{ route: string; timestamp: string; duration?: number }> = [];
  private interactions: Array<{ type: string; target: string; timestamp: string }> = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.trackPageView(window.location.pathname);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Track page navigation
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.trackInteraction('click', target.tagName + (target.id ? `#${target.id}` : ''));
    });
  }

  public trackPageView(route: string) {
    const lastView = this.pageViews[this.pageViews.length - 1];
    if (lastView && !lastView.duration) {
      lastView.duration = Date.now() - new Date(lastView.timestamp).getTime();
    }

    this.pageViews.push({
      route,
      timestamp: new Date().toISOString(),
    });
  }

  public trackInteraction(type: string, target: string) {
    this.interactions.push({
      type,
      target,
      timestamp: new Date().toISOString(),
    });
  }

  public getSessionData() {
    return {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      duration: Date.now() - this.startTime,
      pageViews: this.pageViews,
      interactions: this.interactions,
    };
  }

  public async saveSession() {
    const sessionData = this.getSessionData();
    const storageKey = `session-${this.sessionId}`;
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
  }
}
