/**
 * Next.js API Route for Assistant Logs
 * This is a reference implementation. The active implementation uses Supabase Edge Function.
 * 
 * API: GET /api/assistant/logs
 * Returns logs saved by the AI Assistant for display in the history panel
 * 
 * Security:
 * - Only authenticated users with valid session can access
 * - Regular users only see their own logs
 * - Admins can view all logs
 */

import type { NextApiRequest, NextApiResponse } from "../next-types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Note: This Next.js API route is a reference implementation.
    // The actual implementation uses the Supabase Edge Function at:
    // supabase/functions/assistant-logs/index.ts
    //
    // To use this in a real Next.js environment, you would need to:
    // 1. Install @supabase/auth-helpers-nextjs or @supabase/ssr
    // 2. Set up proper authentication with Supabase
    // 3. Access cookies for session management
    //
    // For now, this returns a helpful message directing to the Edge Function.

    return res.status(200).json({
      message: "This is a reference implementation. Please use the Supabase Edge Function instead.",
      edgeFunction: "/functions/v1/assistant-logs",
      documentation: "See supabase/functions/assistant-logs/index.ts for the active implementation",
      usage: "Call the edge function with an Authorization header containing the user's session token",
    });

  } catch (error) {
    console.error("Error in assistant logs API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
