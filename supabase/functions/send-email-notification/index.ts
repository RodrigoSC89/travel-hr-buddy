import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const { to, subject, html, text, from } = await req.json();

    if (!to || !subject) {
      return errorResponse('To and subject are required', 400);
    }

    if (!RESEND_API_KEY) {
      log('warn', 'send-email', 'RESEND_API_KEY not configured');
      // Mock response for development
      return jsonResponse({ 
        success: true, 
        message: 'Email queued (mock mode)',
        id: 'mock-' + Date.now()
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'Nauti One <noreply@nautione.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text}</p>`,
        text: text || (html ? html.replace(/<[^>]*>/g, '') : '')
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'send-email', 'Failed to send email', { error: errorText });
      return errorResponse('Failed to send email', 500);
    }

    const result = await response.json();

    log('info', 'send-email', 'Email sent', { to, subject, id: result.id });

    return jsonResponse({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'send-email', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
