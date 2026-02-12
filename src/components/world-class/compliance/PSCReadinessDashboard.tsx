/**
 * PSC Readiness Dashboard - Port State Control inspection preparation with AI briefings
 * Uses psc_inspections table with proper error handling and KPI overview
 */
import { useState } from "react";
import { usePSCPrediction } from "@/hooks/usePSCPrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Brain, Shield, AlertTriangle, FileText, CheckCircle, CalendarDays, ShipWheel, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function PSCReadinessDashboard() {
  const { inspections, isLoading, isError, errorMsg, createInspection, generateBriefing } = usePSCPrediction();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [portName, setPortName] = useState("");
  const [country, setCountry] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: vessels } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name");
      return data || [];
    },
  });

  const handleCreate = async () => {
    if (!selectedVessel || !portName || !country) return;
    await createInspection.mutateAsync({
      vessel_id: selectedVessel,
      port_name: portName,
      country: country,
      inspection_date: inspectionDate || undefined,
    });
    setIsOpen(false);
    setSelectedVessel("");
    setPortName("");
    setCountry("");
    setInspectionDate("");
  };

  const riskColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 60) return "text-warning";
    return "text-destructive";
  };

  const riskBg = (score: number) => {
    if (score <= 30) return "bg-success/10 border-success/20";
    if (score <= 60) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  // KPI calculations
  const totalInspections = inspections.length;
  const scheduledCount = inspections.filter(i => i.status === "scheduled").length;
  const completedCount = inspections.filter(i => i.status === "completed").length;
  const avgRisk = totalInspections > 0
    ? Math.round(inspections.reduce((s, i) => s + i.detention_risk_score, 0) / totalInspections)
    : 0;
  const withBriefing = inspections.filter(i => i.ai_briefing).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            PSC Readiness & AI Briefing
          </h2>
          <p className="text-sm text-muted-foreground">Preparação inteligente para inspeções Port State Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Agendar Inspeção</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Inspeção PSC</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Embarcação</Label>
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger><SelectValue placeholder="Selecionar embarcação..." /></SelectTrigger>
                  <SelectContent>
                    {(vessels || []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Porto</Label>
                <Input value={portName} onChange={e => setPortName(e.target.value)} placeholder="Ex: Rotterdam" />
              </div>
              <div>
                <Label>País</Label>
                <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Ex: Netherlands" />
              </div>
              <div>
                <Label>Data da Inspeção (opcional)</Label>
                <Input type="date" value={inspectionDate} onChange={e => setInspectionDate(e.target.value)} />
              </div>
              <Button onClick={handleCreate} disabled={createInspection.isPending || !selectedVessel || !portName || !country} className="w-full">
                {createInspection.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Agendando...</> : "Agendar Inspeção"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShipWheel className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Inspeções</p>
                <p className="text-2xl font-bold">{totalInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-8 w-8 ${avgRisk > 60 ? "text-destructive" : avgRisk > 30 ? "text-warning" : "text-success"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Risco Médio</p>
                <p className="text-2xl font-bold">{avgRisk}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Briefings AI</p>
                <p className="text-2xl font-bold">{withBriefing}/{totalInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Erro ao carregar inspeções PSC</p>
            <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      {/* Inspections List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <Card key={`psc-skeleton-${i}`}><CardContent className="p-6 h-24 animate-pulse bg-muted/30" /></Card>)}</div>
      ) : inspections.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma inspeção PSC agendada</p>
            <p className="text-sm">Agende uma inspeção para gerar briefings AI</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp, i) => (
            <motion.div key={insp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-sm">{insp.vessel_name || "Embarcação"}</h3>
                      <span className="text-xs text-muted-foreground">{insp.port_name}, {insp.country}</span>
                      {insp.inspection_date && (
                        <span className="text-xs text-muted-foreground">
                          📅 {format(new Date(insp.inspection_date), "dd/MM/yyyy")}
                        </span>
                      )}
                      <Badge variant={insp.status === "completed" ? "default" : "secondary"}>
                        {insp.status === "scheduled" ? "Agendada" : insp.status === "completed" ? "Concluída" : insp.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {insp.detention_risk_score > 0 && (
                        <div className={`px-2 py-1 rounded text-xs font-bold border ${riskBg(insp.detention_risk_score)}`}>
                          <span className={riskColor(insp.detention_risk_score)}>
                            Risco: {insp.detention_risk_score}%
                          </span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateBriefing.mutate(insp.id)}
                        disabled={generateBriefing.isPending}
                      >
                        {generateBriefing.isPending ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Gerando...</>
                        ) : (
                          <><Brain className="h-3 w-3 mr-1" />{insp.ai_briefing ? "Atualizar Briefing" : "Gerar Briefing AI"}</>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === insp.id ? null : insp.id)}>
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Risk bar */}
                  {insp.detention_risk_score > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground w-20">Detenção</span>
                      <Progress value={insp.detention_risk_score} className="h-2 flex-1" />
                      <span className={`text-xs font-medium ${riskColor(insp.detention_risk_score)}`}>
                        {insp.detention_risk_score}%
                      </span>
                    </div>
                  )}

                  {expandedId === insp.id && insp.ai_briefing && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-3">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <h4 className="font-medium text-sm text-primary mb-2 flex items-center gap-1">
                          <Brain className="h-4 w-4" /> Briefing AI
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{insp.ai_briefing}</p>
                      </div>

                      {insp.predicted_deficiencies?.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <h4 className="font-medium text-sm text-amber-500 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Deficiências Previstas ({insp.predicted_deficiencies.length})
                          </h4>
                          <ul className="space-y-1">
                            {insp.predicted_deficiencies.map((d, idx: number) => (
                              <li key={`def-${idx}-${typeof d === "string" ? d.slice(0, 10) : idx}`} className="text-xs flex items-start gap-1">
                                <span className="text-warning mt-0.5">•</span>
                                {typeof d === "string" ? d : (d as Record<string, string>)?.description || JSON.stringify(d)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {insp.preparation_checklist?.length > 0 && (
                        <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                          <h4 className="font-medium text-sm text-success mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Checklist de Preparação ({insp.preparation_checklist.length})
                          </h4>
                          <ul className="space-y-1">
                            {insp.preparation_checklist.map((item, idx: number) => (
                              <li key={`chk-${idx}-${typeof item === "string" ? item.slice(0, 10) : idx}`} className="text-xs flex items-start gap-1">
                                <span className="text-success mt-0.5">☐</span>
                                {typeof item === "string" ? item : (item as Record<string, string>)?.description || JSON.stringify(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
