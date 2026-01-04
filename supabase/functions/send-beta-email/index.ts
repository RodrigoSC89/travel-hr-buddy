import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BetaEmailRequest {
  email_type: "invitation" | "welcome" | "weekly_checkin" | "completion";
  recipient_email: string;
  recipient_name: string;
  custom_data?: {
    signup_link?: string;
    slack_invite?: string;
    calendly_link?: string;
    video_link?: string;
    survey_link?: string;
    bugs_count?: number;
    features_count?: number;
    nps_score?: number;
    hours_spent?: number;
    quote?: string;
    launch_date?: string;
  };
}

// Email templates
function getInvitationEmail(name: string, data: BetaEmailRequest["custom_data"]) {
  return {
    subject: "🚀 You're Invited: Nautilus One Beta Program",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d;">Hi ${name},</h1>
        
        <p>We're excited to invite you to be one of the first to experience <strong>Nautilus One</strong> - the revolutionary maritime operations platform powered by AI.</p>
        
        <h2 style="color: #2d3748;">What is Nautilus One?</h2>
        <p>A next-generation system that combines AI, real-time monitoring, and intelligent automation to transform how you manage your fleet.</p>
        
        <h2 style="color: #2d3748;">What's In It For You:</h2>
        <ul>
          <li>✅ Free access during beta (3 months)</li>
          <li>✅ Direct line to our product team</li>
          <li>✅ Your feedback shapes the product</li>
          <li>✅ 50% discount if you continue after beta</li>
          <li>✅ Priority support</li>
        </ul>
        
        <h2 style="color: #2d3748;">Next Steps:</h2>
        <ol>
          <li>Click here to create your account: <a href="${data?.signup_link || '#'}">${data?.signup_link || 'Sign Up'}</a></li>
          <li>Join our Slack channel: <a href="${data?.slack_invite || '#'}">Slack Invite</a></li>
          <li>Book your 30-min onboarding call: <a href="${data?.calendly_link || '#'}">Schedule Call</a></li>
        </ol>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <a href="${data?.signup_link || '#'}" style="color: white; text-decoration: none; font-size: 18px; font-weight: bold;">🚀 Join Beta Now</a>
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          We're limiting this to 50 users. Questions? Reply to this email.<br><br>
          Looking forward to working with you!<br><br>
          Best regards,<br>
          <strong>Nautilus One Team</strong>
        </p>
        
        ${data?.video_link ? `<p>P.S. - Check out this 3-min demo: <a href="${data.video_link}">Watch Video</a></p>` : ''}
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">
          Nautilus One | Maritime Operations Reimagined<br>
          www.nautilus.com | support@nautilus.com
        </p>
      </div>
    `,
  };
}

function getWelcomeEmail(name: string, data: BetaEmailRequest["custom_data"]) {
  return {
    subject: "✅ Welcome to Nautilus One Beta!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d;">Welcome aboard, ${name}! 🎉</h1>
        
        <p>Your Nautilus One account is ready.</p>
        
        <h2 style="color: #2d3748;">Quick Start (5 minutes):</h2>
        <ol>
          <li><strong>Login:</strong> <a href="${data?.signup_link || '#'}">Click here to login</a></li>
          <li><strong>Add Your First Vessel:</strong> Click "Fleet Command" → "Add Vessel"</li>
          <li><strong>Explore AI Features:</strong> Try the AI Copilot (click chat icon)</li>
        </ol>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Pro Tips:</h3>
          <ul style="margin-bottom: 0;">
            <li>🎤 Voice commands are amazing - try them!</li>
            <li>🤖 AI Copilot gets smarter as you use it</li>
            <li>📱 Mobile app coming soon (currently desktop-first)</li>
            <li>⚡ Keyboard shortcuts: Press "?" to see them</li>
          </ul>
        </div>
        
        <h2 style="color: #2d3748;">Your Mission:</h2>
        <ul>
          <li>Week 1: Explore & set up your fleet (3-4 hours)</li>
          <li>Week 2: Use daily, report bugs (30 min/day)</li>
          <li>Week 3: Test advanced features (AI, analytics)</li>
          <li>Week 4: Complete feedback survey</li>
        </ul>
        
        <p style="color: #718096;">
          Thank you for being part of this journey!<br><br>
          Best,<br>
          <strong>Nautilus One Team</strong>
        </p>
        
        <p style="background: #fef5e7; padding: 15px; border-radius: 5px; color: #744210;">
          P.S. - First person to report a bug wins a Nautilus t-shirt! 👕
        </p>
      </div>
    `,
  };
}

function getWeeklyCheckinEmail(name: string, data: BetaEmailRequest["custom_data"]) {
  return {
    subject: "🚢 Beta Week 1: How's it going?",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d;">Hi ${name},</h1>
        
        <p>You've had Nautilus One for a week now - we'd love to hear how it's going!</p>
        
        <h2 style="color: #2d3748;">This Week's Focus:</h2>
        <p>Try these features we think you'll love:</p>
        <ol>
          <li>✨ AI Command Center (most popular!)</li>
          <li>📊 Fleet Analytics (real-time insights)</li>
          <li>🎤 Voice Navigation (hands-free operation)</li>
        </ol>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <a href="${data?.survey_link || '#'}" style="color: white; text-decoration: none; font-size: 18px; font-weight: bold;">📝 Share Your Feedback (2 min)</a>
        </div>
        
        <h2 style="color: #2d3748;">Reminder:</h2>
        <ul>
          <li>Bug bounty: $50 for critical bugs found 💰</li>
          <li>Slack channel: For quick questions</li>
        </ul>
        
        <p style="color: #718096;">
          Your feedback is shaping the product - thank you! 🙏<br><br>
          Sail on,<br>
          <strong>Nautilus One Team</strong>
        </p>
      </div>
    `,
  };
}

function getCompletionEmail(name: string, data: BetaEmailRequest["custom_data"]) {
  return {
    subject: "🎉 Thank You - Beta Program Complete!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d;">Hi ${name},</h1>
        
        <p>Wow! 4 weeks flew by. The beta program is officially complete, and we couldn't have done it without you.</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Your Impact:</h3>
          <ul style="margin-bottom: 0;">
            <li>🐛 Bugs reported: ${data?.bugs_count || 0}</li>
            <li>💡 Feature suggestions: ${data?.features_count || 0}</li>
            <li>⭐ Your NPS score: ${data?.nps_score || 'N/A'}/10</li>
            <li>⏱️ Time spent: ${data?.hours_spent || 0} hours</li>
          </ul>
        </div>
        
        ${data?.quote ? `
        <blockquote style="border-left: 4px solid #667eea; padding-left: 20px; margin: 20px 0; font-style: italic; color: #4a5568;">
          "${data.quote}"<br>
          <small style="color: #a0aec0;">(This made our day! Thank you.)</small>
        </blockquote>
        ` : ''}
        
        <h2 style="color: #2d3748;">What's Next:</h2>
        <ul>
          <li><strong>Your Beta Account:</strong> Stays active forever (free!) 🎁</li>
          <li><strong>Official Launch:</strong> ${data?.launch_date || 'Coming soon!'}</li>
          <li><strong>Thank You Gift:</strong> Nautilus t-shirt + $100 referral credits + Lifetime "Beta Tester" badge 🏆</li>
        </ul>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <a href="${data?.survey_link || '#'}" style="color: white; text-decoration: none; font-size: 18px; font-weight: bold;">📝 Complete Final Survey (5 min)</a>
        </div>
        
        <p style="color: #718096;">
          Thank you for taking a chance on us. Your feedback transformed Nautilus One from "good" to "amazing."<br><br>
          With gratitude,<br>
          <strong>Nautilus One Team</strong>
        </p>
        
        <p style="background: #e6fffa; padding: 15px; border-radius: 5px; color: #234e52;">
          P.S. - Want to join our advisory board? Reply "YES" and let's chat.
        </p>
      </div>
    `,
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email_type, recipient_email, recipient_name, custom_data }: BetaEmailRequest = await req.json();

    console.log(`📧 Sending ${email_type} email to ${recipient_email}`);

    // Get email content based on type
    let emailContent: { subject: string; html: string };
    switch (email_type) {
      case "invitation":
        emailContent = getInvitationEmail(recipient_name, custom_data);
        break;
      case "welcome":
        emailContent = getWelcomeEmail(recipient_name, custom_data);
        break;
      case "weekly_checkin":
        emailContent = getWeeklyCheckinEmail(recipient_name, custom_data);
        break;
      case "completion":
        emailContent = getCompletionEmail(recipient_name, custom_data);
        break;
      default:
        throw new Error(`Unknown email type: ${email_type}`);
    }

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: "Nautilus One <onboarding@resend.dev>",
      to: [recipient_email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      
      // Log failed attempt
      await supabase.from("beta_email_logs").insert({
        recipient_email,
        recipient_name,
        email_type,
        subject: emailContent.subject,
        status: "failed",
        error_message: error.message,
      });

      throw error;
    }

    console.log("✅ Email sent successfully:", data);

    // Log successful send
    await supabase.from("beta_email_logs").insert({
      recipient_email,
      recipient_name,
      email_type,
      subject: emailContent.subject,
      status: "sent",
      resend_id: data?.id,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
