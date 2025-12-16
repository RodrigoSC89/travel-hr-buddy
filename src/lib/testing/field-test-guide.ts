/**
 * Field Test Guide - PATCH 960
 * Roteiro de testes em campo real para ambiente marítimo
 */

export interface TestCase {
  id: string;
  name: string;
  category: TestCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: string[];
  expectedResult: string;
  offlineRequired: boolean;
  networkCondition: NetworkCondition;
  estimatedTime: string;
  validationCriteria: string[];
}

export type TestCategory = 
  | 'connectivity'
  | 'offline'
  | 'sync'
  | 'performance'
  | 'ai'
  | 'security'
  | 'ui'
  | 'recovery';

export type NetworkCondition = 
  | 'full'
  | '4g'
  | '3g'
  | '2g'
  | 'slow-2g'
  | 'offline'
  | 'intermittent';

export const FIELD_TEST_CASES: TestCase[] = [
  // ========== CONNECTIVITY TESTS ==========
  {
    id: 'CONN-001',
    name: 'Detecção automática de qualidade de rede',
    category: 'connectivity',
    priority: 'critical',
    steps: [
      '1. Abrir o sistema com rede 4G',
      '2. Verificar indicador de rede no header',
      '3. Simular throttle para 2G',
      '4. Verificar mudança automática do indicador',
      '5. Verificar ativação do modo otimizado',
    ],
    expectedResult: 'Sistema detecta mudança de rede e adapta comportamento automaticamente',
    offlineRequired: false,
    networkCondition: '2g',
    estimatedTime: '5 min',
    validationCriteria: [
      'Indicador mostra qualidade correta',
      'Modo otimizado ativa em ≤2Mbps',
      'Animações desabilitadas em rede lenta',
    ],
  },
  {
    id: 'CONN-002',
    name: 'Transição online/offline suave',
    category: 'connectivity',
    priority: 'critical',
    steps: [
      '1. Usar o sistema normalmente',
      '2. Desativar WiFi/dados',
      '3. Verificar banner de offline',
      '4. Continuar usando funções offline',
      '5. Reativar conexão',
      '6. Verificar sync automático',
    ],
    expectedResult: 'Sistema transiciona sem perda de dados ou erros',
    offlineRequired: true,
    networkCondition: 'offline',
    estimatedTime: '10 min',
    validationCriteria: [
      'Banner offline aparece em <3s',
      'Funções críticas continuam operando',
      'Sync automático ao reconectar',
      'Nenhum dado perdido',
    ],
  },

  // ========== OFFLINE TESTS ==========
  {
    id: 'OFF-001',
    name: 'Operação completa offline',
    category: 'offline',
    priority: 'critical',
    steps: [
      '1. Carregar sistema com conexão',
      '2. Desconectar totalmente',
      '3. Navegar para módulo de Frota',
      '4. Visualizar status de embarcações',
      '5. Criar nova ocorrência',
      '6. Preencher checklist de segurança',
      '7. Consultar tripulação',
    ],
    expectedResult: 'Todas as funções críticas operam sem conexão',
    offlineRequired: true,
    networkCondition: 'offline',
    estimatedTime: '15 min',
    validationCriteria: [
      'Dados em cache são exibidos',
      'Formulários salvam localmente',
      'Checklists funcionam offline',
      'IA local responde consultas',
    ],
  },
  {
    id: 'OFF-002',
    name: 'Persistência de dados offline após restart',
    category: 'offline',
    priority: 'high',
    steps: [
      '1. Criar dados offline (ocorrência, checklist)',
      '2. Fechar completamente o app/navegador',
      '3. Reabrir o sistema (ainda offline)',
      '4. Verificar se dados pendentes estão salvos',
      '5. Conectar e verificar sync',
    ],
    expectedResult: 'Dados offline persistem entre sessões',
    offlineRequired: true,
    networkCondition: 'offline',
    estimatedTime: '10 min',
    validationCriteria: [
      'IndexedDB mantém dados',
      'Fila de sync preservada',
      'Nenhum dado perdido no restart',
    ],
  },

  // ========== SYNC TESTS ==========
  {
    id: 'SYNC-001',
    name: 'Sincronização com priorização de dados críticos',
    category: 'sync',
    priority: 'critical',
    steps: [
      '1. Offline: criar 5 itens de baixa prioridade',
      '2. Offline: criar 2 alertas críticos',
      '3. Reconectar com rede lenta (2G)',
      '4. Observar ordem de sync',
    ],
    expectedResult: 'Alertas críticos sincronizam primeiro',
    offlineRequired: true,
    networkCondition: '2g',
    estimatedTime: '10 min',
    validationCriteria: [
      'Críticos sincronizam primeiro',
      'Fila respeita prioridade',
      'Feedback visual de progresso',
    ],
  },
  {
    id: 'SYNC-002',
    name: 'Recuperação de sync falho',
    category: 'sync',
    priority: 'high',
    steps: [
      '1. Criar dados offline',
      '2. Reconectar brevemente',
      '3. Desconectar durante sync',
      '4. Reconectar novamente',
      '5. Verificar retomada do sync',
    ],
    expectedResult: 'Sync retoma de onde parou sem duplicações',
    offlineRequired: true,
    networkCondition: 'intermittent',
    estimatedTime: '15 min',
    validationCriteria: [
      'Retry automático funciona',
      'Sem dados duplicados',
      'Log de erros registrado',
    ],
  },

  // ========== PERFORMANCE TESTS ==========
  {
    id: 'PERF-001',
    name: 'Carregamento inicial em rede 2G',
    category: 'performance',
    priority: 'critical',
    steps: [
      '1. Limpar cache do navegador',
      '2. Configurar throttle para 2G (256kbps)',
      '3. Medir tempo de First Contentful Paint',
      '4. Medir tempo de Time to Interactive',
      '5. Verificar se conteúdo crítico carrega primeiro',
    ],
    expectedResult: 'FCP < 4s, TTI < 8s em 2G',
    offlineRequired: false,
    networkCondition: '2g',
    estimatedTime: '10 min',
    validationCriteria: [
      'FCP < 4 segundos',
      'TTI < 8 segundos',
      'Critical CSS inline',
      'Lazy loading ativo',
    ],
  },
  {
    id: 'PERF-002',
    name: 'Uso de memória em sessão prolongada',
    category: 'performance',
    priority: 'medium',
    steps: [
      '1. Abrir DevTools > Memory',
      '2. Usar sistema por 30 minutos',
      '3. Navegar entre módulos',
      '4. Criar/editar vários registros',
      '5. Verificar heap memory',
    ],
    expectedResult: 'Memória estável sem memory leaks',
    offlineRequired: false,
    networkCondition: 'full',
    estimatedTime: '45 min',
    validationCriteria: [
      'Heap < 150MB após 30min',
      'Sem crescimento contínuo',
      'GC funcionando',
    ],
  },

  // ========== AI TESTS ==========
  {
    id: 'AI-001',
    name: 'Fallback de IA para modo local',
    category: 'ai',
    priority: 'high',
    steps: [
      '1. Com conexão: fazer pergunta à IA',
      '2. Verificar resposta via API',
      '3. Desconectar',
      '4. Fazer pergunta similar offline',
      '5. Verificar resposta local',
    ],
    expectedResult: 'IA responde em ambos os modos',
    offlineRequired: true,
    networkCondition: 'offline',
    estimatedTime: '10 min',
    validationCriteria: [
      'Resposta online detalhada',
      'Resposta offline funcional',
      'Cache de respostas funciona',
      'Navegação por intenção opera',
    ],
  },
  {
    id: 'AI-002',
    name: 'IA em todos os módulos',
    category: 'ai',
    priority: 'high',
    steps: [
      '1. Testar IA no módulo Frota',
      '2. Testar IA no módulo Tripulação',
      '3. Testar IA no módulo Manutenção',
      '4. Testar IA no módulo Segurança',
      '5. Testar IA no módulo ESG',
    ],
    expectedResult: 'IA responde contextualmente em cada módulo',
    offlineRequired: false,
    networkCondition: 'full',
    estimatedTime: '20 min',
    validationCriteria: [
      'Respostas contextualizadas',
      'Sugestões relevantes',
      'Ações executáveis',
    ],
  },

  // ========== SECURITY TESTS ==========
  {
    id: 'SEC-001',
    name: 'Autenticação offline',
    category: 'security',
    priority: 'critical',
    steps: [
      '1. Login normal online',
      '2. Fechar app',
      '3. Desconectar',
      '4. Abrir app offline',
      '5. Verificar se sessão persiste',
    ],
    expectedResult: 'Usuário autenticado pode usar offline',
    offlineRequired: true,
    networkCondition: 'offline',
    estimatedTime: '5 min',
    validationCriteria: [
      'Sessão persiste offline',
      'Token válido em cache',
      'Expiração respeitada',
    ],
  },
  {
    id: 'SEC-002',
    name: 'Criptografia de dados sensíveis',
    category: 'security',
    priority: 'high',
    steps: [
      '1. Salvar dados sensíveis (credenciais)',
      '2. Verificar localStorage/IndexedDB',
      '3. Confirmar que dados estão criptografados',
      '4. Tentar acessar sem autenticação',
    ],
    expectedResult: 'Dados sensíveis criptografados localmente',
    offlineRequired: false,
    networkCondition: 'full',
    estimatedTime: '10 min',
    validationCriteria: [
      'AES-GCM aplicado',
      'Dados ilegíveis no storage',
      'Acesso requer autenticação',
    ],
  },

  // ========== RECOVERY TESTS ==========
  {
    id: 'REC-001',
    name: 'Recuperação após queda de energia',
    category: 'recovery',
    priority: 'critical',
    steps: [
      '1. Criar/editar dados',
      '2. Simular queda de energia (fechar abruptamente)',
      '3. Reabrir sistema',
      '4. Verificar integridade dos dados',
    ],
    expectedResult: 'Sistema recupera estado consistente',
    offlineRequired: false,
    networkCondition: 'full',
    estimatedTime: '10 min',
    validationCriteria: [
      'Dados não corrompidos',
      'Transações atômicas',
      'Log de recuperação',
    ],
  },
  {
    id: 'REC-002',
    name: 'Reset seguro do sistema',
    category: 'recovery',
    priority: 'medium',
    steps: [
      '1. Acessar Painel DevOps',
      '2. Executar "Limpar Todos os Caches"',
      '3. Verificar se dados críticos são preservados',
      '4. Verificar se sistema reinicia corretamente',
    ],
    expectedResult: 'Reset limpa caches mas preserva dados essenciais',
    offlineRequired: false,
    networkCondition: 'full',
    estimatedTime: '10 min',
    validationCriteria: [
      'Caches limpos',
      'Configurações preservadas',
      'Re-autenticação funciona',
    ],
  },
];

// Network simulation tools
export const NETWORK_SIMULATION_TOOLS = [
  {
    name: 'Chrome DevTools Network Throttling',
    platform: 'Chrome',
    instructions: [
      '1. Abrir DevTools (F12)',
      '2. Ir para aba Network',
      '3. Selecionar "Throttling" dropdown',
      '4. Escolher preset ou criar custom',
    ],
    presets: {
      '3G': { download: 1500, upload: 750, latency: 400 },
      '2G': { download: 250, upload: 150, latency: 800 },
      'slow-2g': { download: 50, upload: 50, latency: 2000 },
    },
  },
  {
    name: 'Network Link Conditioner',
    platform: 'macOS',
    instructions: [
      '1. Baixar Additional Tools for Xcode',
      '2. Instalar Network Link Conditioner',
      '3. Abrir em Preferências do Sistema',
      '4. Configurar perfil desejado',
    ],
  },
  {
    name: 'Charles Proxy',
    platform: 'Cross-platform',
    instructions: [
      '1. Instalar Charles Proxy',
      '2. Proxy > Throttle Settings',
      '3. Enable Throttling',
      '4. Configurar bandwidth',
    ],
  },
  {
    name: 'Terminal (Linux/macOS)',
    platform: 'Linux/macOS',
    instructions: [
      '# Instalar wondershaper',
      'sudo apt install wondershaper',
      '',
      '# Limitar a 2Mbps',
      'sudo wondershaper eth0 2048 1024',
      '',
      '# Remover limite',
      'sudo wondershaper -ca eth0',
    ],
  },
];

// Test report generator
export function generateTestReport(results: Array<{
  testId: string;
  passed: boolean;
  notes: string;
  duration: number;
}>): string {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  let report = `# Relatório de Testes em Campo\n\n`;
  report += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
  report += `Total: ${total} | Passou: ${passed} | Falhou: ${failed}\n`;
  report += `Taxa de Sucesso: ${((passed / total) * 100).toFixed(1)}%\n\n`;
  
  report += `## Resultados Detalhados\n\n`;
  
  for (const result of results) {
    const test = FIELD_TEST_CASES.find(t => t.id === result.testId);
    report += `### ${result.testId}: ${test?.name || 'Unknown'}\n`;
    report += `- Status: ${result.passed ? '✅ PASSOU' : '❌ FALHOU'}\n`;
    report += `- Duração: ${result.duration}s\n`;
    report += `- Notas: ${result.notes}\n\n`;
  }
  
  return report;
}

// Get tests by category
export function getTestsByCategory(category: TestCategory): TestCase[] {
  return FIELD_TEST_CASES.filter(t => t.category === category);
}

// Get critical tests
export function getCriticalTests(): TestCase[] {
  return FIELD_TEST_CASES.filter(t => t.priority === 'critical');
}

// Get offline tests
export function getOfflineTests(): TestCase[] {
  return FIELD_TEST_CASES.filter(t => t.offlineRequired);
}
