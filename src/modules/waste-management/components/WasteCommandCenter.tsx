/**
 * Waste Management Command Center - Premium Dashboard
 * Centro de Comando de Gestão de Resíduos MARPOL
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Recycle, Droplets, Trash2, FileText, AlertTriangle, 
  Ship, Calendar, CheckCircle2, TrendingDown, Plus, 
  Download, Signature, Brain, Activity, MapPin, Anchor,
  Gauge, Waves, Leaf, ArrowRight, Sparkles, Eye, Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useWasteManagementData } from "@/hooks/useWasteManagementData";
import { useESGWasteAI } from "@/hooks/useESGWasteAI";

// Tank 3D Visualization Component
function Tank3D({ tank }: { tank: { name: string; type: string; currentLevel: number; capacity: number; unit: string; lastDischarge?: string } }) {
  const fillPercent = (tank.currentLevel / tank.capacity) * 100;
  const isWarning = fillPercent >= 60 && fillPercent < 80;
  const isCritical = fillPercent >= 80;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div className={`
        relative w-full h-40 rounded-2xl overflow-hidden border-2 transition-all
        ${isCritical ? "border-destructive shadow-lg shadow-destructive/20" : 
          isWarning ? "border-warning shadow-md shadow-warning/20" : 
          "border-primary/30 hover:border-primary"}
      `}>
        {/* Tank Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted" />
        
        {/* Liquid Level */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${fillPercent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`
            absolute bottom-0 w-full transition-colors
            ${isCritical ? "bg-gradient-to-t from-destructive to-destructive/60" : 
              isWarning ? "bg-gradient-to-t from-warning to-warning/60" : 
              "bg-gradient-to-t from-primary to-primary/60"}
          `}
        >
          {/* Wave Animation */}
          <div className="absolute top-0 w-full h-4 overflow-hidden">
            <div className="animate-pulse opacity-30 bg-white h-full" />
          </div>
        </motion.div>
        
        {/* Tank Info Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <span className="text-3xl font-bold drop-shadow-lg">{Math.round(fillPercent)}%</span>
          <span className="text-sm font-medium mt-1 drop-shadow">{tank.name}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {tank.currentLevel.toLocaleString()}/{tank.capacity.toLocaleString()} {tank.unit}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-2 right-2">
          {isCritical ? (
            <Badge variant="destructive" className="animate-pulse gap-1">
              <AlertTriangle className="h-3 w-3" />
              Crítico
            </Badge>
          ) : isWarning ? (
            <Badge variant="secondary" className="bg-warning/20 text-warning gap-1">
              <AlertTriangle className="h-3 w-3" />
              Atenção
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-success/20 text-success gap-1">
              <CheckCircle2 className="h-3 w-3" />
              OK
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions on Hover */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-lg">
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <Recycle className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Discharge Timeline Component
function DischargeTimeline({ records }: { records: { id: string; type: string; date: string; location: string; quantity: number; unit: string; certificate: string }[] }) {
  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <motion.div 
          key={record.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary" />
            {index < records.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{record.type}</p>
                <p className="text-sm text-muted-foreground">{record.date} • {record.location}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{record.quantity} {record.unit}</p>
                <Badge variant="outline" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {record.certificate}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// AI Analysis Panel
function AIAnalysisPanel() {
  const { isLoading, chat, checkCompliance } = useESGWasteAI();
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    toast.loading("Analisando dados de resíduos...");
    const result = await checkCompliance({
      tanks: [
        { name: "Óleo Usado", level: 64, status: "warning" },
        { name: "Água de Porão", level: 93, status: "critical" },
      ],
      compliance: {
        marpol: true,
        orbEntries: 45,
        grbEntries: 32
      }
    });
    
    if (result) {
      setAnalysis(result);
      toast.success("Análise concluída");
    }
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Análise IA - MARPOL
        </CardTitle>
        <CardDescription>Inteligência artificial para conformidade ambiental</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4 text-emerald-500" />
              Score ESG
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">87/100</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown className="h-4 w-4 text-primary" />
              Redução CO₂
            </div>
            <p className="text-2xl font-bold text-primary mt-1">-12%</p>
          </div>
        </div>

        {analysis ? (
          <div className="p-3 rounded-lg border bg-muted/50">
            <p className="text-sm">{analysis}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">Previsão de Descarte</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Água de porão atingirá 95% em ~48h. Recomendo agendar descarte.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Alerta de Conformidade</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Próxima entrada ORB pendente há 6 dias. Prazo máximo: 3 dias.
              </p>
            </div>
          </div>
        )}

        <Button 
          className="w-full gap-2" 
          variant="outline"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          <Brain className="h-4 w-4" />
          {isLoading ? "Analisando..." : "Análise Completa IA"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WasteCommandCenter() {
  const { tanks, records, criticalTanks, warningTanks, isLoading, refetch } = useWasteManagementData();

  const handleNewORBEntry = () => {
    toast.success("Abrindo Oil Record Book para nova entrada");
  };

  const handleNewGRBEntry = () => {
    toast.success("Abrindo Garbage Record Book para nova entrada");
  };

  const handleScheduleDischarge = () => {
    toast.info("Abrindo agendamento de descarte em porto");
  };

  return (
    <div className="space-y-6">
      {/* Command Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">MARPOL</p>
                  <p className="text-2xl font-bold text-success">100%</p>
                  <p className="text-xs">Conforme</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tanques</p>
                  <p className="text-2xl font-bold">{tanks.length}</p>
                  <p className="text-xs">Monitorados</p>
                </div>
                <Droplets className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Atenção</p>
                  <p className="text-2xl font-bold text-warning">{warningTanks}</p>
                  <p className="text-xs">&gt;60% cap.</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Crítico</p>
                  <p className="text-2xl font-bold text-destructive">{criticalTanks}</p>
                  <p className="text-xs">Urgente</p>
                </div>
                <Gauge className="h-8 w-8 text-destructive opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">ESG Score</p>
                  <p className="text-2xl font-bold text-emerald-600">87</p>
                  <p className="text-xs">Excelente</p>
                </div>
                <Leaf className="h-8 w-8 text-emerald-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Descartes</p>
                  <p className="text-2xl font-bold text-purple-600">{records.length}</p>
                  <p className="text-xs">Este mês</p>
                </div>
                <Recycle className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tanks Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Níveis dos Tanques em Tempo Real
                  </CardTitle>
                  <CardDescription>Monitoramento contínuo via IoT</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  <Activity className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tanks.map((tank) => (
                  <Tank3D key={tank.id} tank={tank} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        <AIAnalysisPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Ações Rápidas MARPOL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3 h-12" variant="outline" onClick={handleNewORBEntry}>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Nova Entrada ORB</p>
                <p className="text-xs text-muted-foreground">Oil Record Book - Anexo I</p>
              </div>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline" onClick={handleNewGRBEntry}>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Trash2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Nova Entrada GRB</p>
                <p className="text-xs text-muted-foreground">Garbage Record Book - Anexo V</p>
              </div>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline" onClick={handleScheduleDischarge}>
              <div className="p-2 rounded-lg bg-warning/10">
                <MapPin className="h-4 w-4 text-warning" />
              </div>
              <div className="text-left">
                <p className="font-medium">Agendar Descarte em Porto</p>
                <p className="text-xs text-muted-foreground">Coordenar com terminal</p>
              </div>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Signature className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Assinatura do Comandante</p>
                <p className="text-xs text-muted-foreground">Validação digital de registros</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Discharges Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Histórico de Descartes
              </CardTitle>
              <Button size="sm" variant="ghost">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <DischargeTimeline records={records} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* MARPOL Annexes Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Status de Conformidade MARPOL por Anexo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { annex: "Anexo I", title: "Óleo", desc: "Prevenção de Poluição por Óleo", status: "compliant", orbEntries: 45, lastEntry: "2026-02-01" },
              { annex: "Anexo II", title: "NLS", desc: "Substâncias Líquidas Nocivas", status: "na", entries: 0, lastEntry: "-" },
              { annex: "Anexo IV", title: "Esgoto", desc: "Esgoto de Navios", status: "compliant", entries: 12, lastEntry: "2026-01-28" },
              { annex: "Anexo V", title: "Lixo", desc: "Lixo de Navios", status: "compliant", grbEntries: 32, lastEntry: "2026-02-02" },
              { annex: "Anexo VI", title: "Ar", desc: "Poluição Atmosférica", status: "compliant", entries: 8, lastEntry: "2026-01-30" },
            ].map((item) => (
              <motion.div 
                key={item.annex}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  item.status === "compliant" ? "hover:border-success hover:bg-success/5" :
                  item.status === "na" ? "hover:border-muted" : "hover:border-destructive hover:bg-destructive/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={item.status === "compliant" ? "default" : item.status === "na" ? "secondary" : "destructive"}>
                    {item.annex}
                  </Badge>
                  {item.status === "compliant" && <CheckCircle2 className="h-4 w-4 text-success" />}
                </div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {item.status === "compliant" ? `Última: ${item.lastEntry}` : "N/A"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
