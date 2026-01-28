// @ts-nocheck
/**
 * Check Subscription Edge Function
 * Verifies user subscription status from Stripe
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step, details) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      // Return free tier when Stripe is not configured
      logStep("Stripe not configured, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_name: "free",
        plan_features: ["3 vessels", "Basic features", "Community support"],
        message: "Stripe not configured - using free tier"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let planName = null;
    let planFeatures = [];

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product;
      
      // Map product IDs to plan names and features
      const productConfig = {
        'prod_TlCZjXi65mykUJ': { 
          name: 'starter', 
          features: ['5 vessels', 'Basic monitoring', 'Email support']
        },
        'prod_TlCZGV0R8q7gd4': { 
          name: 'professional', 
          features: ['25 vessels', 'Full monitoring', 'AI assistant', 'Priority support']
        },
        'prod_Tj7IL3o2MMqFUv': { 
          name: 'starter', 
          features: ['5 vessels', 'Basic monitoring', 'Email support']
        },
        'prod_Tj7J2F7AKu9anZ': { 
          name: 'professional', 
          features: ['25 vessels', 'Full monitoring', 'AI assistant', 'Priority support']
        },
        'prod_Tj7LaAvHIWE95C': { 
          name: 'enterprise', 
          features: ['Unlimited vessels', 'Custom AI', 'Dedicated support', 'On-premise option']
        },
      };
      const config = productConfig[productId];
      planName = config?.name || 'unknown';
      planFeatures = config?.features || [];
      logStep("Active subscription found", { planName, subscriptionEnd });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      plan_name: planName,
      plan_features: planFeatures,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
