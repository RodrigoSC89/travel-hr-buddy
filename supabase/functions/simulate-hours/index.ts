// ✅ Edge Function: simulate-hours
// Simula consumo de horas dos componentes a cada ciclo
// Atualiza mmi_components.last_hours e insere registros em mmi_hours

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔄 Starting hour simulation for MMI components...');

    // Busca componentes ativos
    const { data: components, error } = await supabase
      .from('mmi_components')
      .select('id, last_hours, expected_daily')
      .eq('status', 'active')
      .limit(100);

    if (error) {
      console.error('❌ Error fetching components:', error);
      return new Response('Erro ao buscar componentes', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!components || components.length === 0) {
      console.log('⚠️ No active components found');
      return new Response('✅ Nenhum componente ativo encontrado', {
        headers: corsHeaders
      });
    }

    console.log(`📊 Found ${components.length} active components`);

    let successCount = 0;
    let errorCount = 0;

    // Processar cada componente
    for (const comp of components) {
      try {
        // Simula 1-5h de consumo
        const delta = Math.floor(Math.random() * 5) + 1;
        const newTotal = comp.last_hours + delta;

        console.log(`  ⚙️ Component ${comp.id}: +${delta}h (${comp.last_hours}h → ${newTotal}h)`);

        // Inserir registro no histórico
        const { error: insertError } = await supabase
          .from('mmi_hours')
          .insert({
            component_id: comp.id,
            added_hours: delta,
            total_hours: newTotal,
            timestamp: new Date().toISOString()
          });

        if (insertError) {
          console.error(`  ❌ Error inserting hours for ${comp.id}:`, insertError);
          errorCount++;
          continue;
        }

        // Atualizar total de horas do componente
        const { error: updateError } = await supabase
          .from('mmi_components')
          .update({ last_hours: newTotal })
          .eq('id', comp.id);

        if (updateError) {
          console.error(`  ❌ Error updating component ${comp.id}:`, updateError);
          errorCount++;
          continue;
        }

        successCount++;
      } catch (compError) {
        console.error(`  ❌ Error processing component ${comp.id}:`, compError);
        errorCount++;
      }
    }

    const message = `✅ Horímetros simulados: ${successCount} sucesso${successCount !== 1 ? 's' : ''}, ${errorCount} erro${errorCount !== 1 ? 's' : ''}`;
    console.log(message);

    return new Response(message, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Unexpected error in simulate-hours:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
