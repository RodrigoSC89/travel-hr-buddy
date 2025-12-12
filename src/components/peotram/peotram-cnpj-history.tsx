import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Ship,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  BarChart3,
  History,
  Target,
  Award
} from "lucide-react";
import { toast } from "sonner";

interface Company {
  cnpj: string;
  name: string;
  vessels: Vessel[];
  audits: AuditCycle[];
  overallScore: number;
  trend: "improving" | "stable" | "declining";
  riskLevel: "low" | "medium" | "high";
}

interface Vessel {
  id: string;
  name: string;
  type: "PSV" | "AHTS" | "OSRV" | "RSV" | "PLSV";
  imo: string;
  lastAudit: string;
  score: number;
  status: "active" | "inactive";
}

interface AuditCycle {
  id: string;
  cycle: string; // "2024", "2023", etc.
  auditDate: string;
  vesselId: string;
  vesselName: string;
  score: number;
  nonConformities: number;
  criticalItems: number;
  status: "completed" | "pending" | "in_progress";
  findings: AuditFinding[];
}

interface AuditFinding {
  id: string;
  element: string;
  description: string;
  severity: "critical" | "major" | "minor";
  status: "open" | "closed" | "in_progress";
  deadline: string;
  responsible: string;
}

export const PeotramCNPJHistory: React.FC = () => {
  const [searchCNPJ, setSearchCNPJ] = useState("");
  const [selectedCycle, setSelectedCycle] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  const [companies] = useState<Company[]>([
    {
      cnpj: "12.345.678/0001-90",
      name: "Navegação Atlântico Sul Ltda",
      overallScore: 87,
      trend: "improving",
      riskLevel: "low",
      vessels: [
        { id: "v1", name: "PSV Atlantic Explorer", type: "PSV", imo: "9876543", lastAudit: "2024-03-15", score: 92, status: "active" },
        { id: "v2", name: "AHTS Ocean Warrior", type: "AHTS", imo: "9876544", lastAudit: "2024-02-20", score: 85, status: "active" },
        { id: "v3", name: "OSRV Clean Sea", type: "OSRV", imo: "9876545", lastAudit: "2024-01-10", score: 78, status: "active" }
      ],
      audits: [
        {
          id: "a1", cycle: "2024", auditDate: "2024-03-15", vesselId: "v1", vesselName: "PSV Atlantic Explorer",
          score: 92, nonConformities: 3, criticalItems: 0, status: "completed",
          findings: [
            { id: "f1", element: "ELEM_03", description: "Procedimento de emergência desatualizado", severity: "major", status: "closed", deadline: "2024-04-15", responsible: "Comandante" }
          ]
        },
        {
          id: "a2", cycle: "2024", auditDate: "2024-02-20", vesselId: "v2", vesselName: "AHTS Ocean Warrior",
          score: 85, nonConformities: 5, criticalItems: 1, status: "completed",
          findings: [
            { id: "f2", element: "ELEM_05", description: "Manutenção de equipamento de salvatagem", severity: "critical", status: "in_progress", deadline: "2024-03-20", responsible: "Chefe de Máquinas" }
          ]
        },
        {
          id: "a3", cycle: "2023", auditDate: "2023-11-10", vesselId: "v1", vesselName: "PSV Atlantic Explorer",
          score: 88, nonConformities: 4, criticalItems: 1, status: "completed",
          findings: []
        },
        {
          id: "a4", cycle: "2023", auditDate: "2023-10-05", vesselId: "v2", vesselName: "AHTS Ocean Warrior",
          score: 79, nonConformities: 8, criticalItems: 2, status: "completed",
          findings: []
        }
      ]
    },
    {
      cnpj: "98.765.432/0001-10",
      name: "Offshore Services Brasil S.A.",
      overallScore: 72,
      trend: "stable",
      riskLevel: "medium",
      vessels: [
        { id: "v4", name: "RSV Deep Diver", type: "RSV", imo: "9876546", lastAudit: "2024-01-25", score: 75, status: "active" },
        { id: "v5", name: "PLSV Pipe Master", type: "PLSV", imo: "9876547", lastAudit: "2023-12-10", score: 68, status: "active" }
      ],
      audits: [
        {
          id: "a5", cycle: "2024", auditDate: "2024-01-25", vesselId: "v4", vesselName: "RSV Deep Diver",
          score: 75, nonConformities: 7, criticalItems: 2, status: "completed",
          findings: [
            { id: "f3", element: "ELEM_02", description: "Treinamento de tripulação incompleto", severity: "major", status: "open", deadline: "2024-02-25", responsible: "RH" }
          ]
        }
      ]
    }
  ]);

  const handleSearch = () => {
    const found = companies.find(c => c.cnpj.includes(searchCNPJ) || c.name.toLowerCase().includes(searchCNPJ.toLowerCase()));
    if (found) {
      setSelectedCompany(found);
      toast.success(`Empresa encontrada: ${found.name}`);
    } else {
      toast.error("Empresa não encontrada");
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[risk as keyof typeof colors];
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredAudits = selectedCompany?.audits.filter(a => 
    selectedCycle === "all" || a.cycle === selectedCycle
  ) || [];

  const availableCycles = [...new Set(selectedCompany?.audits.map(a => a.cycle) || [])].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-600/10">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Histórico PEOTRAM por CNPJ</CardTitle>
                <CardDescription>
                  Repositório de auditorias por ciclo, empresa e embarcação
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>CNPJ ou Nome da Empresa</Label>
              <Input
                placeholder="Digite o CNPJ ou nome..."
                value={searchCNPJ}
                onChange={(e) => setSearchCNPJ(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-4">
            <Label className="text-muted-foreground">Acesso rápido:</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {companies.map((company) => (
                <Button
                  key={company.cnpj}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCompany(company)}
                  className={selectedCompany?.cnpj === company.cnpj ? "border-primary" : ""}
                >
                  {company.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      {selectedCompany && (
        <>
          {/* Company Overview */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedCompany.name}</CardTitle>
                  <CardDescription>CNPJ: {selectedCompany.cnpj}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {getTrendIcon(selectedCompany.trend)}
                  <Badge className={getRiskBadge(selectedCompany.riskLevel)}>
                    Risco {selectedCompany.riskLevel === "low" ? "Baixo" : 
                      selectedCompany.riskLevel === "medium" ? "Médio" : "Alto"}
                  </Badge>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedCompany.overallScore)}`}>
                    {selectedCompany.overallScore}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ship className="h-4 w-4" />
                    <span className="text-sm">Embarcações</span>
                  </div>
                  <div className="text-2xl font-bold">{selectedCompany.vessels.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Auditorias</span>
                  </div>
                  <div className="text-2xl font-bold">{selectedCompany.audits.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">NCs Abertas</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedCompany.audits.reduce((sum, a) => 
                      sum + a.findings.filter(f => f.status === "open").length, 0
                    )}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Último Ciclo</span>
                  </div>
                  <div className="text-2xl font-bold">{availableCycles[0] || "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="vessels" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vessels">Embarcações</TabsTrigger>
              <TabsTrigger value="audits">Histórico de Auditorias</TabsTrigger>
              <TabsTrigger value="analytics">Análise de Tendência</TabsTrigger>
            </TabsList>

            {/* Vessels Tab */}
            <TabsContent value="vessels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCompany.vessels.map((vessel) => (
                  <Card 
                    key={vessel.id} 
                    className={`cursor-pointer transition-all ${
                      selectedVessel?.id === vessel.id ? "border-primary shadow-lg" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{vessel.name}</CardTitle>
                        <Badge variant="outline">{vessel.type}</Badge>
                      </div>
                      <CardDescription>IMO: {vessel.imo}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Score Atual</span>
                          <span className={`text-xl font-bold ${getScoreColor(vessel.score)}`}>
                            {vessel.score}%
                          </span>
                        </div>
                        <Progress value={vessel.score} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Última Auditoria</span>
                          <span>{new Date(vessel.lastAudit).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <Badge className={vessel.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {vessel.status === "active" ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Audits Tab */}
            <TabsContent value="audits" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Histórico de Auditorias
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os ciclos</SelectItem>
                          {availableCycles.map((cycle) => (
                            <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredAudits.map((audit) => (
                    <div 
                      key={audit.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{audit.vesselName}</span>
                              <Badge variant="outline">Ciclo {audit.cycle}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(audit.auditDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(audit.score)}`}>
                              {audit.score}%
                            </div>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">
                              {audit.nonConformities}
                            </div>
                            <p className="text-xs text-muted-foreground">NCs</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">
                              {audit.criticalItems}
                            </div>
                            <p className="text-xs text-muted-foreground">Críticos</p>
                          </div>
                          <Badge className={
                            audit.status === "completed" ? "bg-green-100 text-green-800" :
                              audit.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                          }>
                            {audit.status === "completed" ? "Concluída" :
                              audit.status === "in_progress" ? "Em Andamento" : "Pendente"}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Findings Preview */}
                      {audit.findings.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Achados pendentes:</p>
                          <div className="space-y-1">
                            {audit.findings.filter(f => f.status !== "closed").slice(0, 2).map((finding) => (
                              <div 
                                key={finding.id}
                                className={`text-sm p-2 rounded ${
                                  finding.severity === "critical" ? "bg-red-50 text-red-700" :
                                    finding.severity === "major" ? "bg-yellow-50 text-yellow-700" :
                                      "bg-blue-50 text-blue-700"
                                }`}
                              >
                                <span className="font-medium">{finding.element}:</span> {finding.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Evolução de Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableCycles.map((cycle) => {
                        const cycleAudits = selectedCompany.audits.filter(a => a.cycle === cycle);
                        const avgScore = cycleAudits.reduce((sum, a) => sum + a.score, 0) / cycleAudits.length;
                        return (
                          <div key={cycle} className="flex items-center gap-3">
                            <span className="w-16 font-medium">{cycle}</span>
                            <Progress value={avgScore} className="flex-1 h-4" />
                            <span className={`w-16 text-right font-bold ${getScoreColor(avgScore)}`}>
                              {Math.round(avgScore)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Padrão de Não Conformidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["ELEM_01", "ELEM_02", "ELEM_03", "ELEM_04", "ELEM_05"].map((elem, idx) => {
                        const count = selectedCompany.audits.reduce((sum, a) => 
                          sum + a.findings.filter(f => f.element === elem).length, 0
                        );
                        return (
                          <div key={elem} className="flex items-center justify-between">
                            <span className="text-sm">{elem}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded">
                                <div 
                                  className="h-2 bg-yellow-500 rounded"
                                  style={{ width: `${Math.min(count * 20, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Analysis */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Análise de Tendência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Tendência Geral</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(selectedCompany.trend)}
                        <span className="font-medium capitalize">
                          {selectedCompany.trend === "improving" ? "Melhorando" :
                            selectedCompany.trend === "declining" ? "Declinando" : "Estável"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Previsão Próximo Ciclo</p>
                      <div className="text-xl font-bold text-blue-600">
                        {Math.round(selectedCompany.overallScore * (selectedCompany.trend === "improving" ? 1.05 : selectedCompany.trend === "declining" ? 0.95 : 1))}%
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Risco de NC Crítica</p>
                      <div className={`text-xl font-bold ${
                        selectedCompany.riskLevel === "low" ? "text-green-600" :
                          selectedCompany.riskLevel === "medium" ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {selectedCompany.riskLevel === "low" ? "15%" :
                          selectedCompany.riskLevel === "medium" ? "35%" : "60%"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
