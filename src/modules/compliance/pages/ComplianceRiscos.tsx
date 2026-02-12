/**
 * Compliance Risks - Risk Matrix & Management
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, Filter, Grid3X3 } from "lucide-react";
import { useComplianceRisks, useCreateComplianceRisk } from "../hooks/useComplianceData";
import type { ComplianceRisk } from "../types";

const RISK_CATEGORIES = [
  "Operacional", "Financeiro", "Legal", "Reputacional", 
  "Ambiental", "Trabalhista", "LGPD", "Marítimo"
];

const DEPARTMENTS = [
  "Geral", "Operações", "RH", "Financeiro", "TI", 
  "Jurídico", "Qualidade", "Segurança"
];

export default function ComplianceRiscos() {
  const { data: risks = [], isLoading } = useComplianceRisks();
  const createRisk = useCreateComplianceRisk();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [newRisk, setNewRisk] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    probability: 3,
    impact: 3,
    control_description: "",
    mitigation_plan: "",
  });

  const filteredRisks = filterStatus === "all" 
    ? risks 
    : risks.filter((r) => r.status === filterStatus);

  const handleCreateRisk = async () => {
    await createRisk.mutateAsync({
      ...newRisk,
      status: "open",
    });
    setIsDialogOpen(false);
    setNewRisk({
      title: "",
      description: "",
      category: "",
      department: "",
      probability: 3,
      impact: 3,
      control_description: "",
      mitigation_plan: "",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      default: return "bg-success text-success-foreground";
    }
  };

  // Risk Matrix Data
  const matrixData: Record<string, ComplianceRisk[]> = {};
  for (let p = 5; p >= 1; p--) {
    for (let i = 1; i <= 5; i++) {
      const key = `${p}-${i}`;
      matrixData[key] = risks.filter((r) => r.probability === p && r.impact === i);
    }
  }

  const getMatrixCellColor = (p: number, i: number) => {
    const score = p * i;
    if (score >= 20) return "bg-destructive/80";
    if (score >= 12) return "bg-warning/80";
    if (score >= 6) return "bg-accent/80";
    return "bg-success/80";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Matriz de Riscos
          </h1>
          <p className="text-muted-foreground">
            Gestão de riscos e controles internos
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="mitigated">Mitigados</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Risco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Risco</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Título do Risco</Label>
                  <Input
                    value={newRisk.title}
                    onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                    placeholder="Descreva o risco identificado"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                    placeholder="Detalhes do risco e contexto"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select value={newRisk.category} onValueChange={(v) => setNewRisk({ ...newRisk, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Departamento</Label>
                    <Select value={newRisk.department} onValueChange={(v) => setNewRisk({ ...newRisk, department: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Probabilidade (1-5)</Label>
                    <Select 
                      value={String(newRisk.probability)} 
                      onValueChange={(v) => setNewRisk({ ...newRisk, probability: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Muito Baixa</SelectItem>
                        <SelectItem value="2">2 - Baixa</SelectItem>
                        <SelectItem value="3">3 - Média</SelectItem>
                        <SelectItem value="4">4 - Alta</SelectItem>
                        <SelectItem value="5">5 - Muito Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Impacto (1-5)</Label>
                    <Select 
                      value={String(newRisk.impact)} 
                      onValueChange={(v) => setNewRisk({ ...newRisk, impact: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Insignificante</SelectItem>
                        <SelectItem value="2">2 - Menor</SelectItem>
                        <SelectItem value="3">3 - Moderado</SelectItem>
                        <SelectItem value="4">4 - Maior</SelectItem>
                        <SelectItem value="5">5 - Catastrófico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Controle Existente</Label>
                  <Textarea
                    value={newRisk.control_description}
                    onChange={(e) => setNewRisk({ ...newRisk, control_description: e.target.value })}
                    placeholder="Descreva os controles já existentes"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Plano de Mitigação</Label>
                  <Textarea
                    value={newRisk.mitigation_plan}
                    onChange={(e) => setNewRisk({ ...newRisk, mitigation_plan: e.target.value })}
                    placeholder="Ações para mitigar o risco"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateRisk} disabled={!newRisk.title || createRisk.isPending}>
                    {createRisk.isPending ? "Salvando..." : "Registrar Risco"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Matriz de Riscos (Probabilidade x Impacto)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-medium text-muted-foreground">Prob.</th>
                  <th className="p-2 text-xs font-medium">1 - Insignificante</th>
                  <th className="p-2 text-xs font-medium">2 - Menor</th>
                  <th className="p-2 text-xs font-medium">3 - Moderado</th>
                  <th className="p-2 text-xs font-medium">4 - Maior</th>
                  <th className="p-2 text-xs font-medium">5 - Catastrófico</th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((p) => (
                  <tr key={p}>
                    <td className="p-2 text-xs font-medium border text-center">{p}</td>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const cellRisks = matrixData[`${p}-${i}`] || [];
                      return (
                        <td 
                          key={`${p}-${i}`} 
                          className={`p-2 border ${getMatrixCellColor(p, i)} min-w-24 h-16 align-top`}
                        >
                          {cellRisks.length > 0 && (
                            <div className="text-xs text-white font-medium">
                              {cellRisks.length} risco(s)
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-success rounded" />
              <span>Baixo (1-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-accent rounded" />
              <span>Médio (6-11)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-warning rounded" />
              <span>Alto (12-19)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-destructive rounded" />
              <span>Crítico (20-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Riscos ({filteredRisks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : filteredRisks.length > 0 ? (
            <div className="space-y-3">
              {filteredRisks.map((risk) => (
                <div 
                  key={risk.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{risk.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                      <div className="flex gap-2 mt-2">
                        {risk.category && <Badge variant="outline">{risk.category}</Badge>}
                        {risk.department && <Badge variant="secondary">{risk.department}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getRiskColor(risk.risk_level)}>
                        Score: {risk.risk_score}
                      </Badge>
                      <Badge variant={risk.status === "open" ? "destructive" : "default"}>
                        {risk.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhum risco encontrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
