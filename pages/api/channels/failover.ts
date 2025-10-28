// API endpoint for channel failover management
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      // Get failover configuration or events
      const { type = 'events', primary_channel_id } = req.query;

      if (type === 'config') {
        let query = supabase
          .from('channel_fallback_config')
          .select(`
            *,
            primary:communication_channels!primary_channel_id(id, name),
            fallback:communication_channels!fallback_channel_id(id, name)
          `)
          .eq('is_active', true);

        if (primary_channel_id) {
          query = query.eq('primary_channel_id', primary_channel_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching failover config:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ configurations: data });
      }

      // Get failover events
      let query = supabase
        .from('channel_failover_events')
        .select(`
          *,
          from_channel:communication_channels!from_channel_id(id, name),
          to_channel:communication_channels!to_channel_id(id, name)
        `)
        .order('initiated_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching failover events:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ events: data });
    }

    if (req.method === 'POST') {
      // Trigger manual failover
      const {
        from_channel_id,
        to_channel_id,
        reason,
        initiated_by
      } = req.body;

      if (!from_channel_id || !to_channel_id || !reason) {
        return res.status(400).json({ 
          error: 'from_channel_id, to_channel_id, and reason are required' 
        });
      }

      // Call failover function
      const { data, error } = await supabase.rpc('trigger_channel_failover', {
        p_from_channel_id: from_channel_id,
        p_to_channel_id: to_channel_id,
        p_reason: reason
      });

      if (error) {
        console.error('Error triggering failover:', error);
        return res.status(500).json({ error: error.message });
      }

      // Get the created event
      const { data: event } = await supabase
        .from('channel_failover_events')
        .select('*')
        .eq('id', data)
        .single();

      return res.status(201).json({ 
        message: 'Failover initiated successfully',
        event 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
