/**
 * M001 - Agent Hierarchy Visualizer
 * Interactive 3-tier hierarchy tree for the agent swarm
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, ChevronDown, ChevronRight, Shield, Users, 
  Cpu, Zap, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { AGENT_HIERARCHY, type AgentNode, type AgentLevel } from '@/services/ai/agent-hierarchy.service';
import { type AgentPerformance } from '@/services/ai/adaptive-weights.service';

const LEVEL_CONFIG: Record<AgentLevel, { color: string; icon: typeof Brain; label: string }> = {
  SUPERVISOR: { color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', icon: Shield, label: 'Supervisor' },
  COORDINATOR: { color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', icon: Users, label: 'Coordenador' },
  EXECUTOR: { color: 'bg-green-500/20 text-green-600 border-green-500/30', icon: Cpu, label: 'Executor' },
};

const TREND_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

interface Props {
  agentPerformance?: AgentPerformance[];
}

function AgentNodeCard({ 
  agent, 
  performance,
  depth = 0,
}: { 
  agent: AgentNode; 
  performance?: AgentPerformance;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const config = LEVEL_CONFIG[agent.level];
  const Icon = config.icon;
  const children = agent.manages.map(id => AGENT_HIERARCHY[id]).filter(Boolean);
  const hasChildren = children.length > 0;

  const TrendIcon = performance ? TREND_ICONS[performance.weightTrend] : Minus;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
      <div 
        className={`p-3 rounded-lg border ${config.color} mb-2 cursor-pointer hover:shadow-sm transition-shadow`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChildren && (
              expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
            <Icon className="h-4 w-4" />
            <span className="font-medium text-sm">{agent.name}</span>
            <Badge variant="outline" className="text-[10px] h-5">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {performance && (
              <>
                <span className="text-xs text-muted-foreground">
                  Peso: {(performance.dynamicWeight * 100).toFixed(0)}%
                </span>
                <TrendIcon className={`h-3 w-3 ${
                  performance.weightTrend === 'up' ? 'text-green-500' : 
                  performance.weightTrend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`} />
              </>
            )}
            <Badge variant="secondary" className="text-[10px]">
              L{agent.autonomyLevel}
            </Badge>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{agent.role}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{agent.capabilities.length} capabilities</span>
        </div>
        {performance && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span>Precisão</span>
                <span>{(performance.accuracy * 100).toFixed(0)}%</span>
              </div>
              <Progress value={performance.accuracy * 100} className="h-1" />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {performance.totalTasks} tasks
            </div>
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="space-y-1">
          {children.map(child => (
            <AgentNodeCard 
              key={child.id} 
              agent={child} 
              performance={undefined}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentHierarchyVisualizer({ agentPerformance = [] }: Props) {
  const root = AGENT_HIERARCHY['nauti-brain'];
  const perfMap = new Map(agentPerformance.map(p => [p.agentId, p]));

  const stats = {
    total: Object.keys(AGENT_HIERARCHY).length,
    supervisors: Object.values(AGENT_HIERARCHY).filter(a => a.level === 'SUPERVISOR').length,
    coordinators: Object.values(AGENT_HIERARCHY).filter(a => a.level === 'COORDINATOR').length,
    executors: Object.values(AGENT_HIERARCHY).filter(a => a.level === 'EXECUTOR').length,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Hierarquia de Agentes ({stats.total})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">{stats.supervisors} Supervisores</Badge>
            <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">{stats.coordinators} Coordenadores</Badge>
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">{stats.executors} Executores</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AgentNodeCard 
          agent={root} 
          performance={perfMap.get(root.id)}
          depth={0}
        />
      </CardContent>
    </Card>
  );
}

export default AgentHierarchyVisualizer;
