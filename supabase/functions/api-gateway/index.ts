// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { buildSchema, graphql } from 'https://esm.sh/graphql@16.8.1';
import { typeDefs } from './graphql-schema.ts';
import { resolvers } from './graphql-resolvers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nautilus-token',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Build GraphQL schema
const schema = buildSchema(typeDefs);

// Rate limiting tracker
const rateLimitTracker = new Map<string, { count: number, resetAt: number }>();

function checkRateLimit(endpoint: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = endpoint;
  const tracker = rateLimitTracker.get(key);
  
  if (!tracker || now > tracker.resetAt) {
    rateLimitTracker.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (tracker.count >= maxRequests) {
    return false;
  }
  
  tracker.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get authentication token
    const nautilusToken = req.headers.get('x-nautilus-token');
    const authHeader = req.headers.get('authorization');
    
    if (!nautilusToken && !authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      user = authUser;
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/api-gateway', '');
    const method = req.method;

    // Check rate limit
    if (!checkRateLimit(path)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[API Gateway] ${method} ${path} - User: ${user?.id || 'service'}`);

    // Route to appropriate handler
    let response;
    
    // GraphQL endpoint
    if (path === '/graphql' && method === 'POST') {
      const body = await req.json();
      const { query, variables } = body;
      
      try {
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { user, supabase }
        });
        
        // Execute resolvers manually since buildSchema doesn't support them directly
        if (result.data) {
          const operationType = query.trim().startsWith('mutation') ? 'Mutation' : 'Query';
          const operationMatch = query.match(/(?:query|mutation)\s+\w+\s*{?\s*(\w+)/);
          const operationName = operationMatch ? operationMatch[1] : null;
          
          if (operationName && resolvers[operationType] && resolvers[operationType][operationName]) {
            try {
              const resolverResult = await resolvers[operationType][operationName](
                null,
                variables || {},
                { user, supabase }
              );
              result.data = { [operationName]: resolverResult };
            } catch (resolverError) {
              result.errors = result.errors || [];
              result.errors.push({ message: resolverError.message });
            }
          }
        }
        
        response = result;
      } catch (error) {
        response = {
          errors: [{ message: error.message }]
        };
      }
    }
    // GraphQL Playground (GET request)
    else if (path === '/graphql' && method === 'GET') {
      return new Response(getGraphQLPlaygroundHTML(), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }
    // REST endpoints
    else {
      switch (path) {
        case '/weather':
          response = await handleWeatherAPI(url.searchParams);
          break;
        case '/satellite':
          response = await handleSatelliteAPI(url.searchParams);
          break;
        case '/ais':
          response = await handleAISAPI(url.searchParams);
          break;
        case '/logistics':
          response = await handleLogisticsAPI(await req.json());
          break;
        
        // New REST endpoints for critical resources
        case '/documents':
          response = await handleDocumentsAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/checklists':
          response = await handleChecklistsAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/audits':
          response = await handleAuditsAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/vessels':
          response = await handleVesselsAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/forecasts':
          response = await handleForecastsAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/analytics':
          response = await handleAnalyticsAPI(supabase, url.searchParams);
          break;
        case '/templates':
          response = await handleTemplatesAPI(supabase, method, url.searchParams, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/users':
          response = await handleUsersAPI(supabase, method, url.searchParams, user);
          break;
        case '/api-keys':
          response = await handleAPIKeysAPI(supabase, method, method !== 'GET' ? await req.json() : null, user);
          break;
        case '/webhooks':
          response = await handleWebhooksAPI(supabase, method, method !== 'GET' ? await req.json() : null, user);
          break;
        
        case '/status':
          response = {
            status: 'online',
            version: '2.0.0',
            graphql: '/graphql',
            endpoints: {
              rest: [
                'weather', 'satellite', 'ais', 'logistics',
                'documents', 'checklists', 'audits', 'vessels',
                'forecasts', 'analytics', 'templates', 'users',
                'api-keys', 'webhooks'
              ],
              graphql: 'Available at /graphql'
            },
            rate_limiting: {
              enabled: true,
              default_limit: '100 requests/minute'
            }
          };
          break;
        
        default:
          response = {
            error: 'Endpoint not found',
            available_endpoints: {
              graphql: '/graphql (GET for playground, POST for queries)',
              rest: [
                '/weather', '/satellite', '/ais', '/logistics',
                '/documents', '/checklists', '/audits', '/vessels',
                '/forecasts', '/analytics', '/templates', '/users',
                '/api-keys', '/webhooks', '/status'
              ]
            }
          };
      }
    }

    // Log request to external_logs
    await logExternalRequest(supabase, {
      user_id: user?.id,
      endpoint: path,
      method,
      status: response.error ? 'error' : 'success',
      response_time: 0, // Could be calculated
      metadata: { query: Object.fromEntries(url.searchParams) }
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: response.error || response.errors ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API Gateway] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GraphQL Playground HTML
 */
function getGraphQLPlaygroundHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>API Gateway GraphQL Playground</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    #playground { height: 100vh; width: 100%; display: flex; flex-direction: column; }
    .header { background: #1a202c; color: white; padding: 1rem; font-size: 1.2rem; font-weight: bold; }
    .container { flex: 1; display: flex; }
    .query-panel, .result-panel { flex: 1; display: flex; flex-direction: column; }
    .query-panel { border-right: 1px solid #ddd; }
    .panel-header { background: #f7fafc; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
    textarea, pre { flex: 1; margin: 0; padding: 1rem; border: none; font-family: 'Courier New', monospace; font-size: 14px; }
    textarea { resize: none; background: #fafafa; }
    pre { background: #f8f9fa; overflow: auto; white-space: pre-wrap; }
    .controls { padding: 1rem; background: #fff; border-top: 1px solid #e2e8f0; }
    button { background: #3182ce; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 14px; }
    button:hover { background: #2c5aa0; }
    .examples { padding: 0.5rem 1rem; background: #edf2f7; border-top: 1px solid #e2e8f0; }
    .example-btn { background: #718096; margin-right: 0.5rem; margin-bottom: 0.5rem; padding: 0.25rem 0.75rem; font-size: 12px; }
  </style>
</head>
<body>
  <div id="playground">
    <div class="header">🚀 Nautilus One - GraphQL API Playground</div>
    <div class="container">
      <div class="query-panel">
        <div class="panel-header">Query</div>
        <textarea id="query" placeholder="Enter your GraphQL query here...">query {
  me {
    id
    email
    role
  }
  documents(limit: 5) {
    id
    title
    category
    created_at
  }
}</textarea>
        <div class="examples">
          <strong>Quick Examples:</strong><br>
          <button class="example-btn" onclick="loadExample(1)">Get Me</button>
          <button class="example-btn" onclick="loadExample(2)">List Documents</button>
          <button class="example-btn" onclick="loadExample(3)">Weather</button>
          <button class="example-btn" onclick="loadExample(4)">Create Document</button>
          <button class="example-btn" onclick="loadExample(5)">Vessels</button>
        </div>
        <div class="controls">
          <button onclick="executeQuery()">Execute Query</button>
        </div>
      </div>
      <div class="result-panel">
        <div class="panel-header">Result</div>
        <pre id="result">Results will appear here...</pre>
      </div>
    </div>
  </div>
  <script>
    const examples = {
      1: 'query { me { id email role created_at } }',
      2: 'query { documents(limit: 10) { id title category created_at } }',
      3: 'query { weather(location: "Santos") { location temperature humidity conditions forecast { day temp conditions } } }',
      4: 'mutation { createDocument(input: { title: "Test Document" category: "general" content: "Test content" }) { id title created_at } }',
      5: 'query { vessels { id name vessel_type status } }'
    };
    
    function loadExample(num) {
      document.getElementById('query').value = examples[num];
    }
    
    async function executeQuery() {
      const query = document.getElementById('query').value;
      const resultEl = document.getElementById('result');
      resultEl.textContent = 'Executing...';
      
      try {
        const token = localStorage.getItem('supabase.auth.token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = \`Bearer \${JSON.parse(token).currentSession.access_token}\`;
        }
        
        const response = await fetch('/api-gateway/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        resultEl.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        resultEl.textContent = \`Error: \${error.message}\`;
      }
    }
  </script>
</body>
</html>
  `;
}

/**
 * REST API Handlers for Critical Resources
 */

// Documents API
async function handleDocumentsAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const id = params.get('id');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        const limit = parseInt(params.get('limit') || '50');
        const offset = parseInt(params.get('offset') || '0');
        const { data, error } = await supabase.from('documents').select('*').range(offset, offset + limit - 1).order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return { documents: data || [], total: data?.length || 0 };
      }
    
    case 'POST':
      if (!user) return { error: 'Authentication required' };
      const { data: newDoc, error: createError } = await supabase.from('documents').insert({ ...body, user_id: user.id }).select().single();
      if (createError) return { error: createError.message };
      return newDoc;
    
    case 'PUT':
    case 'PATCH':
      if (!user || !id) return { error: 'Authentication and ID required' };
      const { data: updatedDoc, error: updateError } = await supabase.from('documents').update(body).eq('id', id).eq('user_id', user.id).select().single();
      if (updateError) return { error: updateError.message };
      return updatedDoc;
    
    case 'DELETE':
      if (!user || !id) return { error: 'Authentication and ID required' };
      const { error: deleteError } = await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id);
      if (deleteError) return { error: deleteError.message };
      return { success: true };
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Checklists API
async function handleChecklistsAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const id = params.get('id');
  const category = params.get('category');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('checklists').select('*, checklist_items(*)').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        let query = supabase.from('checklists').select('*, checklist_items(*)');
        if (category) query = query.eq('category', category);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return { checklists: data || [] };
      }
    
    case 'POST':
      if (!user) return { error: 'Authentication required' };
      const { data: newChecklist, error: createError } = await supabase.from('checklists').insert({ title: body.title, description: body.description, category: body.category, user_id: user.id }).select().single();
      if (createError) return { error: createError.message };
      return newChecklist;
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Audits API
async function handleAuditsAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const id = params.get('id');
  const vessel_id = params.get('vessel_id');
  const status = params.get('status');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('auditorias').select('*').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        let query = supabase.from('auditorias').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (status) query = query.eq('status', status);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return { audits: data || [] };
      }
    
    case 'POST':
      if (!user) return { error: 'Authentication required' };
      const { data: newAudit, error: createError } = await supabase.from('auditorias').insert({ ...body, auditor_id: user.id, status: 'pending' }).select().single();
      if (createError) return { error: createError.message };
      return newAudit;
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Vessels API
async function handleVesselsAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const id = params.get('id');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('vessels').select('*').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        const { data, error } = await supabase.from('vessels').select('*').order('name');
        if (error) return { error: error.message };
        return { vessels: data || [] };
      }
    
    default:
      return { error: 'Method not allowed for this endpoint' };
  }
}

// Forecasts API
async function handleForecastsAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const category = params.get('category');
  
  switch (method) {
    case 'GET':
      let query = supabase.from('forecasts').select('*');
      if (category) query = query.eq('category', category);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
      if (error) return { error: error.message };
      return { forecasts: data || [] };
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Analytics API
async function handleAnalyticsAPI(supabase: any, params: URLSearchParams) {
  const metric = params.get('metric');
  const period = params.get('period') || 'daily';
  
  if (!metric) {
    return { error: 'metric parameter is required' };
  }
  
  const { data, error } = await supabase
    .from('analytics_metrics')
    .select('*')
    .eq('metric', metric)
    .eq('period', period)
    .order('timestamp', { ascending: false })
    .limit(30);
  
  if (error) {
    // Return mock data if table doesn't exist
    return {
      metric,
      period,
      data: [{
        value: Math.random() * 100,
        trend: 'up',
        timestamp: new Date().toISOString()
      }]
    };
  }
  
  return { metric, period, data: data || [] };
}

// Templates API
async function handleTemplatesAPI(supabase: any, method: string, params: URLSearchParams, body: any, user: any) {
  const id = params.get('id');
  const category = params.get('category');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        let query = supabase.from('templates').select('*');
        if (category) query = query.eq('category', category);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return { templates: data || [] };
      }
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Users API
async function handleUsersAPI(supabase: any, method: string, params: URLSearchParams, user: any) {
  if (!user) return { error: 'Authentication required' };
  
  const id = params.get('id');
  
  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) return { error: error.message };
        return data;
      } else {
        // Return current user only for privacy
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) return { error: error.message };
        return data;
      }
    
    default:
      return { error: 'Method not allowed' };
  }
}

// API Keys Management
async function handleAPIKeysAPI(supabase: any, method: string, body: any, user: any) {
  if (!user) return { error: 'Authentication required' };
  
  switch (method) {
    case 'GET':
      const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) return { api_keys: [] };
      return { api_keys: (data || []).map((key: any) => ({ ...key, key: key.key?.substring(0, 8) + '...' })) };
    
    case 'POST':
      const key = 'sk_' + Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join('');
      const expiresAt = body.expires_in_days ? new Date(Date.now() + body.expires_in_days * 24 * 60 * 60 * 1000) : null;
      
      const { data: newKey, error: createError } = await supabase.from('api_keys').insert({
        user_id: user.id,
        name: body.name,
        key,
        scope: body.scope || [],
        is_active: true,
        request_count: 0,
        expires_at: expiresAt
      }).select().single();
      
      if (createError) return { error: createError.message };
      return newKey;
    
    case 'DELETE':
      const { error: deleteError } = await supabase.from('api_keys').delete().eq('id', body.id).eq('user_id', user.id);
      if (deleteError) return { error: deleteError.message };
      return { success: true };
    
    default:
      return { error: 'Method not allowed' };
  }
}

// Webhooks Management
async function handleWebhooksAPI(supabase: any, method: string, body: any, user: any) {
  if (!user) return { error: 'Authentication required' };
  
  return { message: 'Webhooks endpoint - implementation in progress' };
}

/**
 * Weather API Handler (Mock)
 */
async function handleWeatherAPI(params: URLSearchParams) {
  const location = params.get('location') || 'Santos, Brazil';
  
  console.log(`[Weather API] Fetching weather for: ${location}`);
  
  // Mock weather data
  return {
    location,
    timestamp: new Date().toISOString(),
    temperature: Math.round(20 + Math.random() * 15),
    humidity: Math.round(60 + Math.random() * 30),
    wind_speed: Math.round(5 + Math.random() * 15),
    conditions: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
    pressure: Math.round(1010 + Math.random() * 20),
    visibility: Math.round(8 + Math.random() * 7),
    forecast: [
      { day: 'Tomorrow', temp: 24, conditions: 'Sunny' },
      { day: 'Day after', temp: 22, conditions: 'Cloudy' }
    ]
  };
}

/**
 * Satellite API Handler (Mock)
 */
async function handleSatelliteAPI(params: URLSearchParams) {
  const vesselId = params.get('vessel_id') || 'unknown';
  
  console.log(`[Satellite API] Tracking vessel: ${vesselId}`);
  
  // Mock satellite data
  return {
    vessel_id: vesselId,
    timestamp: new Date().toISOString(),
    position: {
      latitude: -23.96 + (Math.random() - 0.5) * 0.1,
      longitude: -46.33 + (Math.random() - 0.5) * 0.1,
      accuracy: '±10m'
    },
    speed: Math.round(8 + Math.random() * 7),
    heading: Math.round(Math.random() * 360),
    satellite_signal: 'Strong',
    coverage: 'Full',
    next_pass: new Date(Date.now() + 3600000).toISOString()
  };
}

/**
 * AIS (Automatic Identification System) Handler (Mock)
 */
async function handleAISAPI(params: URLSearchParams) {
  const area = params.get('area') || 'Santos Port';
  
  console.log(`[AIS API] Fetching vessels in area: ${area}`);
  
  // Mock AIS data
  return {
    area,
    timestamp: new Date().toISOString(),
    vessels_detected: Math.floor(5 + Math.random() * 15),
    vessels: [
      {
        mmsi: '123456789',
        name: 'MV EXAMPLE',
        type: 'Cargo',
        position: { lat: -23.96, lon: -46.33 },
        speed: 12,
        heading: 180,
        status: 'Under way using engine'
      },
      {
        mmsi: '987654321',
        name: 'PSV NAUTILUS',
        type: 'Platform Supply Vessel',
        position: { lat: -23.97, lon: -46.32 },
        speed: 8,
        heading: 90,
        status: 'Engaged in DP operations'
      }
    ],
    warnings: [],
    traffic_density: 'Moderate'
  };
}

/**
 * Logistics API Handler (Mock)
 */
async function handleLogisticsAPI(body: any) {
  const { operation, data } = body || {};
  
  console.log(`[Logistics API] Operation: ${operation}`);
  
  switch (operation) {
    case 'track_cargo':
      return {
        cargo_id: data?.cargo_id || 'unknown',
        status: 'In Transit',
        location: 'Santos Port',
        estimated_arrival: new Date(Date.now() + 86400000).toISOString(),
        customs_cleared: false
      };
    
    case 'port_schedule':
      return {
        port: data?.port || 'Santos',
        berths_available: 3,
        next_available: new Date(Date.now() + 7200000).toISOString(),
        current_vessels: 12,
        capacity: 15
      };
    
    default:
      return { error: 'Unknown logistics operation' };
  }
}

/**
 * Log external request to Supabase
 */
async function logExternalRequest(supabase: any, logData: any) {
  try {
    // Create a simple log entry (table might not exist yet)
    await supabase.from('ai_insights').insert({
      user_id: logData.user_id || '00000000-0000-0000-0000-000000000000',
      title: `API Gateway: ${logData.endpoint}`,
      description: `External API call to ${logData.endpoint}`,
      category: 'external_api',
      priority: 'low',
      confidence: 1.0,
      metadata: {
        ...logData.metadata,
        method: logData.method,
        status: logData.status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API Gateway] Failed to log request:', error);
    // Don't fail the main request if logging fails
  }
}
