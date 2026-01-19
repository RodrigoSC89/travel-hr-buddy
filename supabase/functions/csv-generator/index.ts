import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, errorResponse } from "../_shared/cors.ts";
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

    const { data, columns, filename, include_headers } = await req.json();

    if (!data || !Array.isArray(data)) {
      return errorResponse('Data array is required', 400);
    }

    // Determine columns from data or use provided columns
    const csvColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

    // Build CSV content
    let csvContent = '';

    // Add headers if requested
    if (include_headers !== false) {
      csvContent += csvColumns.map((col: string) => escapeCSV(col)).join(',') + '\n';
    }

    // Add data rows
    for (const row of data) {
      const rowValues = csvColumns.map((col: string) => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return escapeCSV(JSON.stringify(value));
        return escapeCSV(String(value));
      });
      csvContent += rowValues.join(',') + '\n';
    }

    log('info', 'csv-generator', 'CSV generated', { 
      rowCount: data.length, 
      columnCount: csvColumns.length 
    });

    const responseFilename = filename || `export_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${responseFilename}"`
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'csv-generator', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
