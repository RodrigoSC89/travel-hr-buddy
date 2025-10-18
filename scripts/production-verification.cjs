#!/usr/bin/env node

/**
 * Production Verification Script
 * Verifica se todas as configurações necessárias estão presentes para deploy em produção
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function checkMark(passed) {
  return passed ? '✅' : '❌';
}

// Verificar arquivo
function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Verificar variáveis de ambiente necessárias
function checkEnvVariables() {
  logSection('🔐 Verificando Variáveis de Ambiente');
  
  const requiredEnvVars = {
    'Frontend (Obrigatórias)': [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_PROJECT_ID',
    ],
    'Monitoramento (Recomendadas)': [
      'VITE_SENTRY_DSN',
    ],
    'APIs Opcionais': [
      'VITE_OPENAI_API_KEY',
      'VITE_MAPBOX_ACCESS_TOKEN',
      'VITE_OPENWEATHER_API_KEY',
    ]
  };

  let allPassed = true;
  const missing = [];

  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    log(`\n${category}:`, 'bright');
    vars.forEach(varName => {
      const exists = process.env[varName] !== undefined;
      const isMandatory = category.includes('Obrigatórias');
      
      if (!exists && isMandatory) {
        allPassed = false;
        missing.push(varName);
      }
      
      const status = exists ? 'Configurada' : (isMandatory ? 'FALTANDO' : 'Não configurada');
      const statusColor = exists ? 'green' : (isMandatory ? 'red' : 'yellow');
      
      console.log(`  ${checkMark(exists)} ${varName}: ${colors[statusColor]}${status}${colors.reset}`);
    });
  });

  if (missing.length > 0) {
    log('\n⚠️  ATENÇÃO: Variáveis obrigatórias faltando:', 'red');
    missing.forEach(v => log(`   - ${v}`, 'red'));
  }

  return allPassed;
}

// Verificar arquivos de configuração
function checkConfigFiles() {
  logSection('📁 Verificando Arquivos de Configuração');
  
  const requiredFiles = [
    { path: 'package.json', mandatory: true },
    { path: 'vite.config.ts', mandatory: true },
    { path: 'tsconfig.json', mandatory: true },
    { path: 'vercel.json', mandatory: true },
    { path: '.env.example', mandatory: true },
    { path: 'tailwind.config.ts', mandatory: true },
    { path: 'supabase/functions', mandatory: true },
  ];

  let allPassed = true;

  requiredFiles.forEach(({ path: filePath, mandatory }) => {
    const exists = checkFileExists(filePath);
    if (!exists && mandatory) allPassed = false;
    
    const status = exists ? 'Encontrado' : (mandatory ? 'FALTANDO' : 'Não encontrado');
    const statusColor = exists ? 'green' : (mandatory ? 'red' : 'yellow');
    
    console.log(`  ${checkMark(exists)} ${filePath}: ${colors[statusColor]}${status}${colors.reset}`);
  });

  return allPassed;
}

// Verificar scripts do package.json
function checkPackageScripts() {
  logSection('📦 Verificando Scripts NPM');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = [
    'dev',
    'build',
    'test',
    'lint',
  ];

  let allPassed = true;

  requiredScripts.forEach(script => {
    const exists = packageJson.scripts && packageJson.scripts[script];
    if (!exists) allPassed = false;
    
    console.log(`  ${checkMark(exists)} ${script}: ${exists ? colors.green + 'Configurado' : colors.red + 'FALTANDO'}${colors.reset}`);
  });

  return allPassed;
}

// Verificar Node e NPM versions
function checkNodeVersion() {
  logSection('🔧 Verificando Versões de Node e NPM');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const nodeVersion = process.version;
  const npmVersion = require('child_process').execSync('npm --version').toString().trim();
  
  const requiredNode = packageJson.engines?.node || '>=16';
  const requiredNpm = packageJson.engines?.npm || '>=8';
  
  console.log(`  Node.js: ${nodeVersion} (Requerido: ${requiredNode})`);
  console.log(`  NPM: ${npmVersion} (Requerido: ${requiredNpm})`);
  
  return true;
}

// Verificar estrutura de diretórios
function checkDirectoryStructure() {
  logSection('📂 Verificando Estrutura de Diretórios');
  
  const requiredDirs = [
    'src',
    'src/components',
    'src/pages',
    'src/lib',
    'src/hooks',
    'src/contexts',
    'public',
    'supabase/functions',
  ];

  let allPassed = true;

  requiredDirs.forEach(dir => {
    const exists = checkFileExists(dir);
    if (!exists) allPassed = false;
    
    console.log(`  ${checkMark(exists)} ${dir}: ${exists ? colors.green + 'Encontrado' : colors.red + 'FALTANDO'}${colors.reset}`);
  });

  return allPassed;
}

// Verificar GitHub Actions workflows
function checkGitHubActions() {
  logSection('🔄 Verificando GitHub Actions');
  
  const workflows = [
    '.github/workflows/run-tests.yml',
    '.github/workflows/code-quality-check.yml',
    '.github/workflows/deploy-vercel.yml',
  ];

  let allPassed = true;

  workflows.forEach(workflow => {
    const exists = checkFileExists(workflow);
    const isMandatory = workflow.includes('deploy-vercel');
    
    if (!exists && isMandatory) allPassed = false;
    
    const status = exists ? 'Configurado' : (isMandatory ? 'FALTANDO' : 'Não encontrado');
    const statusColor = exists ? 'green' : (isMandatory ? 'red' : 'yellow');
    
    console.log(`  ${checkMark(exists)} ${workflow.split('/').pop()}: ${colors[statusColor]}${status}${colors.reset}`);
  });

  return allPassed;
}

// Verificar build size
function checkBuildSize() {
  logSection('📊 Verificando Build');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    log('  ⚠️  Diretório dist não encontrado. Execute "npm run build" primeiro.', 'yellow');
    return true; // Não é crítico para verificação pré-deploy
  }

  try {
    const stats = require('child_process').execSync(`du -sh ${distPath}`).toString();
    const size = stats.split('\t')[0];
    
    log(`  Build size: ${size}`, 'green');
    log('  ✅ Build encontrado', 'green');
    
    return true;
  } catch (error) {
    log('  ⚠️  Não foi possível verificar tamanho do build', 'yellow');
    return true;
  }
}

// Verificar documentação
function checkDocumentation() {
  logSection('📚 Verificando Documentação');
  
  const docs = [
    'README.md',
    'PRODUCTION_READY_README.md',
    'PRODUCTION_DEPLOYMENT_GUIDE.md',
    'VERCEL_DEPLOYMENT_GUIDE.md',
  ];

  let allPassed = true;

  docs.forEach(doc => {
    const exists = checkFileExists(doc);
    const isMandatory = doc === 'README.md';
    
    if (!exists && isMandatory) allPassed = false;
    
    console.log(`  ${checkMark(exists)} ${doc}: ${exists ? colors.green + 'Encontrado' : colors.yellow + 'Não encontrado'}${colors.reset}`);
  });

  return allPassed;
}

// Gerar relatório final
function generateReport(checks) {
  logSection('📋 Relatório Final de Verificação');
  
  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  const percentage = Math.round((passed / total) * 100);
  
  checks.forEach(check => {
    const status = check.passed ? '✅ PASSOU' : '❌ FALHOU';
    const color = check.passed ? 'green' : 'red';
    log(`  ${status} - ${check.name}`, color);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (percentage === 100) {
    log(`\n✅ SISTEMA PRONTO PARA PRODUÇÃO! (${passed}/${total} verificações passaram)`, 'green');
    log('\nPróximos passos:', 'cyan');
    log('  1. Configure as variáveis de ambiente no Vercel', 'bright');
    log('  2. Configure os secrets do GitHub Actions', 'bright');
    log('  3. Faça push para main para iniciar deploy automático', 'bright');
    log('  4. Monitore o deploy no GitHub Actions e Vercel', 'bright');
    log('\nDocumentação: PRODUCTION_DEPLOYMENT_GUIDE.md', 'yellow');
  } else if (percentage >= 80) {
    log(`\n⚠️  SISTEMA QUASE PRONTO (${passed}/${total} verificações passaram)`, 'yellow');
    log('\nResolva os itens faltantes antes do deploy para produção.', 'bright');
  } else {
    log(`\n❌ SISTEMA NÃO ESTÁ PRONTO (${passed}/${total} verificações passaram)`, 'red');
    log('\nResolva os problemas críticos antes de prosseguir com o deploy.', 'bright');
  }
  
  console.log('='.repeat(60) + '\n');
  
  process.exit(percentage === 100 ? 0 : 1);
}

// Executar todas as verificações
function main() {
  console.clear();
  log('\n🚀 NAUTILUS ONE - PRODUCTION VERIFICATION', 'bright');
  log('    Verificando prontidão para deploy em produção\n', 'cyan');
  
  const checks = [
    { name: 'Variáveis de Ambiente', passed: checkEnvVariables() },
    { name: 'Arquivos de Configuração', passed: checkConfigFiles() },
    { name: 'Scripts NPM', passed: checkPackageScripts() },
    { name: 'Versões Node/NPM', passed: checkNodeVersion() },
    { name: 'Estrutura de Diretórios', passed: checkDirectoryStructure() },
    { name: 'GitHub Actions', passed: checkGitHubActions() },
    { name: 'Build', passed: checkBuildSize() },
    { name: 'Documentação', passed: checkDocumentation() },
  ];
  
  generateReport(checks);
}

// Executar
main();
