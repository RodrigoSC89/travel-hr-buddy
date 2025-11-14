import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://vnbptmixvwropvanyhdb.supabase.co';
const SUPABASE_KEY = 'sbp_f033cef6f08611ec31843ca6f01f87d0d3879e20';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sql = readFileSync('SQL_APLICAR_URGENTE.sql', 'utf8');

console.log('Aplicando SQL no Supabase...');

// Executar via RPC ou SQL direto
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: sql })
});

if (response.ok) {
  console.log('✅ SQL aplicado com sucesso!');
} else {
  console.error('❌ Erro:', await response.text());
}
