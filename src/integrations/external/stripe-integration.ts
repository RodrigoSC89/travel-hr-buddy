/**
 * Stripe Integration Service
 * Handles payments, subscriptions, and billing operations
 */
import { supabase } from "@/integrations/supabase/client";

export interface StripeCheckoutOptions {
  priceId: string;
  quantity?: number;
  mode?: "payment" | "subscription";
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCustomerPortalOptions {
  returnUrl?: string;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  productId?: string;
  subscriptionEnd?: string;
  plan?: string;
}

export class StripeIntegration {
  /**
   * Create a checkout session for one-time payment or subscription
   */
  static async createCheckout(options: StripeCheckoutOptions): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId: options.priceId,
        quantity: options.quantity || 1,
        mode: options.mode || "subscription",
        successUrl: options.successUrl || `${window.location.origin}/billing?success=true`,
        cancelUrl: options.cancelUrl || `${window.location.origin}/billing?canceled=true`,
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error("No checkout URL returned");

    return { url: data.url };
  }

  /**
   * Open Stripe Customer Portal for subscription management
   */
  static async openCustomerPortal(options?: StripeCustomerPortalOptions): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke("customer-portal", {
      body: {
        returnUrl: options?.returnUrl || `${window.location.origin}/billing`,
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error("No portal URL returned");

    return { url: data.url };
  }

  /**
   * Check user's subscription status
   */
  static async checkSubscription(): Promise<SubscriptionStatus> {
    const { data, error } = await supabase.functions.invoke("check-subscription");

    if (error) {
      console.error("Error checking subscription:", error);
      return { subscribed: false };
    }

    return {
      subscribed: data?.subscribed || false,
      productId: data?.product_id,
      subscriptionEnd: data?.subscription_end,
      plan: data?.plan,
    };
  }

  /**
   * Redirect to checkout
   */
  static async redirectToCheckout(options: StripeCheckoutOptions): Promise<void> {
    const { url } = await this.createCheckout(options);
    window.open(url, "_blank");
  }

  /**
   * Redirect to customer portal
   */
  static async redirectToCustomerPortal(options?: StripeCustomerPortalOptions): Promise<void> {
    const { url } = await this.openCustomerPortal(options);
    window.open(url, "_blank");
  }
}

// Convenience functions
export const createStripeCheckout = StripeIntegration.createCheckout.bind(StripeIntegration);
export const openStripePortal = StripeIntegration.openCustomerPortal.bind(StripeIntegration);
export const checkStripeSubscription = StripeIntegration.checkSubscription.bind(StripeIntegration);
