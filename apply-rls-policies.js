import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vnbptmixvwropvanyhdb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjI0MjkyNywiZXhwIjoyMDQxODE4OTI3fQ.aR8XkH4iCz0H2bMSfg_Tz2CxULp8dCOZSJOdRVbhL1M';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Aplicando RLS policies...');
  
  const sql = fs.readFileSync('supabase/migrations/20251114000001_add_rls_policies_missing_tables.sql', 'utf8');
  
  // Split por statement (simples, pode melhorar)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
  
  console.log(`📋 ${statements.length} statements para executar`);
  
  let success = 0;
  let errors = 0;
  
  for (const statement of statements) {
    if (statement.includes('COMMENT ON')) continue; // Skip comments
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        errors++;
      } else {
        success++;
        console.log(`✅ OK (${success}/${statements.length})`);
      }
    } catch (err) {
      console.error(`❌ Exception: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Resultado: ${success} sucesso, ${errors} erros`);
}

applyMigration().catch(console.error);
