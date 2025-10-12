/**
 * ✅ API: /api/assistant/logs
 * Suporta filtros por data e e-mail (admin only)
 * 
 * This is a REFERENCE IMPLEMENTATION for Next.js 13+ App Router.
 * The current project uses Vite + React with Supabase Edge Functions.
 * 
 * Active implementation: supabase/functions/assistant-logs/index.ts
 * 
 * To use this in a Next.js environment:
 * 1. Ensure Next.js 13+ is installed with App Router
 * 2. Install @supabase/ssr package
 * 3. Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * 
 * Security:
 * - ✅ Authenticated users only
 * - ✅ Users see only their own logs
 * - ✅ Admins can see all logs and filter by email
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
            // Handle cookie setting error (cookies can only be set in server actions/route handlers)
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
  const start = url.searchParams.get("start"); // data inicial (YYYY-MM-DD)
  const end = url.searchParams.get("end");     // data final (YYYY-MM-DD)
  const email = url.searchParams.get("email"); // filtro por e-mail (admin)

  // Obtém o perfil e verifica se é admin
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

  // Monta query base
  let query = supabase
    .from("assistant_logs")
    .select("id, question, answer, created_at, user_id, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(1000);

  // Se não for admin, mostra apenas os logs do próprio usuário
  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  } else {
    // Admins podem filtrar por e-mail
    if (email) {
      query = query.ilike("profiles.email", `%${email}%`);
    }
  }

  // Aplica filtros de data se existirem
  if (start) query = query.gte("created_at", start);
  if (end) query = query.lte("created_at", end);

  // Executa a consulta
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Formata com e-mail do usuário
  const logs = data.map((log) => ({
    ...log,
    user_email: log.profiles?.email || "Anônimo",
  }));

  return NextResponse.json(logs);
}
