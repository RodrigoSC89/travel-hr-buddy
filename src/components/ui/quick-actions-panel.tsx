import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
import { 
  Search, 
  Zap, 
  TrendingUp, 
  Users, 
  Ship, 
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Bell,
  Calendar,
  Bot,
  Shield,
  Radio,
  Eye,
  Trophy,
  User,
  Plane,
  Target,
  Brain,
  Mic
} from "lucide-react";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  category: string;
  badge?: string;
}

const quickActions: QuickActionProps[] = [
  // Dashboard e Analytics
  { title: "Dashboard Principal", description: "Visão geral do sistema", icon: BarChart3, module: "dashboard", category: "Dashboard", badge: "Principal" },
  { title: "Analytics Avançado", description: "Análise de dados em tempo real", icon: TrendingUp, module: "analytics", category: "Dashboard" },
  { title: "Análise Preditiva", description: "IA para previsões estratégicas", icon: Brain, module: "predictive-analytics", category: "Dashboard" },
  
  // Marítimo e RH
  { title: "Sistema Marítimo", description: "Gestão completa da frota", icon: Ship, module: "maritime", category: "Marítimo", badge: "Essencial" },
  { title: "Recursos Humanos", description: "Gestão de pessoal e certificações", icon: Users, module: "hr", category: "Marítimo" },
  
  // Inovação
  { title: "Centro de Inovação", description: "IA e tecnologias emergentes", icon: Bot, module: "innovation", category: "Inovação", badge: "Novo" },
  { title: "Gamificação", description: "Sistema de conquistas e ranking", icon: Trophy, module: "gamification", category: "Inovação" },
  { title: "Realidade Aumentada", description: "Interface imersiva", icon: Eye, module: "ar", category: "Inovação" },
  { title: "IoT Dashboard", description: "Dispositivos conectados", icon: Radio, module: "iot", category: "Inovação" },
  { title: "Blockchain", description: "Documentos seguros", icon: Shield, module: "blockchain", category: "Inovação" },
  
  // Operacional
  { title: "Viagens", description: "Voos e hospedagens corporativas", icon: Plane, module: "travel", category: "Operacional" },
  { title: "Alertas de Preços", description: "Monitoramento inteligente", icon: Bell, module: "price-alerts", category: "Operacional" },
  { title: "Reservas", description: "Agendamentos e recursos", icon: Calendar, module: "reservations", category: "Operacional" },
  { title: "Comunicação", description: "Chat e mensagens", icon: MessageSquare, module: "communication", category: "Operacional" },
  
  // Gestão
  { title: "Relatórios", description: "Documentos e análises", icon: FileText, module: "reports", category: "Gestão" },
  { title: "Portal do Funcionário", description: "Acesso personalizado", icon: User, module: "portal", category: "Gestão" },
  { title: "Configurações", description: "Preferências do sistema", icon: Settings, module: "settings", category: "Gestão" },
  
  // Estratégico
  { title: "Centro Estratégico", description: "Melhorias baseadas em SWOT", icon: Target, module: "strategic", category: "Estratégico", badge: "Premium" },
  { title: "Assistente de Voz", description: "Comandos inteligentes", icon: Mic, module: "voice", category: "Estratégico" },
  { title: "Inteligência", description: "Processamento de documentos", icon: Brain, module: "intelligence", category: "Estratégico" },
  { title: "Otimização", description: "Performance e melhorias", icon: Zap, module: "optimization", category: "Estratégico" }
];

export const QuickActionsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { handleNavigation } = useSidebarActions();

  const categories = ["Todos", ...Array.from(new Set(quickActions.map(action => action.category)))];
  
  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickAction = (module: string) => {
    handleNavigation(module);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Ações Rápidas
        </CardTitle>
        
        {/* Busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-secondary/5 group"
                onClick={() => handleQuickAction(action.module)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {filteredActions.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum módulo encontrado com os filtros atuais</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};