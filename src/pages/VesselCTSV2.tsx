/**
 * VesselCTSV2 - CTS Tripulação
 * Verificação de conformidade STCW com IA
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Users, Brain, Shield, AlertTriangle, CheckCircle, FileCheck, 
  UserCheck, GraduationCap, Calendar, RefreshCw
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  stcw_certificates: string[];
  certificate_expiry: string;
  compliance_status: string;
  vessel_name: string;
}

const QUICK_QUESTIONS = [
  "Quais certificados STCW são obrigatórios?",
  "Como verificar conformidade da tripulação?",
  "O que é Safe Manning Certificate?",
  "Quando renovar certificados?",
  "Requisitos mínimos por função?",
  "Como funciona a auditoria CTS?"
];

const EVIDENCE_FIELDS = [
  { name: "crew_name", label: "Nome do Tripulante", type: "text" as const, required: true },
  { name: "rank", label: "Função/Posto", type: "text" as const, required: true },
  { name: "observed_condition", label: "Não Conformidade", type: "textarea" as const, required: true },
  { name: "certificate_type", label: "Certificado Afetado", type: "text" as const },
];

export default function VesselCTSV2() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCrew([
      { id: "1", name: "João Silva", rank: "Capitão", stcw_certificates: ["II/2", "V/1", "VI/1"], certificate_expiry: "2026-05-15", compliance_status: "compliant", vessel_name: "MV Atlantic Star" },
      { id: "2", name: "Maria Santos", rank: "Chefe de Máquinas", stcw_certificates: ["III/2", "V/1", "VI/1"], certificate_expiry: "2025-08-20", compliance_status: "expiring_soon", vessel_name: "MV Atlantic Star" },
      { id: "3", name: "Pedro Costa", rank: "Oficial de Navegação", stcw_certificates: ["II/1", "V/1"], certificate_expiry: "2025-02-01", compliance_status: "non_compliant", vessel_name: "MV Pacific Dawn" },
    ]);
    setLoading(false);
  }, []);

  const compliant = crew.filter(c => c.compliance_status === 'compliant').length;
  const expiring = crew.filter(c => c.compliance_status === 'expiring_soon').length;
  const nonCompliant = crew.filter(c => c.compliance_status === 'non_compliant').length;
  const complianceRate = crew.length > 0 ? ((compliant / crew.length) * 100).toFixed(0) : 0;

  const stats = [
    { label: "Total Tripulantes", value: crew.length, icon: Users, color: "blue" as const },
    { label: "Conformes", value: compliant, icon: CheckCircle, color: "green" as const },
    { label: "Expirando", value: expiring, icon: Calendar, color: "orange" as const },
    { label: "Não Conformes", value: nonCompliant, icon: AlertTriangle, color: "red" as const },
  ];

  const columns = [
    { key: "name", label: "Nome", sortable: true },
    { key: "rank", label: "Função", sortable: true },
    { key: "vessel_name", label: "Embarcação" },
    { key: "stcw_certificates", label: "STCW", render: (item: CrewMember) => item.stcw_certificates.join(", ") },
    { key: "certificate_expiry", label: "Validade", render: (item: CrewMember) => new Date(item.certificate_expiry).toLocaleDateString('pt-BR') },
    { key: "compliance_status", label: "Status", render: (item: CrewMember) => (
      <Badge variant={item.compliance_status === 'compliant' ? 'default' : item.compliance_status === 'expiring_soon' ? 'secondary' : 'destructive'}>
        {item.compliance_status === 'compliant' ? 'Conforme' : item.compliance_status === 'expiring_soon' ? 'Expirando' : 'Não Conforme'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Users}
      title="CTS Tripulação"
      description="Verificação de conformidade STCW e Safe Manning com IA"
      gradient="purple"
      badges={[
        { icon: Brain, label: "IA Verificação" },
        { icon: GraduationCap, label: "STCW Compliance" },
        { icon: UserCheck, label: "Safe Manning" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="crew" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="crew">
          <DataTableV2
            data={crew}
            columns={columns}
            title="Gestão de Tripulação"
            icon={Users}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            loading={loading}
            actions={[
              { label: "Verificar STCW", icon: Brain, onClick: (item) => toast.success(`Verificando certificados de ${item.name}`) },
              { label: "Gerar Relatório", icon: FileCheck, onClick: (item) => toast.info("Gerando relatório") },
            ]}
            filters={[
              { key: "compliance_status", label: "Status", options: [
                { value: "compliant", label: "Conforme" },
                { value: "expiring_soon", label: "Expirando" },
                { value: "non_compliant", label: "Não Conforme" }
              ]}
            ]}
          />
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Shield} title="Taxa de Conformidade" gradient="green">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-500">{complianceRate}%</p>
                  <p className="text-muted-foreground">Conformidade STCW</p>
                </div>
                <Progress value={Number(complianceRate)} className="h-3" />
              </div>
            </CardV2>
            <CardV2 icon={AlertTriangle} title="Alertas de Certificação" gradient="orange">
              <div className="space-y-3">
                {crew.filter(c => c.compliance_status !== 'compliant').map(c => (
                  <div key={c.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.rank} - Expira {new Date(c.certificate_expiry).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge variant={c.compliance_status === 'expiring_soon' ? 'secondary' : 'destructive'}>
                      {c.compliance_status === 'expiring_soon' ? 'Renovar' : 'Urgente'}
                    </Badge>
                  </div>
                ))}
                {crew.filter(c => c.compliance_status !== 'compliant').length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum alerta</p>
                )}
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="CTS Tripulação"
            moduleContext="conformidade STCW, Safe Manning Certificate, certificações marítimas"
            systemPrompt="Você é especialista em STCW e certificações marítimas. Ajude com verificação de conformidade, requisitos por função e renovação de certificados."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="cts-ai"
            accentColor="purple"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="CTS Tripulação"
            moduleContext="conformidade STCW, certificações marítimas, Safe Manning"
            edgeFunctionName="cts-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="purple"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
