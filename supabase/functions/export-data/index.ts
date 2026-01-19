import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { 
      entity_type, 
      format = 'json',
      filters,
      fields 
    } = await req.json();

    if (!entity_type) {
      return errorResponse('Entity type is required', 400);
    }

    const validEntities = ['crews', 'vessels', 'voyages', 'maintenance_items', 'invoices'];
    if (!validEntities.includes(entity_type)) {
      return errorResponse(`Invalid entity type. Valid types: ${validEntities.join(', ')}`, 400);
    }

    const tableMap: Record<string, string> = {
      'crews': 'crew_members',
      'vessels': 'vessels',
      'voyages': 'voyages',
      'maintenance_items': 'maintenance_items',
      'invoices': 'invoices'
    };

    const tableName = tableMap[entity_type];
    let query = supabase.from(tableName).select(fields ? fields.join(',') : '*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      log('error', 'export-data', 'Export failed', { error: error.message });
      return errorResponse('Failed to export data', 500);
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      // Convert to CSV
      if (!data || data.length === 0) {
        exportData = '';
      } else {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map((row: Record<string, unknown>) => 
            headers.map(h => {
              const value = row[h];
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
              return String(value).includes(',') ? `"${value}"` : value;
            }).join(',')
          )
        ];
        exportData = csvRows.join('\n');
      }
      contentType = 'text/csv';
      filename = `${entity_type}_export_${Date.now()}.csv`;
    } else {
      exportData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `${entity_type}_export_${Date.now()}.json`;
    }

    log('info', 'export-data', 'Data exported successfully', { 
      entityType: entity_type,
      format,
      recordCount: data?.length || 0 
    });

    return new Response(exportData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'export-data', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
