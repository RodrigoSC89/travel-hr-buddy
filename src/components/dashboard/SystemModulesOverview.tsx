/**
 * SystemModulesOverview v2 - World-Class Animated Hub Navigation
 * Live data counts per hub, health pulse, and cinematic entrance animations
 */
import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Compass, Ship, Wrench, Brain, Satellite,
  Shield, Briefcase, ArrowRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HubInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgGradient: string;
  modules: string[];
  badge?: string;
  dataKey: string;
}

const HUBS: HubInfo[] = [
  {
    id: 'command',
    name: 'Central de Comando',
    description: 'Visão executiva, NOC, SOC e alertas operacionais',
    icon: Compass,
    path: '/command',
    color: 'text-info',
    bgGradient: 'from-info/10 to-info/5',
    modules: ['Executive Dashboard', 'NOC 24/7', 'SOC Security', 'Comms', 'Alerts'],
    badge: '7 módulos',
    dataKey: 'alerts',
  },
  {
    id: 'ops',
    name: 'Hub de Operações',
    description: 'Frota, viagens, contratos e logística marítima',
    icon: Ship,
    path: '/ops',
    color: 'text-success',
    bgGradient: 'from-success/10 to-success/5',
    modules: ['Maritime', 'Fleet', 'Voyage', 'Missions', 'Logistics', 'Contracts'],
    badge: '7 módulos',
    dataKey: 'voyages',
  },
  {
    id: 'maintenance',
    name: 'Hub de Manutenção',
    description: 'Preditiva, drydock, combustível, ESG e digital twin',
    icon: Wrench,
    path: '/maintenance',
    color: 'text-warning',
    bgGradient: 'from-warning/10 to-warning/5',
    modules: ['Class Surveys', 'Predictive ML', 'Drydock', 'Fuel/ROB', 'Digital Twin', 'ESG'],
    badge: '8 módulos',
    dataKey: 'maintenance',
  },
  {
    id: 'ai',
    name: 'Hub de IA',
    description: 'Chat, agentes, workflows, voz e observabilidade',
    icon: Brain,
    path: '/ai',
    color: 'text-accent-foreground',
    bgGradient: 'from-accent/10 to-accent/5',
    modules: ['AI Chat', 'Agents', 'Workflows', 'Voice', '11 Modules', 'RAG/OCR'],
    badge: '11 módulos',
    dataKey: 'aiAgents',
  },
  {
    id: 'tracking',
    name: 'Hub de Rastreamento',
    description: 'AIS, SATCOM, meteorologia e telemetria IoT',
    icon: Satellite,
    path: '/tracking',
    color: 'text-primary',
    bgGradient: 'from-primary/10 to-primary/5',
    modules: ['Real-time', 'AIS Fleet', 'SATCOM', 'Weather AI', 'Alerts', 'IoT'],
    badge: '8 módulos',
    dataKey: 'sensors',
  },
  {
    id: 'compliance',
    name: 'Hub de Compliance',
    description: '12 auditorias marítimas e 10 agentes IA',
    icon: Shield,
    path: '/compliance',
    color: 'text-destructive',
    bgGradient: 'from-destructive/10 to-destructive/5',
    modules: ['12 Auditorias', '10 AI Agents', 'Certificates', 'Risk Matrix', 'NCs/CAPAs'],
    badge: '22 módulos',
    dataKey: 'audits',
  },
  {
    id: 'workbench',
    name: 'Área de Trabalho',
    description: 'Documentos, pessoas, finanças e sistema',
    icon: Briefcase,
    path: '/workbench',
    color: 'text-muted-foreground',
    bgGradient: 'from-muted/30 to-muted/10',
    modules: ['Documents', 'People', 'Finance', 'Travel', 'System', 'Academy'],
    badge: '12 módulos',
    dataKey: 'documents',
  },
];

/* ─── Hub Card ─── */
const HubCard = memo(({ hub, count, index }: { hub: HubInfo; count: number; index: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg group overflow-hidden relative"
        )}
        onClick={() => navigate(hub.path)}
      >
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          hub.bgGradient
        )} />

        <CardContent className="relative p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2.5 rounded-xl bg-background/80 shadow-sm border border-border/30"
                whileHover={{ rotate: 6, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <hub.icon className={cn("h-5 w-5", hub.color)} />
              </motion.div>
              <div>
                <h3 className="font-semibold text-sm">{hub.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {hub.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {hub.badge}
                    </Badge>
                  )}
                  {count > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20 tabular-nums">
                      {count} registros
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {hub.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {hub.modules.slice(0, 4).map((mod) => (
              <Badge
                key={mod}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-background/50 group-hover:bg-background/80 transition-colors"
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

          {/* Health pulse indicator */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                count > 0 ? "bg-success" : "bg-muted-foreground/30"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                count > 0 ? "bg-success" : "bg-muted-foreground/30"
              )} />
            </span>
            <span className="text-[10px] text-muted-foreground">
              {count > 0 ? 'Operacional' : 'Sem dados'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
HubCard.displayName = 'HubCard';

export function SystemModulesOverview() {
  // Fetch counts relevant to each hub in a single batch
  const { data: hubCounts } = useQuery({
    queryKey: ['hub-module-counts'],
    queryFn: async () => {
      const [alerts, voyages, maintenance, aiAgents, sensors, audits, documents] = await Promise.all([
        supabase.from('soc_alerts').select('id', { count: 'exact', head: true }),
        supabase.from('voyage_plans').select('id', { count: 'exact', head: true }),
        supabase.from('mmi_maintenance_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('agent_registry').select('id', { count: 'exact', head: true }),
        supabase.from('iot_sensors').select('id', { count: 'exact', head: true }),
        supabase.from('internal_audits').select('id', { count: 'exact', head: true }),
        supabase.from('ai_documents').select('id', { count: 'exact', head: true }),
      ]);
      return {
        alerts: alerts.count ?? 0,
        voyages: voyages.count ?? 0,
        maintenance: maintenance.count ?? 0,
        aiAgents: aiAgents.count ?? 0,
        sensors: sensors.count ?? 0,
        audits: audits.count ?? 0,
        documents: documents.count ?? 0,
      };
    },
    staleTime: 120000,
  });

  const totalModules = useMemo(() => HUBS.reduce((sum, h) => sum + h.modules.length, 0), []);

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center justify-between px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">
            7 Mega-Hubs • {totalModules}+ módulos
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground">Clique para acessar</span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {HUBS.map((hub, index) => (
          <HubCard
            key={hub.id}
            hub={hub}
            count={(hubCounts as Record<string, number>)?.[hub.dataKey] ?? 0}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
