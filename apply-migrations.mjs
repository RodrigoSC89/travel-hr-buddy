import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://vnbptmixvwropvanyhdb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjI0MjkyNywiZXhwIjoyMDQxODE4OTI3fQ.aR8XkH4iCz0H2bMSfg_Tz2CxULp8dCOZSJOdRVbhL1M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) throw error;
  return data;
}

async function applyMigration(filePath) {
  console.log(`\n📄 Aplicando: ${path.basename(filePath)}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    await executeSql(sql);
    console.log('✅ Sucesso!');
    return true;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Aplicando migrations RLS...\n');
  
  const migrations = [
    'supabase/migrations/20251114000001_add_rls_policies_missing_tables.sql'
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const migration of migrations) {
    if (fs.existsSync(migration)) {
      const result = await applyMigration(migration);
      if (result) success++;
      else failed++;
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${migration}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Resultado: ${success} sucesso, ${failed} falhas`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
