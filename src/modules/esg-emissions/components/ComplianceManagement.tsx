/**
 * Compliance Management - IMO/EU MRV/DCS
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Ship,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";

interface ComplianceItem {
  id: string;
  regulation: string;
  requirement: string;
  status: "compliant" | "warning" | "non_compliant" | "pending";
  dueDate: string;
  vessel: string;
  lastCheck: string;
  details: string;
}

interface CIIRating {
  vessel: string;
  currentRating: string;
  targetRating: string;
  ciiValue: number;
  trend: number;
  year: number;
}

const complianceItems: ComplianceItem[] = [
  { id: "1", regulation: "IMO 2020", requirement: "Limite de Enxofre 0.5%", status: "compliant", dueDate: "Contínuo", vessel: "PSV Atlantic Explorer", lastCheck: "2024-01-14", details: "Usando MGO 0.1%S" },
  { id: "2", regulation: "EU MRV", requirement: "Relatório Anual de Emissões", status: "compliant", dueDate: "2024-04-30", vessel: "Frota", lastCheck: "2024-01-10", details: "Dados 2023 submetidos" },
  { id: "3", regulation: "IMO DCS", requirement: "Data Collection System", status: "compliant", dueDate: "2024-03-31", vessel: "Frota", lastCheck: "2024-01-12", details: "Coleta automática ativa" },
  { id: "4", regulation: "EEXI", requirement: "Índice de Eficiência Energética", status: "warning", dueDate: "2024-01-01", vessel: "AHTS Pacific Star", lastCheck: "2024-01-08", details: "Próximo ao limite" },
  { id: "5", regulation: "CII", requirement: "Rating Mínimo C", status: "compliant", dueDate: "2024-12-31", vessel: "PSV Atlantic Explorer", lastCheck: "2024-01-14", details: "Rating atual: B" },
  { id: "6", regulation: "CII", requirement: "Rating Mínimo C", status: "warning", dueDate: "2024-12-31", vessel: "PSV Gulf Stream", lastCheck: "2024-01-14", details: "Rating atual: C" },
  { id: "7", regulation: "MARPOL Anexo VI", requirement: "NOx Tier II", status: "compliant", dueDate: "Contínuo", vessel: "Frota", lastCheck: "2024-01-13", details: "Motores certificados" },
  { id: "8", regulation: "Ballast Water", requirement: "Tratamento BWM", status: "pending", dueDate: "2024-09-01", vessel: "OSV Caribbean Wind", lastCheck: "2024-01-05", details: "Instalação programada" },
];

const ciiRatings: CIIRating[] = [
  { vessel: "PSV Atlantic Explorer", currentRating: "B", targetRating: "A", ciiValue: 4.2, trend: -8.5, year: 2024 },
  { vessel: "AHTS Pacific Star", currentRating: "C", targetRating: "B", ciiValue: 6.8, trend: -3.2, year: 2024 },
  { vessel: "OSV Caribbean Wind", currentRating: "A", targetRating: "A", ciiValue: 3.1, trend: -12.0, year: 2024 },
  { vessel: "PSV Gulf Stream", currentRating: "C", targetRating: "B", ciiValue: 7.2, trend: 2.1, year: 2024 },
];

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "A": return "bg-green-500";
    case "B": return "bg-green-400";
    case "C": return "bg-yellow-400";
    case "D": return "bg-orange-400";
    case "E": return "bg-red-500";
    default: return "bg-gray-400";
  }
};

export function ComplianceManagement() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [selectedRegulation, setSelectedRegulation] = useState("all");

  const filteredItems = complianceItems.filter(item => {
    if (selectedVessel !== "all" && item.vessel !== selectedVessel && item.vessel !== "Frota") return false;
    if (selectedRegulation !== "all" && item.regulation !== selectedRegulation) return false;
    return true;
  });

  const compliantCount = complianceItems.filter(i => i.status === "compliant").length;
  const warningCount = complianceItems.filter(i => i.status === "warning").length;
  const nonCompliantCount = complianceItems.filter(i => i.status === "non_compliant").length;
  const pendingCount = complianceItems.filter(i => i.status === "pending").length;

  const complianceRate = Math.round((compliantCount / complianceItems.length) * 100);

  const vessels = [...new Set(complianceItems.map(i => i.vessel))];
  const regulations = [...new Set(complianceItems.map(i => i.regulation))];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade Geral</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
                <Progress value={complianceRate} className="mt-2 h-2" />
              </div>
              <Shield className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conforme</p>
                <p className="text-2xl font-bold">{compliantCount}</p>
                <p className="text-xs text-green-600">Requisitos atendidos</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Alerta</p>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-xs text-amber-600">Atenção requerida</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-blue-600">Em implementação</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conforme</p>
                <p className="text-2xl font-bold">{nonCompliantCount}</p>
                <p className="text-xs text-red-600">Ação imediata</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cii">CII Rating</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-56">
                <Ship className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Embarcações</SelectItem>
                {vessels.map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
              <SelectTrigger className="w-48">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Regulamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Regulamentos</SelectItem>
                {regulations.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compliance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Status de Conformidade Regulatória
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Regulamento</TableHead>
                    <TableHead>Requisito</TableHead>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Última Verificação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.regulation}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.requirement}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          {item.vessel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {item.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>{item.lastCheck}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === "compliant" ? "default" : item.status === "warning" ? "secondary" : item.status === "pending" ? "outline" : "destructive"}
                          className={item.status === "compliant" ? "bg-green-600" : item.status === "warning" ? "bg-amber-500" : ""}
                        >
                          {item.status === "compliant" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {item.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {item.status === "non_compliant" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {item.status === "compliant" ? "Conforme" : 
                           item.status === "warning" ? "Alerta" : 
                           item.status === "pending" ? "Pendente" : "Não Conforme"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cii" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Carbon Intensity Indicator (CII) - Ratings por Embarcação
              </CardTitle>
              <CardDescription>
                Conforme IMO MEPC.352(78) - Classificação de A (melhor) a E (pior)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ciiRatings.map((vessel) => (
                  <Card key={vessel.vessel} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Ship className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{vessel.vessel}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">CII Value: {vessel.ciiValue} gCO₂/dwt·nm</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm">Tendência:</span>
                            <Badge variant={vessel.trend < 0 ? "default" : "destructive"} className={vessel.trend < 0 ? "bg-green-600" : ""}>
                              {vessel.trend < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                              {Math.abs(vessel.trend)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full ${getRatingColor(vessel.currentRating)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                            {vessel.currentRating}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Rating {vessel.year}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span>Meta: Rating {vessel.targetRating}</span>
                          {vessel.currentRating === vessel.targetRating ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Meta Atingida
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Target className="h-3 w-3 mr-1" />
                              Em Progresso
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CII Rating Scale */}
          <Card>
            <CardHeader>
              <CardTitle>Escala de Classificação CII</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {["A", "B", "C", "D", "E"].map((rating) => (
                  <div key={rating} className="flex-1 text-center">
                    <div className={`h-12 ${getRatingColor(rating)} rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
                      {rating}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rating === "A" ? "Muito Superior" :
                       rating === "B" ? "Superior" :
                       rating === "C" ? "Moderado" :
                       rating === "D" ? "Inferior" : "Muito Inferior"}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Navios com rating D por 3 anos consecutivos ou E devem apresentar plano de ação corretivo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Prazos Regulatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-03-31", title: "IMO DCS - Submissão de Dados 2023", status: "pending" },
                  { date: "2024-04-30", title: "EU MRV - Relatório Anual", status: "pending" },
                  { date: "2024-09-01", title: "BWM - Instalação OSV Caribbean Wind", status: "warning" },
                  { date: "2024-12-31", title: "CII - Avaliação Anual", status: "pending" },
                  { date: "2025-01-01", title: "EEXI - Verificação Obrigatória", status: "pending" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-bold">{item.date.split("-")[2]}</p>
                      <p className="text-xs text-muted-foreground">{item.date.split("-").slice(0, 2).join("/")}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                    </div>
                    <Badge variant={item.status === "warning" ? "secondary" : "outline"} className={item.status === "warning" ? "bg-amber-500" : ""}>
                      {item.status === "warning" ? "Atenção" : "Programado"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
