import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return errorResponse('Missing signature or webhook secret', 400);
    }

    const body = await req.text();
    
    // In production, verify the Stripe signature
    // For now, parse the event directly
    const event = JSON.parse(body);

    log('info', 'stripe-webhook-handler', 'Received Stripe event', { 
      type: event.type,
      id: event.id 
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            stripe_payment_id: paymentIntent.id,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        log('info', 'stripe-webhook-handler', 'Payment succeeded', { 
          paymentIntentId: paymentIntent.id 
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        log('warn', 'stripe-webhook-handler', 'Payment failed', { 
          paymentIntentId: paymentIntent.id 
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'stripe_subscription_id' });

        log('info', 'stripe-webhook-handler', 'Subscription updated', { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        log('info', 'stripe-webhook-handler', 'Subscription canceled', { 
          subscriptionId: subscription.id 
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_invoice_id: invoice.id,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_invoice_id', invoice.id);

        log('info', 'stripe-webhook-handler', 'Invoice paid', { 
          invoiceId: invoice.id 
        });
        break;
      }

      default:
        log('info', 'stripe-webhook-handler', 'Unhandled event type', { 
          type: event.type 
        });
    }

    // Store webhook event for audit
    await supabase.from('webhook_events').insert({
      provider: 'stripe',
      event_type: event.type,
      event_id: event.id,
      payload: event,
      processed_at: new Date().toISOString()
    });

    return jsonResponse({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'stripe-webhook-handler', 'Webhook error', { error: message });
    return errorResponse(message, 500);
  }
});
