/**
 * API Authentication Middleware
 * 
 * Provides authentication and authorization utilities for API routes.
 * Use this to protect API endpoints and verify user permissions.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
}

export type UserRole = 'admin' | 'manager' | 'user' | 'readonly';

/**
 * Extract and validate JWT token from Authorization header
 */
export async function authenticateRequest(req: NextApiRequest): Promise<{
  user?: { id: string; email?: string };
  error?: string;
}> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { error: "Não autenticado. Token de autorização ausente." };
  }

  const token = authHeader.replace("Bearer ", "");
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: "Não autenticado. Token inválido ou expirado." };
  }

  return { user: { id: user.id, email: user.email } };
}

/**
 * Get user profile and role from database
 */
export async function getUserProfile(userId: string): Promise<{
  profile?: { id: string; role: string; [key: string]: any };
  error?: string;
}> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return { error: "Perfil de usuário não encontrado." };
  }

  return { profile };
}

/**
 * Verify user has required role
 */
export function hasRequiredRole(userRole: string, requiredRole: UserRole | UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    readonly: 0,
    user: 1,
    manager: 2,
    admin: 3,
  };

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userLevel = roleHierarchy[userRole as UserRole] ?? -1;

  return roles.some(role => {
    const requiredLevel = roleHierarchy[role];
    return userLevel >= requiredLevel;
  });
}

/**
 * Middleware wrapper for API routes requiring authentication
 * 
 * @example
 * export default withAuth(async (req, res) => {
 *   // req.user is available here
 *   res.json({ userId: req.user.id });
 * });
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(req);
    
    if (authError || !user) {
      return res.status(401).json({ error: authError || "Não autenticado." });
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    // Call the actual handler
    return handler(req as AuthenticatedRequest, res);
  };
}

/**
 * Middleware wrapper for API routes requiring specific role
 * 
 * @example
 * export default withRole('admin', async (req, res) => {
 *   // Only admins can access this
 *   res.json({ data: sensitiveData });
 * });
 */
export function withRole(
  requiredRole: UserRole | UserRole[],
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(req);
    
    if (authError || !user) {
      return res.status(401).json({ error: authError || "Não autenticado." });
    }

    // Get user profile and role
    const { profile, error: profileError } = await getUserProfile(user.id);
    
    if (profileError || !profile) {
      return res.status(403).json({ error: profileError || "Perfil não encontrado." });
    }

    // Check role permission
    if (!hasRequiredRole(profile.role, requiredRole)) {
      return res.status(403).json({ 
        error: "Acesso negado. Permissão insuficiente.",
        required: Array.isArray(requiredRole) ? requiredRole : [requiredRole],
        current: profile.role,
      });
    }

    // Attach user with role to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: profile.role,
    };

    // Call the actual handler
    return handler(req as AuthenticatedRequest, res);
  };
}

/**
 * Combined authentication and authorization check
 * 
 * @example
 * const authResult = await requireAuth(req, 'admin');
 * if (!authResult.authorized) {
 *   return res.status(authResult.status).json({ error: authResult.error });
 * }
 */
export async function requireAuth(
  req: NextApiRequest,
  requiredRole?: UserRole | UserRole[]
): Promise<{
  authorized: boolean;
  status: number;
  error?: string;
  user?: { id: string; email?: string; role?: string };
}> {
  // Authenticate user
  const { user, error: authError } = await authenticateRequest(req);
  
  if (authError || !user) {
    return {
      authorized: false,
      status: 401,
      error: authError || "Não autenticado.",
    };
  }

  // If no role required, authentication is enough
  if (!requiredRole) {
    return {
      authorized: true,
      status: 200,
      user,
    };
  }

  // Get user profile and check role
  const { profile, error: profileError } = await getUserProfile(user.id);
  
  if (profileError || !profile) {
    return {
      authorized: false,
      status: 403,
      error: profileError || "Perfil não encontrado.",
    };
  }

  // Check role permission
  if (!hasRequiredRole(profile.role, requiredRole)) {
    return {
      authorized: false,
      status: 403,
      error: "Acesso negado. Permissão insuficiente.",
      user: { ...user, role: profile.role },
    };
  }

  return {
    authorized: true,
    status: 200,
    user: { ...user, role: profile.role },
  };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, consider using Redis or Vercel rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (record && record.resetAt < now) {
    rateLimitStore.delete(identifier);
  }

  const current = rateLimitStore.get(identifier) || {
    count: 0,
    resetAt: now + windowMs,
  };

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetAt: current.resetAt,
  };
}
