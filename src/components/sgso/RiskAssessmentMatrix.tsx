import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, TrendingUp, Shield, Activity, Plus, FileText } from "lucide-react";

interface Risk {
  id: string;
  title: string;
  description?: string;
  category: string;
  probability: number;
  impact: number;
  riskLevel: "negligible" | "low" | "medium" | "high" | "critical";
  riskScore: number;
  mitigation?: string;
}

const DEFAULT_RISKS: Risk[] = [
  { id: "1", title: "Falha DP em operação crítica", category: "operational", probability: 2, impact: 5, riskLevel: "high", riskScore: 10 },
  { id: "2", title: "Vazamento de óleo", category: "environmental", probability: 3, impact: 4, riskLevel: "medium", riskScore: 12 },
  { id: "3", title: "Acidente com tripulante", category: "health_safety", probability: 2, impact: 4, riskLevel: "medium", riskScore: 8 },
  { id: "4", title: "Falha sistema contraincêndio", category: "operational", probability: 4, impact: 5, riskLevel: "critical", riskScore: 20 },
];

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-600 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-primary text-primary-foreground",
    negligible: "bg-green-600 text-white"
  };
  return colors[level] || "bg-muted";
};

const getRiskLevelLabel = (level: string) => {
  const labels: Record<string, string> = { critical: "Crítico", high: "Alto", medium: "Médio", low: "Baixo", negligible: "Negligível" };
  return labels[level] || level;
};

const calculateRiskLevel = (probability: number, impact: number): string => {
  const score = probability * impact;
  if (score >= 20) return "critical";
  if (score >= 15) return "high";
  if (score >= 8) return "medium";
  if (score >= 4) return "low";
  return "negligible";
};

export const RiskAssessmentMatrix: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>(DEFAULT_RISKS);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewRiskOpen, setIsNewRiskOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [newRisk, setNewRisk] = useState({ title: "", description: "", category: "operational", probability: 3, impact: 3, mitigation: "" });
  const { toast } = useToast();

  const handleViewDetails = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDetailsOpen(true);
  };

  const handleCreateRisk = () => {
    if (!newRisk.title.trim()) {
      toast({ title: "⚠️ Atenção", description: "Informe o título do risco", variant: "destructive" });
      return;
    }
    const riskLevel = calculateRiskLevel(newRisk.probability, newRisk.impact);
    const riskScore = newRisk.probability * newRisk.impact;
    const created: Risk = {
      id: crypto.randomUUID(),
      title: newRisk.title,
      description: newRisk.description,
      category: newRisk.category,
      probability: newRisk.probability,
      impact: newRisk.impact,
      riskLevel: riskLevel as Risk["riskLevel"],
      riskScore,
      mitigation: newRisk.mitigation
    };
    setRisks(prev => [...prev, created]);
    toast({ title: "✅ Risco Registrado", description: "Novo risco adicionado à matriz" });
    setIsNewRiskOpen(false);
    setNewRisk({ title: "", description: "", category: "operational", probability: 3, impact: 3, mitigation: "" });
  };

  const handleExportPDF = async () => {
    toast({ title: "📄 Exportando PDF", description: "Gerando relatório..." });
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Matriz de Riscos SGSO", 20, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 30);
      let y = 45;
      risks.forEach((risk, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${idx + 1}. ${risk.title} - ${getRiskLevelLabel(risk.riskLevel)} (Score: ${risk.riskScore})`, 20, y);
        y += 10;
      });
      doc.save(`matriz-riscos-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "✅ PDF Exportado" });
    } catch { toast({ title: "❌ Erro ao gerar PDF", variant: "destructive" }); }
  };

  const criticalCount = risks.filter(r => r.riskLevel === "critical").length;
  const highCount = risks.filter(r => r.riskLevel === "high").length;
  const mediumCount = risks.filter(r => r.riskLevel === "medium").length;
  const probabilityLabels = ["Muito Baixa (1)", "Baixa (2)", "Média (3)", "Alta (4)", "Muito Alta (5)"];
  const impactLabels = ["Insignificante (1)", "Menor (2)", "Moderado (3)", "Maior (4)", "Catastrófico (5)"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/10 border-destructive/30"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-destructive">Críticos</p><p className="text-2xl font-bold">{criticalCount}</p></div><AlertTriangle className="h-8 w-8 text-destructive opacity-70" /></div></CardContent></Card>
        <Card className="bg-orange-100 border-orange-300"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-orange-700">Altos</p><p className="text-2xl font-bold">{highCount}</p></div><TrendingUp className="h-8 w-8 text-orange-600 opacity-70" /></div></CardContent></Card>
        <Card className="bg-yellow-100 border-yellow-300"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-yellow-700">Médios</p><p className="text-2xl font-bold">{mediumCount}</p></div><Activity className="h-8 w-8 text-yellow-600 opacity-70" /></div></CardContent></Card>
        <Card className="bg-primary/10 border-primary/30"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-primary">Total</p><p className="text-2xl font-bold">{risks.length}</p></div><Shield className="h-8 w-8 text-primary opacity-70" /></div></CardContent></Card>
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Matriz de Riscos 5x5</CardTitle><CardDescription>Probabilidade x Impacto</CardDescription></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}><FileText className="h-4 w-4 mr-1" />PDF</Button>
            <Button size="sm" onClick={() => setIsNewRiskOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Risco</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-1 p-2 bg-muted rounded-lg min-w-[600px]">
              <div className="p-2 text-xs font-bold text-center bg-background rounded">P↓ / I→</div>
              {impactLabels.map((l, i) => <div key={i} className="p-2 text-xs font-medium text-center bg-primary/10 rounded">{l}</div>)}
              {[5,4,3,2,1].map(prob => (
                <React.Fragment key={prob}>
                  <div className="p-2 text-xs font-medium text-center bg-primary/10 rounded">{probabilityLabels[prob-1]}</div>
                  {[1,2,3,4,5].map(imp => {
                    const level = calculateRiskLevel(prob, imp);
                    const score = prob * imp;
                    const count = risks.filter(r => r.probability === prob && r.impact === imp).length;
                    return (
                      <div key={`${prob}-${imp}`} className={`p-2 rounded text-center cursor-pointer hover:opacity-80 ${getRiskColor(level)} relative min-h-[60px] flex flex-col items-center justify-center`}>
                        <span className="font-bold">{score}</span>
                        <span className="text-xs">{getRiskLevelLabel(level)}</span>
                        {count > 0 && <Badge className="absolute top-1 right-1 bg-background text-foreground text-xs">{count}</Badge>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <Card>
        <CardHeader><CardTitle>Riscos Identificados</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {risks.sort((a, b) => b.riskScore - a.riskScore).map(risk => (
            <Card key={risk.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Badge className={getRiskColor(risk.riskLevel)}>{getRiskLevelLabel(risk.riskLevel)}</Badge><span className="font-medium">{risk.title}</span></div>
                  <div className="text-sm text-muted-foreground">P: {risk.probability}/5 • I: {risk.impact}/5 • Score: {risk.riskScore}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(risk)}>Detalhes</Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Risco</DialogTitle></DialogHeader>
          {selectedRisk && (
            <div className="space-y-3">
              <p><strong>Título:</strong> {selectedRisk.title}</p>
              <p><strong>Categoria:</strong> {selectedRisk.category}</p>
              <p><strong>Nível:</strong> {getRiskLevelLabel(selectedRisk.riskLevel)} (Score: {selectedRisk.riskScore})</p>
              <p><strong>Probabilidade:</strong> {selectedRisk.probability}/5</p>
              <p><strong>Impacto:</strong> {selectedRisk.impact}/5</p>
              {selectedRisk.description && <p><strong>Descrição:</strong> {selectedRisk.description}</p>}
              {selectedRisk.mitigation && <p><strong>Mitigação:</strong> {selectedRisk.mitigation}</p>}
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsDetailsOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Risk Dialog */}
      <Dialog open={isNewRiskOpen} onOpenChange={setIsNewRiskOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Registro de Risco</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={newRisk.title} onChange={e => setNewRisk(p => ({...p, title: e.target.value}))} /></div>
            <div><Label>Descrição</Label><Textarea value={newRisk.description} onChange={e => setNewRisk(p => ({...p, description: e.target.value}))} /></div>
            <div><Label>Categoria</Label><Select value={newRisk.category} onValueChange={v => setNewRisk(p => ({...p, category: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="operational">Operacional</SelectItem><SelectItem value="environmental">Ambiental</SelectItem><SelectItem value="health_safety">Saúde/Segurança</SelectItem><SelectItem value="financial">Financeiro</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Probabilidade (1-5)</Label><Input type="number" min={1} max={5} value={newRisk.probability} onChange={e => setNewRisk(p => ({...p, probability: parseInt(e.target.value) || 3}))} /></div>
              <div><Label>Impacto (1-5)</Label><Input type="number" min={1} max={5} value={newRisk.impact} onChange={e => setNewRisk(p => ({...p, impact: parseInt(e.target.value) || 3}))} /></div>
            </div>
            <div><Label>Mitigação</Label><Textarea value={newRisk.mitigation} onChange={e => setNewRisk(p => ({...p, mitigation: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsNewRiskOpen(false)}>Cancelar</Button><Button onClick={handleCreateRisk}>Registrar Risco</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskAssessmentMatrix;
