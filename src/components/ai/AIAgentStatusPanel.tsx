/**
 * AI Agent Status Panel - Shows status of all 8 specialized agents
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'active' | 'busy' | 'idle' | 'error';
  currentTask?: string;
  decisionsToday: number;
  avgConfidence: number;
  lastActivity: Date;
}

interface AIAgentStatusPanelProps {
  agents?: Agent[];
  className?: string;
}

const DEFAULT_AGENTS: Agent[] = [
  { id: 'captain', name: 'Captain', emoji: '🎯', role: 'Decisões estratégicas', status: 'active', decisionsToday: 15, avgConfidence: 92, lastActivity: new Date() },
  { id: 'engineer', name: 'Engineer', emoji: '🔧', role: 'Manutenção preditiva', status: 'active', currentTask: 'Analisando telemetria', decisionsToday: 23, avgConfidence: 88, lastActivity: new Date() },
  { id: 'safety', name: 'Safety', emoji: '🛡️', role: 'Compliance & segurança', status: 'busy', currentTask: 'Auditoria ISM', decisionsToday: 8, avgConfidence: 95, lastActivity: new Date() },
  { id: 'wellness', name: 'Wellness', emoji: '💚', role: 'Bem-estar da tripulação', status: 'idle', decisionsToday: 5, avgConfidence: 87, lastActivity: new Date(Date.now() - 3600000) },
  { id: 'navigator', name: 'Navigator', emoji: '🧭', role: 'Otimização de rotas', status: 'active', currentTask: 'Calculando ETA', decisionsToday: 12, avgConfidence: 98, lastActivity: new Date() },
  { id: 'economist', name: 'Economist', emoji: '💰', role: 'Otimização financeira', status: 'busy', currentTask: 'Análise OPEX', decisionsToday: 7, avgConfidence: 85, lastActivity: new Date() },
  { id: 'predictor', name: 'Predictor', emoji: '🔮', role: 'Previsões ML', status: 'active', decisionsToday: 31, avgConfidence: 91, lastActivity: new Date() },
  { id: 'comms', name: 'Comms', emoji: '📡', role: 'Comunicações', status: 'active', decisionsToday: 18, avgConfidence: 89, lastActivity: new Date() },
];

const STATUS_COLORS = {
  active: 'bg-green-500',
  busy: 'bg-yellow-500',
  idle: 'bg-gray-400',
  error: 'bg-red-500'
};

const STATUS_LABELS = {
  active: 'Ativo',
  busy: 'Ocupado',
  idle: 'Ocioso',
  error: 'Erro'
};

export function AIAgentStatusPanel({ agents = DEFAULT_AGENTS, className }: AIAgentStatusPanelProps) {
  const activeCount = agents.filter(a => a.status === 'active' || a.status === 'busy').length;
  const totalDecisions = agents.reduce((sum, a) => sum + a.decisionsToday, 0);
  const avgConfidence = agents.reduce((sum, a) => sum + a.avgConfidence, 0) / agents.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Multi-Agent Orchestrator</CardTitle>
            <CardDescription>8 agentes especializados colaborando</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              {activeCount}/8 ativos
            </Badge>
            <Badge variant="outline">
              {totalDecisions} decisões
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Grid */}
        <div className="grid grid-cols-4 gap-3">
          <TooltipProvider>
            {agents.map((agent) => (
              <Tooltip key={agent.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "text-center p-3 rounded-lg transition-all cursor-pointer hover:scale-105",
                      agent.status === 'active' && "bg-green-500/10",
                      agent.status === 'busy' && "bg-yellow-500/10",
                      agent.status === 'idle' && "bg-muted",
                      agent.status === 'error' && "bg-red-500/10"
                    )}
                  >
                    <div className="text-2xl mb-1">{agent.emoji}</div>
                    <p className="text-xs font-medium truncate">{agent.name}</p>
                    <div className={cn(
                      "w-2 h-2 rounded-full mx-auto mt-1",
                      STATUS_COLORS[agent.status]
                    )} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{agent.name} Agent</p>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn("w-2 h-2 rounded-full", STATUS_COLORS[agent.status])} />
                      <span>{STATUS_LABELS[agent.status]}</span>
                    </div>
                    {agent.currentTask && (
                      <p className="text-xs italic">{agent.currentTask}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>Decisões: {agent.decisionsToday}</div>
                      <div>Confiança: {agent.avgConfidence}%</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Agentes Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalDecisions}</p>
            <p className="text-xs text-muted-foreground">Decisões Hoje</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{avgConfidence.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Confiança Média</p>
          </div>
        </div>

        {/* Overall Confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Confiança do Sistema</span>
            <span>{avgConfidence.toFixed(1)}%</span>
          </div>
          <Progress value={avgConfidence} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default AIAgentStatusPanel;
