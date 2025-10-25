// PATCH 108.0: Security & Access Control Types

export type AccessResult = 'success' | 'failure' | 'denied' | 'error';
export type LogSeverity = 'info' | 'warning' | 'critical';
export type UserRoleType = 'admin' | 'operator' | 'viewer' | 'auditor';

export interface AccessLog {
  id: string;
  user_id?: string;
  module_accessed: string;
  timestamp: string;
  action: string;
  result: AccessResult;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: LogSeverity;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  permissions: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

export interface AccessAnalytics {
  module_accessed: string;
  action: string;
  result: AccessResult;
  access_count: number;
  unique_users: number;
  failed_attempts: number;
  last_access: string;
  first_access: string;
}

export interface SuspiciousAccess {
  user_id: string;
  module_accessed: string;
  failed_attempts: number;
  time_range: {
    start: string;
    end: string;
  };
  severity: LogSeverity;
}

export interface AccessFilters {
  module?: string;
  result?: AccessResult;
  severity?: LogSeverity;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface PermissionSet {
  module: string;
  permissions: string[];
}
