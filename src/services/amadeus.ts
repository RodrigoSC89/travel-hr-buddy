/**
 * Amadeus Service - Stub
 */

export interface AmadeusTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  data?: Record<string, unknown>;
}

export async function testAmadeusConnection(): Promise<AmadeusTestResult> {
  return {
    success: false,
    message: "Amadeus integration not configured",
    error: "Service stub - integration removed",
    data: {},
  };
}
