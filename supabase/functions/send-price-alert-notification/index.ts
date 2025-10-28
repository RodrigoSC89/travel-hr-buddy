// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceAlertNotificationRequest {
  alert_id: string;
  user_id: string;
  product_name: string;
  current_price: number;
  target_price: number;
  product_url: string;
  notification_type: "email" | "push" | "both";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      alert_id,
      user_id,
      product_name,
      current_price,
      target_price,
      product_url,
      notification_type = "both",
    }: PriceAlertNotificationRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get user email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
    
    if (userError || !userData) {
      throw new Error("User not found");
    }

    const userEmail = userData.user.email;
    const savings = target_price - current_price;

    // Send email notification if requested
    if (notification_type === "email" || notification_type === "both") {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      if (resendApiKey) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Travel HR Buddy <notifications@travel-hr-buddy.com>",
              to: userEmail,
              subject: `🎯 Price Alert: ${product_name}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Price Alert</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🎯 Price Alert Triggered!</h1>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #667eea; margin-top: 0;">Great news!</h2>
                    <p style="font-size: 16px;">The price for <strong>${product_name}</strong> has dropped to your target price!</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="color: #666;">Current Price:</span>
                        <span style="font-size: 24px; font-weight: bold; color: #10b981;">R$ ${current_price.toFixed(2)}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="color: #666;">Target Price:</span>
                        <span style="font-size: 18px; color: #6b7280;">R$ ${target_price.toFixed(2)}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                        <span style="color: #666; font-weight: bold;">Your Savings:</span>
                        <span style="font-size: 20px; font-weight: bold; color: #10b981;">R$ ${savings.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin: 20px 0;">
                      Don't miss this opportunity! Prices can change quickly.
                    </p>
                    
                    <a href="${product_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
                      View Product
                    </a>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                      You're receiving this email because you set up a price alert for this product.
                      <br>
                      Manage your alerts in the Travel HR Buddy dashboard.
                    </p>
                  </div>
                </body>
                </html>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error("Failed to send email:", await emailResponse.text());
          } else {
            console.log("Email sent successfully");
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    }

    // Send push notification if requested
    if (notification_type === "push" || notification_type === "both") {
      // In a production environment, you would integrate with:
      // - Firebase Cloud Messaging (FCM) for mobile push notifications
      // - Web Push API for browser notifications
      // - OneSignal or similar service
      
      // For now, we'll log that a push notification would be sent
      console.log("Push notification would be sent:", {
        user_id,
        title: `🎯 Price Alert: ${product_name}`,
        body: `Price dropped to R$ ${current_price.toFixed(2)}! You save R$ ${savings.toFixed(2)}`,
        data: {
          alert_id,
          product_url,
          type: "price_alert",
        },
      });

      // Create a notification record in the database
      await supabaseClient.from("price_notifications").insert({
        user_id,
        alert_id,
        message: `Price Alert: ${product_name} is now R$ ${current_price.toFixed(2)} (target: R$ ${target_price.toFixed(2)}). Save R$ ${savings.toFixed(2)}!`,
        is_read: false,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
        email_sent: notification_type === "email" || notification_type === "both",
        push_sent: notification_type === "push" || notification_type === "both",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending price alert notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
