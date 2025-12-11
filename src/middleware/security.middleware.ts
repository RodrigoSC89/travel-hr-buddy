/**
 * Security Middleware
 * 
 * Aplica automaticamente todas as proteções de segurança:
 * - Security headers
 * - Rate limiting
 * - Input validation
 * - CORS
 * - Request logging
 * 
 * Compatible with both Next.js and standalone environments
 */

// @ts-ignore - Next.js types optional
type NextRequest = any;
type NextResponse = any;

import { SECURITY_HEADERS, RATE_LIMITS, CORS_CONFIG, isAllowedOrigin, logSecurityEvent } from '@/lib/security';

// Rate limit store (em produção, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Função para limpar rate limit expirados (executar periodicamente)
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Executar limpeza a cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Verifica rate limit para um IP/endpoint
 */
function checkRateLimit(ip: string, endpoint: string): { allowed: boolean; remaining: number; resetAt: number } {
  // Determinar qual configuração de rate limit usar
  let config = RATE_LIMITS.api;
  
  if (endpoint.includes('/auth/')) {
    config = RATE_LIMITS.auth;
  } else if (endpoint.includes('/ai/') || endpoint.includes('/generate-')) {
    config = RATE_LIMITS.ai;
  } else if (endpoint.includes('/upload/')) {
    config = RATE_LIMITS.upload;
  }

  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Se não existe ou expirou, criar nova entrada
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Incrementar contador
  entry.count++;
  
  // Verificar se excedeu o limite
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Extrai IP do request
 */
function getClientIP(request: NextRequest): string {
  // Tentar vários headers (para suporte a proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback para IP direto (desenvolvimento)
  return '127.0.0.1';
}

/**
 * Valida origem CORS
 */
function handleCORS(request: NextRequest): Response | null {
  const origin = request.headers.get('origin');
  const ip = getClientIP(request);
  
  // Se não tem origin header, permitir (requests do mesmo domínio)
  if (!origin) {
    return null;
  }
  
  // Verificar se origem é permitida
  if (!isAllowedOrigin(origin)) {
    // Log security event
    logSecurityEvent({
      type: 'VALIDATION_ERROR',
      severity: 'medium',
      ip_address: ip,
      details: {
        origin,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        reason: 'CORS_VIOLATION'
      },
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    }).catch(console.error);
    
    return new Response(
      JSON.stringify({ error: 'CORS policy violation' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return null;
}

/**
 * Detecta padrões suspeitos no request
 */
function detectSuspiciousPatterns(request: NextRequest): { suspicious: boolean; reason?: string } {
  const url = request.nextUrl.toString();
  const body = request.body?.toString() || '';
  
  // SQL Injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b.*\b(FROM|INTO|WHERE|TABLE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /('|(\\')|(;))/,
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      return { suspicious: true, reason: 'SQL_INJECTION_PATTERN' };
    }
  }
  
  // XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      return { suspicious: true, reason: 'XSS_PATTERN' };
    }
  }
  
  // Path traversal
  if (/\.\.[\/\\]/.test(url)) {
    return { suspicious: true, reason: 'PATH_TRAVERSAL' };
  }
  
  return { suspicious: false };
}

/**
 * Middleware principal de segurança
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const endpoint = request.nextUrl.pathname;
  const method = request.method;
  
  try {
    // 1. CORS validation
    const corsError = handleCORS(request);
    if (corsError) {
      return corsError;
    }
    
    // 2. Detectar padrões suspeitos
    const suspiciousCheck = detectSuspiciousPatterns(request);
    if (suspiciousCheck.suspicious) {
      // Log security event
      await logSecurityEvent({
        type: suspiciousCheck.reason === 'SQL_INJECTION_PATTERN' ? 'SQL_INJECTION_ATTEMPT' : 'XSS_ATTEMPT',
        severity: 'critical',
        ip_address: ip,
        details: {
          ip,
          endpoint,
          method,
          reason: suspiciousCheck.reason,
          url: request.nextUrl.toString(),
        },
        timestamp: new Date().toISOString(),
      });
      
      return new Response(
        JSON.stringify({ error: 'Request blocked for security reasons' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // 3. Rate limiting
    const rateLimit = checkRateLimit(ip, endpoint);
    
    if (!rateLimit.allowed) {
      // Log rate limit violation
      await logSecurityEvent({
        type: 'RATE_LIMIT',
        severity: 'medium',
        ip_address: ip,
        details: {
          ip,
          endpoint,
          method,
          limit: 'exceeded',
        },
        timestamp: new Date().toISOString(),
      });
      
      const response = new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: new Date(rateLimit.resetAt).toISOString(),
        }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(RATE_LIMITS.api.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          }
        }
      );
      
      return response;
      response.headers.set('Retry-After', String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)));
      
      return response;
    }
    
    // 4. Continuar processamento normal
    const response = new Response(null, {
      status: 200,
      headers: new Headers()
    });
    
    // 5. Adicionar security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // 6. Adicionar CORS headers se origem permitida
    const origin = request.headers.get('origin');
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // 7. Adicionar rate limit headers
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMITS.api.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));
    
    // 8. Adicionar request ID para tracking
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    
    // 9. Log request (apenas para endpoints importantes)
    if (endpoint.startsWith('/api/') || endpoint.startsWith('/auth/')) {
      const duration = Date.now() - startTime;
      
      // Log apenas se demorar mais de 1 segundo ou for erro
      if (duration > 1000) {
      }
    }
    
    return response;
    
  } catch (error) {
    // Log error
    console.error('Security middleware error:', error);
    console.error('Security middleware error:', error);
    
    // Retornar erro genérico (não expor detalhes)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Edge function security wrapper
 * Use em todas as edge functions do Supabase
 */
export function withSecurity<T>(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      // 1. Parse URL e extrair IP
      const url = new URL(req.url);
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
      
      // 2. Aplicar security headers
      const headers = new Headers(SECURITY_HEADERS);
      headers.set('X-Request-ID', requestId);
      
      // 3. CORS
      const origin = req.headers.get('origin');
      if (origin && isAllowedOrigin(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
        headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
        headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      // 4. Handle OPTIONS (preflight)
      if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
      }
      
      // 5. Executar handler
      const response = await handler(req);
      
      // 6. Adicionar headers à response
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      response.headers.set('X-Request-ID', requestId);
      
      // 7. Log performance
      const duration = Date.now() - startTime;
      if (duration > 2000) {
      }
      
      return response;
      
    } catch (error) {
      console.error(`Error in edge function (${requestId}):`, error);
      console.error(`Error in edge function (${requestId}):`, error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          requestId,
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            ...SECURITY_HEADERS,
          },
        }
      );
    }
  };
}

/**
 * Validador de autenticação para edge functions
 */
export async function validateAuth(req: Request): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }
    
    const token = authHeader.substring(7);
    
    // TODO: Implementar validação real do token JWT
    // Por enquanto, apenas verificar se existe
    if (!token || token.length < 10) {
      return { valid: false, error: 'Invalid token' };
    }
    
    // Em produção, decodificar e validar o JWT aqui
    // const decoded = await verifyJWT(token);
    // return { valid: true, userId: decoded.sub };
    
    return { valid: true, userId: 'user-id-placeholder' };
    
  } catch (error) {
    console.error('Auth validation error:', error);
    console.error('Auth validation error:', error);
    return { valid: false, error: 'Authentication failed' };
  }
}
