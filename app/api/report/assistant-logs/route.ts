/**
 * API Route: /api/report/assistant-logs
 * Get logs of AI assistant report sending to users
 * Supports filtering by date range and email
 * 
 * Note: This is a REFERENCE IMPLEMENTATION for Next.js App Router.
 * The current project uses Vite + React.
 * For actual implementation in this project, you may want to use a Supabase Edge Function.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Handle cookie removal error
          }
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const start = url.searchParams.get("start"); // Start date (YYYY-MM-DD)
  const end = url.searchParams.get("end");     // End date (YYYY-MM-DD)
  const email = url.searchParams.get("email"); // Filter by email (admin only)

  // Get user profile and check if admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }

  const isAdmin = profile?.role === "admin";

  // Build base query
  let query = supabase
    .from("assistant_report_logs")
    .select("id, user_email, status, message, sent_at, user_id, report_type")
    .order("sent_at", { ascending: false })
    .limit(1000);

  // If not admin, show only user's own logs
  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  } else {
    // Admins can filter by email
    if (email) {
      query = query.ilike("user_email", `%${email}%`);
    }
  }

  // Apply date filters if they exist
  if (start) query = query.gte("sent_at", start);
  if (end) {
    // Add time to end of day for end date
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    query = query.lte("sent_at", endDate.toISOString());
  }

  // Execute query
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
