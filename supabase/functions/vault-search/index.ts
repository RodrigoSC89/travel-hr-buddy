// PATCH 283: Vault AI - Semantic Document Search
// OpenAI ada-002 embeddings + pgvector search + optional GPT-4 response

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
  use_llm?: boolean;
  search_chunks?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { query, match_threshold = 0.7, match_count = 10, use_llm = false, search_chunks = false }: SearchRequest = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate query embedding using OpenAI ada-002
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

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error('OpenAI embedding error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate query embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search documents or chunks based on preference
    let searchResults;
    if (search_chunks) {
      const { data, error } = await supabase.rpc('search_vault_chunks', {
        query_embedding: queryEmbedding,
        match_threshold,
        match_count,
      });

      if (error) {
        console.error('Vault chunks search error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to search vault chunks' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      searchResults = data;
    } else {
      const { data, error } = await supabase.rpc('search_vault_documents', {
        query_embedding: queryEmbedding,
        match_threshold,
        match_count,
      });

      if (error) {
        console.error('Vault documents search error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to search vault documents' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      searchResults = data;
    }

    let llmResponse = null;
    let llmTokens = null;

    // Optionally generate LLM response based on search results
    if (use_llm && searchResults && searchResults.length > 0) {
      // Prepare context from search results
      const context = searchResults
        .slice(0, 5) // Use top 5 results
        .map((result: any, idx: number) => {
          if (search_chunks) {
            return `[${idx + 1}] ${result.document_title} (Similarity: ${(result.similarity * 100).toFixed(1)}%)\n${result.chunk_content}`;
          } else {
            return `[${idx + 1}] ${result.title} (Similarity: ${(result.similarity * 100).toFixed(1)}%)\n${result.content.substring(0, 1000)}...`;
          }
        })
        .join('\n\n');

      // Call GPT-4 to generate contextual answer
      const llmPayload = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the provided document context. If the context does not contain relevant information, say so clearly.',
          },
          {
            role: 'user',
            content: `Context from vault documents:\n\n${context}\n\nQuestion: ${query}\n\nPlease provide a clear and concise answer based on the context above.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      };

      const llmFetchResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(llmPayload),
      });

      if (llmFetchResponse.ok) {
        const llmData = await llmFetchResponse.json();
        llmResponse = llmData.choices[0]?.message?.content;
        llmTokens = {
          prompt: llmData.usage?.prompt_tokens,
          completion: llmData.usage?.completion_tokens,
          total: llmData.usage?.total_tokens,
        };
      } else {
        console.error('LLM response error:', await llmFetchResponse.text());
      }
    }

    // Get user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    // Log the search
    const searchDuration = performance.now() - startTime;
    await supabase.from('vault_search_logs').insert({
      user_id: user?.id,
      query,
      query_embedding: JSON.stringify(queryEmbedding),
      results_count: searchResults?.length || 0,
      top_result_id: searchResults?.[0]?.id || searchResults?.[0]?.document_id,
      top_similarity_score: searchResults?.[0]?.similarity,
      search_duration_ms: searchDuration,
      used_llm: use_llm,
      llm_response: llmResponse,
    });

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: searchResults,
        llm_response: llmResponse,
        llm_tokens: llmTokens,
        search_duration_ms: searchDuration,
        results_count: searchResults?.length || 0,
        search_type: search_chunks ? 'chunks' : 'documents',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Vault search error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
