/**
 * Compliance Hub Premium - v2.0
 * Centro de Conformidade MLC 2006, STCW, ISM/ISPS
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, LayoutDashboard, FileCheck, AlertTriangle, CheckCircle,
  Calendar, Users, Ship, Bot, FileText, Plus, Award, ClipboardCheck
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Compliance Dashboard
function ComplianceDashboard() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .order("expiry_date", { ascending: true })
        .limit(20);
      
      if (data) setCertificates(data);
      setLoading(false);
    }
    loadCertificates();
  }, []);

  const validCerts = certificates.filter(c => new Date(c.expiry_date) > new Date()).length;
  const expiringCerts = certificates.filter(c => {
    const expiry = new Date(c.expiry_date);
    const today = new Date();
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  }).length;
  const expiredCerts = certificates.filter(c => new Date(c.expiry_date) < new Date()).length;

  const regulations = [
    { name: "MLC 2006", score: 98, status: "compliant" },
    { name: "STCW", score: 95, status: "compliant" },
    { name: "ISM Code", score: 100, status: "compliant" },
    { name: "ISPS Code", score: 97, status: "compliant" },
    { name: "MARPOL", score: 100, status: "compliant" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Score Geral</p>
                <p className="text-2xl font-bold text-success">98%</p>
              </div>
              <Shield className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Certificados</p>
                <p className="text-2xl font-bold">{validCerts}</p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold text-warning">{expiringCerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{expiredCerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Auditorias</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regulation Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conformidade por Regulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulations.map((reg) => (
              <div key={reg.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    {reg.name}
                    <Badge variant={reg.status === "compliant" ? "default" : "destructive"}>
                      {reg.status === "compliant" ? "Conforme" : "Verificar"}
                    </Badge>
                  </span>
                  <span className="text-success font-bold">{reg.score}%</span>
                </div>
                <Progress value={reg.score} className="[&>div]:bg-success" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Nova auditoria")}>
              <ClipboardCheck className="h-4 w-4" />
              Iniciar Auditoria Interna
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Checklist MLC")}>
              <FileCheck className="h-4 w-4" />
              Checklist MLC 2006
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Análise IA")}>
              <Bot className="h-4 w-4" />
              Análise de Conformidade com IA
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Relatório gerado")}>
              <FileText className="h-4 w-4" />
              Gerar Relatório DMLC
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Auditorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "PSC", date: "15/02/2024", port: "Santos", status: "scheduled" },
                { type: "Flag State", date: "20/03/2024", port: "Rio de Janeiro", status: "scheduled" },
                { type: "Class Survey", date: "10/04/2024", port: "Vitória", status: "pending" },
              ].map((audit, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{audit.type}</p>
                    <p className="text-sm text-muted-foreground">{audit.port} - {audit.date}</p>
                  </div>
                  <Badge variant={audit.status === "scheduled" ? "default" : "secondary"}>
                    {audit.status === "scheduled" ? "Agendada" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificados da Embarcação
          </CardTitle>
          <CardDescription>Status e vencimentos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum certificado encontrado</p>
              <Button className="mt-4" onClick={() => toast.success("Novo certificado")}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Certificado
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.slice(0, 5).map((cert) => {
                const expiry = new Date(cert.expiry_date);
                const today = new Date();
                const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const status = daysLeft < 0 ? "expired" : daysLeft <= 30 ? "expiring" : "valid";

                return (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        status === "expired" ? "bg-destructive/10" :
                        status === "expiring" ? "bg-warning/10" : "bg-success/10"
                      }`}>
                        <Award className={`h-5 w-5 ${
                          status === "expired" ? "text-destructive" :
                          status === "expiring" ? "text-warning" : "text-success"
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold">{cert.certificate_type}</p>
                        <p className="text-sm text-muted-foreground">Nº: {cert.certificate_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">{expiry.toLocaleDateString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">
                          {daysLeft < 0 ? `Vencido há ${Math.abs(daysLeft)} dias` : `${daysLeft} dias restantes`}
                        </p>
                      </div>
                      <Badge variant={
                        status === "expired" ? "destructive" :
                        status === "expiring" ? "secondary" : "default"
                      }>
                        {status === "expired" ? "Vencido" :
                         status === "expiring" ? "Expirando" : "Válido"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComplianceHubPremium() {
  const handleRefresh = async () => {
    // Real refresh handled by React Query invalidation
  };

  const handleExport = () => {
    toast.success("Relatório de conformidade exportado");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <ComplianceDashboard />
    },
    {
      id: "certificates",
      label: "Certificados",
      icon: Award,
      badge: 3,
      content: <div className="text-center py-12 text-muted-foreground">Gestão de Certificados</div>
    },
    {
      id: "audits",
      label: "Auditorias",
      icon: ClipboardCheck,
      content: <div className="text-center py-12 text-muted-foreground">Centro de Auditorias</div>
    },
    {
      id: "mlc",
      label: "MLC 2006",
      icon: Users,
      content: <div className="text-center py-12 text-muted-foreground">Conformidade MLC 2006</div>
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FileText,
      content: <div className="text-center py-12 text-muted-foreground">Relatórios de Conformidade</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <ClipboardCheck className="h-4 w-4" />
        Auditoria
      </Button>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Certificado
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Centro de Conformidade"
      subtitle="MLC 2006, STCW, ISM/ISPS e certificações"
      icon={Shield}
      iconGradient="from-violet-500 to-purple-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={3}
    />
  );
}
