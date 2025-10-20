/**
 * PEO-DP Audit Component
 * Interface para auditoria PEO-DP Inteligente
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Ship,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { peodpCore } from "@/modules/peodp_ai";
import type { PEODPAuditoria } from "@/types/peodp-audit";
import { getScoreLevel, getScoreColor } from "@/types/peodp-audit";

export function PEODPAuditComponent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("input");
  const [loading, setLoading] = useState(false);
  const [auditoria, setAuditoria] = useState<PEODPAuditoria | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);

  // Form state
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDpClass] = useState("");

  const handleExecutarAuditoria = async () => {
    if (!vesselName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome da embarcação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const resultado = await peodpCore.iniciarAuditoria({
        vesselName,
        dpClass: dpClass || undefined,
        autoDownload: false,
      });

      // Gerar recomendações
      const engine = new (await import("@/modules/peodp_ai")).PEOEngine();
      const recs = engine.gerarRecomendacoes(resultado);
      setRecomendacoes(recs);

      setAuditoria(resultado);
      setActiveTab("results");

      toast({
        title: "Auditoria Concluída",
        description: `Score: ${resultado.score}% - ${getScoreLevel(resultado.score)}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar auditoria PEO-DP",
        variant: "destructive",
      });
      console.error("Erro na auditoria:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (auditoria) {
      peodpCore.downloadReports(auditoria, recomendacoes, "pdf");
      toast({
        title: "Download Iniciado",
        description: "Relatório PDF está sendo baixado",
      });
    }
  };

  const handleDownloadMarkdown = () => {
    if (auditoria) {
      peodpCore.downloadReports(auditoria, recomendacoes, "markdown");
      toast({
        title: "Download Iniciado",
        description: "Relatório Markdown está sendo baixado",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ship className="h-8 w-8" />
          PEO-DP Inteligente
        </h1>
        <p className="text-muted-foreground mt-2">
          Auditoria de Conformidade DP baseada em NORMAM-101 e IMCA M 117
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Dados da Embarcação</TabsTrigger>
          <TabsTrigger value="results" disabled={!auditoria}>
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Embarcação</CardTitle>
              <CardDescription>
                Preencha os dados para iniciar a auditoria PEO-DP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vesselName">Nome da Embarcação *</Label>
                <Input
                  id="vesselName"
                  placeholder="Ex: PSV Ocean Explorer"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dpClass">Classe DP</Label>
                <Select value={dpClass} onValueChange={setDpClass}>
                  <SelectTrigger id="dpClass">
                    <SelectValue placeholder="Selecione a classe DP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DP1">DP1</SelectItem>
                    <SelectItem value="DP2">DP2</SelectItem>
                    <SelectItem value="DP3">DP3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  A auditoria verificará conformidade com NORMAM-101 (DPC) e IMCA M 117
                  (Treinamento e Experiência de Pessoal DP)
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleExecutarAuditoria}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando Auditoria...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Iniciar Auditoria PEO-DP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {auditoria && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado da Auditoria</CardTitle>
                  <CardDescription>
                    {auditoria.vesselName} {auditoria.dpClass && `- ${auditoria.dpClass}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                      <p className={`text-3xl font-bold ${getScoreColor(auditoria.score)}`}>
                        {auditoria.score}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getScoreLevel(auditoria.score)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownloadPDF} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button onClick={handleDownloadMarkdown} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Markdown
                      </Button>
                    </div>
                  </div>

                  <Progress value={auditoria.score} className="h-2" />

                  <div className="text-sm text-muted-foreground">
                    Data: {new Date(auditoria.data).toLocaleString("pt-BR")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Itens Auditados</CardTitle>
                  <CardDescription>
                    {auditoria.resultado.length} requisitos verificados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditoria.resultado.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className="mt-0.5">
                          {item.cumprimento === "OK" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : item.cumprimento === "Não Conforme" ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{item.item}</Badge>
                            <Badge
                              variant={
                                item.cumprimento === "OK"
                                  ? "default"
                                  : item.cumprimento === "Não Conforme"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.cumprimento}
                            </Badge>
                          </div>
                          <p className="text-sm">{item.descricao}</p>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {recomendacoes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recomendacoes.map((rec, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
