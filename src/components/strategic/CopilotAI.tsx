import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Send,
  Mic,
  FileText,
  BarChart3,
  Users,
  Calendar,
} from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  module: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  action: string;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  module: string;
  usage: number;
}

export const CopilotAI = () => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const suggestions: Suggestion[] = [
    {
      id: "1",
      title: "Otimização de Rotas Detectada",
      description:
        "Baseado nos dados históricos, alterando a rota Rio-Santos pode economizar 15% em combustível.",
      module: "Logística",
      impact: "high",
      confidence: 87,
      action: "review_routes",
    },
    {
      id: "2",
      title: "Renovação de Certificados",
      description:
        "3 certificados de tripulação expiram em 30 dias. Sugerido agendamento automático.",
      module: "RH Marítimo",
      impact: "high",
      confidence: 95,
      action: "schedule_renewals",
    },
    {
      id: "3",
      title: "Tendência de Reservas",
      description: "Aumento de 40% nas reservas para dezembro. Considere expandir capacidade.",
      module: "Reservas",
      impact: "medium",
      confidence: 78,
      action: "plan_capacity",
    },
    {
      id: "4",
      title: "Anomalia de Custos",
      description: "Gastos portuários 25% acima da média. Investigação recomendada.",
      module: "Viagens",
      impact: "medium",
      confidence: 82,
      action: "investigate_costs",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "1",
      name: "Gerar Relatório",
      description: "Criar relatório automático de qualquer módulo",
      icon: <FileText className="h-5 w-5" />,
      module: "Geral",
      usage: 156,
    },
    {
      id: "2",
      name: "Análise de Dados",
      description: "Analisar tendências e padrões nos dados",
      icon: <BarChart3 className="h-5 w-5" />,
      module: "Analytics",
      usage: 98,
    },
    {
      id: "3",
      name: "Encontrar Tripulação",
      description: "Buscar tripulação disponível para embarque",
      icon: <Users className="h-5 w-5" />,
      module: "RH Marítimo",
      usage: 73,
    },
    {
      id: "4",
      name: "Agendar Operação",
      description: "Criar agendamento de operação portuária",
      icon: <Calendar className="h-5 w-5" />,
      module: "Logística",
      usage: 64,
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-danger text-danger-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Aqui implementaria a funcionalidade de voz
  };

  const handleSendQuery = () => {
    if (query.trim()) {
      // Aqui implementaria o processamento da query
      setQuery("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Copiloto IA Nautilus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{suggestions.length}</div>
              <div className="text-sm text-muted-foreground">Sugestões Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">92%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">1.2k</div>
              <div className="text-sm text-muted-foreground">Interações/mês</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Assistente Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Pergunte qualquer coisa sobre o sistema... Ex: 'Mostrar reservas da próxima semana'"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleSendQuery()}
                />
              </div>
              <Button
                variant={isListening ? "default" : "outline"}
                onClick={handleVoiceToggle}
                className={isListening ? "animate-pulse" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendQuery}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 h-32 overflow-y-auto">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="text-sm">Olá! Sou o Copiloto Nautilus. Posso ajudá-lo com:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Navegação pelo sistema</li>
                    <li>• Geração de relatórios</li>
                    <li>• Análise de dados</li>
                    <li>• Sugestões operacionais</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Sugestões Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="border rounded-lg p-4 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(suggestion.impact)}>{suggestion.impact}</Badge>
                    <Badge variant="outline">{suggestion.confidence}% confiança</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{suggestion.module}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ignorar
                    </Button>
                    <Button size="sm">Aplicar Sugestão</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map(action => (
              <div key={action.id} className="border rounded-lg p-4 hover-lift cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="text-primary">{action.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{action.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">{action.module}</Badge>
                      <span className="text-xs text-muted-foreground">{action.usage} usos</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-success">98.5%</div>
              <div className="text-sm text-muted-foreground">Precisão das Sugestões</div>
            </div>
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">1.8s</div>
              <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            </div>
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-warning">R$ 125k</div>
              <div className="text-sm text-muted-foreground">Economia Gerada</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
