/**
 * SystemModulesOverview - Shows all 7 Mega-Hubs with quick access
 * Provides a bird's-eye view of the platform capabilities
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Compass, Ship, Wrench, Brain, Satellite,
  Shield, Briefcase, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HubInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgColor: string;
  modules: string[];
  badge?: string;
}

const HUBS: HubInfo[] = [
  {
    id: 'command',
    name: 'Central de Comando',
    description: 'Visão executiva, NOC, SOC e alertas operacionais',
    icon: Compass,
    path: '/command',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    modules: ['Executive Dashboard', 'NOC 24/7', 'SOC Security', 'Comms', 'Alerts'],
    badge: '7 módulos',
  },
  {
    id: 'ops',
    name: 'Hub de Operações',
    description: 'Frota, viagens, contratos e logística marítima',
    icon: Ship,
    path: '/ops',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    modules: ['Maritime', 'Fleet', 'Voyage', 'Missions', 'Logistics', 'Contracts'],
    badge: '7 módulos',
  },
  {
    id: 'maintenance',
    name: 'Hub de Manutenção',
    description: 'Preditiva, drydock, combustível, ESG e digital twin',
    icon: Wrench,
    path: '/maintenance',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
    modules: ['Class Surveys', 'Predictive ML', 'Drydock', 'Fuel/ROB', 'Digital Twin', 'ESG'],
    badge: '8 módulos',
  },
  {
    id: 'ai',
    name: 'Hub de IA',
    description: 'Chat, agentes, workflows, voz e observabilidade',
    icon: Brain,
    path: '/ai',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    modules: ['AI Chat', 'Agents', 'Workflows', 'Voice', '11 Modules', 'RAG/OCR'],
    badge: '11 módulos',
  },
  {
    id: 'tracking',
    name: 'Hub de Rastreamento',
    description: 'AIS, SATCOM, meteorologia e telemetria IoT',
    icon: Satellite,
    path: '/tracking',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    modules: ['Real-time', 'AIS Fleet', 'SATCOM', 'Weather AI', 'Alerts', 'IoT'],
    badge: '8 módulos',
  },
  {
    id: 'compliance',
    name: 'Hub de Compliance',
    description: '12 auditorias marítimas e 10 agentes IA',
    icon: Shield,
    path: '/compliance',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
    modules: ['12 Auditorias', '10 AI Agents', 'Certificates', 'Risk Matrix', 'NCs/CAPAs'],
    badge: '22 módulos',
  },
  {
    id: 'workbench',
    name: 'Área de Trabalho',
    description: 'Documentos, pessoas, finanças e sistema',
    icon: Briefcase,
    path: '/workbench',
    color: 'text-slate-600',
    bgColor: 'bg-slate-500/10 hover:bg-slate-500/20',
    modules: ['Documents', 'People', 'Finance', 'Travel', 'System', 'Academy'],
    badge: '12 módulos',
  },
];

export function SystemModulesOverview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          7 Mega-Hubs • {HUBS.reduce((sum, h) => sum + h.modules.length, 0)}+ módulos disponíveis
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {HUBS.map((hub) => (
          <Card
            key={hub.id}
            className={cn(
              "cursor-pointer border-border/50 transition-all duration-200 hover:shadow-md group",
              hub.bgColor
            )}
            onClick={() => navigate(hub.path)}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl bg-background/80 shadow-sm")}>
                    <hub.icon className={cn("h-5 w-5", hub.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{hub.name}</h3>
                    {hub.badge && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                        {hub.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {hub.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {hub.modules.slice(0, 4).map((mod) => (
                  <Badge
                    key={mod}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 bg-background/50"
                  >
                    {mod}
                  </Badge>
                ))}
                {hub.modules.length > 4 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-background/50">
                    +{hub.modules.length - 4}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
