/**
 * Supabase Edge Function: Send Alert Email
 * Sends critical alerts via SendGrid Email
 * Patch 144.0
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || ''
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'alerts@nautilus-one.com'

interface EmailRequest {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  cc?: string[]
  bcc?: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { 
      to, 
      subject, 
      text, 
      html, 
      priority = 'medium',
      cc,
      bcc,
    } = await req.json() as EmailRequest

    // Validate request
    if (!to || !subject || (!text && !html)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and text or html' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, simulating email send')
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: 'Email would be sent in production',
          details: { to, subject, priority },
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Prepare recipients
    const toArray = Array.isArray(to) ? to : [to]
    const personalizations = toArray.map(email => ({
      to: [{ email }],
      ...(cc && { cc: cc.map(email => ({ email })) }),
      ...(bcc && { bcc: bcc.map(email => ({ email })) }),
    }))

    // Prepare email payload
    const emailPayload = {
      personalizations,
      from: { email: SENDGRID_FROM_EMAIL },
      subject: `[${priority.toUpperCase()}] ${subject}`,
      content: [
        ...(text ? [{ type: 'text/plain', value: text }] : []),
        ...(html ? [{ type: 'text/html', value: html }] : []),
      ],
      headers: {
        'X-Priority': priority === 'critical' ? '1' : priority === 'high' ? '2' : '3',
      },
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`SendGrid API error: ${errorData}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        recipients: toArray.length,
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
