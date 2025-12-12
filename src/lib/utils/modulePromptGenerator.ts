/**
 * PATCH 655 - Module Prompt Generator
 * Generates AI prompts for modules dynamically
 */

import { NavigationModule, ModuleStatus } from "@/hooks/useNavigationStructure";

interface PromptTemplate {
  moduleId: string;
  moduleName: string;
  category: string;
  status: ModuleStatus;
  roles?: string[];
  prompt: string;
  examples?: string[];
}

interface PromptConfig {
  language?: "pt-BR" | "en-US";
  includeEmojis?: boolean;
}

/**
 * Generate a comprehensive AI prompt for a module
 */
export const generateModulePrompt = (
  module: NavigationModule,
  config: PromptConfig = { language: "pt-BR", includeEmojis: true }
): PromptTemplate => {
  const { language = "pt-BR", includeEmojis = true } = config;
  const statusEmoji = includeEmojis ? getStatusEmoji(module.status) : "";
  const categoryDescription = getCategoryDescription(module.category, language);
  
  const labels = getLabels(language);
  
  const prompt = `${includeEmojis ? "🔧 " : ""}${labels.module}: ${module.name}
${statusEmoji} ${labels.status}: ${module.status.toUpperCase()}
${includeEmojis ? "📂 " : ""}${labels.category}: ${categoryDescription}
${module.aiEnabled ? `${includeEmojis ? "🧠 " : ""}${labels.ai}: ${labels.enabled}` : ""}
${module.requiresRole ? `${includeEmojis ? "🔐 " : ""}${labels.roles}: ${module.requiresRole.join(", ")}` : ""}

${includeEmojis ? "📋 " : ""}${labels.description}:
${module.description || (language === "pt-BR" ? "Módulo do sistema Nautilus One" : "Nautilus One system module")}

${includeEmojis ? "🎯 " : ""}${labels.promptFor}:
"${labels.activateMode} ${getOperationMode(module.category, language)} ${labels.forModule} ${module.name}. ${getModuleAction(module.category, module.name, language)}${module.requiresRole ? ` ${labels.considerRoles}: ${module.requiresRole.join(", ")}.` : ""}"

${includeEmojis ? "⚙️ " : ""}${labels.availableActions}:
${getModuleActions(module, language)}

${includeEmojis ? "🔍 " : ""}${labels.context}:
- ${labels.system}: Nautilus One
- ${labels.path}: ${module.path}
- ${labels.status}: ${module.status}
- ${labels.aiEnabled}: ${module.aiEnabled ? labels.yes : labels.no}
`;

  return {
    moduleId: module.id,
    moduleName: module.name,
    category: module.category,
    status: module.status,
    roles: module.requiresRole,
    prompt,
    examples: generateExamples(module, language),
  };
};

/**
 * Get localized labels
 */
const getLabels = (language: string) => {
  if (language === "en-US") {
    return {
      module: "Module",
      status: "Status",
      category: "Category",
      ai: "AI",
      enabled: "Enabled",
      roles: "Roles",
      description: "Description",
      promptFor: "AI Prompt",
      activateMode: "Activate",
      forModule: "mode for module",
      considerRoles: "Consider access levels",
      availableActions: "Available Actions",
      context: "Context",
      system: "System",
      path: "Path",
      aiEnabled: "AI-Enabled",
      yes: "Yes",
      no: "No",
    };
  }
  
  return {
    module: "Módulo",
    status: "Status",
    category: "Categoria",
    ai: "IA",
    enabled: "Habilitado",
    roles: "Roles",
    description: "Descrição",
    promptFor: "Prompt para IA",
    activateMode: "Ative o modo de",
    forModule: "para o módulo",
    considerRoles: "Considere os níveis de acesso",
    availableActions: "Ações Disponíveis",
    context: "Contexto",
    system: "Sistema",
    path: "Caminho",
    aiEnabled: "AI-Enabled",
    yes: "Sim",
    no: "Não",
  };
};

/**
 * Get status emoji
 */
const getStatusEmoji = (status: ModuleStatus): string => {
  const emojis: Record<ModuleStatus, string> = {
    production: "✅",
    development: "⚠️",
    experimental: "🧪",
    deprecated: "❌",
  };
  return emojis[status] || "❓";
};

/**
 * Get category description
 */
const getCategoryDescription = (category: string, language: string = "pt-BR"): string => {
  const descriptions: Record<string, { pt: string; en: string }> = {
    core: { pt: "Sistema Central", en: "Core System" },
    maritime: { pt: "Operações Marítimas", en: "Maritime Operations" },
    compliance: { pt: "Conformidade e Auditoria", en: "Compliance & Audit" },
    communication: { pt: "Comunicação", en: "Communication" },
    ai: { pt: "Inteligência Artificial", en: "Artificial Intelligence" },
    documents: { pt: "Gestão de Documentos", en: "Document Management" },
    analytics: { pt: "Análise e Relatórios", en: "Analytics & Reports" },
    hr: { pt: "Recursos Humanos", en: "Human Resources" },
    logistics: { pt: "Logística", en: "Logistics" },
    system: { pt: "Sistema", en: "System" },
    experimental: { pt: "Experimental", en: "Experimental" },
    safety: { pt: "Segurança", en: "Safety" },
    travel: { pt: "Viagens", en: "Travel" },
    maintenance: { pt: "Manutenção", en: "Maintenance" },
    finance: { pt: "Finanças", en: "Finance" },
    operations: { pt: "Operações", en: "Operations" },
    intelligence: { pt: "Inteligência", en: "Intelligence" },
    planning: { pt: "Planejamento", en: "Planning" },
  };
  
  const lang = language === "en-US" ? "en" : "pt";
  return descriptions[category]?.[lang] || category;
};

/**
 * Get operation mode based on category
 */
const getOperationMode = (category: string, language: string = "pt-BR"): string => {
  const modes: Record<string, { pt: string; en: string }> = {
    maritime: { pt: "monitoramento marítimo", en: "maritime monitoring" },
    compliance: { pt: "validação de conformidade", en: "compliance validation" },
    communication: { pt: "comunicação em tempo real", en: "real-time communication" },
    ai: { pt: "processamento inteligente", en: "intelligent processing" },
    documents: { pt: "gestão documental", en: "document management" },
    analytics: { pt: "análise de dados", en: "data analysis" },
    hr: { pt: "gestão de recursos humanos", en: "human resources management" },
    logistics: { pt: "otimização logística", en: "logistics optimization" },
    safety: { pt: "monitoramento de segurança", en: "safety monitoring" },
    travel: { pt: "gestão de viagens", en: "travel management" },
    maintenance: { pt: "planejamento de manutenção", en: "maintenance planning" },
  };
  
  const lang = language === "en-US" ? "en" : "pt";
  return modes[category]?.[lang] || (language === "en-US" ? "standard operation" : "operação padrão");
};

/**
 * Get module-specific action description
 */
const getModuleAction = (category: string, moduleName: string, language: string = "pt-BR"): string => {
  const actions: Record<string, { pt: string; en: string }> = {
    maritime: {
      pt: "Liste os perfis de embarcações ativas e inicie o fluxo de monitoramento.",
      en: "List active vessel profiles and start the monitoring flow.",
    },
    compliance: {
      pt: "Execute a verificação de conformidade e gere o relatório de auditoria.",
      en: "Execute compliance verification and generate the audit report.",
    },
    communication: {
      pt: "Ative os canais de comunicação e monitore as mensagens em tempo real.",
      en: "Activate communication channels and monitor messages in real-time.",
    },
    ai: {
      pt: "Inicie o processamento de dados com IA e gere insights automatizados.",
      en: "Start AI data processing and generate automated insights.",
    },
    documents: {
      pt: "Processe os documentos pendentes e valide a conformidade.",
      en: "Process pending documents and validate compliance.",
    },
    crew: {
      pt: "Liste os perfis pendentes da tripulação e inicie o fluxo de integração com RH.",
      en: "List pending crew profiles and start the HR integration flow.",
    },
    hr: {
      pt: "Sincronize os dados de recursos humanos e valide os perfis.",
      en: "Synchronize human resources data and validate profiles.",
    },
    logistics: {
      pt: "Otimize as rotas logísticas e calcule os custos operacionais.",
      en: "Optimize logistics routes and calculate operational costs.",
    },
  };

  // Check for specific module patterns
  if (moduleName.toLowerCase().includes("crew")) {
    const lang = language === "en-US" ? "en" : "pt";
    return actions.crew[lang];
  }

  const lang = language === "en-US" ? "en" : "pt";
  return actions[category]?.[lang] || (language === "en-US" 
    ? "Execute standard module operations." 
    : "Execute as operações padrão do módulo.");
};

/**
 * Get available actions for module
 */
const getModuleActions = (module: NavigationModule, language: string = "pt-BR"): string => {
  const labels = language === "en-US" 
    ? {
      navigate: "Navigate",
      list: "List",
      filter: "Filter",
      export: "Export",
      aiAnalysis: "AI Analysis",
      aiPrediction: "AI Prediction",
      audit: "Audit",
      message: "Message",
      monitor: "Monitor",
      access: "Access",
      displayData: "Display module data",
      applyFilters: "Apply specific filters",
      generateReports: "Generate reports",
      executeAnalysis: "Execute intelligent analysis",
      generatePredictions: "Generate data-based predictions",
      executeVerification: "Execute compliance verification",
      sendComm: "Send communication",
      monitorConv: "Monitor conversations",
    }
    : {
      navigate: "Navegar",
      list: "Listar",
      filter: "Filtrar",
      export: "Exportar",
      aiAnalysis: "IA Análise",
      aiPrediction: "IA Previsão",
      audit: "Auditoria",
      message: "Mensagem",
      monitor: "Monitor",
      access: "Acessar",
      displayData: "Exibir dados do módulo",
      applyFilters: "Aplicar filtros específicos",
      generateReports: "Gerar relatórios",
      executeAnalysis: "Executar análise inteligente",
      generatePredictions: "Gerar previsões baseadas em dados",
      executeVerification: "Executar verificação de conformidade",
      sendComm: "Enviar comunicação",
      monitorConv: "Acompanhar conversas",
    };

  const baseActions = [
    `- ${labels.navigate}: ${labels.access} ${module.path}`,
    `- ${labels.list}: ${labels.displayData}`,
    `- ${labels.filter}: ${labels.applyFilters}`,
    `- ${labels.export}: ${labels.generateReports}`,
  ];

  if (module.aiEnabled) {
    baseActions.push(
      `- ${labels.aiAnalysis}: ${labels.executeAnalysis}`,
      `- ${labels.aiPrediction}: ${labels.generatePredictions}`
    );
  }

  if (module.category === "compliance") {
    baseActions.push(`- ${labels.audit}: ${labels.executeVerification}`);
  }

  if (module.category === "communication") {
    baseActions.push(
      `- ${labels.message}: ${labels.sendComm}`,
      `- ${labels.monitor}: ${labels.monitorConv}`
    );
  }

  return baseActions.join("\n");
};

/**
 * Generate usage examples
 */
const generateExamples = (module: NavigationModule, language: string = "pt-BR"): string[] => {
  const examples: string[] = [];

  const aiLabel = language === "en-US" ? "AI" : "IA";
  const activateLabel = language === "en-US" ? "activate module" : "ative o módulo";
  const showLabel = language === "en-US" ? "and show the latest data" : "e mostre os dados mais recentes";

  // Basic example
  examples.push(
    `"${aiLabel}, ${activateLabel} ${module.name} ${showLabel}."`
  );

  // Category-specific examples
  if (module.category === "maritime") {
    examples.push(
      language === "en-US"
        ? `"${aiLabel}, list all vessels in operation in ${module.name} module."`
        : `"${aiLabel}, liste todas as embarcações em operação no módulo ${module.name}."`,
      language === "en-US"
        ? `"${aiLabel}, generate a fleet status report using ${module.name}."`
        : `"${aiLabel}, gere um relatório de status da frota usando ${module.name}."`
    );
  }

  if (module.category === "compliance") {
    examples.push(
      language === "en-US"
        ? `"${aiLabel}, execute a compliance audit in ${module.name}."`
        : `"${aiLabel}, execute uma auditoria de conformidade no ${module.name}."`,
      language === "en-US"
        ? `"${aiLabel}, identify non-compliances in ${module.name} module."`
        : `"${aiLabel}, identifique não conformidades no módulo ${module.name}."`
    );
  }

  if (module.category === "ai") {
    examples.push(
      language === "en-US"
        ? `"${aiLabel}, process pending data in ${module.name} and generate insights."`
        : `"${aiLabel}, processe os dados pendentes no ${module.name} e gere insights."`,
      language === "en-US"
        ? `"${aiLabel}, execute a predictive analysis using ${module.name}."`
        : `"${aiLabel}, execute uma análise preditiva usando ${module.name}."`
    );
  }

  if (module.category === "crew" || module.category === "hr") {
    examples.push(
      language === "en-US"
        ? `"${aiLabel}, list pending crew profiles in ${module.name}."`
        : `"${aiLabel}, liste os perfis da tripulação pendentes no ${module.name}."`,
      language === "en-US"
        ? `"${aiLabel}, validate crew certifications in ${module.name} module."`
        : `"${aiLabel}, valide as certificações da tripulação no módulo ${module.name}."`
    );
  }

  return examples;
};

/**
 * Generate batch prompts for multiple modules
 */
export const generateBatchPrompts = (
  modules: NavigationModule[],
  config?: PromptConfig
): PromptTemplate[] => {
  return modules.map((module) => generateModulePrompt(module, config));
};

/**
 * Export prompts to markdown format
 */
export const exportPromptsToMarkdown = (prompts: PromptTemplate[]): string => {
  let markdown = "# Nautilus One - AI Module Prompts\n\n";
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += "---\n\n";

  prompts.forEach((prompt, index) => {
    markdown += `## ${index + 1}. ${prompt.moduleName}\n\n`;
    markdown += "```\n";
    markdown += prompt.prompt;
    markdown += "\n```\n\n";

    if (prompt.examples && prompt.examples.length > 0) {
      markdown += "### Exemplos de Uso:\n\n";
      prompt.examples.forEach((example) => {
        markdown += `- ${example}\n`;
      });
      markdown += "\n";
    }

    markdown += "---\n\n";
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
      system: "Nautilus One",
      totalPrompts: prompts.length,
      prompts,
    },
    null,
    2
  );
};
