import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  FileText,
  Package,
  TrendingUp,
  Clock,
  XCircle
} from "lucide-react";
import { 
  getVesselInspections, 
  getDeficiencies, 
  calculateRiskScore,
  generatePDFPackage,
  generateZIPPackage,
  exportInspectionsCSV,
  type PSCInspection, 
  type PSCDeficiency 
} from "@/lib/psc";
import { toast } from "sonner";

const severityColors: Record<string, string> = {
  observation: "bg-blue-500/20 text-blue-600",
  deficiency: "bg-yellow-500/20 text-yellow-600",
  detainable: "bg-red-500/20 text-red-600"
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/20 text-red-600",
  in_progress: "bg-yellow-500/20 text-yellow-600",
  corrected: "bg-green-500/20 text-green-600",
  verified: "bg-blue-500/20 text-blue-600",
  closed: "bg-gray-500/20 text-gray-600"
};

export const PSCPackagePanel: React.FC = () => {
  const [inspections, setInspections] = useState<PSCInspection[]>([]);
  const [deficiencies, setDeficiencies] = useState<PSCDeficiency[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<PSCInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use empty vessel ID to get all inspections
      const insp = await getVesselInspections("").catch(() => [] as PSCInspection[]);
      const def = await getDeficiencies("").catch(() => [] as PSCDeficiency[]);
      setInspections(insp);
      setDeficiencies(def);
      
      // Calculate risk score using fetched data
      const score = calculateRiskScore(insp, def);
      setRiskScore(score);
    } catch (error) {
      console.error("Error loading PSC data:", error);
      toast.error("Erro ao carregar dados PSC");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePackage = async (format: "pdf" | "zip" | "csv") => {
    setGenerating(true);
    try {
      let result: Blob | string | null = null;
      const inspection = selectedInspection || inspections[0];
      
      if (!inspection && format !== "csv") {
        toast.error("Selecione uma inspeção primeiro");
        setGenerating(false);
        return;
      }
      
      if (format === "pdf" && inspection) {
        result = await generatePDFPackage(inspection, deficiencies, "Embarcação");
      } else if (format === "zip" && inspection) {
        result = await generateZIPPackage(inspection, deficiencies, "Embarcação", []);
      } else {
        result = exportInspectionsCSV(inspections);
      }
      
      if (result) {
        toast.success(`Pacote ${format.toUpperCase()} gerado com sucesso`);
      }
    } catch (error) {
      toast.error("Erro ao gerar pacote");
    } finally {
      setGenerating(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: "Baixo", color: "text-green-500" };
    if (score <= 60) return { label: "Médio", color: "text-yellow-500" };
    if (score <= 80) return { label: "Alto", color: "text-orange-500" };
    return { label: "Crítico", color: "text-red-500" };
  };

  const risk = getRiskLevel(riskScore);
  const openDeficiencies = deficiencies.filter(d => d.status === "open" || d.status === "in_progress");
  const resolvedDeficiencies = deficiencies.filter(d => d.status === "corrected" || d.status === "verified" || d.status === "closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerador de Pacotes PSC</h2>
          <p className="text-muted-foreground">Documentação para inspeção Port State Control</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => handlehandleGeneratePackage}
            disabled={generating}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => handlehandleGeneratePackage}
            disabled={generating}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button 
            className="gap-2"
            onClick={() => handlehandleGeneratePackage}
            disabled={generating}
          >
            <Package className="h-4 w-4" />
            Pacote ZIP
          </Button>
        </div>
      </div>

      {/* Risk Score Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Score de Risco PSC</h3>
              <p className="text-sm text-muted-foreground">
                Baseado em deficiências abertas, histórico e conformidade
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${risk.color}`}>{riskScore}</div>
              <Badge className={severityColors[risk.label.toLowerCase()] || "bg-muted"}>
                Risco {risk.label}
              </Badge>
            </div>
          </div>
          <Progress value={riskScore} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections.length}</p>
                <p className="text-sm text-muted-foreground">Inspeções</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openDeficiencies.length}</p>
                <p className="text-sm text-muted-foreground">Deficiências Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedDeficiencies.length}</p>
                <p className="text-sm text-muted-foreground">Resolvidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deficiencies.length > 0 
                    ? Math.round((resolvedDeficiencies.length / deficiencies.length) * 100)
                    : 100}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa Resolução</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deficiencies" className="w-full">
        <TabsList>
          <TabsTrigger value="deficiencies" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Deficiências ({deficiencies.length})
          </TabsTrigger>
          <TabsTrigger value="inspections" className="gap-2">
            <Shield className="h-4 w-4" />
            Inspeções ({inspections.length})
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deficiencies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rastreamento de Deficiências</CardTitle>
              <CardDescription>Deficiências identificadas e status corretivo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : deficiencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma deficiência registrada</p>
                  <p className="text-sm mt-2">Excelente! Embarcação em conformidade.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {deficiencies.map((def) => (
                      <div 
                        key={def.id} 
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{def.deficiency_code}</Badge>
                              <Badge className={severityColors[def.severity]}>
                                {def.severity}
                              </Badge>
                              <Badge className={statusColors[def.status]}>
                                {def.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <h4 className="font-medium mt-2">{def.deficiency_description}</h4>
                            <p className="text-sm text-muted-foreground">
                              Categoria: {def.category || "N/A"} • Código: {def.action_code || "N/A"}
                            </p>
                            {def.corrective_action && (
                              <p className="text-sm text-green-600 mt-2">
                                Ação Corretiva: {def.corrective_action}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {def.corrective_deadline && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(def.corrective_deadline).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Inspeções</CardTitle>
              <CardDescription>Inspeções PSC realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma inspeção registrada</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {inspections.map((insp) => (
                      <div 
                        key={insp.id} 
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={handleSetSelectedInspection}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{insp.port_name}</h4>
                              <Badge variant="outline">{insp.inspection_type}</Badge>
                              <Badge className={
                                !insp.detention ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                              }>
                                {insp.detention ? "Detenção" : "Aprovado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(insp.inspection_date).toLocaleDateString("pt-BR")} • 
                              {insp.port_country}
                            </p>
                            <p className="text-sm">
                              Deficiências: {insp.deficiencies_count} • 
                              Score de Risco: <span className={getRiskLevel(insp.risk_score || 0).color}>
                                {insp.risk_score}
                              </span>
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Preparação PSC</CardTitle>
              <CardDescription>Itens essenciais para inspeção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { item: "Certificados de Segurança", status: "ok" },
                  { item: "Documentos ISM", status: "ok" },
                  { item: "Registros de Treinamento", status: "warning" },
                  { item: "Plano de Emergência", status: "ok" },
                  { item: "Certificados de Tripulação (STCW)", status: "ok" },
                  { item: "Acordos MLC", status: "ok" },
                  { item: "Registros de Manutenção", status: "warning" },
                  { item: "Relatórios de Auditoria", status: "ok" }
                ].map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{check.item}</span>
                    {check.status === "ok" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PSCPackagePanel;
