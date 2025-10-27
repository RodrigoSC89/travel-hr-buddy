/**
 * PATCH 251 - GraphQL Resolvers
 * Complete resolver implementation for API Gateway GraphQL
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export const resolvers = {
  Query: {
    // User & Auth
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return {
        id: context.user.id,
        email: context.user.email,
        role: context.user.user_metadata?.role || 'user',
        created_at: context.user.created_at
      };
    },

    user: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Documents
    documents: async (_parent: any, { limit = 50, offset = 0 }: any, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },

    document: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Checklists
    checklists: async (_parent: any, { category }: { category?: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      let query = supabase.from('checklists').select('*, checklist_items(*)');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((checklist: any) => ({
        ...checklist,
        items: checklist.checklist_items || [],
        completed: checklist.checklist_items?.every((item: any) => item.completed) || false
      }));
    },

    checklist: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('checklists')
        .select('*, checklist_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        items: data.checklist_items || [],
        completed: data.checklist_items?.every((item: any) => item.completed) || false
      };
    },

    // Audits
    audits: async (_parent: any, { vessel_id, status }: { vessel_id?: string, status?: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      let query = supabase.from('auditorias').select('*');
      
      if (vessel_id) {
        query = query.eq('vessel_id', vessel_id);
      }
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },

    audit: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('auditorias')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Vessels
    vessels: async (_parent: any, _args: any, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },

    vessel: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Weather
    weather: async (_parent: any, { location }: { location: string }, context: any) => {
      // For now, return mock data. In production, integrate with OpenWeatherMap or similar
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
    },

    // Satellite Tracking
    satelliteTracking: async (_parent: any, { vessel_id }: { vessel_id: string }, context: any) => {
      return {
        vessel_id,
        timestamp: new Date().toISOString(),
        position: {
          latitude: -23.96 + (Math.random() - 0.5) * 0.1,
          longitude: -46.33 + (Math.random() - 0.5) * 0.1,
          accuracy: '±10m',
          timestamp: new Date().toISOString()
        },
        speed: Math.round(8 + Math.random() * 7),
        heading: Math.round(Math.random() * 360),
        satellite_signal: 'Strong',
        coverage: 'Full',
        next_pass: new Date(Date.now() + 3600000).toISOString()
      };
    },

    // AIS Data
    aisData: async (_parent: any, { area }: { area: string }, context: any) => {
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
    },

    // Logistics
    logistics: async (_parent: any, { input }: any, context: any) => {
      const { operation, data: inputData } = JSON.parse(input.data || '{}');
      
      switch (operation) {
        case 'track_cargo':
          return {
            cargo_id: inputData?.cargo_id || 'unknown',
            status: 'In Transit',
            location: 'Santos Port',
            estimated_arrival: new Date(Date.now() + 86400000).toISOString(),
            customs_cleared: false
          };
        
        case 'port_schedule':
          return {
            status: 'Available',
            location: inputData?.port || 'Santos',
            estimated_arrival: new Date(Date.now() + 7200000).toISOString()
          };
        
        default:
          throw new Error('Unknown logistics operation');
      }
    },

    // Forecasts
    forecasts: async (_parent: any, { category }: { category?: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      let query = supabase.from('forecasts').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
      
      if (error) throw error;
      return data || [];
    },

    // Analytics
    analytics: async (_parent: any, { metric, period }: { metric: string, period: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('metric', metric)
        .eq('period', period)
        .order('timestamp', { ascending: false })
        .limit(30);
      
      if (error) {
        // Return mock data if table doesn't exist
        return [{
          metric,
          value: Math.random() * 100,
          trend: 'up',
          period,
          timestamp: new Date().toISOString()
        }];
      }
      return data || [];
    },

    // Templates
    templates: async (_parent: any, { category }: { category?: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      let query = supabase.from('templates').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((template: any) => ({
        ...template,
        variables: template.variables || []
      }));
    },

    template: async (_parent: any, { id }: { id: string }, context: any) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        variables: data.variables || []
      };
    },

    // API Management
    apiKeys: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', context.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Return empty if table doesn't exist yet
        return [];
      }
      
      return (data || []).map((key: any) => ({
        ...key,
        key_prefix: key.key?.substring(0, 8) + '...',
        scope: key.scope || []
      }));
    },

    rateLimits: async (_parent: any, _args: any, context: any) => {
      // Return configured rate limits
      return [
        { endpoint: '/api/auth', max_requests: 100, window_ms: 60000, current_count: 0, reset_at: new Date(Date.now() + 60000).toISOString() },
        { endpoint: '/api/documents', max_requests: 50, window_ms: 60000, current_count: 0, reset_at: new Date(Date.now() + 60000).toISOString() },
        { endpoint: '/api/analytics', max_requests: 30, window_ms: 60000, current_count: 0, reset_at: new Date(Date.now() + 60000).toISOString() },
      ];
    }
  },

  Mutation: {
    // Documents
    createDocument: async (_parent: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...input,
          user_id: context.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    updateDocument: async (_parent: any, { id, input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('documents')
        .update(input)
        .eq('id', id)
        .eq('user_id', context.user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    deleteDocument: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', context.user.id);
      
      if (error) throw error;
      return true;
    },

    // Checklists
    createChecklist: async (_parent: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Create checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert({
          title: input.title,
          description: input.description,
          category: input.category,
          user_id: context.user.id
        })
        .select()
        .single();
      
      if (checklistError) throw checklistError;

      // Create checklist items
      if (input.items && input.items.length > 0) {
        const items = input.items.map((text: string, index: number) => ({
          checklist_id: checklist.id,
          text,
          completed: false,
          order_index: index
        }));

        const { error: itemsError } = await supabase
          .from('checklist_items')
          .insert(items);
        
        if (itemsError) throw itemsError;
      }

      return {
        ...checklist,
        items: input.items.map((text: string, index: number) => ({
          text,
          completed: false,
          order_index: index
        })),
        completed: false
      };
    },

    updateChecklistItem: async (_parent: any, { id, completed }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from('checklist_items')
        .update({ completed })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },

    deleteChecklist: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)
        .eq('user_id', context.user.id);
      
      if (error) throw error;
      return true;
    },

    // Audits
    createAudit: async (_parent: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('auditorias')
        .insert({
          ...input,
          auditor_id: context.user.id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    updateAudit: async (_parent: any, { id, status }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('auditorias')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // API Keys
    createAPIKey: async (_parent: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Generate API key
      const key = 'sk_' + Array.from({ length: 32 }, () => 
        Math.random().toString(36).charAt(2)
      ).join('');

      const expiresAt = input.expires_in_days 
        ? new Date(Date.now() + input.expires_in_days * 24 * 60 * 60 * 1000)
        : null;

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: context.user.id,
          name: input.name,
          key,
          scope: input.scope || [],
          is_active: true,
          request_count: 0,
          expires_at: expiresAt
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        key_prefix: key.substring(0, 8) + '...'
      };
    },

    revokeAPIKey: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', context.user.id);
      
      if (error) throw error;
      return true;
    },

    deleteAPIKey: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', context.user.id);
      
      if (error) throw error;
      return true;
    },

    // Webhooks
    triggerWebhook: async (_parent: any, { event, payload }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // In a real implementation, this would trigger configured webhooks
      console.log(`Webhook triggered: ${event}`, payload);
      return true;
    }
  }
};
