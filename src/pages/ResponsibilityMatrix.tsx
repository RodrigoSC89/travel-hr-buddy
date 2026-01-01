import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutGrid, Plus, Users, CheckCircle, Clock, AlertTriangle,
  Send, Bell, Mail, MessageSquare, RefreshCw
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_email: string;
  assigned_to_phone: string;
  priority: "low" | "medium" | "high" | "critical";
  due_date: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  source_module: string;
  vessel_name?: string;
  created_at: string;
}

interface MatrixCell {
  activity: string;
  roles: Record<string, "R" | "A" | "C" | "I" | "">;
}

const RACI_LEGEND = {
  R: { label: "Responsável", description: "Executa a atividade", color: "bg-blue-500" },
  A: { label: "Accountable", description: "Aprova e responde pelo resultado", color: "bg-green-500" },
  C: { label: "Consultar", description: "Deve ser consultado", color: "bg-yellow-500" },
  I: { label: "Informar", description: "Deve ser informado", color: "bg-purple-500" },
};

const ResponsibilityMatrix = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("matrix");
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const [actionForm, setActionForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    assigned_to_email: "",
    assigned_to_phone: "",
    priority: "medium",
    due_date: "",
    vessel_name: ""
  });

  // Demo matrix data
  const roles = ["Capitão", "Chefe Máquinas", "Oficial Segurança", "Armador", "RH"];
  const [matrixData] = useState<MatrixCell[]>([
    { activity: "Inspeção de Segurança", roles: { "Capitão": "A", "Chefe Máquinas": "C", "Oficial Segurança": "R", "Armador": "I", "RH": "" } },
    { activity: "Manutenção Preventiva", roles: { "Capitão": "I", "Chefe Máquinas": "R", "Oficial Segurança": "C", "Armador": "A", "RH": "" } },
    { activity: "Treinamento de Tripulação", roles: { "Capitão": "A", "Chefe Máquinas": "C", "Oficial Segurança": "C", "Armador": "I", "RH": "R" } },
    { activity: "Relatório de Incidentes", roles: { "Capitão": "A", "Chefe Máquinas": "C", "Oficial Segurança": "R", "Armador": "I", "RH": "I" } },
    { activity: "Certificação de Equipamentos", roles: { "Capitão": "I", "Chefe Máquinas": "R", "Oficial Segurança": "C", "Armador": "A", "RH": "" } },
  ]);

  // Demo actions
  const [actions] = useState<ActionItem[]>([
    {
      id: "ACT-001",
      title: "Completar inspeção mensal de salvatagem",
      description: "Verificar todos os equipamentos de salvatagem conforme SOLAS",
      assigned_to: "João Silva",
      assigned_to_email: "joao.silva@nautilus.com",
      assigned_to_phone: "+5521999999999",
      priority: "high",
      due_date: "2025-01-05",
      status: "pending",
      source_module: "Segurança",
      vessel_name: "MV Atlantic Explorer",
      created_at: "2024-12-28"
    },
    {
      id: "ACT-002",
      title: "Atualizar certificados STCW",
      description: "3 tripulantes com certificados vencendo em 30 dias",
      assigned_to: "Maria Santos",
      assigned_to_email: "maria.santos@nautilus.com",
      assigned_to_phone: "+5521888888888",
      priority: "critical",
      due_date: "2025-01-02",
      status: "in_progress",
      source_module: "CTS",
      vessel_name: "OSV Petrobras XXI",
      created_at: "2024-12-27"
    }
  ]);

  const handleCreateAction = async () => {
    setIsLoading(true);
    try {
      const actionItem = {
        id: `ACT-${Date.now()}`,
        ...actionForm,
        status: "pending",
        source_module: "Manual",
        created_at: new Date().toISOString()
      };

      // Dispatch via Edge Function
      const { data, error } = await supabase.functions.invoke("responsibility-matrix-dispatch", {
        body: {
          action_item: actionItem,
          assigned_to: {
            name: actionForm.assigned_to,
            email: actionForm.assigned_to_email,
            phone: actionForm.assigned_to_phone
          },
          notification_channels: webhookUrl ? ["zapier", "in_app"] : ["in_app"],
          webhook_url: webhookUrl || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Ação Criada",
        description: `Notificação enviada para ${actionForm.assigned_to}`
      });
      
      setIsNewActionOpen(false);
      setActionForm({
        title: "",
        description: "",
        assigned_to: "",
        assigned_to_email: "",
        assigned_to_phone: "",
        priority: "medium",
        due_date: "",
        vessel_name: ""
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar ação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      low: { variant: "outline", label: "Baixa" },
      medium: { variant: "secondary", label: "Média" },
      high: { variant: "default", label: "Alta" },
      critical: { variant: "destructive", label: "Crítica" }
    };
    const { variant, label } = config[priority] || { variant: "outline" as const, label: priority };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      pending: { variant: "outline", label: "Pendente", icon: <Clock className="h-3 w-3" /> },
      in_progress: { variant: "secondary", label: "Em Execução", icon: <RefreshCw className="h-3 w-3" /> },
      completed: { variant: "default", label: "Concluído", icon: <CheckCircle className="h-3 w-3" /> },
      overdue: { variant: "destructive", label: "Atrasado", icon: <AlertTriangle className="h-3 w-3" /> }
    };
    const { variant, label, icon } = config[status] || { variant: "outline" as const, label: status, icon: null };
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={LayoutGrid}
        title="Matriz de Responsabilidades"
        description="RACI Matrix com automação de ações via Zapier/Twilio"
        gradient="blue"
        badges={[
          { icon: Users, label: "RACI Model" },
          { icon: Bell, label: "Notificações" },
          { icon: Send, label: "Zapier/Twilio" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="matrix">Matriz RACI</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <Dialog open={isNewActionOpen} onOpenChange={setIsNewActionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Ação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Ação</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título da Ação</Label>
                  <Input 
                    value={actionForm.title}
                    onChange={(e) => setActionForm({...actionForm, title: e.target.value})}
                    placeholder="Descreva a ação..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={actionForm.description}
                    onChange={(e) => setActionForm({...actionForm, description: e.target.value})}
                    placeholder="Detalhes da ação..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input 
                      value={actionForm.assigned_to}
                      onChange={(e) => setActionForm({...actionForm, assigned_to: e.target.value})}
                      placeholder="Nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={actionForm.priority} onValueChange={(v) => setActionForm({...actionForm, priority: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={actionForm.assigned_to_email}
                      onChange={(e) => setActionForm({...actionForm, assigned_to_email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone (WhatsApp)</Label>
                    <Input 
                      value={actionForm.assigned_to_phone}
                      onChange={(e) => setActionForm({...actionForm, assigned_to_phone: e.target.value})}
                      placeholder="+5521999999999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prazo</Label>
                    <Input 
                      type="date"
                      value={actionForm.due_date}
                      onChange={(e) => setActionForm({...actionForm, due_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Embarcação</Label>
                    <Input 
                      value={actionForm.vessel_name}
                      onChange={(e) => setActionForm({...actionForm, vessel_name: e.target.value})}
                      placeholder="Nome da embarcação"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Zapier (Opcional)</Label>
                  <Input 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..."
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    SMS/WhatsApp via Twilio
                    <Mail className="h-3 w-3 ml-2" />
                    Email automático
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewActionOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAction} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Criar e Notificar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz RACI</CardTitle>
              <CardDescription>R = Responsável, A = Accountable, C = Consultar, I = Informar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                {Object.entries(RACI_LEGEND).map(([key, { label, color }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${color}`}>
                      {key}
                    </div>
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Atividade</TableHead>
                    {roles.map(role => (
                      <TableHead key={role} className="text-center">{role}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.activity}</TableCell>
                      {roles.map(role => {
                        const value = row.roles[role] || "";
                        const legend = value ? RACI_LEGEND[value as keyof typeof RACI_LEGEND] : null;
                        return (
                          <TableCell key={role} className="text-center">
                            {legend && (
                              <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold mx-auto ${legend.color}`}>
                                {value}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Ativas</CardTitle>
              <CardDescription>Ações criadas a partir da matriz de responsabilidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{action.id}</span>
                          {getPriorityBadge(action.priority)}
                          {getStatusBadge(action.status)}
                        </div>
                        <h4 className="font-medium">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>👤 {action.assigned_to}</span>
                          <span>📅 {new Date(action.due_date).toLocaleDateString('pt-BR')}</span>
                          <span>🚢 {action.vessel_name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Lembrete Enviado", description: `Notificação enviada para ${action.assigned_to}` })}>
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => toast({ title: "Ação Concluída", description: `${action.id} marcada como concluída` })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {actions.filter(a => a.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {actions.filter(a => a.status === "completed").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {actions.filter(a => a.status === "overdue").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default ResponsibilityMatrix;
