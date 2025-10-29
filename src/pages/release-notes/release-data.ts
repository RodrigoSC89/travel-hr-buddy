/**
 * PATCH 569 - Release Notes v3.5 Data
 * Changelog for PATCHES 391-570
 */

export interface PatchInfo {
  id: number;
  title: string;
  category: "infra" | "ai" | "module" | "fix" | "ui" | "security";
  description: string;
  githubUrl?: string;
}

export const releaseNotes: PatchInfo[] = [
  // Sample patches (in real implementation, this would contain all 391-570)
  {
    id: 566,
    title: "Copilot Presenter Module",
    category: "module",
    description: "Interactive demo interface with AI voice narration, guided tours through 10+ key modules, and user feedback collection",
    githubUrl: "https://github.com/RodrigoSC89/travel-hr-buddy/pull/566",
  },
  {
    id: 567,
    title: "AI Auto-Tuning Engine",
    category: "ai",
    description: "Continuous learning system that adjusts AI parameters based on real usage, processes logs every 6 hours, includes rollback mechanism",
    githubUrl: "https://github.com/RodrigoSC89/travel-hr-buddy/pull/567",
  },
  {
    id: 568,
    title: "AI Evolution Dashboard",
    category: "module",
    description: "Real-time visualization of AI learning progress with confidence, accuracy, and response time charts. Includes CSV export",
    githubUrl: "https://github.com/RodrigoSC89/travel-hr-buddy/pull/568",
  },
  {
    id: 569,
    title: "Public Changelog (Release v3.5)",
    category: "ui",
    description: "Official changelog page with categorized patches, markdown support, and GitHub links",
    githubUrl: "https://github.com/RodrigoSC89/travel-hr-buddy/pull/569",
  },
  {
    id: 570,
    title: "Weekly Evolution Trigger + Watchdog Integration",
    category: "ai",
    description: "Automated weekly performance audits with PATCH suggestion generation based on metrics",
    githubUrl: "https://github.com/RodrigoSC89/travel-hr-buddy/pull/570",
  },
  {
    id: 565,
    title: "Enhanced Security Scanning",
    category: "security",
    description: "Improved security scanning with automated vulnerability detection",
  },
  {
    id: 564,
    title: "Performance Optimization",
    category: "infra",
    description: "Database query optimization and caching improvements",
  },
  {
    id: 563,
    title: "Mobile Responsiveness Updates",
    category: "ui",
    description: "Enhanced mobile UI with improved touch interactions",
  },
  {
    id: 562,
    title: "Bug Fix: Navigation Issues",
    category: "fix",
    description: "Fixed navigation routing problems in certain edge cases",
  },
  {
    id: 561,
    title: "AI Prediction Accuracy Improvements",
    category: "ai",
    description: "Enhanced machine learning models for better predictions",
  },
];

export const categoryNames = {
  infra: "Infrastructure",
  ai: "AI & Machine Learning",
  module: "New Modules",
  fix: "Bug Fixes",
  ui: "UI/UX",
  security: "Security",
};

export const categoryColors = {
  infra: "bg-blue-500",
  ai: "bg-purple-500",
  module: "bg-green-500",
  fix: "bg-red-500",
  ui: "bg-yellow-500",
  security: "bg-orange-500",
};
