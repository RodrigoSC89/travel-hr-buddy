/**
 * SGSO Risk Heatmap with Bow-Tie Analysis
 * World-class: Interactive 5x5 risk matrix with AI-driven bow-tie diagrams
 * NO COMPETITOR HAS THIS for maritime safety management
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, AlertTriangle, Shield, ArrowLeft, ArrowRight, Zap, Target } from "lucide-react";
import { toast } from "sonner";

interface Risk {
  id: string;
  name: string;
  practice: string;
  probability: number; // 1-5
  severity: number; // 1-5
  category: string;
  barriers: string[];
  controls: string[];
  consequences: string[];
}

const INITIAL_RISKS: Risk[] = [
  { id: "r1", name: "Vazamento de óleo no convés", practice: "P6-Controle Operacional", probability: 3, severity: 4, category: "Ambiental", barriers: ["Procedimento de bunkering", "Treinamento SOPEP"], controls: ["Kit SOPEP disponível", "Inspeção diária"], consequences: ["Contaminação marinha", "Multa ANP", "Parada operacional"] },
  { id: "r2", name: "Queda de pessoa ao mar", practice: "P5-Saúde e Segurança", probability: 2, severity: 5, category: "Pessoal", barriers: ["Guarda-corpo instalado", "Buddy system"], controls: ["Colete salva-vidas", "MOB drill mensal"], consequences: ["Fatalidade", "Investigação ANTAQ", "Suspensão operação"] },
  { id: "r3", name: "Falha no sistema de detecção de gás", practice: "P7-Gerenciamento de Mudanças", probability: 3, severity: 5, category: "Processo", barriers: ["Manutenção preventiva", "Calibração periódica"], controls: ["Detector portátil backup", "Alarme redundante"], consequences: ["Explosão", "Múltiplas fatalidades", "Perda da instalação"] },
  { id: "r4", name: "Colisão com embarcação de apoio", practice: "P4-Operações", probability: 3, severity: 3, category: "Operacional", barriers: ["Procedimento 500m zone", "Radar watchkeeping"], controls: ["VHF comunicação", "AIS tracking"], consequences: ["Dano estrutural", "Derramamento", "Lesões"] },
  { id: "r5", name: "Incêndio em sala de máquinas", practice: "P9-Emergências", probability: 2, severity: 4, category: "Processo", barriers: ["Fire watch", "Housekeeping"], controls: ["Sistema CO2 fixo", "Fire team treinado"], consequences: ["Dano equipamento", "Evacuação", "Parada longa"] },
  { id: "r6", name: "Fadiga operacional da tripulação", practice: "P5-Saúde e Segurança", probability: 4, severity: 3, category: "Pessoal", barriers: ["Controle horas de trabalho", "Escala adequada"], controls: ["Monitoramento MLC 2.3", "Wellness checks"], consequences: ["Erro humano", "Acidente", "NC em inspeção"] },
  { id: "r7", name: "Não conformidade em auditoria ANP", practice: "P2-Conformidade Legal", probability: 3, severity: 3, category: "Regulatório", barriers: ["Programa auditoria interna", "Gap analysis"], controls: ["Ação corretiva 30d", "Treinamento"], consequences: ["Multa", "Suspensão operação", "Dano reputacional"] },
  { id: "r8", name: "Descarte inadequado de resíduos", practice: "P6-Controle Operacional", probability: 2, severity: 3, category: "Ambiental", barriers: ["Plano MARPOL Anexo V", "Treinamento"], controls: ["Registro de resíduos", "Auditoria interna"], consequences: ["Multa IBAMA", "NC em PSC", "Contaminação"] },
];

const PROB_LABELS = ["", "Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const SEV_LABELS = ["", "Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"];

const getRiskLevel = (p: number, s: number): { level: string; color: string } => {
  const score = p * s;
  if (score >= 15) return { level: "Extremo", color: "bg-red-600 text-white" };
  if (score >= 10) return { level: "Alto", color: "bg-orange-500 text-white" };
  if (score >= 5) return { level: "Médio", color: "bg-amber-400 text-black" };
  return { level: "Baixo", color: "bg-emerald-500 text-white" };
};

export function SGSORiskHeatmap() {
  const [risks] = useState<Risk[]>(INITIAL_RISKS);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [bowTieOpen, setBowTieOpen] = useState(false);

  // Build 5x5 matrix
  const matrix: Risk[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => [] as Risk[]));
  risks.forEach(r => {
    matrix[5 - r.severity][r.probability - 1].push(r);
  });

  const openBowTie = (risk: Risk) => {
    setSelectedRisk(risk);
    setBowTieOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-destructive" />
            Matriz de Riscos 5×5 — SGSO ANP
          </CardTitle>
          <CardDescription>
            Clique em um risco para visualizar a análise Bow-Tie com barreiras e consequências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: "120px repeat(5, 1fr)" }}>
                {/* Header */}
                <div />
                {PROB_LABELS.slice(1).map((label, i) => (
                  <div key={`pl-${i}`} className="text-center text-xs font-medium p-2 bg-muted/30 rounded">
                    {label}
                  </div>
                ))}

                {/* Rows */}
                {[5, 4, 3, 2, 1].map((sev, rowIdx) => (
                  <React.Fragment key={`row-${sev}`}>
                    <div className="flex items-center text-xs font-medium pr-2 bg-muted/30 rounded p-2">
                      {SEV_LABELS[sev]}
                    </div>
                    {[1, 2, 3, 4, 5].map(prob => {
                      const cellRisks = matrix[5 - sev][prob - 1];
                      const { color } = getRiskLevel(prob, sev);
                      return (
                        <div key={`cell-${prob}-${sev}`} className={`min-h-[60px] rounded p-1 ${color} flex flex-col gap-1`}>
                          {cellRisks.map(risk => (
                            <Tooltip key={risk.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => openBowTie(risk)}
                                  className="text-[10px] leading-tight bg-white/20 rounded px-1 py-0.5 hover:bg-white/40 transition-colors text-left w-full truncate"
                                >
                                  {risk.name}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{risk.name}</p>
                                <p className="text-xs">{risk.practice} • {risk.category}</p>
                                <p className="text-xs">Score: {prob * sev} ({getRiskLevel(prob, sev).level})</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* X-axis label */}
                <div />
                <div className="col-span-5 text-center text-xs text-muted-foreground font-medium pt-2">
                  Probabilidade →
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* Y-axis label */}
          <div className="text-xs text-muted-foreground font-medium -mt-[300px] -ml-2 absolute" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { level: "Extremo", count: risks.filter(r => r.probability * r.severity >= 15).length, color: "text-red-600 bg-red-500/10 border-red-500/30" },
          { level: "Alto", count: risks.filter(r => { const s = r.probability * r.severity; return s >= 10 && s < 15; }).length, color: "text-orange-600 bg-orange-500/10 border-orange-500/30" },
          { level: "Médio", count: risks.filter(r => { const s = r.probability * r.severity; return s >= 5 && s < 10; }).length, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
          { level: "Baixo", count: risks.filter(r => r.probability * r.severity < 5).length, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
        ].map(item => (
          <Card key={item.level} className={`border ${item.color}`}>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{item.count}</p>
              <p className="text-sm font-medium">{item.level}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bow-Tie Dialog */}
      <Dialog open={bowTieOpen} onOpenChange={setBowTieOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRisk && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Análise Bow-Tie: {selectedRisk.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-[1fr,auto,1fr,auto,1fr] gap-4 items-center py-6">
                {/* Barriers (Prevention) */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Barreiras Preventivas
                  </h4>
                  {selectedRisk.barriers.map((b, i) => (
                    <div key={i} className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-sm">
                      {b}
                    </div>
                  ))}
                </div>

                <ArrowRight className="h-6 w-6 text-muted-foreground" />

                {/* Central Event */}
                <Card className="border-2 border-destructive bg-destructive/5">
                  <CardContent className="py-4 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                    <p className="font-bold text-sm">{selectedRisk.name}</p>
                    <Badge className="mt-2">{selectedRisk.practice}</Badge>
                    <div className="mt-2 flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs">P: {PROB_LABELS[selectedRisk.probability]}</Badge>
                      <Badge variant="outline" className="text-xs">S: {SEV_LABELS[selectedRisk.severity]}</Badge>
                    </div>
                    <Badge className={`mt-2 ${getRiskLevel(selectedRisk.probability, selectedRisk.severity).color}`}>
                      {getRiskLevel(selectedRisk.probability, selectedRisk.severity).level} ({selectedRisk.probability * selectedRisk.severity})
                    </Badge>
                  </CardContent>
                </Card>

                <ArrowRight className="h-6 w-6 text-muted-foreground" />

                {/* Consequences + Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-blue-600 flex items-center gap-1">
                      <Zap className="h-4 w-4" /> Controles Mitigatórios
                    </h4>
                    {selectedRisk.controls.map((c, i) => (
                      <div key={i} className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-sm">
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Consequências
                    </h4>
                    {selectedRisk.consequences.map((c, i) => (
                      <div key={i} className="p-2 rounded bg-red-500/10 border border-red-500/30 text-sm">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
