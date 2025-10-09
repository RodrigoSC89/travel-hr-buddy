import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(200).json({ session: null });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user from the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Return session-like structure
    res.status(200).json({ 
      session: user ? { user } : null 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
}
