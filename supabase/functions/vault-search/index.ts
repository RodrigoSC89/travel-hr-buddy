import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  match_threshold?: number;
  match_count?: number;
  filter_type?: string;
  filter_category?: string;
  use_llm?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { query, match_threshold = 0.5, match_count = 10, filter_type, filter_category, use_llm = false }: SearchRequest = await req.json();

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = performance.now();
    console.log('Vault search request:', { query, match_threshold, match_count, filter_type, use_llm });

    // Generate embedding for the query using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let queryEmbedding: number[] = [];

    if (openaiApiKey) {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: query,
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        queryEmbedding = embeddingData.data[0].embedding;
      } else {
        console.error('Failed to generate embedding:', await embeddingResponse.text());
      }
    }

    let results = [];

    if (queryEmbedding.length > 0) {
      // Perform vector similarity search
      const { data, error } = await supabaseClient.rpc('search_vault_documents', {
        query_embedding: queryEmbedding,
        match_threshold,
        match_count,
        filter_type,
        filter_category,
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      results = data || [];
    } else {
      // Fallback to text search if embeddings not available
      let dbQuery = supabaseClient
        .from('vault_documents')
        .select('id, title, content, document_type, category, metadata')
        .eq('status', 'published')
        .ilike('content', `%${query}%`)
        .limit(match_count);

      if (filter_type) {
        dbQuery = dbQuery.eq('document_type', filter_type);
      }

      if (filter_category) {
        dbQuery = dbQuery.eq('category', filter_category);
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Fallback search error:', error);
        throw error;
      }

      results = (data || []).map(doc => ({ ...doc, similarity: 0.5 }));
    }

    // Generate LLM response if requested
    let llmResponse = null;
    if (use_llm && openaiApiKey && results.length > 0) {
      const context = results
        .slice(0, 3)
        .map((r: any) => `Document: ${r.title}\n${r.content.substring(0, 500)}...`)
        .join('\n\n');

      const llmRequest = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that answers questions based on the provided documents. Be concise and accurate.',
            },
            {
              role: 'user',
              content: `Based on these documents:\n\n${context}\n\nQuestion: ${query}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (llmRequest.ok) {
        const llmData = await llmRequest.json();
        llmResponse = llmData.choices[0].message.content;
      }
    }

    // Log the search
    const { data: user } = await supabaseClient.auth.getUser();
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);
    
    await supabaseClient.from('vault_search_logs').insert({
      user_id: user?.user?.id,
      query,
      query_embedding: queryEmbedding.length > 0 ? queryEmbedding : null,
      results_count: results.length,
      top_result_id: results[0]?.id || null,
      top_result_score: results[0]?.similarity || null,
      search_type: queryEmbedding.length > 0 ? 'semantic' : 'keyword',
      llm_used: use_llm && llmResponse !== null,
      llm_response: llmResponse,
      response_time_ms: responseTimeMs,
    });

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results,
        llm_response: llmResponse,
        search_type: queryEmbedding.length > 0 ? 'semantic' : 'keyword',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Vault search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
