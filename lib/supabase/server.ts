/**
 * Supabase Server Client
 * Creates a Supabase client for server-side use (API routes)
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/integrations/supabase/types";
import type { NextApiRequest, NextApiResponse } from "next";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

/**
 * Create a Supabase client instance for server-side use
 * @returns Supabase client configured for server-side operations
 */
export function createClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client for Next.js API routes with session handling
 * @param context - Object containing Next.js request and response
 * @returns Supabase client with session management for API routes
 */
export function createServerSupabaseClient(context: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
        set(name: string, value: string, options: any) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly; ' : ''}${options.secure ? 'Secure; ' : ''}${options.sameSite ? `SameSite=${options.sameSite}; ` : ''}${options.maxAge ? `Max-Age=${options.maxAge}` : ''}`);
        },
        remove(name: string, options: any) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
        },
      },
    }
  );
}
