/**
 * ISOSOCCompliancePage - ISO 27001 & SOC 2 Type II Preparation Tracker
 * Phase 4: Certification readiness dashboard
 */
import { motion } from "framer-motion";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Lock, Eye, Server, Users, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ControlGroup {
  name: string;
  icon: React.ElementType;
  controls: { id: string; name: string; status: "done" | "in_progress" | "todo"; evidence?: string }[];
}

const iso27001Controls: ControlGroup[] = [
  {
    name: "A.5 - Políticas de Segurança", icon: FileText,
    controls: [
      { id: "A.5.1", name: "Política de segurança da informação", status: "done", evidence: "security-policy.pdf" },
      { id: "A.5.2", name: "Revisão de políticas", status: "done", evidence: "review-log.pdf" },
    ],
  },
  {
    name: "A.6 - Organização da SI", icon: Users,
    controls: [
      { id: "A.6.1", name: "Responsabilidades e papéis", status: "done", evidence: "RBAC config + user_roles table" },
      { id: "A.6.2", name: "Segregação de funções", status: "done", evidence: "RLS policies + role hierarchy" },
    ],
  },
  {
    name: "A.8 - Gestão de Ativos", icon: Database,
    controls: [
      { id: "A.8.1", name: "Inventário de ativos", status: "done", evidence: "720+ tables catalogadas" },
      { id: "A.8.2", name: "Classificação de informação", status: "in_progress" },
      { id: "A.8.3", name: "Tratamento de mídias", status: "done", evidence: "Supabase Storage policies" },
    ],
  },
  {
    name: "A.9 - Controle de Acesso", icon: Lock,
    controls: [
      { id: "A.9.1", name: "Requisitos de controle de acesso", status: "done", evidence: "RLS + RBAC + auth.uid()" },
      { id: "A.9.2", name: "Gestão de acesso do usuário", status: "done", evidence: "active_sessions table" },
      { id: "A.9.3", name: "Responsabilidades do usuário", status: "done", evidence: "Onboarding flow" },
      { id: "A.9.4", name: "Controle de acesso ao sistema", status: "done", evidence: "MFA + session management" },
    ],
  },
  {
    name: "A.10 - Criptografia", icon: Shield,
    controls: [
      { id: "A.10.1", name: "Controles criptográficos", status: "done", evidence: "TLS 1.3 + SHA-256 blockchain" },
    ],
  },
  {
    name: "A.12 - Segurança Operacional", icon: Server,
    controls: [
      { id: "A.12.1", name: "Procedimentos operacionais", status: "done", evidence: "Edge functions + CI/CD" },
      { id: "A.12.2", name: "Proteção contra malware", status: "done", evidence: "Input validation + Zod schemas" },
      { id: "A.12.3", name: "Backup", status: "done", evidence: "Supabase auto-backups" },
      { id: "A.12.4", name: "Logs e monitoramento", status: "done", evidence: "access_logs + ai_audit_logs + Sentry" },
    ],
  },
  {
    name: "A.16 - Gestão de Incidentes", icon: AlertTriangle,
    controls: [
      { id: "A.16.1", name: "Gestão de incidentes de SI", status: "done", evidence: "qhse_incidents + ai_self_healing_logs" },
      { id: "A.16.2", name: "Reporte de eventos", status: "done", evidence: "Whistleblower + incident timeline" },
    ],
  },
  {
    name: "A.18 - Conformidade", icon: Eye,
    controls: [
      { id: "A.18.1", name: "Conformidade legal e contratual", status: "done", evidence: "LGPD + maritime compliance frameworks" },
      { id: "A.18.2", name: "Revisões de segurança", status: "in_progress" },
    ],
  },
];

const soc2Criteria = [
  { id: "CC1", name: "Ambiente de Controle", status: "done" as const, score: 95 },
  { id: "CC2", name: "Comunicação e Informação", status: "done" as const, score: 90 },
  { id: "CC3", name: "Avaliação de Risco", status: "done" as const, score: 92 },
  { id: "CC4", name: "Monitoramento", status: "done" as const, score: 88 },
  { id: "CC5", name: "Atividades de Controle", status: "done" as const, score: 94 },
  { id: "CC6", name: "Controles de Acesso Lógicos e Físicos", status: "done" as const, score: 96 },
  { id: "CC7", name: "Operações de Sistema", status: "in_progress" as const, score: 82 },
  { id: "CC8", name: "Gestão de Mudanças", status: "in_progress" as const, score: 78 },
  { id: "CC9", name: "Mitigação de Risco", status: "done" as const, score: 90 },
];

const ISOSOCCompliancePage = () => {
  const totalISO = iso27001Controls.flatMap(g => g.controls);
  const doneISO = totalISO.filter(c => c.status === "done").length;
  const isoPercent = Math.round((doneISO / totalISO.length) * 100);
  
  const soc2Avg = Math.round(soc2Criteria.reduce((a, c) => a + c.score, 0) / soc2Criteria.length);
  const soc2Done = soc2Criteria.filter(c => c.status === "done").length;

  const statusIcon = (status: string) => {
    switch (status) {
      case "done": return <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)]" />;
      case "in_progress": return <Clock className="w-4 h-4 text-[hsl(45,100%,51%)]" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          ISO 27001 & SOC 2 Type II
        </h1>
        <p className="text-muted-foreground mt-1">Preparação para certificação de segurança enterprise</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">ISO 27001:2022</h3>
                <p className="text-sm text-muted-foreground">Anexo A Controls</p>
              </div>
              <Badge className="bg-[hsl(142,76%,36%)]/10 text-[hsl(142,76%,36%)] text-lg px-4 py-1">{isoPercent}%</Badge>
            </div>
            <Progress value={isoPercent} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{doneISO}/{totalISO.length} controles implementados</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">SOC 2 Type II</h3>
                <p className="text-sm text-muted-foreground">Trust Service Criteria</p>
              </div>
              <Badge className="bg-[hsl(214,84%,46%)]/10 text-[hsl(214,84%,46%)] text-lg px-4 py-1">{soc2Avg}%</Badge>
            </div>
            <Progress value={soc2Avg} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{soc2Done}/{soc2Criteria.length} critérios atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* ISO 27001 Details */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">ISO 27001 — Controles do Anexo A</h2>
        <div className="space-y-4">
          {iso27001Controls.map(group => (
            <Card key={group.name} className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <group.icon className="w-5 h-5 text-primary" />
                  {group.name}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {group.controls.filter(c => c.status === "done").length}/{group.controls.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {group.controls.map(ctrl => (
                    <div key={ctrl.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      {statusIcon(ctrl.status)}
                      <Badge variant="outline" className="font-mono text-xs">{ctrl.id}</Badge>
                      <span className="text-sm text-foreground flex-1">{ctrl.name}</span>
                      {ctrl.evidence && (
                        <span className="text-xs text-muted-foreground hidden md:block">{ctrl.evidence}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SOC 2 Details */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">SOC 2 Type II — Trust Service Criteria</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {soc2Criteria.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {statusIcon(c.status)}
                    <Badge variant="outline" className="font-mono text-xs">{c.id}</Badge>
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  </div>
                  <Progress value={c.score} className="h-2 mb-1" />
                  <div className="text-xs text-muted-foreground text-right">{c.score}%</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ISOSOCCompliancePage;
