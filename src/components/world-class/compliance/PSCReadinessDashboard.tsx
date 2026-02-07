/**
 * PSC Readiness Dashboard - Port State Control inspection preparation with AI briefings
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Brain, Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PSCReadinessDashboard() {
  const { inspections, isLoading, createInspection, generateBriefing } = usePSCPrediction();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [portName, setPortName] = useState("");
  const [country, setCountry] = useState("");
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
    });
    setIsOpen(false);
    setSelectedVessel("");
    setPortName("");
    setCountry("");
  };

  const riskColor = (score: number) => {
    if (score <= 30) return "text-emerald-600";
    if (score <= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    {(vessels || []).map((v: any) => (
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
              <Button onClick={handleCreate} disabled={createInspection.isPending} className="w-full">
                {createInspection.isPending ? "Agendando..." : "Agendar Inspeção"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inspections List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <Card key={i}><CardContent className="p-6 h-24 animate-pulse bg-muted/30" /></Card>)}</div>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-sm">{insp.vessel_name || "Embarcação"}</h3>
                      <span className="text-xs text-muted-foreground">{insp.port_name}, {insp.country}</span>
                      <Badge variant={insp.status === "completed" ? "default" : "secondary"}>
                        {insp.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {insp.detention_risk_score > 0 && (
                        <span className={`text-sm font-bold ${riskColor(insp.detention_risk_score)}`}>
                          Risco: {insp.detention_risk_score}%
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateBriefing.mutate(insp.id)}
                        disabled={generateBriefing.isPending}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        {insp.ai_briefing ? "Atualizar Briefing" : "Gerar Briefing AI"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === insp.id ? null : insp.id)}>
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

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
                          <h4 className="font-medium text-sm text-amber-700 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Deficiências Previstas
                          </h4>
                          <ul className="space-y-1">
                            {insp.predicted_deficiencies.map((d: any, idx: number) => (
                              <li key={idx} className="text-xs flex items-start gap-1">
                                <span className="text-amber-600 mt-0.5">•</span>
                                {typeof d === "string" ? d : d.description || JSON.stringify(d)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {insp.preparation_checklist?.length > 0 && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <h4 className="font-medium text-sm text-emerald-700 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Checklist de Preparação
                          </h4>
                          <ul className="space-y-1">
                            {insp.preparation_checklist.map((item: any, idx: number) => (
                              <li key={idx} className="text-xs flex items-start gap-1">
                                <span className="text-emerald-600 mt-0.5">☐</span>
                                {typeof item === "string" ? item : item.description || JSON.stringify(item)}
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
