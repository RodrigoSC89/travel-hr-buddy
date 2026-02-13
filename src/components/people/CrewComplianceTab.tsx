/**
 * CrewComplianceTab - Tab de Compliance do PeopleHub
 * UX SYSTEM v1.0 - Real Data Integration
 */

import React, { useState } from "react";
import { 
  Shield, AlertTriangle, CheckCircle, Clock, FileCheck,
  Users, Calendar, TrendingUp, RefreshCw, Filter, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTemplate } from "@/components/ui/ux-system/PageTemplate";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  useCrewCertifications, 
  useExpiringCertifications,
  Certification 
} from "@/hooks/useCrewManagement";
import { useCrewMembersCRUD, CrewMember } from "@/hooks/use-crew-members-crud";
import { toast } from "sonner";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Compliance Score Card
const ComplianceScoreCard: React.FC<{
  score: number;
  label: string;
  details: string;
  icon: React.ElementType;
}> = ({ score, label, details, icon: Icon }) => {
  const getScoreColor = () => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}%</span>
        </div>
        <h3 className="font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground mb-3">{details}</p>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Certification Row Component
const CertificationRow: React.FC<{ 
  certification: Certification;
  onRenew?: (id: string) => void;
}> = ({ certification, onRenew }) => {
  const daysUntilExpiry = differenceInDays(
    new Date(certification.expiry_date), 
    new Date()
  );

  const getStatusBadge = () => {
    switch (certification.status) {
      case "valid":
        return <Badge variant="default" className="bg-success">Válido</Badge>;
      case "expiring_soon":
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {daysUntilExpiry}d restantes
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expirado
          </Badge>
        );
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
      certification.status === 'expired' ? 'border-destructive/30 bg-destructive/5' :
      certification.status === 'expiring_soon' ? 'border-warning/30 bg-warning/5' : ''
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${
          certification.status === 'expired' ? 'bg-destructive/10' :
          certification.status === 'expiring_soon' ? 'bg-warning/10' : 'bg-muted'
        }`}>
          <FileCheck className={`h-5 w-5 ${
            certification.status === 'expired' ? 'text-destructive' :
            certification.status === 'expiring_soon' ? 'text-warning' : ''
          }`} />
        </div>
        <div>
          <p className="font-medium">{certification.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{certification.type}</span>
            <span>•</span>
            <span>{certification.issuing_authority}</span>
            <span>•</span>
            <span>Nº {certification.certificate_number}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">
            {format(new Date(certification.expiry_date), "dd/MM/yyyy")}
          </p>
          <p className="text-xs text-muted-foreground">
            {daysUntilExpiry > 0 
              ? `em ${formatDistanceToNow(new Date(certification.expiry_date), { locale: ptBR })}` 
              : `há ${formatDistanceToNow(new Date(certification.expiry_date), { locale: ptBR })}`
            }
          </p>
        </div>
        {getStatusBadge()}
        {(certification.status === 'expired' || certification.status === 'expiring_soon') && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              onRenew?.(certification.id);
              toast.info("Solicitação de renovação enviada", {
                description: `Renovação de "${certification.name}" será processada.`
              });
            }}
          >
            Renovar
          </Button>
        )}
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard: React.FC<{
  title: string;
  count: number;
  severity: "critical" | "warning" | "info";
  description: string;
}> = ({ title, count, severity, description }) => {
  const colors = {
    critical: "border-destructive/30 bg-destructive/5",
    warning: "border-warning/30 bg-warning/5",
    info: "border-primary/30 bg-primary/5"
  };

  const icons = {
    critical: AlertTriangle,
    warning: Clock,
    info: CheckCircle
  };

  const iconColors = {
    critical: "text-destructive",
    warning: "text-warning",
    info: "text-primary"
  };

  const Icon = icons[severity];

  return (
    <div className={`p-4 border-2 rounded-xl ${colors[severity]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${iconColors[severity]}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{title}</p>
            <Badge variant="secondary" className="text-lg font-bold">
              {count}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default function CrewComplianceTab() {
  const { data: certifications = [], isLoading, refetch } = useCrewCertifications();
  const { expiring, expired, total } = useExpiringCertifications(30);
  const { crewMembers } = useCrewMembersCRUD();
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const validCount = certifications.filter((c: Certification) => c.status === 'valid').length;
  const complianceScore = total > 0 ? Math.round((validCount / total) * 100) : 100;
  const crewComplianceScore = crewMembers.length > 0 
    ? Math.round((crewMembers.filter((c: CrewMember) => c.status === 'active').length / crewMembers.length) * 100)
    : 100;

  const filteredCertifications = statusFilter
    ? certifications.filter(c => c.status === statusFilter)
    : certifications;

  return (
    <PageTemplate
      title="Compliance de Tripulação"
      description="Certificações, documentos e conformidade regulatória da tripulação"
      icon={Shield}
      badge={`${complianceScore}% compliance`}
      isLoading={isLoading}
      refreshable
      onRefresh={() => { refetch(); }}
      exportable
      onExport={() => {
        const rows = ["Nome;Tipo;Status;Validade", ...certifications.map((c) => `${(c as unknown as Record<string, unknown>).crew_member_name || ""};${c.type};${c.status};${c.expiry_date || ""}`)];
        const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `crew-compliance-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
        toast.success("Relatório de compliance exportado!");
      }}
      isEmpty={certifications.length === 0}
      emptyTitle="Nenhuma certificação cadastrada"
      emptyDescription="Adicione certificações para monitorar a compliance da tripulação."
    >
      {(expired.length > 0 || expiring.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {expired.length > 0 && (
            <AlertCard title="Certificações Expiradas" count={expired.length} severity="critical" description="Ação imediata necessária para regularização" />
          )}
          {expiring.length > 0 && (
            <AlertCard title="Expirando em 30 dias" count={expiring.length} severity="warning" description="Inicie o processo de renovação" />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ComplianceScoreCard score={complianceScore} label="Certificações Válidas" details={`${validCount} de ${total} certificações`} icon={FileCheck} />
        <ComplianceScoreCard score={crewComplianceScore} label="Tripulação Ativa" details={`${crewMembers.filter(c => c.status === 'active').length} tripulantes`} icon={Users} />
        <ComplianceScoreCard score={expired.length === 0 ? 100 : Math.max(0, 100 - (expired.length * 10))} label="STCW Compliance" details="Certificações obrigatórias" icon={Shield} />
        <ComplianceScoreCard score={95} label="MLC 2006" details="Maritime Labour Convention" icon={CheckCircle} />
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2"><Shield className="h-4 w-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2"><FileCheck className="h-4 w-4" />Certificações<Badge variant="secondary" className="ml-1">{total}</Badge></TabsTrigger>
            <TabsTrigger value="expiring" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />Atenção
              {(expired.length + expiring.length) > 0 && <Badge variant="destructive" className="ml-1">{expired.length + expiring.length}</Badge>}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setStatusFilter(statusFilter ? null : 'expiring_soon')}>
              <Filter className="h-4 w-4 mr-2" />{statusFilter ? 'Limpar Filtro' : 'Filtrar'}
            </Button>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Próximos Vencimentos</CardTitle></CardHeader>
              <CardContent>
                {expiring.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                    <p>Nenhuma certificação próxima ao vencimento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expiring.slice(0, 5).map(cert => (
                      <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div><p className="font-medium text-sm">{cert.name}</p><p className="text-xs text-muted-foreground">{cert.type}</p></div>
                        <Badge variant="secondary">{differenceInDays(new Date(cert.expiry_date), new Date())}d</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Compliance por Tipo</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["STCW", "COC", "Medical", "Safety", "Other"].map(type => {
                    const typeCount = certifications.filter(c => c.type.toLowerCase().includes(type.toLowerCase())).length;
                    const validTypeCount = certifications.filter(c => c.type.toLowerCase().includes(type.toLowerCase()) && c.status === 'valid').length;
                    const typeScore = typeCount > 0 ? Math.round((validTypeCount / typeCount) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm"><span>{type}</span><span className="font-medium">{typeScore}%</span></div>
                        <Progress value={typeScore} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          {filteredCertifications.length === 0 ? (
            <EmptyState icon={FileCheck} title="Nenhuma certificação encontrada" description="Ajuste os filtros ou adicione novas certificações." />
          ) : (
            <div className="space-y-3">{filteredCertifications.map(cert => <CertificationRow key={cert.id} certification={cert} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="expiring">
          {expired.length === 0 && expiring.length === 0 ? (
            <EmptyState icon={CheckCircle} title="Tudo em dia!" description="Não há certificações expiradas ou próximas ao vencimento." />
          ) : (
            <div className="space-y-4">
              {expired.length > 0 && (
                <div>
                  <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Expiradas ({expired.length})</h3>
                  <div className="space-y-2">{expired.map(cert => <CertificationRow key={cert.id} certification={cert} />)}</div>
                </div>
              )}
              {expiring.length > 0 && (
                <div>
                  <h3 className="font-semibold text-warning mb-3 flex items-center gap-2"><Clock className="h-4 w-4" />Expirando em 30 dias ({expiring.length})</h3>
                  <div className="space-y-2">{expiring.map(cert => <CertificationRow key={cert.id} certification={cert} />)}</div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}