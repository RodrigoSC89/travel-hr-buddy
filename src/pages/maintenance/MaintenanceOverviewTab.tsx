/**
 * MaintenanceOverviewTab - Quick access cards for Maintenance Command Center
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Ship, Bot, Brain, Sparkles, Wrench, Target, FileText, Box, 
  Clock, Calendar, History, BarChart3 
} from "lucide-react";

interface MaintenanceOverviewTabProps {
  setActiveTab: (tab: string) => void;
}

const overviewCards = [
  { tab: "saude", icon: Ship, color: "primary", title: "Saúde da Frota", desc: "Monitoramento em tempo real do estado das embarcações", btn: "Acessar" },
  { tab: "copilot", icon: Bot, color: "accent", title: "Copilot IA", desc: "Assistente inteligente para planejamento de manutenção", btn: "Acessar" },
  { tab: "predictive", icon: Brain, color: "primary", title: "IA Preditiva", desc: "Manutenção preditiva com machine learning", btn: "Analisar" },
  { tab: "forecast", icon: Sparkles, color: "accent", title: "Forecast com IA", desc: "Gerar previsões de manutenção com GPT-4", btn: "Gerar Forecast" },
  { tab: "jobs", icon: Wrench, color: "success", title: "Central de Jobs", desc: "Gerenciar jobs e tarefas de manutenção", btn: "Ver Jobs" },
  { tab: "tasks", icon: Target, color: "warning", title: "Tarefas de Manutenção", desc: "Gerenciar tarefas e criar ordens de serviço", btn: "Ver Tarefas" },
  { tab: "os", icon: FileText, color: "warning", title: "Ordens de Serviço", desc: "Criar e gerenciar ordens de serviço", btn: "Gerenciar OS" },
  { tab: "twin", icon: Box, color: "info", title: "Digital Twin 3D", desc: "Visualização 3D dos sistemas e componentes", btn: "Abrir Twin" },
  { tab: "horimetros", icon: Clock, color: "success", title: "Horímetros", desc: "Gestão de horímetros e tempo de operação", btn: "Ver Horímetros" },
  { tab: "calendar", icon: Calendar, color: "info", title: "Calendário", desc: "Visualização do calendário de manutenções", btn: "Ver Calendário" },
  { tab: "history", icon: History, color: "destructive", title: "Histórico", desc: "Histórico completo de manutenções realizadas", btn: "Ver Histórico" },
  { tab: "dashboard", icon: BarChart3, color: "secondary", title: "Dashboard BI", desc: "Análises e métricas de Business Intelligence", btn: "Ver Analytics" },
];

export function MaintenanceOverviewTab({ setActiveTab }: MaintenanceOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card) => (
        <Card 
          key={card.tab} 
          className={`cursor-pointer hover:shadow-lg transition-all hover:border-${card.color}/50`} 
          onClick={() => setActiveTab(card.tab)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <card.icon className={`h-5 w-5 text-${card.color}`} />
              {card.title}
            </CardTitle>
            <CardDescription>{card.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">{card.btn}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
