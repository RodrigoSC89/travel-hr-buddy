import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function ok<T>(data: T): APIResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

export function fail(error: string): APIResponse {
  return { success: false, error, timestamp: new Date().toISOString() };
}
