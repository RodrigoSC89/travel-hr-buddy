/**
 * MarineTraffic Service - Stub
 */

export interface MarineTrafficTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  data?: Record<string, unknown>;
}

export async function testMarineTrafficConnection(): Promise<MarineTrafficTestResult> {
  return {
    success: false,
    message: "MarineTraffic integration not configured",
    error: "Service stub - integration removed",
    data: {},
  };
}
