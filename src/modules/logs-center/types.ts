/**
 * PATCH 94.0 - Logs Center Types
 * Type definitions for the centralized logging system
 */

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  origin: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  created_at: string;
}

export interface LogFilter {
  level?: LogLevel;
  origin?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byOrigin: Record<string, number>;
}

export interface AIAuditResult {
  summary: string;
  insights: string[];
  suggestions: string[];
  confidence: number;
  timestamp: Date;
}
