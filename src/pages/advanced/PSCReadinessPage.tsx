/**
 * PSC Readiness AI Page
 * Preparação automatizada para inspeções Port State Control
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, CheckCircle, AlertTriangle, FileText, 
  Users, Anchor, Brain, Eye, ClipboardList, Target
} from "lucide-react";

const PSCReadinessPage = () => {
  const [scanning, setScanning] = useState(false);

  const readinessScore = 87;
  
  const categories = [
    { name: "Certificados", score: 95, items: 24, issues: 1 },
    { name: "Segurança", score: 88, items: 45, issues: 4 },
    { name: "MARPOL", score: 82, items: 18, issues: 3 },
    { name: "ISM/ISPS", score: 92, items: 32, issues: 2 },
    { name: "MLC 2006", score: 78, items: 28, issues: 6 },
    { name: "Navegação", score: 90, items: 15, issues: 1 }
  ];

  const criticalIssues = [
    { 
      id: 1,
      category: "MLC 2006",
      item: "Registro de Horas de Descanso",
      description: "3 tripulantes sem registro completo nos últimos 7 dias",
      priority: "critical",
      action: "Completar registros imediatamente"
    },
    { 
      id: 2,
      category: "MARPOL",
      item: "Plano de Gerenciamento de Lixo",
      description: "Plano não atualizado para MARPOL Anexo V revisado",
      priority: "high",
      action: "Atualizar plano conforme regulamento"
    },
    { 
      id: 3,
      category: "Segurança",
      item: "Equipamento de Salvamento",
      description: "2 coletes salva-vidas com vistoria vencida há 5 dias",
      priority: "high",
      action: "Solicitar vistoria urgente"
    },
    { 
      id: 4,
      category: "MLC 2006",
      item: "Contratos de Trabalho",
      description: "1 contrato sem assinatura do tripulante",
      priority: "medium",
      action: "Obter assinatura"
    }
  ];

  const inspectionHistory = [
    { port: "Singapore", date: "2024-01-15", result: "No Deficiencies", detained: false },
    { port: "Rotterdam", date: "2023-10-22", result: "2 Deficiencies", detained: false },
    { port: "Houston", date: "2023-07-08", result: "1 Deficiency", detained: false },
    { port: "Santos", date: "2023-04-12", result: "No Deficiencies", detained: false }
  ];

  const handleScan = async () => {
    setScanning(true);
    try {
      const { error } = await supabase.from("psc_inspections").select("id, status").limit(5);
      if (error) throw error;
    } catch {
      // Continue with offline data
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            PSC Readiness AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Preparação automatizada para inspeções Port State Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-success" />
            IA Ativa
          </Badge>
          <Button onClick={handleScan} disabled={scanning}>
            <Eye className="h-4 w-4 mr-2" />
            {scanning ? "Escaneando..." : "Scan Completo"}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">PSC Readiness Score</h2>
              <p className="text-sm text-muted-foreground">
                Baseado em 162 pontos de verificação
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Badge className={
                  readinessScore >= 90 ? "bg-success" :
                  readinessScore >= 75 ? "bg-warning" : "bg-destructive"
                }>
                  {readinessScore >= 90 ? "Excelente" :
                   readinessScore >= 75 ? "Bom" : "Requer Atenção"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  17 itens requerem ação
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${readinessScore * 3.52} 352`}
                    className={
                      readinessScore >= 90 ? "text-success" :
                      readinessScore >= 75 ? "text-warning" : "text-destructive"
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{readinessScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Card key={cat.name}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{cat.name}</p>
                <p className={`text-2xl font-bold ${
                  cat.score >= 90 ? "text-success" :
                  cat.score >= 75 ? "text-warning" : "text-destructive"
                }`}>{cat.score}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.issues} pendências
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList>
          <TabsTrigger value="issues">Pendências Críticas</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Completo</TabsTrigger>
          <TabsTrigger value="history">Histórico PSC</TabsTrigger>
          <TabsTrigger value="predictions">Predições IA</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Pendências que Requerem Ação ({criticalIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalIssues.map((issue) => (
                  <div 
                    key={issue.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.priority === "critical" ? "border-l-destructive bg-destructive/5" :
                      issue.priority === "high" ? "border-l-warning bg-warning/5" :
                      "border-l-info bg-info/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{issue.category}</Badge>
                          <h3 className="font-semibold">{issue.item}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Ação: {issue.action}</span>
                        </div>
                      </div>
                      <Badge className={
                         issue.priority === "critical" ? "bg-destructive" :
                        issue.priority === "high" ? "bg-warning" : "bg-info"
                      }>
                        {issue.priority === "critical" ? "Crítico" :
                         issue.priority === "high" ? "Alto" : "Médio"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights da IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm">
                    <strong>⚠️ MLC 2006:</strong> Área com mais pendências. Priorize correções 
                    antes da próxima escala em porto da Paris MOU.
                  </p>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <p className="text-sm">
                    <strong>📊 Análise:</strong> Seu score está 12 pontos acima da média 
                    da frota. Manter padrão atual.
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm">
                    <strong>✅ Próxima Inspeção:</strong> Probabilidade de 89% de 
                    "No Deficiencies" se itens críticos forem resolvidos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Checklist de Preparação PSC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{cat.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {cat.items - cat.issues}/{cat.items} OK
                      </span>
                    </div>
                    <Progress value={cat.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Inspeções PSC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspectionHistory.map((insp) => (
                  <div 
                    key={`${insp.port}-${insp.date}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Anchor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{insp.port}</p>
                        <p className="text-sm text-muted-foreground">{insp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insp.result === "No Deficiencies" ? "default" : "secondary"}>
                        {insp.result}
                      </Badge>
                      {!insp.detained && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Predições de Inspeção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Modelo Preditivo PSC</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  IA analisa padrões de inspeção por porto, bandeira e tipo de navio 
                  para prever áreas de foco dos inspetores.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PSCReadinessPage;
