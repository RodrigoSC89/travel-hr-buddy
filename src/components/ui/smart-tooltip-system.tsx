import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  Lightbulb, 
  TrendingUp, 
  Zap,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Navigation,
  Compass,
  Anchor,
  Ship,
  Target
} from "lucide-react";

interface TooltipData {
  id: string;
  element: string;
  title: string;
  description: string;
  category: "navigation" | "feature" | "optimization" | "help";
  priority: "high" | "medium" | "low";
  position: "top" | "bottom" | "left" | "right";
}

interface ContextualAssistant {
  id: string;
  trigger: string;
  title: string;
  message: string;
  type: "tip" | "warning" | "success" | "info";
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

const SmartTooltipSystem: React.FC = () => {
  const [activeTooltips, setActiveTooltips] = useState<TooltipData[]>([]);
  const [assistantMessages, setAssistantMessages] = useState<ContextualAssistant[]>([]);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [currentTour, setCurrentTour] = useState<number | null>(null);
  const { toast } = useToast();

  const tooltipDatabase: TooltipData[] = [
    {
      id: "nautical-copilot",
      element: "[data-tour=\"copilot\"]",
      title: "Nautilus Copilot IA",
      description: "Seu assistente marítimo inteligente. Faça perguntas sobre operações, solicite relatórios ou execute comandos por voz.",
      category: "feature",
      priority: "high",
      position: "right"
    },
    {
      id: "fleet-status",
      element: "[data-tour=\"fleet\"]",
      title: "Status da Frota",
      description: "Monitore em tempo real todas as embarcações, suas posições, status operacional e próximas manutenções.",
      category: "navigation",
      priority: "high",
      position: "bottom"
    },
    {
      id: "integration-hub",
      element: "[data-tour=\"integrations\"]",
      title: "Hub de Integrações",
      description: "Conecte-se com APIs marítimas, dados meteorológicos e sistemas governamentais para automação completa.",
      category: "feature",
      priority: "medium",
      position: "left"
    },
    {
      id: "custom-theme",
      element: "[data-tour=\"theme\"]",
      title: "Personalização Náutica",
      description: "Customize cores, temas e terminologia para adequar o sistema à identidade da sua empresa marítima.",
      category: "feature",
      priority: "medium",
      position: "top"
    },
    {
      id: "quick-actions",
      element: "[data-tour=\"actions\"]",
      title: "Ações Rápidas",
      description: "Acesse rapidamente as funções mais utilizadas: relatórios, alertas, comunicação e monitoramento.",
      category: "navigation",
      priority: "high",
      position: "bottom"
    }
  ];

  const contextualAssistants: ContextualAssistant[] = [
    {
      id: "first-visit",
      trigger: "new_user",
      title: "Bem-vindo ao Nautilus One!",
      message: "Detectamos que é sua primeira vez aqui. Gostaria de fazer um tour guiado pelas principais funcionalidades?",
      type: "info",
      actions: [
        { label: "Iniciar Tour", action: () => startGuidedTour() },
        { label: "Pular", action: () => dismissAssistant("first-visit") }
      ]
    },
    {
      id: "low-efficiency",
      trigger: "efficiency_below_threshold",
      title: "Oportunidade de Otimização",
      message: "Detectamos que a eficiência operacional está abaixo do esperado. O Copilot IA pode sugerir melhorias automáticas.",
      type: "warning",
      actions: [
        { label: "Ver Sugestões", action: () => openOptimizationPanel() },
        { label: "Ignorar", action: () => dismissAssistant("low-efficiency") }
      ]
    },
    {
      id: "new-feature",
      trigger: "feature_announcement",
      title: "Nova Funcionalidade Disponível",
      message: "Acabamos de lançar o Sistema de Identidade Marítima. Personalize completamente a aparência do sistema!",
      type: "success",
      actions: [
        { label: "Explorar", action: () => openIdentitySystem() },
        { label: "Mais Tarde", action: () => dismissAssistant("new-feature") }
      ]
    },
    {
      id: "performance-tip",
      trigger: "idle_time",
      title: "Dica de Produtividade",
      message: "Você pode usar Ctrl+K para abrir a busca global rapidamente e navegar entre módulos.",
      type: "tip",
      actions: [
        { label: "Entendi", action: () => dismissAssistant("performance-tip") }
      ]
    }
  ];

  useEffect(() => {
    // Simular detecção de contexto
    const checkContext = () => {
      // Verificar se é novo usuário
      const isNewUser = !sessionStorage.getItem("nautilus_visited");
      if (isNewUser) {
        showAssistant("first-visit");
        sessionStorage.setItem("nautilus_visited", "true");
      }

      // Verificar tempo de inatividade
      let idleTimer: NodeJS.Timeout;
      const resetTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (Date.now() % 10 > 6) { // ~30% de chance determinística
            showAssistant("performance-tip");
          }
        }, 30000); // 30 segundos
      };

      document.addEventListener("mousemove", resetTimer);
      document.addEventListener("keypress", resetTimer);
      resetTimer();

      return () => {
        clearTimeout(idleTimer);
        document.removeEventListener("mousemove", resetTimer);
        document.removeEventListener("keypress", resetTimer);
      };
    };

    checkContext();
  }, []);

  const showAssistant = (id: string) => {
    const assistant = contextualAssistants.find(a => a.id === id);
    if (assistant && !assistantMessages.find(m => m.id === id)) {
      setAssistantMessages(prev => [...prev, assistant]);
    }
  };

  const dismissAssistant = (id: string) => {
    setAssistantMessages(prev => prev.filter(m => m.id !== id));
  };

  const startGuidedTour = () => {
    setCurrentTour(0);
    setIsHelpMode(true);
    dismissAssistant("first-visit");
    toast({
      title: "Tour Iniciado",
      description: "Siga as instruções para conhecer o sistema",
    });
  };

  const nextTourStep = () => {
    if (currentTour !== null && currentTour < tooltipDatabase.length - 1) {
      setCurrentTour(currentTour + 1);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setCurrentTour(null);
    setIsHelpMode(false);
    toast({
      title: "Tour Concluído",
      description: "Agora você conhece as principais funcionalidades!",
    });
  };

  const openOptimizationPanel = () => {
    toast({
      title: "Painel de Otimização",
      description: "Redirecionando para sugestões de melhoria...",
    });
    dismissAssistant("low-efficiency");
  };

  const openIdentitySystem = () => {
    toast({
      title: "Sistema de Identidade",
      description: "Abrindo painel de customização...",
    });
    dismissAssistant("new-feature");
  };

  const getAssistantIcon = (type: ContextualAssistant["type"]) => {
    switch (type) {
    case "tip": return <Lightbulb className="w-5 h-5 text-blue-500" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "info": return <Info className="w-5 h-5 text-blue-500" />;
    default: return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: TooltipData["category"]) => {
    switch (category) {
    case "navigation": return <Compass className="w-4 h-4" />;
    case "feature": return <Star className="w-4 h-4" />;
    case "optimization": return <TrendingUp className="w-4 h-4" />;
    case "help": return <HelpCircle className="w-4 h-4" />;
    default: return <Navigation className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Assistentes Contextuais */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {assistantMessages.map((assistant) => (
          <Card key={assistant.id} className="w-80 glass-maritime shadow-beacon animate-slide-in-right">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getAssistantIcon(assistant.type)}
                  <CardTitle className="text-sm">{assistant.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAssistant(assistant.id)}
                  className="h-auto p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">{assistant.message}</p>
              {assistant.actions && (
                <div className="flex gap-2 flex-wrap">
                  {assistant.actions.map((action, actionIdx) => (
                    <Button
                      key={action.label}
                      size="sm"
                      variant={actionIdx === 0 ? "default" : "outline"}
                      onClick={action.action}
                      className={actionIdx === 0 ? "btn-maritime" : "btn-harbor"}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tour Guiado */}
      {currentTour !== null && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="relative">
            {/* Spotlight effect seria implementado aqui */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
              <Card className="w-96 glass-maritime shadow-navigation">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="w-5 h-5 text-primary animate-sail" />
                      Tour Náutico - Passo {currentTour + 1} de {tooltipDatabase.length}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={endTour}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {tooltipDatabase[currentTour] && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(tooltipDatabase[currentTour].category)}
                        <h3 className="font-semibold">{tooltipDatabase[currentTour].title}</h3>
                        <Badge className={`badge-${tooltipDatabase[currentTour].priority === "high" ? "captain" : "crew"}`}>
                          {tooltipDatabase[currentTour].category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tooltipDatabase[currentTour].description}
                      </p>
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={endTour} className="btn-harbor">
                          Pular Tour
                        </Button>
                        <Button onClick={nextTourStep} className="btn-maritime">
                          {currentTour === tooltipDatabase.length - 1 ? "Finalizar" : "Próximo"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}


      {/* Painel de Ajuda */}
      {isHelpMode && currentTour === null && (
        <Card className="fixed bottom-20 left-4 z-30 w-80 glass-maritime shadow-navigation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="w-5 h-5 text-primary" />
              Central de Ajuda Náutica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start btn-harbor"
              onClick={startGuidedTour}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Iniciar Tour Guiado
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start btn-harbor"
              onClick={() => showAssistant("performance-tip")}
            >
              <Zap className="w-4 h-4 mr-2" />
              Dicas de Produtividade
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start btn-harbor"
              onClick={() => showAssistant("new-feature")}
            >
              <Star className="w-4 h-4 mr-2" />
              Novidades do Sistema
            </Button>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Dica: Use Ctrl+K para busca global
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SmartTooltipSystem;