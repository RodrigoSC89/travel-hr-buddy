import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTierById, PricingTier } from '@/lib/billing/pricing-tiers';
import { toast } from 'sonner';

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  planName: string | null;
  currentTier: PricingTier | null;
  subscriptionEnd: string | null;
  error: string | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isSubscribed: false,
    planName: null,
    currentTier: null,
    subscriptionEnd: null,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({
          isLoading: false,
          isSubscribed: false,
          planName: null,
          currentTier: null,
          subscriptionEnd: null,
          error: null,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      const tier = data.plan_name ? getTierById(data.plan_name) : null;

      setState({
        isLoading: false,
        isSubscribed: data.subscribed,
        planName: data.plan_name,
        currentTier: tier ?? null,
        subscriptionEnd: data.subscription_end,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const createCheckout = useCallback(async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout';
      toast.error(message);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open portal';
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // Refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
