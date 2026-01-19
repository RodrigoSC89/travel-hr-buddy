import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Enable2FARequest {
  userId: string;
  method: "totp" | "sms" | "email";
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { method, phone }: Enable2FARequest = await req.json();

    if (!method || !["totp", "sms", "email"].includes(method)) {
      return new Response(
        JSON.stringify({ error: "Valid 2FA method required: totp, sms, or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate TOTP secret if method is totp
    let totpSecret = null;
    let qrCode = null;

    if (method === "totp") {
      // Generate a random secret for TOTP
      const randomBytes = crypto.getRandomValues(new Uint8Array(20));
      totpSecret = base32Encode(randomBytes);
      
      // Generate QR code URL (for authenticator apps)
      const issuer = "NautilusOne";
      const email = user.email || "user";
      qrCode = `otpauth://totp/${issuer}:${email}?secret=${totpSecret}&issuer=${issuer}`;
    }

    // Store 2FA setup in database
    const { error: insertError } = await adminSupabase
      .from("user_2fa_settings")
      .upsert({
        user_id: user.id,
        method,
        totp_secret: method === "totp" ? totpSecret : null,
        phone: method === "sms" ? phone : null,
        enabled: false, // Not enabled until verified
        setup_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("2FA setup error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to setup 2FA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action
    await adminSupabase.from("access_logs").insert({
      user_id: user.id,
      action: "2fa_setup_initiated",
      module_accessed: "auth",
      result: "success",
      severity: "info",
      details: { method },
    });

    const response: Record<string, unknown> = {
      success: true,
      method,
      message: `2FA setup initiated with ${method}. Please verify to complete.`,
    };

    if (method === "totp") {
      response.secret = totpSecret;
      response.qrCode = qrCode;
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("enable-2fa error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Base32 encoding for TOTP secret
function base32Encode(buffer: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}
