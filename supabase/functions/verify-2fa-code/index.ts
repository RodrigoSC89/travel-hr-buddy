import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Verify2FARequest {
  userId: string;
  code: string;
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

    const { code }: Verify2FARequest = await req.json();

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Valid 6-digit code required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's 2FA settings
    const { data: settings, error: fetchError } = await adminSupabase
      .from("user_2fa_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !settings) {
      return new Response(
        JSON.stringify({ error: "2FA not set up for this user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let isValid = false;

    if (settings.method === "totp" && settings.totp_secret) {
      // Verify TOTP code
      isValid = verifyTOTP(settings.totp_secret, code);
    } else if (settings.method === "email" || settings.method === "sms") {
      // For email/SMS, check against stored verification code
      const { data: verification } = await adminSupabase
        .from("verification_codes")
        .select("*")
        .eq("user_id", user.id)
        .eq("code", code)
        .eq("type", "2fa")
        .gte("expires_at", new Date().toISOString())
        .single();

      isValid = !!verification;

      if (isValid) {
        // Delete used code
        await adminSupabase
          .from("verification_codes")
          .delete()
          .eq("id", verification.id);
      }
    }

    if (!isValid) {
      // Log failed attempt
      await adminSupabase.from("access_logs").insert({
        user_id: user.id,
        action: "2fa_verification_failed",
        module_accessed: "auth",
        result: "failure",
        severity: "warning",
      });

      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enable 2FA if not already enabled
    if (!settings.enabled) {
      await adminSupabase
        .from("user_2fa_settings")
        .update({ 
          enabled: true, 
          verified_at: new Date().toISOString() 
        })
        .eq("user_id", user.id);
    }

    // Log successful verification
    await adminSupabase.from("access_logs").insert({
      user_id: user.id,
      action: "2fa_verified",
      module_accessed: "auth",
      result: "success",
      severity: "info",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "2FA verification successful",
        enabled: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-2fa-code error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// TOTP verification (RFC 6238)
function verifyTOTP(secret: string, code: string): boolean {
  const timeStep = 30;
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / timeStep);

  // Check current and adjacent time windows
  for (let i = -1; i <= 1; i++) {
    const expectedCode = generateTOTP(secret, counter + i);
    if (expectedCode === code) {
      return true;
    }
  }
  return false;
}

function generateTOTP(secret: string, counter: number): string {
  // Simplified TOTP - in production use a proper library
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setBigUint64(0, BigInt(counter), false);

  // For demo purposes - actual TOTP requires HMAC-SHA1
  // This is a placeholder that returns a consistent code for testing
  const hash = (secret.charCodeAt(0) * counter) % 1000000;
  return hash.toString().padStart(6, "0");
}
