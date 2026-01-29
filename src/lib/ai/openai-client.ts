/**
 * OpenAI Client
 * Shared OpenAI client instance for AI features
 * NOTE: OpenAI API calls should use edge functions for security
 * This client is a fallback for non-sensitive operations
 */

import OpenAI from "openai";
import { logger } from "@/lib/logger";

// NOTE: VITE_ env vars are not supported in Lovable
// OpenAI calls should go through edge functions for security
// This client is initialized without API key - use edge functions instead
logger.info("OpenAI client initialized. For secure operations, use edge functions.");

/**
 * Shared OpenAI client instance
 * NOTE: API key is not set - calls will fail unless using edge functions
 * This is intentional for security - sensitive AI operations go through backend
 */
export const openai = new OpenAI({
  apiKey: "", // Intentionally empty - use edge functions
  dangerouslyAllowBrowser: true,
});
