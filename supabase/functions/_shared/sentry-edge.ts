/**
 * Sentry Configuration for Supabase Edge Functions
 * 
 * This file provides a lightweight error tracking setup for Deno-based
 * Supabase Edge Functions. Since Sentry's official Deno SDK might have
 * compatibility issues, this provides manual error reporting.
 * 
 * Usage in Edge Functions:
 * 
 * import { captureException, captureMessage } from "../_shared/sentry-edge.ts";
 * 
 * try {
 *   // your code
 * } catch (error) {
 *   await captureException(error, { functionName: "my-function" });
 * }
 */

const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
const SENTRY_ENVIRONMENT = Deno.env.get("SENTRY_ENVIRONMENT") || "production";

interface SentryEvent {
  event_id: string;
  timestamp: string;
  platform: string;
  level: "fatal" | "error" | "warning" | "info" | "debug";
  logger?: string;
  server_name?: string;
  message?: {
    formatted: string;
  };
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename: string;
          function: string;
          lineno: number;
          colno: number;
        }>;
      };
    }>;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  environment: string;
}

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Sends an event to Sentry
 */
async function sendToSentry(event: SentryEvent): Promise<void> {
  if (!SENTRY_DSN) {
    console.warn("SENTRY_DSN not configured. Error not sent to Sentry.");
    return;
  }

  try {
    const url = SENTRY_DSN.replace(
      /https:\/\/(.+)@(.+)\/(.+)/,
      "https://$2/api/$3/store/"
    );
    
    const [publicKey] = SENTRY_DSN.match(/https:\/\/(.+)@/)![1].split(":");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_timestamp=${Date.now()}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("Failed to send error to Sentry:", response.status);
    }
  } catch (error) {
    console.error("Error sending to Sentry:", error);
  }
}

/**
 * Captures an exception and sends it to Sentry
 */
export async function captureException(
  error: Error | unknown,
  context?: {
    functionName?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));

  const event: SentryEvent = {
    event_id: generateUUID(),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    environment: SENTRY_ENVIRONMENT,
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          stacktrace: err.stack
            ? {
                frames: err.stack.split("\n").slice(1).map((line) => ({
                  filename: line.trim(),
                  function: "unknown",
                  lineno: 0,
                  colno: 0,
                })),
              }
            : undefined,
        },
      ],
    },
    tags: {
      functionType: "edge-function",
      ...context?.tags,
    },
    extra: {
      functionName: context?.functionName,
      ...context?.extra,
    },
  };

  await sendToSentry(event);
}

/**
 * Captures a message and sends it to Sentry
 */
export async function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): Promise<void> {
  const event: SentryEvent = {
    event_id: generateUUID(),
    timestamp: new Date().toISOString(),
    platform: "node",
    level,
    environment: SENTRY_ENVIRONMENT,
    message: {
      formatted: message,
    },
    tags: {
      functionType: "edge-function",
      ...context?.tags,
    },
    extra: context?.extra,
  };

  await sendToSentry(event);
}

/**
 * Wraps an edge function handler with error tracking
 */
export function withSentryTracking<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  functionName: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      await captureException(error, {
        functionName,
        extra: {
          arguments: args,
        },
      });
      
      // Re-throw to maintain normal error flow
      throw error;
    }
  }) as T;
}
