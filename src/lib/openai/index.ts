/**
 * OpenAI Client for Server-Side API Routes
 * Routes through secure edge function proxy - NO direct API keys
 * @deprecated Import from @/services/unified/openai-client.service instead
 */

import { logger } from "@/lib/logger";
import { chatCompletion } from "@/services/unified/openai-client.service";

/**
 * @deprecated - Use chatCompletion() from unified service. Direct client is no longer supported.
 */
export const openai = {
  chat: {
    completions: {
      create: async (params: Record<string, unknown>) => {
        logger.warn("[OpenAI] Direct client deprecated. Routing through edge function proxy.");
        const messages = (params.messages || []) as Array<{ role: string; content: string }>;
        const content = await chatCompletion(
          messages.map(m => ({ role: m.role as "system" | "user" | "assistant", content: String(m.content) })),
          {
            temperature: params.temperature as number | undefined,
            maxTokens: params.max_tokens as number | undefined,
          }
        );
        return {
          choices: [{ message: { content } }],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        };
      },
    },
  },
};
