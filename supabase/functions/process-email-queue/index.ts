/**
 * Process Email Queue Edge Function
 * Sends pending emails from the queue with retry logic
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface EmailQueueItem {
  id: string;
  to_email: string;
  to_name: string | null;
  from_email: string;
  reply_to: string | null;
  subject: string;
  html_body: string;
  text_body: string | null;
  priority: string;
  attempts: number;
  max_attempts: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get pending emails
    const { data: emails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", 3)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending emails", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let failed = 0;

    for (const email of emails as EmailQueueItem[]) {
      try {
        // Mark as sending
        await supabase
          .from("email_queue")
          .update({
            status: "sending",
            last_attempt_at: new Date().toISOString(),
            attempts: email.attempts + 1,
          })
          .eq("id", email.id);

        // Send via Resend (or simulate if no API key)
        if (RESEND_API_KEY) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: email.from_email || "Nauti One <noreply@nautione.com>",
              to: [email.to_email],
              subject: email.subject,
              html: email.html_body,
              text: email.text_body,
              reply_to: email.reply_to,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resend API error: ${errorText}`);
          }
        }

        // Mark as sent
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id);

        processed++;
        console.log(`Email sent successfully to ${email.to_email}`);

      } catch (sendError) {
        console.error(`Failed to send email to ${email.to_email}:`, sendError);

        // Check if max attempts reached
        const newAttempts = email.attempts + 1;
        const newStatus = newAttempts >= email.max_attempts ? "failed" : "pending";

        await supabase
          .from("email_queue")
          .update({
            status: newStatus,
            error_message: sendError instanceof Error ? sendError.message : "Unknown error",
          })
          .eq("id", email.id);

        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Email queue processed",
        processed,
        failed,
        total: emails.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing email queue:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
