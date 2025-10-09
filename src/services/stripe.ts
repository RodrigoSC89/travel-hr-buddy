/**
 * Stripe API Service
 * Provides payment processing
 */

export interface StripeTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Stripe API connection
 */
export async function testStripe(): Promise<StripeTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
    
    if (!apiKey && !secretKey) {
      return {
        success: false,
        error: 'Stripe API key not configured'
      };
    }

    // For publishable key, we can only validate format
    if (apiKey && !secretKey) {
      return {
        success: true,
        message: 'Stripe publishable key is configured (client-side only)',
        data: {
          keyType: 'publishable',
          testMode: apiKey.startsWith('pk_test_')
        }
      };
    }

    // Test with secret key if available
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Stripe API is working correctly',
      data: {
        currency: data.available?.[0]?.currency || 'N/A',
        available: data.available?.[0]?.amount || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get Stripe API status
 */
export function getStripeStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_SECRET_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
