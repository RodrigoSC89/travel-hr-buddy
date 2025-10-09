/**
 * Utilities for consistent status colors with proper accessibility
 */

// Status color mappings using semantic tokens
export const statusColors = {
  // Connection/Active States
  active: "bg-status-active text-status-active-foreground",
  inactive: "bg-status-inactive text-status-inactive-foreground",
  online: "bg-status-active text-status-active-foreground",
  offline: "bg-status-inactive text-status-inactive-foreground",
  connected: "bg-status-active text-status-active-foreground",
  disconnected: "bg-status-inactive text-status-inactive-foreground",

  // Process States
  success: "bg-success text-success-foreground",
  completed: "bg-success text-success-foreground",
  approved: "bg-success text-success-foreground",
  published: "bg-success text-success-foreground",

  // Warning States
  warning: "bg-warning text-warning-foreground",
  pending: "bg-warning text-warning-foreground",
  in_progress: "bg-warning text-warning-foreground",
  maintenance: "bg-warning text-warning-foreground",

  // Error States
  error: "bg-status-error text-status-error-foreground",
  failed: "bg-status-error text-status-error-foreground",
  rejected: "bg-status-error text-status-error-foreground",
  emergency: "bg-status-error text-status-error-foreground",

  // Info States
  info: "bg-info text-info-foreground",
  draft: "bg-info text-info-foreground",
  scheduled: "bg-info text-info-foreground",
  navigation: "bg-info text-info-foreground",

  // Default
  default: "bg-muted text-muted-foreground",
} as const;

// Status indicator dots (for small status indicators)
export const statusDots = {
  active: "bg-status-active",
  inactive: "bg-status-inactive",
  online: "bg-status-active",
  offline: "bg-status-inactive",
  connected: "bg-status-active",
  disconnected: "bg-status-inactive",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-status-error",
  info: "bg-info",
  default: "bg-muted",
} as const;

// Priority colors
export const priorityColors = {
  high: "bg-status-error text-status-error-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-info text-info-foreground",
  critical: "bg-status-error text-status-error-foreground",
  normal: "bg-info text-info-foreground",
} as const;

// Helper functions
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  return statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.default;
};

export const getStatusDot = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  return statusDots[normalizedStatus as keyof typeof statusDots] || statusDots.default;
};

export const getPriorityColor = (priority: string): string => {
  const normalizedPriority = priority.toLowerCase();
  return priorityColors[normalizedPriority as keyof typeof priorityColors] || priorityColors.normal;
};

// Difficulty level colors for knowledge base
export const difficultyColors = {
  beginner: "bg-success text-success-foreground",
  intermediate: "bg-warning text-warning-foreground",
  advanced: "bg-status-error text-status-error-foreground",
  expert: "bg-destructive text-destructive-foreground",
} as const;

export const getDifficultyColor = (difficulty: string): string => {
  const normalizedDifficulty = difficulty.toLowerCase();
  return (
    difficultyColors[normalizedDifficulty as keyof typeof difficultyColors] ||
    difficultyColors.beginner
  );
};

// Vessel/Fleet status colors
export const vesselStatusColors = {
  operational: "bg-status-active text-status-active-foreground",
  maintenance: "bg-warning text-warning-foreground",
  docked: "bg-info text-info-foreground",
  emergency: "bg-status-error text-status-error-foreground",
  offline: "bg-status-inactive text-status-inactive-foreground",
  excellent: "bg-success text-success-foreground",
  good: "bg-info text-info-foreground",
  fair: "bg-warning text-warning-foreground",
  poor: "bg-status-error text-status-error-foreground",
} as const;

export const getVesselStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  return (
    vesselStatusColors[normalizedStatus as keyof typeof vesselStatusColors] ||
    vesselStatusColors.offline
  );
};
