// Shared Supabase client utilities for edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Create a Supabase client from request headers
export const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Get the authorization header from the request
  const authHeader = req.headers.get("Authorization");

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
};

// Get authenticated user from request
export const getAuthenticatedUser = async (supabaseClient: any) => {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
};
