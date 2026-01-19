/**
 * Authentication utilities for Edge Functions
 * @module _shared/auth
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Use ReturnType for proper typing
type SupabaseClientType = ReturnType<typeof createClient>;

// Type definitions for Supabase
interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
}

export interface AuthResult {
  user: User | null;
  error: string | null;
  organizationId?: string;
  role?: string;
}

/**
 * Verify JWT and get user from Authorization header
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }

  // Get user organization and role
  const { data: orgUser } = await getServiceClient()
    .from('organization_users')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return {
    user,
    error: null,
    organizationId: orgUser?.organization_id,
    role: orgUser?.role,
  };
}

/**
 * Get Supabase service client (admin privileges)
 */
export function getServiceClient(): SupabaseClientType {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

/**
 * Get Supabase client with user context
 */
export function getUserClient(token: string): SupabaseClientType {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: string | undefined): boolean {
  return hasRole(role, ['admin', 'super_admin']);
}

/**
 * Check if user can manage resources
 */
export function canManage(role: string | undefined): boolean {
  return hasRole(role, ['admin', 'super_admin', 'manager', 'hr_manager']);
}

/**
 * Validate API key for external integrations
 */
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; organizationId?: string }> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, organization_id, is_active, expires_at')
    .eq('key_hash', await hashApiKey(apiKey))
    .single();

  if (error || !data || !data.is_active) {
    return { valid: false };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return { valid: true, organizationId: data.organization_id };
}

/**
 * Hash API key for storage/comparison
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
