/**
 * OpenAI Client - Secure proxy via edge function
 * NO direct browser API calls - all routed through ai-proxy
 * @deprecated Import from @/services/unified/openai-client.service instead
 */

import { logger } from "@/lib/logger";
import { chatCompletion } from "@/services/unified/openai-client.service";

// Re-export the secure service
export { chatCompletion, chatCompletionJSON, simpleCompletion, generateEmbedding, testOpenAIConnection } from "@/services/unified/openai-client.service";

/**
 * @deprecated - Direct OpenAI client access is no longer supported.
 * Use chatCompletion() from unified service instead.
 */
export const openai = {
  chat: {
    completions: {
      create: async (params: Record<string, unknown>) => {
        logger.warn("[OpenAI] Direct client usage deprecated. Routing through edge function.");
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
