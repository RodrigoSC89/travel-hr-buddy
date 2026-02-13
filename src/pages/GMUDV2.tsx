/**
 * GMUDV2 - Gestão de Mudanças V2
 * Workflow de assinaturas digitais com IA
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  GitBranch, Brain, Shield, Users, CheckCircle, XCircle, Clock, 
  Send, FileCheck, AlertTriangle, PenTool
} from "lucide-react";
import { GMUDApprovalModal } from "@/components/gmud/GMUDApprovalModal";

interface GMUDRequest {
  id: string;
  title: string;
  change_type: string;
  status: string;
  current_step: number;
  total_steps: number;
  requester: string;
  created_at: string;
  approvers: { role: string; status: string; date?: string }[];
}

const QUICK_QUESTIONS = [
  "O que é uma GMUD?",
  "Quem deve aprovar mudanças?",
  "Como funciona o rollback?",
  "Tipos de mudança (técnica vs processual)?",
  "Prazo para aprovação?",
  "Como escalar uma GMUD urgente?"
];

const EVIDENCE_FIELDS = [
  { name: "change_title", label: "Título da Mudança", type: "text" as const, required: true },
  { name: "change_type", label: "Tipo", type: "select" as const, options: [
    { value: "technical", label: "Técnica" },
    { value: "procedural", label: "Processual" },
    { value: "emergency", label: "Emergencial" }
  ], required: true },
  { name: "observed_condition", label: "Justificativa/Impacto", type: "textarea" as const, required: true },
];

export default function GMUDV2() {
  const [requests, setRequests] = useState<GMUDRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGmud, setSelectedGmud] = useState<GMUDRequest | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  useEffect(() => {
    setRequests([
      { id: "GMUD-001", title: "Atualização Sistema GPS para DGPS", change_type: "technical", status: "in_progress", current_step: 2, total_steps: 4, requester: "João Silva", created_at: "2024-12-28", approvers: [
        { role: "Safety Officer", status: "approved", date: "2024-12-29" },
        { role: "Chief Engineer", status: "pending" },
        { role: "Captain", status: "pending" },
        { role: "Shipowner", status: "pending" }
      ]},
      { id: "GMUD-002", title: "Novo procedimento de troca de turno", change_type: "procedural", status: "approved", current_step: 4, total_steps: 4, requester: "Maria Santos", created_at: "2024-12-20", approvers: [
        { role: "Safety Officer", status: "approved", date: "2024-12-21" },
        { role: "Chief Engineer", status: "approved", date: "2024-12-22" },
        { role: "Captain", status: "approved", date: "2024-12-23" },
        { role: "Shipowner", status: "approved", date: "2024-12-24" }
      ]},
    ]);
    setLoading(false);
  }, []);

  const handleOpenApproval = (gmud: GMUDRequest) => {
    setSelectedGmud(gmud);
    setIsApprovalOpen(true);
  };

  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const pending = requests.filter(r => r.status === 'pending').length;

  const stats = [
    { label: "Total GMUDs", value: total, icon: GitBranch, color: "blue" as const },
    { label: "Aprovadas", value: approved, icon: CheckCircle, color: "green" as const },
    { label: "Em Aprovação", value: inProgress, icon: Clock, color: "orange" as const },
    { label: "Pendentes", value: pending, icon: AlertTriangle, color: "purple" as const },
  ];

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "title", label: "Mudança", sortable: true },
    { key: "change_type", label: "Tipo", render: (item: GMUDRequest) => (
      <Badge variant={item.change_type === 'technical' ? 'default' : item.change_type === 'emergency' ? 'destructive' : 'secondary'}>
        {item.change_type === 'technical' ? 'Técnica' : item.change_type === 'emergency' ? 'Emergencial' : 'Processual'}
      </Badge>
    )},
    { key: "current_step", label: "Progresso", render: (item: GMUDRequest) => (
      <div className="flex items-center gap-2">
        <Progress value={(item.current_step / item.total_steps) * 100} className="h-2 w-20" />
        <span className="text-xs">{item.current_step}/{item.total_steps}</span>
      </div>
    )},
    { key: "status", label: "Status", render: (item: GMUDRequest) => (
      <Badge variant={item.status === 'approved' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'}>
        {item.status === 'approved' ? 'Aprovada' : item.status === 'in_progress' ? 'Em Aprovação' : 'Pendente'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={GitBranch}
      title="GMUD"
      description="Gestão de Mudanças com workflow automático de assinaturas digitais"
      gradient="purple"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: PenTool, label: "Assinatura Digital" },
        { icon: Users, label: "Multi-Aprovadores" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <DataTableV2
            data={requests}
            columns={columns}
            title="Solicitações de Mudança"
            icon={GitBranch}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            loading={loading}
            actions={[
              { label: "Ver Workflow", icon: Users, onClick: (item) => handleOpenApproval(item) },
              { label: "Aprovar", icon: CheckCircle, onClick: (item) => handleOpenApproval(item) },
            ]}
          />
        </TabsContent>

        {/* Approval Modal */}
        {selectedGmud && (
          <GMUDApprovalModal
            open={isApprovalOpen}
            onClose={() => setIsApprovalOpen(false)}
            gmudData={{
              id: selectedGmud.id,
              gmud_number: selectedGmud.id,
              title: selectedGmud.title,
              description: "Descrição detalhada da mudança proposta",
              change_type: selectedGmud.change_type,
              risk_level: "medium",
              rollback_plan: "Reverter para configuração anterior",
              current_step: selectedGmud.current_step,
              total_steps: selectedGmud.total_steps,
              approvers: selectedGmud.approvers.map((a, i) => ({
                id: `ap-${i}`,
                role: a.role,
                status: a.status as 'pending' | 'approved' | 'rejected',
                signed_at: a.date,
              })),
            }}
            approvalId="pending-approval-id"
            userRole="Chief Engineer"
            onApprovalComplete={() => {
              toast.success("GMUD aprovada com sucesso!");
              setIsApprovalOpen(false);
            }}
          />
        )}

        <TabsContent value="workflow">
          <CardV2 icon={Users} title="Workflow de Aprovação" description="Sequência de assinaturas digitais" gradient="purple">
            <div className="space-y-6">
              {requests.slice(0, 1).map(req => (
                <div key={req.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-muted-foreground">{req.id}</p>
                    </div>
                    <Badge>{req.current_step}/{req.total_steps}</Badge>
                  </div>
                  <div className="flex gap-4">
                    {req.approvers.map((approver) => (
                      <div key={approver.role} className="flex-1 p-3 bg-background rounded-lg border text-center">
                        {approver.status === 'approved' ? (
                          <CheckCircle className="h-6 w-6 mx-auto text-success mb-2" />
                        ) : approver.status === 'pending' ? (
                          <Clock className="h-6 w-6 mx-auto text-warning mb-2" />
                        ) : (
                          <XCircle className="h-6 w-6 mx-auto text-destructive mb-2" />
                        )}
                        <p className="text-sm font-medium">{approver.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {approver.status === 'approved' ? approver.date : 'Aguardando'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="GMUD"
            moduleContext="gestão de mudanças, workflow de aprovação, assinaturas digitais"
            systemPrompt="Você é especialista em gestão de mudanças (GMUD). Ajude com análise de riscos, workflow de aprovação e rollback."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="gmud-ai"
            accentColor="purple"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="GMUD"
            moduleContext="gestão de mudanças, análise de impacto, rollback"
            edgeFunctionName="gmud-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="purple"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
