/**
 * Webhook Signature Validation
 * HMAC-SHA256 signature verification for webhooks (Stripe, Slack, Discord, etc.)
 */

import { logger } from "@/lib/logger";

export interface WebhookSignatureConfig {
  secret: string;
  header: string;
  algorithm?: 'sha256' | 'sha1';
  timestampHeader?: string;
  timestampTolerance?: number; // seconds
  prefix?: string; // e.g., 'sha256=' for GitHub
}

export interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
  timestamp?: number;
}

// Pre-configured providers
export const WEBHOOK_PROVIDERS = {
  stripe: {
    header: 'stripe-signature',
    algorithm: 'sha256' as const,
    timestampHeader: 't',
    timestampTolerance: 300,
    prefix: '',
  },
  github: {
    header: 'x-hub-signature-256',
    algorithm: 'sha256' as const,
    prefix: 'sha256=',
  },
  slack: {
    header: 'x-slack-signature',
    algorithm: 'sha256' as const,
    timestampHeader: 'x-slack-request-timestamp',
    timestampTolerance: 300,
    prefix: 'v0=',
  },
  discord: {
    header: 'x-signature-ed25519',
    algorithm: 'sha256' as const,
  },
  generic: {
    header: 'x-webhook-signature',
    algorithm: 'sha256' as const,
    prefix: '',
  },
} as const;

/**
 * Generate HMAC signature for outgoing webhooks
 */
export async function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  config: Partial<WebhookSignatureConfig> = {}
): Promise<SignatureVerificationResult> {
  try {
    const algorithm = config.algorithm || 'sha256';
    const prefix = config.prefix || '';
    
    // Remove prefix if present
    const cleanSignature = signature.startsWith(prefix) 
      ? signature.slice(prefix.length) 
      : signature;
    
    // Generate expected signature
    const expectedSignature = await generateWebhookSignature(payload, secret, algorithm);
    
    // Timing-safe comparison
    if (!timingSafeEqual(cleanSignature, expectedSignature)) {
      logger.warn('[WebhookSignature] Invalid signature detected', {
        receivedLength: cleanSignature.length,
        expectedLength: expectedSignature.length,
      });
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[WebhookSignature] Verification error:', { message });
    return { valid: false, error: message };
  }
}

/**
 * Verify Stripe webhook signature
 */
export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): Promise<SignatureVerificationResult> {
  try {
    // Parse Stripe signature header: t=timestamp,v1=signature
    const parts = signatureHeader.split(',');
    const parsed: Record<string, string> = {};
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) parsed[key] = value;
    }
    
    const timestamp = parseInt(parsed['t'] || '0', 10);
    const signature = parsed['v1'];
    
    if (!timestamp || !signature) {
      return { valid: false, error: 'Invalid Stripe signature format' };
    }
    
    // Check timestamp (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: 'Timestamp too old' };
    }
    
    // Stripe signs: timestamp.payload
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = await generateWebhookSignature(signedPayload, secret, 'sha256');
    
    if (!timingSafeEqual(signature, expectedSignature)) {
      return { valid: false, error: 'Invalid signature', timestamp };
    }
    
    return { valid: true, timestamp };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: message };
  }
}

/**
 * Verify Slack webhook signature
 */
export async function verifySlackSignature(
  payload: string,
  signatureHeader: string,
  timestampHeader: string,
  secret: string
): Promise<SignatureVerificationResult> {
  try {
    const timestamp = parseInt(timestampHeader, 10);
    
    // Check timestamp (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: 'Request timestamp too old' };
    }
    
    // Slack signs: v0:timestamp:payload
    const sigBasestring = `v0:${timestamp}:${payload}`;
    const expectedSignature = await generateWebhookSignature(sigBasestring, secret, 'sha256');
    
    // Remove 'v0=' prefix
    const cleanSignature = signatureHeader.replace(/^v0=/, '');
    
    if (!timingSafeEqual(cleanSignature, expectedSignature)) {
      return { valid: false, error: 'Invalid signature', timestamp };
    }
    
    return { valid: true, timestamp };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: message };
  }
}

/**
 * Verify GitHub webhook signature
 */
export async function verifyGitHubSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): Promise<SignatureVerificationResult> {
  try {
    // Remove 'sha256=' prefix
    const signature = signatureHeader.replace(/^sha256=/, '');
    const expectedSignature = await generateWebhookSignature(payload, secret, 'sha256');
    
    if (!timingSafeEqual(signature, expectedSignature)) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: message };
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Create signature headers for outgoing webhooks
 */
export async function createWebhookHeaders(
  payload: string,
  secret: string,
  provider: keyof typeof WEBHOOK_PROVIDERS = 'generic'
): Promise<Record<string, string>> {
  const config = WEBHOOK_PROVIDERS[provider];
  const timestamp = Math.floor(Date.now() / 1000);
  
  let signedPayload = payload;
  let signature: string;
  
  switch (provider) {
    case 'stripe':
      signedPayload = `${timestamp}.${payload}`;
      signature = await generateWebhookSignature(signedPayload, secret);
      return {
        'stripe-signature': `t=${timestamp},v1=${signature}`,
      };
      
    case 'slack':
      signedPayload = `v0:${timestamp}:${payload}`;
      signature = await generateWebhookSignature(signedPayload, secret);
      return {
        'x-slack-signature': `v0=${signature}`,
        'x-slack-request-timestamp': String(timestamp),
      };
      
    case 'github':
      signature = await generateWebhookSignature(payload, secret);
      return {
        'x-hub-signature-256': `sha256=${signature}`,
      };
      
    default:
      signature = await generateWebhookSignature(payload, secret);
      return {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': String(timestamp),
      };
  }
}

/**
 * Middleware-style signature verifier
 */
export function createSignatureVerifier(
  secret: string,
  provider: keyof typeof WEBHOOK_PROVIDERS = 'generic'
) {
  return async (
    payload: string,
    headers: Record<string, string>
  ): Promise<SignatureVerificationResult> => {
    const config = WEBHOOK_PROVIDERS[provider];
    const signatureHeader = headers[config.header] || headers[config.header.toLowerCase()];
    
    if (!signatureHeader) {
      return { valid: false, error: `Missing ${config.header} header` };
    }
    
    switch (provider) {
      case 'stripe':
        return verifyStripeSignature(payload, signatureHeader, secret);
        
      case 'slack': {
        const timestampHeader = headers['x-slack-request-timestamp'] || '';
        return verifySlackSignature(payload, signatureHeader, timestampHeader, secret);
      }
        
      case 'github':
        return verifyGitHubSignature(payload, signatureHeader, secret);
        
      default:
        return verifyWebhookSignature(payload, signatureHeader, secret, config);
    }
  };
}


