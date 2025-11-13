#!/usr/bin/env node

/**
 * Script para gerar tipos TypeScript do Supabase
 * Executa o CLI do Supabase de forma programática
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'vnbptmixvwropvanyhdb';
const OUTPUT_FILE = path.join(__dirname, 'src', 'integrations', 'supabase', 'types.ts');

console.log('🔄 Gerando tipos TypeScript do Supabase...');
console.log(`📦 Project ID: ${PROJECT_ID}`);
console.log(`📝 Output: ${OUTPUT_FILE}`);

try {
  // Tentar gerar tipos
  const command = `npx -y supabase@latest gen types typescript --project-id ${PROJECT_ID} --schema public`;
  
  console.log(`\n⚙️  Executando: ${command}\n`);
  
  const types = execSync(command, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      // Tentar usar token se existir
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    }
  });

  // Salvar tipos
  fs.writeFileSync(OUTPUT_FILE, types, 'utf-8');
  
  console.log('✅ Tipos gerados com sucesso!');
  console.log(`📁 Arquivo salvo em: ${OUTPUT_FILE}`);
  console.log(`📊 Tamanho: ${(types.length / 1024).toFixed(2)} KB`);
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ Erro ao gerar tipos:');
  console.error(error.message);
  
  if (error.message.includes('Access token not provided')) {
    console.error('\n⚠️  SOLUÇÃO:');
    console.error('1. Execute: npx supabase login');
    console.error('2. OU configure: $env:SUPABASE_ACCESS_TOKEN="seu-token"');
    console.error('3. OU obtenha token em: https://app.supabase.com/account/tokens');
  }
  
  process.exit(1);
}
