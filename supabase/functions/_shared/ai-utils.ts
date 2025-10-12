// Shared utilities for AI operations across edge functions

// CORS headers used across all functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 10000, // 10 seconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

// Exponential backoff with jitter
export const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(
    RETRY_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    RETRY_CONFIG.MAX_RETRY_DELAY
  );
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return exponentialDelay + jitter;
};

// Check if error is retryable
export const isRetryableError = (status?: number, error?: Error): boolean => {
  if (!status && error) {
    // Network errors are retryable
    return error.message.includes("fetch") || error.message.includes("network");
  }
  // Retry on 429 (rate limit), 500s (server errors), and 503 (service unavailable)
  return status === 429 || (status !== undefined && status >= 500 && status < 600);
};

// Timeout wrapper for fetch
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Call OpenAI with retry logic
export const callOpenAIWithRetry = async (
  apiKey: string,
  requestBody: object
): Promise<{ response: object; duration: number }> => {
  const startTime = Date.now();
  let lastError: Error | null = null;
  let response: Response | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`OpenAI API request attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES + 1}`);

      response = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
        RETRY_CONFIG.REQUEST_TIMEOUT
      );

      if (response.ok) {
        const data = await response.json();
        const duration = Date.now() - startTime;
        return { response: data, duration };
      }

      // Check if we should retry
      if (!isRetryableError(response.status)) {
        const errorText = await response.text();
        console.error("OpenAI API non-retryable error:", errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      lastError = new Error(`HTTP ${response.status}`);

      // Wait before retrying (except on last attempt)
      if (attempt < RETRY_CONFIG.MAX_RETRIES) {
        const delay = getRetryDelay(attempt);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Don't retry on timeout or network errors on last attempt
      if (attempt === RETRY_CONFIG.MAX_RETRIES) {
        throw new Error(
          `OpenAI API failed after ${RETRY_CONFIG.MAX_RETRIES + 1} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.log(`Retrying after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`OpenAI API failed: ${lastError?.message || "Unknown error"}`);
};

// Log AI interaction to database
export interface AIInteractionLog {
  user_id?: string;
  interaction_type: "chat" | "checklist_generation" | "document_summary" | "other";
  prompt: string;
  response?: string;
  model_used?: string;
  tokens_used?: number;
  duration_ms?: number;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

export const logAIInteraction = async (
  supabaseClient: any,
  log: AIInteractionLog
): Promise<void> => {
  try {
    const { error } = await supabaseClient.from("ai_interactions").insert({
      user_id: log.user_id,
      interaction_type: log.interaction_type,
      prompt: log.prompt,
      response: log.response,
      model_used: log.model_used,
      tokens_used: log.tokens_used,
      duration_ms: log.duration_ms,
      success: log.success,
      error_message: log.error_message,
      metadata: log.metadata || {},
    });

    if (error) {
      console.error("Failed to log AI interaction:", error);
      // Don't throw - logging failure shouldn't break the main function
    }
  } catch (error) {
    console.error("Exception while logging AI interaction:", error);
    // Don't throw - logging failure shouldn't break the main function
  }
};

// Extract token usage from OpenAI response
export const extractTokenUsage = (response: any): number | undefined => {
  return response?.usage?.total_tokens;
};

// Validate OpenAI response format
export const validateOpenAIResponse = (data: any): boolean => {
  return !!(data?.choices && data.choices[0] && data.choices[0].message);
};
