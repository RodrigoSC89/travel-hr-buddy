/**
 * EXAMPLE: Protected API Route
 * 
 * This file demonstrates best practices for creating secure API routes
 * in Nautilus One. Use this as a template for new API endpoints.
 * 
 * Key Features:
 * - Authentication via middleware
 * - Role-based authorization
 * - Input validation
 * - Error handling
 * - Rate limiting
 * - Proper logging
 * 
 * @see docs/internal/API.md for complete API documentation
 * @see docs/internal/SECURITY.md for security guidelines
 */

import { NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { withRole, AuthenticatedRequest, rateLimit } from "@/lib/api-auth-middleware";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Input validation schema using Zod
const QuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  offset: z.string().regex(/^\d+$/).transform(Number).optional().default("0"),
  filter: z.enum(["all", "active", "archived"]).optional().default("all"),
});

/**
 * GET /api/example-protected-route
 * 
 * Example endpoint that demonstrates security best practices.
 * 
 * Query Parameters:
 * - limit: Number of results to return (default: 10, max: 100)
 * - offset: Pagination offset (default: 0)
 * - filter: Filter results by status (all|active|archived, default: all)
 * 
 * Authorization: Requires 'user' role or higher (user, manager, admin)
 * 
 * Rate Limit: 100 requests per minute per user
 * 
 * @example
 * GET /api/example-protected-route?limit=20&filter=active
 * 
 * Response 200:
 * {
 *   "data": [...],
 *   "pagination": {
 *     "limit": 20,
 *     "offset": 0,
 *     "total": 150
 *   }
 * }
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  // 1. Method validation
  if (req.method !== "GET") {
    return res.status(405).json({ 
      error: "Método não permitido.",
      allowed: ["GET"]
    });
  }

  try {
    // 2. Rate limiting
    const rateLimitResult = rateLimit(
      `api-example-${req.user.id}`,
      100, // max requests
      60000 // per minute
    );

    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        error: "Too many requests",
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.setHeader('X-RateLimit-Reset', rateLimitResult.resetAt.toString());

    // 3. Input validation
    const validationResult = QuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid query parameters",
        details: validationResult.error.errors
      });
    }

    const { limit, offset, filter } = validationResult.data;

    // Enforce maximum limit
    const safeLimit = Math.min(limit, 100);

    // 4. Build query with RLS (Row-Level Security)
    // RLS policies automatically filter results based on user permissions
    let query = supabase
      .from("documents") // Example table with RLS enabled
      .select("*", { count: "exact" });

    // Apply filters
    if (filter === "active") {
      query = query.is("deleted_at", null);
    } else if (filter === "archived") {
      query = query.not("deleted_at", "is", null);
    }

    // Apply pagination
    query = query
      .range(offset, offset + safeLimit - 1)
      .order("created_at", { ascending: false });

    // 5. Execute query
    const { data, error, count } = await query;

    if (error) {
      // Log error for monitoring (Sentry will capture this)
      throw new Error(`Database query failed: ${error.message}`);
    }

    // 6. Return successful response
    return res.status(200).json({
      data,
      pagination: {
        limit: safeLimit,
        offset,
        total: count || 0,
        hasMore: count ? offset + safeLimit < count : false,
      },
      meta: {
        user_id: req.user.id,
        user_role: req.user.role,
        filter,
      }
    });

  } catch (error) {
    // 7. Error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // In production, don't expose internal error details
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return res.status(500).json({ 
      error: "Erro interno do servidor.",
      ...(isDevelopment && { details: errorMessage })
    });
  }
}

// Export handler with role-based authorization
// This endpoint requires 'user' role or higher (user, manager, admin)
export default withRole(['user', 'manager', 'admin'], handler);

/**
 * Alternative: If you only need authentication (no specific role required)
 * 
 * import { withAuth } from "@/lib/api-auth-middleware";
 * export default withAuth(handler);
 */

/**
 * Alternative: Manual authentication check for more control
 * 
 * import { requireAuth } from "@/lib/api-auth-middleware";
 * 
 * async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const authResult = await requireAuth(req, 'admin');
 *   if (!authResult.authorized) {
 *     return res.status(authResult.status).json({ error: authResult.error });
 *   }
 *   
 *   // Your logic here
 * }
 * 
 * export default handler;
 */
