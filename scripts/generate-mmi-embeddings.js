#!/usr/bin/env node

/**
 * Script to generate embeddings for MMI Jobs
 * 
 * Usage:
 *   node scripts/generate-mmi-embeddings.js
 * 
 * Environment variables required:
 *   - OPENAI_API_KEY: Your OpenAI API key
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Process a single job: generate embedding and update database
 */
async function processJob(job) {
  try {
    console.log(`Processing job: ${job.id} - "${job.title}"`);
    
    // Combine title and description for embedding
    const text = `${job.title}. ${job.description}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(text);
    
    // Update job with embedding
    const { error } = await supabase
      .from('mmi_jobs')
      .update({ embedding })
      .eq('id', job.id);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully processed job: ${job.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing job ${job.id}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting MMI Jobs embedding generation...\n');
  
  // Fetch all jobs without embeddings
  const { data: jobs, error } = await supabase
    .from('mmi_jobs')
    .select('id, title, description')
    .is('embedding', null);
  
  if (error) {
    console.error('❌ Error fetching jobs:', error.message);
    process.exit(1);
  }
  
  if (!jobs || jobs.length === 0) {
    console.log('✅ All jobs already have embeddings!');
    process.exit(0);
  }
  
  console.log(`📊 Found ${jobs.length} jobs without embeddings\n`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process jobs sequentially to avoid rate limits
  for (const job of jobs) {
    const success = await processJob(job);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📈 Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📊 Total: ${jobs.length}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All jobs processed successfully!');
  } else {
    console.log('\n⚠️  Some jobs failed to process. Check the logs above.');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
