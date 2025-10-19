/**
 * OpenAI Client
 * Shared OpenAI client instance for AI features
 */

import OpenAI from "openai";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === "your_openai_api_key_here") {
  console.warn("⚠️ OpenAI API key not configured. Set VITE_OPENAI_API_KEY in your environment.");
}

/**
 * Shared OpenAI client instance
 * Used across AI features for forecast, embeddings, and chat completions
 */
export const openai = new OpenAI({
  apiKey: apiKey || "",
  dangerouslyAllowBrowser: true,
});
