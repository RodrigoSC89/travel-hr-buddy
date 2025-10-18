import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting forecast-risks-cron job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark expired predictions as resolved
    const { error: expireError } = await supabase
      .from('tactical_risks')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('valid_until', new Date().toISOString());

    if (expireError) {
      console.error('Error expiring old risks:', expireError);
    } else {
      console.log('Expired old risk predictions');
    }

    // Get all active vessels
    const { data: vessels, error: vesselsError } = await supabase
      .from('vessels')
      .select('id, name')
      .eq('status', 'active');

    if (vesselsError) {
      throw new Error(`Failed to fetch vessels: ${vesselsError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      console.log('No active vessels found');
      return new Response(
        JSON.stringify({ message: 'No active vessels to process', vessels_processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${vessels.length} active vessels...`);

    // Call the forecast API for each vessel
    const apiUrl = Deno.env.get('API_BASE_URL') || 'https://travel-hr-buddy.vercel.app';
    const results = [];

    for (const vessel of vessels) {
      try {
        console.log(`Generating forecast for vessel: ${vessel.name}`);
        
        const response = await fetch(`${apiUrl}/api/ai/forecast-risks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vessel_id: vessel.id }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to generate forecast for ${vessel.name}:`, errorText);
          results.push({
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            success: false,
            error: errorText,
          });
        } else {
          const data = await response.json();
          console.log(`Successfully generated forecast for ${vessel.name}`);
          results.push({
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            success: true,
            risks_generated: data.results?.[0]?.risks_generated || 0,
          });
        }
      } catch (error) {
        console.error(`Error processing vessel ${vessel.name}:`, error);
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Cron job completed: ${successCount}/${vessels.length} vessels processed successfully`);

    return new Response(
      JSON.stringify({
        message: 'Forecast risks cron job completed',
        timestamp: new Date().toISOString(),
        vessels_processed: vessels.length,
        successful: successCount,
        failed: vessels.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in forecast-risks-cron:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
