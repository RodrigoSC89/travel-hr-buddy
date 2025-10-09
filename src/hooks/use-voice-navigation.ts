import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";

interface NavigationIntent {
  module: string;
  action?: string;
  parameters?: Record<string, any>;
  confidence: number;
}

// Mapeamento de comandos de voz para ações
const VOICE_COMMANDS = {
  // Navegação geral
  "dashboard": { module: "dashboard", confidence: 0.9 },
  "início": { module: "dashboard", confidence: 0.9 },
  "home": { module: "dashboard", confidence: 0.9 },
  "painel": { module: "dashboard", confidence: 0.8 },
  
  // Recursos Humanos
  "recursos humanos": { module: "hr", confidence: 0.9 },
  "rh": { module: "hr", confidence: 0.9 },
  "funcionários": { module: "hr", confidence: 0.8 },
  "certificados": { module: "hr", action: "certificates", confidence: 0.9 },
  "certificações": { module: "hr", action: "certificates", confidence: 0.9 },
  
  // Viagens
  "viagens": { module: "travel", confidence: 0.9 },
  "voos": { module: "travel", action: "flights", confidence: 0.9 },
  "hotéis": { module: "travel", action: "hotels", confidence: 0.9 },
  "buscar voo": { module: "travel", action: "flights", confidence: 0.9 },
  "buscar hotel": { module: "travel", action: "hotels", confidence: 0.9 },
  
  // Alertas de Preço
  "alertas": { module: "price-alerts", confidence: 0.9 },
  "preços": { module: "price-alerts", confidence: 0.8 },
  "monitoramento": { module: "price-alerts", confidence: 0.8 },
  "criar alerta": { module: "price-alerts", action: "create", confidence: 0.9 },
  
  // Analytics
  "analytics": { module: "analytics", confidence: 0.9 },
  "análises": { module: "analytics", confidence: 0.9 },
  "métricas": { module: "analytics", confidence: 0.8 },
  "estatísticas": { module: "analytics", confidence: 0.8 },
  
  // Relatórios
  "relatórios": { module: "reports", confidence: 0.9 },
  "reports": { module: "reports", confidence: 0.9 },
  "gerar relatório": { module: "reports", action: "generate", confidence: 0.9 },
  
  // Comunicação
  "comunicação": { module: "communication", confidence: 0.9 },
  "chat": { module: "communication", confidence: 0.8 },
  "mensagens": { module: "communication", confidence: 0.8 },
  
  // Configurações
  "configurações": { module: "settings", confidence: 0.9 },
  "settings": { module: "settings", confidence: 0.9 },
  "preferências": { module: "settings", confidence: 0.8 },
  
  // Admin
  "administração": { module: "admin", confidence: 0.9 },
  "admin": { module: "admin", confidence: 0.9 },
  "gerenciar usuários": { module: "admin", action: "users", confidence: 0.9 },
  
  // Inovação
  "inovação": { module: "innovation", confidence: 0.9 },
  "innovation": { module: "innovation", confidence: 0.9 },
  "automação": { module: "innovation", confidence: 0.8 },
  
  // Inteligência
  "inteligência": { module: "intelligence", confidence: 0.9 },
  "intelligence": { module: "intelligence", confidence: 0.9 },
  "documentos": { module: "intelligence", action: "documents", confidence: 0.8 },
  
  // Otimização
  "otimização": { module: "optimization", confidence: 0.9 },
  "optimization": { module: "optimization", confidence: 0.9 },
  "performance": { module: "optimization", confidence: 0.8 },
};

// Palavras-chave para detectar intenções
const ACTION_KEYWORDS = {
  navigation: ["abrir", "ir para", "navegar", "acessar", "mostrar"],
  search: ["buscar", "encontrar", "procurar", "pesquisar"],
  create: ["criar", "adicionar", "novo", "gerar"],
  view: ["ver", "visualizar", "exibir", "mostrar"],
  manage: ["gerenciar", "administrar", "configurar"],
  analyze: ["analisar", "verificar", "checar", "examinar"]
};

export const useVoiceNavigation = () => {
  // Always call hooks at the top level
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { handleNavigation } = useSidebarActions();

  // Analisar comando de voz e extrair intenção
  const parseVoiceCommand = useCallback((command: string): NavigationIntent | null => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Procurar correspondência direta nos comandos conhecidos
    for (const [key, intent] of Object.entries(VOICE_COMMANDS)) {
      if (normalizedCommand.includes(key)) {
        return intent;
      }
    }

    // Procurar palavras-chave para deduzir intenção
    const words = normalizedCommand.split(/\s+/);
    
    // Detectar módulo mencionado
    let detectedModule = null;
    let confidence = 0.5;
    
    for (const word of words) {
      for (const [commandKey, intent] of Object.entries(VOICE_COMMANDS)) {
        if (commandKey.includes(word) && word.length > 2) {
          detectedModule = intent.module;
          confidence = Math.max(confidence, intent.confidence - 0.2);
          break;
        }
      }
    }

    if (detectedModule) {
      return {
        module: detectedModule,
        confidence
      };
    }

    return null;
  }, []);

  // Executar navegação baseada na intenção
  const executeNavigation = useCallback((intent: NavigationIntent): boolean => {
    try {
      if (intent.confidence < 0.5) {
        toast({
          title: "Comando não reconhecido",
          description: "Não consegui entender o comando. Tente ser mais específico.",
          variant: "destructive",
        });
        return false;
      }

      // Log da ação para feedback
      console.log("Executing navigation:", intent);
      
      // Navegar para o módulo
      handleNavigation(intent.module);

      // Feedback de sucesso
      const moduleNames: Record<string, string> = {
        "dashboard": "Dashboard",
        "hr": "Recursos Humanos",
        "travel": "Viagens",
        "price-alerts": "Alertas de Preço",
        "analytics": "Analytics",
        "reports": "Relatórios",
        "communication": "Comunicação",
        "settings": "Configurações",
        "admin": "Administração",
        "innovation": "Inovação",
        "intelligence": "Inteligência",
        "optimization": "Otimização"
      };

      const moduleName = moduleNames[intent.module] || intent.module;
      
      toast({
        title: "Navegação realizada",
        description: `Abrindo ${moduleName}...`,
      });

      return true;
    } catch (error) {
      console.error("Error executing navigation:", error);
      toast({
        title: "Erro de navegação",
        description: "Ocorreu um erro ao navegar para o módulo solicitado.",
        variant: "destructive",
      });
      return false;
    }
  }, [handleNavigation, toast]);

  // Processar comando de voz completo
  const processVoiceCommand = useCallback((command: string): {
    success: boolean;
    intent?: NavigationIntent;
    action?: string;
  } => {
    if (!command.trim()) {
      return { success: false };
    }

    console.log("Processing voice command:", command);

    // Analisar comando
    const intent = parseVoiceCommand(command);
    
    if (!intent) {
      toast({
        title: "Comando não reconhecido",
        description: "Não consegui identificar uma ação válida no seu comando.",
        variant: "destructive",
      });
      return { success: false };
    }

    // Executar navegação
    const success = executeNavigation(intent);
    
    return {
      success,
      intent,
      action: intent.action || "navigation"
    };
  }, [parseVoiceCommand, executeNavigation, toast]);

  // Obter sugestões de comandos
  const getCommandSuggestions = useCallback(() => {
    return [
      "Abrir recursos humanos",
      "Mostrar dashboard",
      "Ir para viagens",
      "Buscar voos",
      "Ver alertas de preço",
      "Acessar relatórios",
      "Abrir configurações",
      "Mostrar analytics"
    ];
  }, []);

  // Verificar se um comando é válido
  const isValidCommand = useCallback((command: string): boolean => {
    const intent = parseVoiceCommand(command);
    return intent !== null && intent.confidence >= 0.5;
  }, [parseVoiceCommand]);

  return {
    processVoiceCommand,
    parseVoiceCommand,
    executeNavigation,
    getCommandSuggestions,
    isValidCommand
  };
};