/**
 * OpenAI Client for Server-Side API Routes
 * Exports an authenticated OpenAI client instance
 */

import OpenAI from "openai";

// Get API key from environment
const apiKey = process.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === "your_openai_api_key_here") {
  console.warn("⚠️ OpenAI API key not configured. Set VITE_OPENAI_API_KEY in your environment.");
}

/**
 * Authenticated OpenAI client instance
 * Can be used in API routes and server-side operations
 */
export const openai = new OpenAI({
  apiKey: apiKey || "",
});
