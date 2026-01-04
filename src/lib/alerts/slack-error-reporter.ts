import { supabase } from "@/integrations/supabase/client";

type Severity = "critical" | "warning" | "info" | "success";

interface ErrorReport {
  message: string;
  severity?: Severity;
  title?: string;
  source?: string;
  errorType?: string;
  stackTrace?: string;
  details?: Record<string, unknown>;
}

/**
 * Reports errors to Slack via edge function
 * Integrates with Sentry for complete error tracking
 */
export async function reportErrorToSlack(report: ErrorReport): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("notify-slack", {
      body: {
        message: report.message,
        severity: report.severity || "warning",
        title: report.title || "Production Error",
        source: report.source || "Frontend",
        errorType: report.errorType,
        stackTrace: report.stackTrace,
        details: report.details,
      },
    });

    if (error) {
      console.error("[SlackReporter] Failed to send:", error);
      return false;
    }

    console.log("[SlackReporter] Error reported to Slack");
    return true;
  } catch (err) {
    console.error("[SlackReporter] Exception:", err);
    return false;
  }
}

/**
 * Reports a critical error to both Sentry and Slack
 */
export async function reportCriticalError(
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  // Report to Slack
  await reportErrorToSlack({
    message: error.message,
    severity: "critical",
    title: "🚨 Critical Production Error",
    source: context?.module as string || "Unknown",
    errorType: error.name,
    stackTrace: error.stack,
    details: context,
  });
}

/**
 * Reports a warning to Slack
 */
export async function reportWarning(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  await reportErrorToSlack({
    message,
    severity: "warning",
    title: "⚠️ Production Warning",
    source: context?.module as string || "Frontend",
    details: context,
  });
}

/**
 * Reports a successful deployment or operation
 */
export async function reportSuccess(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  await reportErrorToSlack({
    message,
    severity: "success",
    title: "✅ Operation Successful",
    source: context?.module as string || "System",
    details: context,
  });
}
