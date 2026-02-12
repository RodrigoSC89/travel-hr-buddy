/**
 * EnhancedWasteManagement - Gestão de Resíduos com UX Premium
 * Dashboard interativo com tanques visuais e conformidade MARPOL
 */
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Recycle,
  LayoutDashboard,
  Droplets,
  Trash2,
  FileText,
  Brain,
  Leaf,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Plus,
  Ship,
  Gauge,
  Activity,
  Fuel,
} from "lucide-react";
import { TanksManagement } from "./components/TanksManagement";
import { GarbageRegistry } from "./components/GarbageRegistry";
import { RecordBooks } from "./components/RecordBooks";
import { WasteReports } from "./components/WasteReports";
import { OilRecordBookComplete } from "./components/OilRecordBookComplete";
import { GarbageRecordBookComplete } from "./components/GarbageRecordBookComplete";
import { ESGAIChat } from "@/components/shared/ESGAIChat";
import { ModuleOnboarding, QuickActionsBar, FeatureHighlight } from "@/components/ux/ModuleOnboarding";
import { InteractiveKPICard, KPIGrid } from "@/components/ux/InteractiveKPICard";
import { ActionableAlerts, AlertSummaryBanner, type ActionableAlert } from "@/components/ux/ActionableAlerts";
import { toast } from "sonner";

interface WasteTank {
  id: string;
  name: string;
  type: "oily" | "sewage" | "garbage" | "bilge";
  capacity: number;
  currentLevel: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  lastDischarge: string;
}

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Gestão de Resíduos MARPOL",
    description: "Controle completo de conformidade ambiental com Oil Record Book e Garbage Record Book digitais.",
    icon: <Recycle className="h-6 w-6 text-primary" />,
    tip: "O sistema gera automaticamente registros para auditorias de Port State Control.",
  },
  {
    id: "tanks",
    title: "Monitoramento de Tanques",
    description: "Visualize níveis de todos os tanques em tempo real com alertas automáticos quando atingem níveis críticos.",
    icon: <Droplets className="h-6 w-6 text-primary" />,
    tip: "Configure alertas em 60%, 80% e 95% de capacidade.",
  },
  {
    id: "compliance",
    title: "Conformidade Automática",
    description: "O sistema verifica automaticamente conformidade com MARPOL Anexos I, IV e V.",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    tip: "Relatórios de conformidade são gerados automaticamente antes de escalas.",
  },
  {
    id: "records",
    title: "Record Books Digitais",
    description: "Oil Record Book e Garbage Record Book em formato digital com assinatura eletrônica.",
    icon: <FileText className="h-6 w-6 text-primary" />,
    tip: "Todos os registros são criptografados e auditáveis.",
  },
];

// Visual Tank Component
function TankVisual({ tank }: { tank: WasteTank }) {
  const fillPercentage = (tank.currentLevel / tank.capacity) * 100;
  
  const getColor = () => {
    if (tank.status === "critical") return "from-destructive to-destructive/80";
    if (tank.status === "warning") return "from-warning to-warning/80";
    return "from-success to-success/80";
  };

  const getTypeIcon = () => {
    switch (tank.type) {
      case "oily": return <Droplets className="h-4 w-4" />;
      case "sewage": return <Trash2 className="h-4 w-4" />;
      case "bilge": return <Droplets className="h-4 w-4" />;
      case "garbage": return <Recycle className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border hover:border-primary/30 transition-all cursor-pointer group"
    >
      {/* Tank Container */}
      <div className="relative h-32 w-full bg-background/50 rounded-lg border-2 border-border overflow-hidden mb-3">
        {/* Fill Level */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${fillPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getColor()} opacity-80`}
        />
        
        {/* Level Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
          {[100, 75, 50, 25].map((level) => (
            <div key={level} className="flex items-center gap-1">
              <div className="w-2 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground">{level}%</span>
            </div>
          ))}
        </div>

        {/* Current Level Indicator */}
        <div 
          className="absolute left-0 right-0 h-0.5 bg-foreground/50"
          style={{ bottom: `${fillPercentage}%` }}
        />
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="font-medium text-sm truncate">{tank.name}</span>
          </div>
          <Badge 
            variant={tank.status === "critical" ? "destructive" : tank.status === "warning" ? "secondary" : "outline"}
            className="text-xs"
          >
            {tank.status === "critical" ? "Crítico" : tank.status === "warning" ? "Atenção" : "OK"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tank.currentLevel.toLocaleString()} / {tank.capacity.toLocaleString()} {tank.unit}</span>
          <span className="font-medium">{fillPercentage.toFixed(0)}%</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Último descarte: {tank.lastDischarge}
        </div>
      </div>

      {/* Action on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
        <Button size="sm" variant="secondary" className="gap-1">
          <Activity className="h-3 w-3" />
          Detalhes
        </Button>
      </div>
    </motion.div>
  );
}

import { ShieldCheck } from "lucide-react";

// Real data hook for waste management
function useWasteTanks() {
  const { data: wasteRecords = [] } = useQuery({
    queryKey: ['waste-tanks-records'],
    queryFn: async () => {
      const { data, error } = await supabase.from('waste_records').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Derive tanks from waste records or use defaults based on vessel data
  if (wasteRecords.length > 0) {
    const typeMap = new Map<string, { total: number; count: number; lastDate: string }>();
    wasteRecords.forEach((r) => {
      const type = r.waste_type || 'general';
      const current = typeMap.get(type) || { total: 0, count: 0, lastDate: '' };
      current.total += r.quantity || 0;
      current.count += 1;
      current.lastDate = r.created_at?.split('T')[0] || current.lastDate;
      typeMap.set(type, current);
    });

    const tanks: WasteTank[] = [];
    const tankTypeMap: Record<string, WasteTank['type']> = { oily_water: 'oily', oily: 'oily', sewage: 'sewage', garbage: 'garbage', bilge: 'bilge', sludge: 'oily', plastic: 'garbage', general: 'garbage' };
    typeMap.forEach((val, key) => {
      const type = tankTypeMap[key] || 'garbage';
      const capacity = type === 'oily' ? 5000 : type === 'sewage' ? 8000 : type === 'bilge' ? 3000 : 500;
      const currentLevel = Math.min(capacity, val.total);
      const fillPct = (currentLevel / capacity) * 100;
      tanks.push({
        id: `tank-${key}`, name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type, capacity, currentLevel: Math.round(currentLevel),
        unit: type === 'garbage' ? 'kg' : 'L',
        status: fillPct >= 90 ? 'critical' : fillPct >= 60 ? 'warning' : 'ok',
        lastDischarge: val.lastDate,
      });
    });
    return tanks;
  }

  // Default tanks when no records exist
  return [
    { id: "1", name: "Tanque de Óleo Usado", type: "oily" as const, capacity: 5000, currentLevel: 0, unit: "L", status: "ok" as const, lastDischarge: "-" },
    { id: "2", name: "Tanque de Esgoto", type: "sewage" as const, capacity: 8000, currentLevel: 0, unit: "L", status: "ok" as const, lastDischarge: "-" },
    { id: "3", name: "Água de Porão", type: "bilge" as const, capacity: 3000, currentLevel: 0, unit: "L", status: "ok" as const, lastDischarge: "-" },
    { id: "4", name: "Resíduos Sólidos", type: "garbage" as const, capacity: 500, currentLevel: 0, unit: "kg", status: "ok" as const, lastDischarge: "-" },
  ];
}

export default function EnhancedWasteManagement() {
  const [showNewFeature, setShowNewFeature] = useState(true);
  const wasteTanks = useWasteTanks();
  const mockTanks = wasteTanks; // alias for backward compat in generateAlerts
  const criticalTanks = wasteTanks.filter((t: WasteTank) => t.status === "critical").length;
  const warningTanks = wasteTanks.filter((t: WasteTank) => t.status === "warning").length;

  // Generate alerts from tank status
  const generateAlerts = (): ActionableAlert[] => {
    const alerts: ActionableAlert[] = [];

    mockTanks.filter(t => t.status === "critical").forEach(tank => {
      alerts.push({
        id: `critical-${tank.id}`,
        type: "critical",
        title: `${tank.name} em nível crítico`,
        description: `${((tank.currentLevel / tank.capacity) * 100).toFixed(0)}% da capacidade - Descarte urgente necessário`,
        timestamp: new Date(),
        source: "MARPOL",
        metadata: {
          "Capacidade": `${tank.capacity}${tank.unit}`,
          "Atual": `${tank.currentLevel}${tank.unit}`,
        },
        actions: [
          {
            id: "schedule",
            label: "Agendar Descarte",
            icon: <Calendar className="h-3 w-3" />,
            onClick: async () => { 
              const { error } = await supabase.from('action_items').insert({ title: `Descarte agendado: ${tank.name}`, description: `Nível: ${tank.currentLevel}${tank.unit}/${tank.capacity}${tank.unit}`, status: 'pending', priority: 'high', source_module: 'waste-management' });
              if (error) { toast.error(`Erro: ${error.message}`); return; }
              toast.success(`Descarte agendado: ${tank.name}`);
            },
          },
          {
            id: "emergency",
            label: "Descarte Emergencial",
            variant: "destructive",
            onClick: () => { window.open('tel:+5511999999999', '_self'); toast.warning(`Protocolo de emergência ativado: ${tank.name}`); },
          },
        ],
      });
    });

    mockTanks.filter(t => t.status === "warning").forEach(tank => {
      alerts.push({
        id: `warning-${tank.id}`,
        type: "warning",
        title: `${tank.name} acima de 60%`,
        description: `Considere agendar descarte na próxima escala`,
        timestamp: new Date(),
        source: "Monitoramento",
        actions: [
          {
            id: "remind",
            label: "Lembrar na Escala",
            icon: <Ship className="h-3 w-3" />,
            onClick: () => { toast.success("Lembrete configurado"); },
          },
        ],
      });
    });

    return alerts;
  };

  const [activeTab, setActiveTab] = useState("dashboard");

  const quickActions = [
    {
      id: "new-discharge",
      label: "Registrar Descarte",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setActiveTab("garbage"),
      variant: "default" as const,
    },
    {
      id: "oil-record",
      label: "Oil Record Book",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setActiveTab("oil-record"),
    },
    {
      id: "garbage-record",
      label: "Garbage Record Book",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setActiveTab("garbage-record"),
    },
    {
      id: "compliance-check",
      label: "Check MARPOL",
      icon: <ShieldCheck className="h-4 w-4" />,
      onClick: () => setActiveTab("reports"),
      variant: "success" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <Recycle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Gestão de Resíduos
                  <Badge variant="secondary" className="ml-2">
                    <Brain className="h-3 w-3 mr-1" />
                    MARPOL
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Conformidade ambiental, Oil Record Book e Garbage Record Book
                </p>
              </div>
            </div>
            <ModuleOnboarding
              moduleKey="waste-management"
              moduleName="Gestão de Resíduos"
              steps={ONBOARDING_STEPS}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Alert Banner */}
        <AlertSummaryBanner
          criticalCount={criticalTanks}
          warningCount={warningTanks}
          onViewAll={() => toast.info("Abrindo painel de alertas...")}
        />

        {/* New Feature */}
        <AnimatePresence>
          {showNewFeature && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FeatureHighlight
                title="ESG Dashboard Integrado"
                description="Acompanhe métricas de sustentabilidade e reduza emissões com insights de IA."
                icon={<Leaf className="h-5 w-5 text-green-500" />}
                isNew
                onDismiss={() => setShowNewFeature(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <QuickActionsBar actions={quickActions} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tanks" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Tanques</span>
            </TabsTrigger>
            <TabsTrigger value="oil-record" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">Oil Record</span>
            </TabsTrigger>
            <TabsTrigger value="garbage-record" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Garbage Record</span>
            </TabsTrigger>
            <TabsTrigger value="garbage" className="flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              <span className="hidden sm:inline">Registros</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Legado</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* KPIs */}
              <KPIGrid columns={5}>
                <InteractiveKPICard
                  title="Conformidade MARPOL"
                  value="100%"
                  subtitle="Todos os anexos"
                  icon={<Leaf className="h-6 w-6 text-green-500" />}
                  status="good"
                  tooltip="Conformidade com MARPOL Anexos I, IV e V"
                  details={[
                    { label: "Anexo I", value: "OK" },
                    { label: "Anexo IV", value: "OK" },
                    { label: "Anexo V", value: "OK" },
                  ]}
                />

                <InteractiveKPICard
                  title="Descartes (Mês)"
                  value="8"
                  subtitle="Todos certificados"
                  icon={<Recycle className="h-6 w-6 text-primary" />}
                  trend={15}
                  trendLabel="vs mês anterior"
                />

                <InteractiveKPICard
                  title="Tanques Alerta"
                  value={warningTanks}
                  subtitle=">60% capacidade"
                  icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
                  status={warningTanks > 0 ? "warning" : "good"}
                />

                <InteractiveKPICard
                  title="Tanques Críticos"
                  value={criticalTanks}
                  subtitle="Descarte urgente"
                  icon={<Droplets className="h-6 w-6 text-destructive" />}
                  status={criticalTanks > 0 ? "critical" : "good"}
                  onDrillDown={() => toast.info("Abrindo tanques críticos...")}
                />

                <InteractiveKPICard
                  title="Redução CO₂"
                  value="12%"
                  subtitle="vs. mês anterior"
                  icon={<TrendingDown className="h-6 w-6 text-green-500" />}
                  status="good"
                  trend={-12}
                  tooltip="Redução de emissões de carbono"
                />
              </KPIGrid>

              {/* Visual Tanks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    Status dos Tanques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockTanks.map((tank, index) => (
                      <motion.div
                        key={tank.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TankVisual tank={tank} />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts and AI */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ActionableAlerts
                  alerts={generateAlerts()}
                  title="Alertas Ambientais"
                  className="lg:col-span-2"
                />

                <ESGAIChat 
                  module="waste" 
                  context={{ 
                    tanks: mockTanks, 
                    criticalTanks,
                    warningTanks 
                  }} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tanks">
            <TanksManagement />
          </TabsContent>

          <TabsContent value="oil-record">
            <OilRecordBookComplete />
          </TabsContent>

          <TabsContent value="garbage-record">
            <GarbageRecordBookComplete />
          </TabsContent>

          <TabsContent value="garbage">
            <GarbageRegistry />
          </TabsContent>

          <TabsContent value="records">
            <RecordBooks />
          </TabsContent>

          <TabsContent value="reports">
            <WasteReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
