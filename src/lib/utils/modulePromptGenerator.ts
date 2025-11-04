/**
 * PATCH 655 - Module Prompt Generator
 * Generates AI prompts for modules dynamically
 */

import { NavigationModule, ModuleStatus } from '@/hooks/useNavigationStructure';

interface PromptTemplate {
  moduleId: string;
  moduleName: string;
  category: string;
  status: ModuleStatus;
  roles?: string[];
  prompt: string;
  examples?: string[];
}

/**
 * Generate a comprehensive AI prompt for a module
 */
export const generateModulePrompt = (module: NavigationModule): PromptTemplate => {
  const statusEmoji = getStatusEmoji(module.status);
  const categoryDescription = getCategoryDescription(module.category);
  
  const prompt = `🔧 Módulo: ${module.name}
${statusEmoji} Status: ${module.status.toUpperCase()}
📂 Categoria: ${categoryDescription}
${module.aiEnabled ? '🧠 IA: Habilitado' : ''}
${module.requiresRole ? `🔐 Roles: ${module.requiresRole.join(', ')}` : ''}

📋 Descrição:
${module.description || 'Módulo do sistema Nautilus One'}

🎯 Prompt para IA:
"Ative o modo de ${getOperationMode(module.category)} para o módulo ${module.name}. ${getModuleAction(module.category, module.name)}${module.requiresRole ? ` Considere os níveis de acesso: ${module.requiresRole.join(', ')}.` : ''}"

⚙️ Ações Disponíveis:
${getModuleActions(module)}

🔍 Contexto:
- Sistema: Nautilus One
- Caminho: ${module.path}
- Status: ${module.status}
- AI-Enabled: ${module.aiEnabled ? 'Sim' : 'Não'}
`;

  return {
    moduleId: module.id,
    moduleName: module.name,
    category: module.category,
    status: module.status,
    roles: module.requiresRole,
    prompt,
    examples: generateExamples(module),
  };
};

/**
 * Get status emoji
 */
const getStatusEmoji = (status: ModuleStatus): string => {
  const emojis: Record<ModuleStatus, string> = {
    production: '✅',
    development: '⚠️',
    experimental: '🧪',
    deprecated: '❌',
  };
  return emojis[status] || '❓';
};

/**
 * Get category description in Portuguese
 */
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    core: 'Sistema Central',
    maritime: 'Operações Marítimas',
    compliance: 'Conformidade e Auditoria',
    communication: 'Comunicação',
    ai: 'Inteligência Artificial',
    documents: 'Gestão de Documentos',
    analytics: 'Análise e Relatórios',
    hr: 'Recursos Humanos',
    logistics: 'Logística',
    system: 'Sistema',
    experimental: 'Experimental',
    safety: 'Segurança',
    travel: 'Viagens',
    maintenance: 'Manutenção',
    finance: 'Finanças',
    operations: 'Operações',
    intelligence: 'Inteligência',
    planning: 'Planejamento',
  };
  return descriptions[category] || category;
};

/**
 * Get operation mode based on category
 */
const getOperationMode = (category: string): string => {
  const modes: Record<string, string> = {
    maritime: 'monitoramento marítimo',
    compliance: 'validação de conformidade',
    communication: 'comunicação em tempo real',
    ai: 'processamento inteligente',
    documents: 'gestão documental',
    analytics: 'análise de dados',
    hr: 'gestão de recursos humanos',
    logistics: 'otimização logística',
    safety: 'monitoramento de segurança',
    travel: 'gestão de viagens',
    maintenance: 'planejamento de manutenção',
  };
  return modes[category] || 'operação padrão';
};

/**
 * Get module-specific action description
 */
const getModuleAction = (category: string, moduleName: string): string => {
  const actions: Record<string, string> = {
    maritime: 'Liste os perfis de embarcações ativas e inicie o fluxo de monitoramento.',
    compliance: 'Execute a verificação de conformidade e gere o relatório de auditoria.',
    communication: 'Ative os canais de comunicação e monitore as mensagens em tempo real.',
    ai: 'Inicie o processamento de dados com IA e gere insights automatizados.',
    documents: 'Processe os documentos pendentes e valide a conformidade.',
    crew: 'Liste os perfis pendentes da tripulação e inicie o fluxo de integração com RH.',
    hr: 'Sincronize os dados de recursos humanos e valide os perfis.',
    logistics: 'Otimize as rotas logísticas e calcule os custos operacionais.',
  };

  // Check for specific module patterns
  if (moduleName.toLowerCase().includes('crew')) {
    return actions.crew;
  }

  return actions[category] || 'Execute as operações padrão do módulo.';
};

/**
 * Get available actions for module
 */
const getModuleActions = (module: NavigationModule): string => {
  const baseActions = [
    `- Navegar: Acessar ${module.path}`,
    '- Listar: Exibir dados do módulo',
    '- Filtrar: Aplicar filtros específicos',
    '- Exportar: Gerar relatórios',
  ];

  if (module.aiEnabled) {
    baseActions.push(
      '- IA Análise: Executar análise inteligente',
      '- IA Previsão: Gerar previsões baseadas em dados'
    );
  }

  if (module.category === 'compliance') {
    baseActions.push('- Auditoria: Executar verificação de conformidade');
  }

  if (module.category === 'communication') {
    baseActions.push('- Mensagem: Enviar comunicação', '- Monitor: Acompanhar conversas');
  }

  return baseActions.join('\n');
};

/**
 * Generate usage examples
 */
const generateExamples = (module: NavigationModule): string[] => {
  const examples: string[] = [];

  // Basic example
  examples.push(
    `"IA, ative o módulo ${module.name} e mostre os dados mais recentes."`
  );

  // Category-specific examples
  if (module.category === 'maritime') {
    examples.push(
      `"IA, liste todas as embarcações em operação no módulo ${module.name}."`,
      `"IA, gere um relatório de status da frota usando ${module.name}."`
    );
  }

  if (module.category === 'compliance') {
    examples.push(
      `"IA, execute uma auditoria de conformidade no ${module.name}."`,
      `"IA, identifique não conformidades no módulo ${module.name}."`
    );
  }

  if (module.category === 'ai') {
    examples.push(
      `"IA, processe os dados pendentes no ${module.name} e gere insights."`,
      `"IA, execute uma análise preditiva usando ${module.name}."`
    );
  }

  if (module.category === 'crew' || module.category === 'hr') {
    examples.push(
      `"IA, liste os perfis da tripulação pendentes no ${module.name}."`,
      `"IA, valide as certificações da tripulação no módulo ${module.name}."`
    );
  }

  return examples;
};

/**
 * Generate batch prompts for multiple modules
 */
export const generateBatchPrompts = (modules: NavigationModule[]): PromptTemplate[] => {
  return modules.map((module) => generateModulePrompt(module));
};

/**
 * Export prompts to markdown format
 */
export const exportPromptsToMarkdown = (prompts: PromptTemplate[]): string => {
  let markdown = '# Nautilus One - AI Module Prompts\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '---\n\n';

  prompts.forEach((prompt, index) => {
    markdown += `## ${index + 1}. ${prompt.moduleName}\n\n`;
    markdown += '```\n';
    markdown += prompt.prompt;
    markdown += '\n```\n\n';

    if (prompt.examples && prompt.examples.length > 0) {
      markdown += '### Exemplos de Uso:\n\n';
      prompt.examples.forEach((example) => {
        markdown += `- ${example}\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
};

/**
 * Export prompts to JSON format
 */
export const exportPromptsToJSON = (prompts: PromptTemplate[]): string => {
  return JSON.stringify(
    {
      generated: new Date().toISOString(),
      system: 'Nautilus One',
      totalPrompts: prompts.length,
      prompts,
    },
    null,
    2
  );
};
