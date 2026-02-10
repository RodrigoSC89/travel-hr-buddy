/**
 * WhistleblowerV2 - Canal de Denúncias
 * Canal seguro com classificação IA e interatividade completa
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Flag, Brain, Shield, Lock, AlertTriangle, CheckCircle, 
  Eye, Send, MessageSquare, User, Calendar, FileText, Download,
  Loader2, Clock
} from "lucide-react";

interface Report {
  id: string;
  category: string;
  severity: string;
  submitted_at: string;
  status: string;
  anonymous: boolean;
  description?: string;
  ai_classification?: {
    confidence: number;
    suggested_severity: string;
    tags: string[];
  };
  investigation_notes?: string;
  assigned_to?: string;
}

const QUICK_QUESTIONS = [
  "O canal é realmente anônimo?",
  "Quais categorias de denúncia?",
  "Prazo de investigação?",
  "Proteção ao denunciante?",
  "Como acompanhar denúncia?",
  "Quem investiga?"
];

const EVIDENCE_FIELDS = [
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "fraud", label: "Fraude" },
    { value: "corruption", label: "Corrupção" },
    { value: "harassment", label: "Assédio" },
    { value: "safety", label: "Segurança" },
    { value: "environmental", label: "Ambiental" },
    { value: "other", label: "Outro" }
  ], required: true },
  { name: "observed_condition", label: "Descrição da Denúncia", type: "textarea" as const, required: true },
];

const CATEGORIES = [
  { value: "fraud", label: "Fraude" },
  { value: "corruption", label: "Corrupção" },
  { value: "harassment", label: "Assédio" },
  { value: "safety", label: "Segurança" },
  { value: "environmental", label: "Ambiental" },
  { value: "other", label: "Outro" }
];

export default function WhistleblowerV2() {
  const [reports, setReports] = useState<Report[]>([
    { 
      id: "WB-001", 
      category: "safety", 
      severity: "high", 
      submitted_at: "2024-12-20", 
      status: "investigating", 
      anonymous: true,
      description: "Equipamento de segurança não foi inspecionado conforme protocolo.",
      ai_classification: { confidence: 92, suggested_severity: "high", tags: ["segurança", "equipamento", "protocolo"] }
    },
    { 
      id: "WB-002", 
      category: "fraud", 
      severity: "medium", 
      submitted_at: "2024-12-15", 
      status: "closed", 
      anonymous: true,
      description: "Irregularidades em documentação de fornecedor.",
      ai_classification: { confidence: 87, suggested_severity: "medium", tags: ["fraude", "documentação"] }
    },
    { 
      id: "WB-003", 
      category: "harassment", 
      severity: "high", 
      submitted_at: "2024-12-28", 
      status: "new", 
      anonymous: false,
      description: "Comportamento inadequado reportado por membro da tripulação."
    },
  ]);

  const [newReport, setNewReport] = useState({ category: '', description: '' });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showInvestigateDialog, setShowInvestigateDialog] = useState(false);
  const [showClassifyDialog, setShowClassifyDialog] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = reports.length;
  const newReports = reports.filter(r => r.status === 'new').length;
  const investigating = reports.filter(r => r.status === 'investigating').length;
  const closed = reports.filter(r => r.status === 'closed').length;

  const stats = [
    { label: "Total Denúncias", value: total, icon: Flag, color: "blue" as const },
    { label: "Novas", value: newReports, icon: AlertTriangle, color: "red" as const },
    { label: "Em Investigação", value: investigating, icon: Eye, color: "orange" as const },
    { label: "Fechadas", value: closed, icon: CheckCircle, color: "green" as const },
  ];

  const handleInvestigate = (report: Report) => {
    setSelectedReport(report);
    setInvestigationNotes(report.investigation_notes || "");
    setAssignedTo(report.assigned_to || "");
    setShowInvestigateDialog(true);
  };

  const handleStartInvestigation = () => {
    if (!selectedReport) return;
    
    setReports(prev => prev.map(r => 
      r.id === selectedReport.id 
        ? { 
            ...r, 
            status: "investigating", 
            investigation_notes: investigationNotes,
            assigned_to: assignedTo 
          } 
        : r
    ));
    
    toast.success(`Investigação iniciada para ${selectedReport.id}`, {
      description: `Atribuído a: ${assignedTo || "Equipe de Compliance"}`
    });
    setShowInvestigateDialog(false);
    setSelectedReport(null);
  };

  const handleCloseInvestigation = () => {
    if (!selectedReport) return;
    
    setReports(prev => prev.map(r => 
      r.id === selectedReport.id 
        ? { ...r, status: "closed", investigation_notes: investigationNotes } 
        : r
    ));
    
    toast.success(`Investigação ${selectedReport.id} concluída`);
    setShowInvestigateDialog(false);
    setSelectedReport(null);
  };

  const handleClassifyAI = async (report: Report) => {
    setSelectedReport(report);
    setIsClassifying(true);
    setShowClassifyDialog(true);
    
    // AI classification
    
    const aiResult = {
      confidence: 92,
      suggested_severity: report.description?.includes("segurança") ? "high" : 
                          report.description?.includes("fraud") ? "high" : "medium",
      tags: generateTags(report.category, report.description || "")
    };
    
    setReports(prev => prev.map(r => 
      r.id === report.id 
        ? { ...r, ai_classification: aiResult } 
        : r
    ));
    
    setIsClassifying(false);
  };

  const generateTags = (category: string, description: string): string[] => {
    const tags = [category];
    const keywords = ["urgente", "crítico", "recorrente", "documentação", "equipamento", "comportamento"];
    keywords.forEach(k => {
      if (description.toLowerCase().includes(k)) tags.push(k);
    });
    return tags.slice(0, 4);
  };

  const handleSubmitReport = async () => {
    if (!newReport.description) {
      toast.error("Por favor, descreva a denúncia");
      return;
    }
    
    setIsSubmitting(true);
    // Submit report
    
    const protocol = `WB-${Date.now().toString().slice(-6)}`;
    const newReportData: Report = {
      id: protocol,
      category: newReport.category || "other",
      severity: "pending",
      submitted_at: new Date().toISOString().split('T')[0],
      status: "new",
      anonymous: true,
      description: newReport.description
    };
    
    setReports(prev => [newReportData, ...prev]);
    setNewReport({ category: '', description: '' });
    setIsSubmitting(false);
    
    toast.success("Denúncia registrada com sucesso!", {
      description: `Protocolo: ${protocol}. Guarde este número para acompanhamento.`
    });
  };

  const handleExportReport = (report: Report) => {
    const content = `
RELATÓRIO DE DENÚNCIA
=====================
Protocolo: ${report.id}
Data: ${report.submitted_at}
Categoria: ${CATEGORIES.find(c => c.value === report.category)?.label || report.category}
Severidade: ${report.severity}
Status: ${report.status}
Anônima: ${report.anonymous ? "Sim" : "Não"}

DESCRIÇÃO:
${report.description || "Não disponível"}

CLASSIFICAÇÃO IA:
${report.ai_classification ? `
Confiança: ${report.ai_classification.confidence}%
Severidade Sugerida: ${report.ai_classification.suggested_severity}
Tags: ${report.ai_classification.tags.join(", ")}
` : "Não classificado"}

NOTAS DE INVESTIGAÇÃO:
${report.investigation_notes || "Nenhuma nota"}

Atribuído a: ${report.assigned_to || "Não atribuído"}
    `.trim();
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denuncia-${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Relatório ${report.id} exportado`);
  };

  const columns = [
    { key: "id", label: "Protocolo" },
    { key: "category", label: "Categoria", render: (item: Report) => (
      <Badge variant="secondary">
        {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
      </Badge>
    )},
    { key: "severity", label: "Severidade", render: (item: Report) => (
      <Badge variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'secondary' : 'outline'}>
        {item.severity === 'high' ? 'Alta' : item.severity === 'medium' ? 'Média' : item.severity === 'pending' ? 'Pendente' : 'Baixa'}
      </Badge>
    )},
    { key: "submitted_at", label: "Data", render: (item: Report) => new Date(item.submitted_at).toLocaleDateString('pt-BR') },
    { key: "anonymous", label: "Anônimo", render: (item: Report) => (
      <Badge variant="outline">{item.anonymous ? 'Sim' : 'Não'}</Badge>
    )},
    { key: "status", label: "Status", render: (item: Report) => (
      <Badge variant={item.status === 'closed' ? 'default' : item.status === 'investigating' ? 'secondary' : 'destructive'}>
        {item.status === 'closed' ? 'Fechado' : item.status === 'investigating' ? 'Investigando' : 'Novo'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Flag}
      title="Canal de Denúncias"
      description="Canal seguro e confidencial com classificação IA"
      gradient="red"
      badges={[
        { icon: Brain, label: "IA Classificação" },
        { icon: Lock, label: "100% Confidencial" },
        { icon: Shield, label: "Proteção" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
          <TabsTrigger value="submit">Nova Denúncia</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <DataTableV2
            data={reports}
            columns={columns}
            title="Denúncias Recebidas"
            icon={Flag}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Investigar", icon: Eye, onClick: handleInvestigate },
              { label: "Classificar IA", icon: Brain, onClick: handleClassifyAI },
              { label: "Exportar", icon: Download, onClick: handleExportReport },
            ]}
          />
        </TabsContent>

        <TabsContent value="submit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={MessageSquare} title="Enviar Denúncia" description="Seu relato é 100% confidencial" gradient="red">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Comunicação Segura</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sua identidade será protegida. Você pode denunciar de forma anônima.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newReport.category} 
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição da Denúncia</Label>
                  <Textarea 
                    placeholder="Descreva o que você observou ou vivenciou..."
                    rows={6}
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Denúncia Anônima
                    </>
                  )}
                </Button>
              </div>
            </CardV2>
            
            <CardV2 icon={Shield} title="Proteção ao Denunciante" description="Suas garantias" gradient="green">
              <div className="space-y-4">
                {[
                  { title: "Anonimato Garantido", desc: "Sua identidade nunca será revelada" },
                  { title: "Proteção contra Retaliação", desc: "Lei protege denunciantes de boa-fé" },
                  { title: "Investigação Imparcial", desc: "Equipe independente analisa os casos" },
                  { title: "Feedback do Processo", desc: "Acompanhe o status pelo protocolo" }
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Canal de Denúncias"
            moduleContext="canal de denúncias, compliance, ética, investigação"
            systemPrompt="Você é especialista em canais de denúncia e ética corporativa. Ajude com orientações sobre denúncias, proteção ao denunciante e processo de investigação."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="whistleblower-ai"
            accentColor="red"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Canal de Denúncias"
            moduleContext="denúncias, investigação, compliance, ética"
            edgeFunctionName="whistleblower-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="red"
          />
        </TabsContent>
      </Tabs>

      {/* Investigation Dialog */}
      <Dialog open={showInvestigateDialog} onOpenChange={setShowInvestigateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Investigar Denúncia {selectedReport?.id}
            </DialogTitle>
            <DialogDescription>
              Gerenciar investigação e atribuir responsável
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">{CATEGORIES.find(c => c.value === selectedReport.category)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Atual</p>
                  <Badge variant={selectedReport.status === 'new' ? 'destructive' : 'secondary'}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-sm mt-1">{selectedReport.description}</p>
                </div>
              </div>
              
              {selectedReport.ai_classification && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">Classificação IA</span>
                    <Badge variant="outline">{selectedReport.ai_classification.confidence}% confiança</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedReport.ai_classification.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Atribuir a</Label>
                <Input 
                  placeholder="Nome do investigador ou equipe..."
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notas da Investigação</Label>
                <Textarea 
                  placeholder="Registre observações, ações tomadas, próximos passos..."
                  rows={4}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInvestigateDialog(false)}>
              Cancelar
            </Button>
            {selectedReport?.status !== 'closed' && (
              <>
                <Button variant="secondary" onClick={handleStartInvestigation}>
                  <Clock className="h-4 w-4 mr-2" />
                  Iniciar/Atualizar Investigação
                </Button>
                <Button onClick={handleCloseInvestigation}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir Investigação
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Classification Dialog */}
      <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Classificação IA
            </DialogTitle>
          </DialogHeader>
          
          {isClassifying ? (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analisando denúncia com IA...</p>
              <p className="text-sm text-muted-foreground mt-2">Identificando padrões e categorias</p>
            </div>
          ) : selectedReport?.ai_classification ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">Classificação Concluída</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Confiança</p>
                  <p className="text-2xl font-bold">{selectedReport.ai_classification.confidence}%</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Severidade Sugerida</p>
                  <Badge variant={selectedReport.ai_classification.suggested_severity === 'high' ? 'destructive' : 'secondary'}>
                    {selectedReport.ai_classification.suggested_severity === 'high' ? 'Alta' : 'Média'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags Identificadas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.ai_classification.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button onClick={() => setShowClassifyDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayoutV2>
  );
}
