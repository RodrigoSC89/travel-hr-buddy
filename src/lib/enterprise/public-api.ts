/**
 * Public API Management
 * NAUTI ONE v4.0 - Phase 12: Enterprise Features
 * 
 * REST API for external integrations
 * Rate Limited: 1000 req/hour (standard), 10000 req/hour (enterprise)
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// API Key Management
export interface APIKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string; // First 8 chars for identification
  key_hash: string;
  
  permissions: APIPermission[];
  
  rate_limit: {
    requests_per_hour: number;
    requests_per_minute: number;
  };
  
  ip_whitelist?: string[];
  
  created_by: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  
  is_active: boolean;
}

export type APIPermission = 
  | 'crew:read'
  | 'crew:write'
  | 'vessels:read'
  | 'vessels:write'
  | 'documents:read'
  | 'documents:write'
  | 'voyages:read'
  | 'voyages:write'
  | 'compliance:read'
  | 'analytics:read'
  | 'webhooks:manage';

export interface APIUsageStats {
  api_key_id: string;
  period: 'hour' | 'day' | 'week' | 'month';
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  endpoints_used: Record<string, number>;
  avg_response_time_ms: number;
}

// API Endpoints Documentation
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  required_permissions: APIPermission[];
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    location: 'path' | 'query' | 'body';
  }>;
  response_schema?: Record<string, unknown>;
  example_request?: string;
  example_response?: string;
}

// Available API Endpoints
export const API_ENDPOINTS: APIEndpoint[] = [
  // Crew Management
  {
    method: 'GET',
    path: '/api/v1/crew',
    description: 'List all crew members',
    required_permissions: ['crew:read'],
    parameters: [
      { name: 'vessel_id', type: 'uuid', required: false, description: 'Filter by vessel', location: 'query' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status (active, on_leave, etc)', location: 'query' },
      { name: 'limit', type: 'number', required: false, description: 'Max results (default: 50)', location: 'query' },
      { name: 'offset', type: 'number', required: false, description: 'Pagination offset', location: 'query' }
    ],
    example_response: `{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "position": "Chief Engineer",
      "vessel_id": "uuid",
      "status": "active",
      "certifications": [...]
    }
  ],
  "pagination": { "total": 150, "limit": 50, "offset": 0 }
}`
  },
  {
    method: 'GET',
    path: '/api/v1/crew/:id',
    description: 'Get crew member details',
    required_permissions: ['crew:read'],
    parameters: [
      { name: 'id', type: 'uuid', required: true, description: 'Crew member ID', location: 'path' }
    ]
  },
  {
    method: 'POST',
    path: '/api/v1/crew',
    description: 'Create new crew member',
    required_permissions: ['crew:write'],
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Full name', location: 'body' },
      { name: 'position', type: 'string', required: true, description: 'Job position', location: 'body' },
      { name: 'email', type: 'string', required: true, description: 'Email address', location: 'body' },
      { name: 'vessel_id', type: 'uuid', required: false, description: 'Assigned vessel', location: 'body' }
    ]
  },
  
  // Vessels
  {
    method: 'GET',
    path: '/api/v1/vessels',
    description: 'List all vessels',
    required_permissions: ['vessels:read'],
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter by status', location: 'query' },
      { name: 'type', type: 'string', required: false, description: 'Filter by vessel type', location: 'query' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/vessels/:id',
    description: 'Get vessel details',
    required_permissions: ['vessels:read'],
    parameters: [
      { name: 'id', type: 'uuid', required: true, description: 'Vessel ID', location: 'path' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/vessels/:id/crew',
    description: 'Get vessel crew list',
    required_permissions: ['vessels:read', 'crew:read'],
    parameters: [
      { name: 'id', type: 'uuid', required: true, description: 'Vessel ID', location: 'path' }
    ]
  },
  
  // Documents
  {
    method: 'GET',
    path: '/api/v1/documents',
    description: 'List documents',
    required_permissions: ['documents:read'],
    parameters: [
      { name: 'crew_id', type: 'uuid', required: false, description: 'Filter by crew member', location: 'query' },
      { name: 'vessel_id', type: 'uuid', required: false, description: 'Filter by vessel', location: 'query' },
      { name: 'type', type: 'string', required: false, description: 'Document type', location: 'query' },
      { name: 'expiring_within_days', type: 'number', required: false, description: 'Documents expiring within N days', location: 'query' }
    ]
  },
  
  // Voyages
  {
    method: 'GET',
    path: '/api/v1/voyages',
    description: 'List voyages',
    required_permissions: ['voyages:read'],
    parameters: [
      { name: 'vessel_id', type: 'uuid', required: false, description: 'Filter by vessel', location: 'query' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status', location: 'query' },
      { name: 'from_date', type: 'date', required: false, description: 'Start date filter', location: 'query' },
      { name: 'to_date', type: 'date', required: false, description: 'End date filter', location: 'query' }
    ]
  },
  
  // Compliance
  {
    method: 'GET',
    path: '/api/v1/compliance/summary',
    description: 'Get compliance summary',
    required_permissions: ['compliance:read'],
    parameters: [
      { name: 'vessel_id', type: 'uuid', required: false, description: 'Filter by vessel', location: 'query' }
    ],
    example_response: `{
  "overall_score": 94.5,
  "certificates_valid": 245,
  "certificates_expiring_30d": 12,
  "certificates_expired": 2,
  "training_compliance": 96.2,
  "mlc_compliance": 98.1
}`
  },
  
  // Analytics
  {
    method: 'GET',
    path: '/api/v1/analytics/kpis',
    description: 'Get key performance indicators',
    required_permissions: ['analytics:read'],
    parameters: [
      { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d, 1y)', location: 'query' }
    ]
  },
  
  // Webhooks
  {
    method: 'POST',
    path: '/api/v1/webhooks',
    description: 'Register a webhook',
    required_permissions: ['webhooks:manage'],
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'Webhook URL', location: 'body' },
      { name: 'events', type: 'string[]', required: true, description: 'Events to subscribe to', location: 'body' },
      { name: 'secret', type: 'string', required: false, description: 'Webhook signing secret', location: 'body' }
    ]
  }
];

/**
 * Generate new API key
 */
export async function generateAPIKey(
  organizationId: string,
  options: {
    name: string;
    permissions: APIPermission[];
    expiresInDays?: number;
    ipWhitelist?: string[];
  }
): Promise<{ key: string; keyId: string } | null> {
  try {
    // Generate secure random key
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = `nauti_${btoa(String.fromCharCode(...keyBytes)).replace(/[+/=]/g, '')}`;
    const keyPrefix = key.substring(0, 14);
    
    // Hash the key for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // In production, store in database
    const keyId = crypto.randomUUID();
    
    logger.debug('[API] Generated new key:', { keyId, keyPrefix, permissions: options.permissions });
    
    return { key, keyId };
  } catch (error) {
    logger.error('[API] Key generation failed:', error);
    return null;
  }
}

/**
 * Validate API key
 */
export async function validateAPIKey(key: string): Promise<{
  valid: boolean;
  apiKey?: APIKey;
  error?: string;
}> {
  if (!key.startsWith('nauti_')) {
    return { valid: false, error: 'Invalid key format' };
  }
  
  // Hash the provided key
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // In production, lookup in database by hash
  // For demo, always return valid
  return {
    valid: true,
    apiKey: {
      id: crypto.randomUUID(),
      organization_id: crypto.randomUUID(),
      name: 'Demo Key',
      key_prefix: key.substring(0, 14),
      key_hash: keyHash,
      permissions: ['crew:read', 'vessels:read'],
      rate_limit: { requests_per_hour: 1000, requests_per_minute: 60 },
      created_by: 'system',
      created_at: new Date().toISOString(),
      is_active: true
    }
  };
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(keyId: string): Promise<boolean> {
  try {
    // In production, update database to set is_active = false
    logger.debug('[API] Revoked key:', keyId);
    return true;
  } catch (error) {
    logger.error('[API] Key revocation failed:', error);
    return false;
  }
}

/**
 * Get API usage statistics
 */
export async function getAPIUsageStats(
  organizationId: string,
  period: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<APIUsageStats[]> {
  // In production, query from api_usage_logs table
  return [];
}

/**
 * Get OpenAPI specification
 */
export function getOpenAPISpec(): object {
  return {
    openapi: '3.0.0',
    info: {
      title: 'NAUTI ONE Public API',
      version: '1.0.0',
      description: 'REST API for Maritime HR Management integrations'
    },
    servers: [
      {
        url: 'https://api.nautione.com.br',
        description: 'Production'
      }
    ],
    security: [
      { ApiKeyAuth: [] }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    paths: API_ENDPOINTS.reduce((acc, endpoint) => {
      const pathKey = endpoint.path.replace(/:(\w+)/g, '{$1}');
      if (!acc[pathKey]) acc[pathKey] = {};
      
      acc[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        security: [{ ApiKeyAuth: [] }],
        parameters: endpoint.parameters?.filter(p => p.location !== 'body').map(p => ({
          name: p.name,
          in: p.location,
          required: p.required,
          schema: { type: p.type },
          description: p.description
        })),
        responses: {
          '200': { description: 'Success' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '429': { description: 'Rate limit exceeded' }
        }
      };
      
      return acc;
    }, {} as Record<string, Record<string, unknown>>)
  };
}

/**
 * Generate API documentation HTML
 */
export function generateAPIDocumentation(): string {
  const endpoints = API_ENDPOINTS.map(e => `
### ${e.method} ${e.path}

${e.description}

**Required Permissions:** ${e.required_permissions.join(', ')}

${e.parameters ? `**Parameters:**
${e.parameters.map(p => `- \`${p.name}\` (${p.type}, ${p.required ? 'required' : 'optional'}): ${p.description}`).join('\n')}` : ''}

${e.example_response ? `**Example Response:**
\`\`\`json
${e.example_response}
\`\`\`` : ''}
  `).join('\n---\n');
  
  return `# NAUTI ONE Public API

## Authentication

All API requests require an API key in the \`X-API-Key\` header.

\`\`\`bash
curl -H "X-API-Key: nauti_your_key_here" https://api.nautione.com.br/api/v1/crew
\`\`\`

## Rate Limits

- Standard: 1,000 requests/hour
- Enterprise: 10,000 requests/hour

## Endpoints

${endpoints}
`;
}

export default {
  generateAPIKey,
  validateAPIKey,
  revokeAPIKey,
  getAPIUsageStats,
  getOpenAPISpec,
  generateAPIDocumentation,
  API_ENDPOINTS
};
