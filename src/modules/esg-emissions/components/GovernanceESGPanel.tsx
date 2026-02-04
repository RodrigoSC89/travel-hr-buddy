/**
 * Governance ESG Panel - G do ESG
 * Estrutura de governança, ética, compliance e gestão de riscos
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Scale,
  Eye,
  Lock,
  Bell,
  FileText,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Gavel,
  Flag,
  UserCheck,
  Briefcase
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const boardComposition = {
  total: 9,
  independent: 5,
  women: 2,
  committees: [
    { name: "Auditoria", members: 3, chair: "Independente" },
    { name: "Riscos", members: 3, chair: "Independente" },
    { name: "Sustentabilidade", members: 4, chair: "CEO" },
    { name: "Remuneração", members: 3, chair: "Independente" }
  ]
};

const complianceMetrics = [
  { regulation: "ISM Code", status: "compliant", audits: 2, nextAudit: "Set/2026" },
  { regulation: "ISPS Code", status: "compliant", audits: 1, nextAudit: "Dez/2026" },
  { regulation: "MLC 2006", status: "compliant", audits: 1, nextAudit: "Mar/2027" },
  { regulation: "MARPOL", status: "compliant", audits: 3, nextAudit: "Jul/2026" },
  { regulation: "SOLAS", status: "compliant", audits: 2, nextAudit: "Nov/2026" },
  { regulation: "STCW", status: "warning", audits: 1, nextAudit: "Ago/2026" }
];

const riskRegister = [
  { id: 1, risk: "Mudanças regulatórias EU ETS", category: "Regulatório", likelihood: "high", impact: "high", mitigation: "Monitoramento contínuo" },
  { id: 2, risk: "Volatilidade preço combustível", category: "Financeiro", likelihood: "high", impact: "medium", mitigation: "Hedging parcial" },
  { id: 3, risk: "Escassez de tripulação qualificada", category: "Operacional", likelihood: "medium", impact: "high", mitigation: "Programa de retenção" },
  { id: 4, risk: "Incidente ambiental", category: "Ambiental", likelihood: "low", impact: "high", mitigation: "SOPEP e simulados" },
  { id: 5, risk: "Cyber attack", category: "Tecnologia", likelihood: "medium", impact: "high", mitigation: "ISO 27001" }
];

const certifications = [
  { name: "ISO 9001:2015", status: "valid", expiry: "2027-03-15" },
  { name: "ISO 14001:2015", status: "valid", expiry: "2027-03-15" },
  { name: "ISO 45001:2018", status: "valid", expiry: "2027-03-15" },
  { name: "ISO 50001:2018", status: "valid", expiry: "2026-09-20" },
  { name: "ISM/ISPS DOC", status: "valid", expiry: "2028-01-10" }
];

export const GovernanceESGPanel: React.FC = () => {
  const getRiskBadge = (level: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return <Badge className={`${colors[level]} text-white text-xs`}>{level}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">56%</p>
            <p className="text-sm text-muted-foreground">Conselho Independente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-500">100%</Badge>
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Detenções PSC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Certificações ISO</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Gavel className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">R$ 0</p>
            <p className="text-sm text-muted-foreground">Multas (YTD)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-sm text-muted-foreground">Treinamento Ética</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Composição do Conselho
            </CardTitle>
            <CardDescription>Estrutura de governança corporativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold">{boardComposition.total}</p>
                <p className="text-sm text-muted-foreground">Membros</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold">{boardComposition.independent}</p>
                <p className="text-sm text-muted-foreground">Independentes</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Diversidade de Gênero</span>
                <span className="font-medium">{Math.round((boardComposition.women / boardComposition.total) * 100)}%</span>
              </div>
              <Progress value={(boardComposition.women / boardComposition.total) * 100} className="h-2" />
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Comitês</h4>
              <div className="space-y-2">
                {boardComposition.committees.map((committee) => (
                  <div key={committee.name} className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">{committee.name}</span>
                    <Badge variant="outline">{committee.members} membros</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Compliance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Compliance Regulatório Marítimo
            </CardTitle>
            <CardDescription>Status de conformidade por regulamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regulamento</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Auditorias (YTD)</TableHead>
                  <TableHead>Próxima Auditoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceMetrics.map((item) => (
                  <TableRow key={item.regulation}>
                    <TableCell className="font-medium">{item.regulation}</TableCell>
                    <TableCell className="text-center">
                      {item.status === "compliant" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">{item.audits}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {item.nextAudit}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Register */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Registro de Riscos ESG
            </CardTitle>
            <CardDescription>Principais riscos identificados</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {riskRegister.map((risk) => (
                  <div key={risk.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{risk.risk}</h4>
                        <Badge variant="outline" className="mt-1">{risk.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Probabilidade:</span>
                        {getRiskBadge(risk.likelihood)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Impacto:</span>
                        {getRiskBadge(risk.impact)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Mitigação:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificações & Acreditações
            </CardTitle>
            <CardDescription>Status das certificações ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Válido até: {new Date(cert.expiry).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Válido</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies & Ethics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Políticas e Ética
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Código de Conduta</p>
              <p className="text-sm text-muted-foreground">Atualizado 2024</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Política Anticorrupção</p>
              <p className="text-sm text-muted-foreground">Ativa</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Canal de Denúncias</p>
              <p className="text-sm text-muted-foreground">Anônimo</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">LGPD/GDPR</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceESGPanel;
