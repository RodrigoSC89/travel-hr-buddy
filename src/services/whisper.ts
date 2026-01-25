/**
 * Whisper Service - Stub
 */

export interface WhisperTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  data?: Record<string, unknown>;
}

export async function testWhisperConnection(): Promise<WhisperTestResult> {
  return {
    success: false,
    message: "Whisper integration not configured",
    error: "Service stub - integration removed",
    data: {},
  };
}
