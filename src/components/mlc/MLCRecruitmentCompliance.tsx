import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CheckCircle, AlertTriangle, Shield, FileText, Users, Globe, Clock, Star, Search } from "lucide-react";

interface Agency {
  id: string;
  name: string;
  country: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "approved" | "conditional" | "under_review" | "blacklisted";
  complianceScore: number;
  lastAudit: string;
  placements: number;
  complaints: number;
  certifications: string[];
}

interface RecruitmentChecklist {
  id: string;
  requirement: string;
  regulation: string;
  status: "compliant" | "non_compliant" | "partial";
}

const AGENCIES: Agency[] = [
  { id: "AG-001", name: "Global Maritime Services", country: "Filipinas", licenseNumber: "POEA-2024-0891", licenseExpiry: "2027-03-15", status: "approved", complianceScore: 96, lastAudit: "2025-11-20", placements: 342, complaints: 1, certifications: ["MLC 2006", "ISO 9001", "POEA Licensed"] },
  { id: "AG-002", name: "Eurocrewing GmbH", country: "Alemanha", licenseNumber: "DE-MLC-2023-445", licenseExpiry: "2026-12-31", status: "approved", complianceScore: 99, lastAudit: "2025-09-10", placements: 128, complaints: 0, certifications: ["MLC 2006", "ISO 9001", "EU Licensed"] },
  { id: "AG-003", name: "Indo Seafarers Ltd", country: "Índia", licenseNumber: "DGS-RPL-2024-112", licenseExpiry: "2026-06-30", status: "conditional", complianceScore: 78, lastAudit: "2025-08-05", placements: 215, complaints: 4, certifications: ["MLC 2006", "DGS Approved"] },
  { id: "AG-004", name: "Pacific Crew Solutions", country: "Indonésia", licenseNumber: "ID-BNSP-2024-067", licenseExpiry: "2026-09-01", status: "under_review", complianceScore: 65, lastAudit: "2025-06-15", placements: 89, complaints: 7, certifications: ["MLC 2006"] },
];

const CHECKLIST: RecruitmentChecklist[] = [
  { id: "R1", requirement: "Agência licenciada pelo Estado de Bandeira ou Estado do Porto", regulation: "Standard A1.4 §2", status: "compliant" },
  { id: "R2", requirement: "Sistema de proteção ao marítimo (seguro, garantia financeira)", regulation: "Standard A1.4 §5(c)(vi)", status: "compliant" },
  { id: "R3", requirement: "Nenhuma taxa cobrada do marítimo (exceto custo de certificados)", regulation: "Standard A1.4 §5(b)", status: "compliant" },
  { id: "R4", requirement: "Registro atualizado de todas as colocações realizadas", regulation: "Standard A1.4 §5(c)(i)", status: "compliant" },
  { id: "R5", requirement: "Marítimo informado sobre direitos e deveres antes do embarque", regulation: "Standard A1.4 §5(c)(ii)", status: "partial" },
  { id: "R6", requirement: "Verificação de qualificação e documentos do marítimo", regulation: "Standard A1.4 §5(c)(iii)", status: "compliant" },
  { id: "R7", requirement: "SEA conforme normas nacionais antes do embarque", regulation: "Standard A1.4 §5(c)(iv)", status: "compliant" },
  { id: "R8", requirement: "Procedimento de reclamação disponível ao marítimo", regulation: "Standard A1.4 §5(c)(v)", status: "compliant" },
  { id: "R9", requirement: "Sistema de lista negra de agências não conforme", regulation: "Guideline B1.4 §3", status: "compliant" },
  { id: "R10", requirement: "Auditoria anual de agências de recrutamento", regulation: "Standard A1.4 §9", status: "partial" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprovada", color: "bg-success/10 text-success border-success/30" },
  conditional: { label: "Condicional", color: "bg-warning/10 text-warning border-warning/30" },
  under_review: { label: "Em Análise", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  blacklisted: { label: "Bloqueada", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const checkStatus: Record<string, { label: string; color: string }> = {
  compliant: { label: "✓", color: "text-success" },
  non_compliant: { label: "✗", color: "text-destructive" },
  partial: { label: "◐", color: "text-warning" },
};

export const MLCRecruitmentCompliance: React.FC = () => {
  const [tab, setTab] = useState("agencies");

  const approvedCount = AGENCIES.filter(a => a.status === "approved").length;
  const avgScore = Math.round(AGENCIES.reduce((a, ag) => a + ag.complianceScore, 0) / AGENCIES.length);
  const totalPlacements = AGENCIES.reduce((a, ag) => a + ag.placements, 0);
  const complianceRate = Math.round((CHECKLIST.filter(c => c.status === "compliant").length / CHECKLIST.length) * 100);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Building2 className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Agências</p></div>
          <p className="text-2xl font-bold">{AGENCIES.length}</p>
          <p className="text-xs text-muted-foreground">{approvedCount} aprovadas</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Score Médio</p></div>
          <p className="text-2xl font-bold">{avgScore}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Colocações</p></div>
          <p className="text-2xl font-bold">{totalPlacements}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Conformidade</p></div>
          <p className="text-2xl font-bold text-success">{complianceRate}%</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agencies" className="gap-1"><Building2 className="h-3 w-3" />Agências</TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1"><CheckCircle className="h-3 w-3" />Checklist A1.4</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-3 mt-4">
          {AGENCIES.map(ag => {
            const st = statusConfig[ag.status];
            const daysToExpiry = Math.ceil((new Date(ag.licenseExpiry).getTime() - Date.now()) / 86400000);

            return (
              <Card key={ag.id} className="bg-card/50">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{ag.id}</span>
                        <Badge variant="outline" className={st.color}>{st.label}</Badge>
                        <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />{ag.country}</Badge>
                      </div>
                      <p className="font-medium">{ag.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Lic: {ag.licenseNumber}</span>
                        <span className={`flex items-center gap-1 ${daysToExpiry < 90 ? "text-warning" : ""}`}>
                          <Clock className="h-3 w-3" />Exp: {ag.licenseExpiry} ({daysToExpiry}d)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ag.certifications.map(c => (
                          <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-2xl font-bold ${ag.complianceScore >= 90 ? "text-success" : ag.complianceScore >= 70 ? "text-warning" : "text-destructive"}`}>
                        {ag.complianceScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">{ag.placements} colocações</p>
                      {ag.complaints > 0 && (
                        <p className="text-xs text-destructive">{ag.complaints} reclamações</p>
                      )}
                    </div>
                  </div>
                  <Progress value={ag.complianceScore} className="h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Checklist de Conformidade — Standard A1.4</CardTitle>
              <CardDescription>Requisitos obrigatórios para serviços de recrutamento e colocação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {CHECKLIST.map(item => {
                const cs = checkStatus[item.status];
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                    <span className={`text-lg font-bold ${cs.color}`}>{cs.label}</span>
                    <div className="flex-1">
                      <p className="text-sm">{item.requirement}</p>
                      <p className="text-xs text-muted-foreground">{item.regulation}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
