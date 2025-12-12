import { useCallback, useEffect, useState } from "react";;
import React, { useState, useEffect, useCallback } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Video, 
  Plus, 
  MessageSquare, 
  FileText, 
  Clock,
  Users,
  Sparkles,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  X,
  Hash,
  Lock,
  Globe,
  Phone,
  Copy,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  WorkspaceTeamPanel,
  WorkspaceChatPanel,
  WorkspaceDocuments,
  WorkspaceActivities,
  type TeamMember,
  type ChatMessage,
  type SharedDocument,
  type WorkspaceActivity,
} from "./components";

// Mock data for team members
const TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Cap. Roberto Silva", role: "Comandante", status: "online" },
  { id: "2", name: "Eng. Maria Santos", role: "Chefe de Máquinas", status: "online" },
  { id: "3", name: "Of. João Pereira", role: "Oficial de Náutica", status: "away", lastSeen: "5 min" },
  { id: "4", name: "Téc. Ana Costa", role: "Eletricista", status: "busy" },
  { id: "5", name: "Of. Carlos Lima", role: "Oficial de Segurança", status: "offline", lastSeen: "2h" },
];

// Mock documents
const SHARED_DOCUMENTS: SharedDocument[] = [
  { id: "1", name: "Relatório Operacional Q4", type: "PDF", size: "2.4 MB", lastModified: "Há 10 min", modifiedBy: "Cap. Roberto", shared: true },
  { id: "2", name: "Checklist Pré-Operação", type: "DOCX", size: "156 KB", lastModified: "Há 1 hora", modifiedBy: "Of. João", shared: true },
  { id: "3", name: "Planilha de Escalas", type: "XLSX", size: "890 KB", lastModified: "Há 3 horas", modifiedBy: "Maria Santos" },
  { id: "4", name: "Manual de Segurança", type: "PDF", size: "5.2 MB", lastModified: "Ontem", modifiedBy: "Of. Carlos" },
];

// Mock activities
const INITIAL_ACTIVITIES: WorkspaceActivity[] = [
  { id: "1", type: "document", action: "Documento enviado", description: "Cap. Roberto enviou novo relatório operacional", user: "Cap. Roberto", timestamp: new Date().toISOString(), priority: "medium" },
  { id: "2", type: "task", action: "Checklist concluído", description: "Checklist de navegação completado com sucesso", user: "Of. João", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "3", type: "user", action: "Escala atualizada", description: "Maria Santos atualizou a escala de tripulação", user: "Maria Santos", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "4", type: "meeting", action: "Reunião iniciada", description: "Briefing de operações diárias", user: "Sistema", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "5", type: "alert", action: "Alerta de manutenção", description: "Manutenção preventiva programada para amanhã", user: "Sistema", timestamp: new Date(Date.now() - 10800000).toISOString(), priority: "high" },
];

const RealTimeWorkspaceProfessional: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [teamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [documents, setDocuments] = useState<SharedDocument[]>(SHARED_DOCUMENTS);
  const [activities, setActivities] = useState<WorkspaceActivity[]>(INITIAL_ACTIVITIES);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "1",
      userName: "Cap. Roberto",
      content: "Relatório de operação enviado para revisão.",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isOwn: false,
      status: "read",
    },
    {
      id: "2",
      userId: "current",
      userName: "Você",
      content: "Recebi. Vou analisar e retorno em 30 minutos.",
      timestamp: new Date(Date.now() - 780000).toISOString(),
      isOwn: true,
      status: "read",
    },
    {
      id: "3",
      userId: "1",
      userName: "Cap. Roberto",
      content: "Perfeito. Aguardo.",
      timestamp: new Date(Date.now() - 720000).toISOString(),
      isOwn: false,
      status: "read",
    },
    {
      id: "4",
      userId: "3",
      userName: "Of. João",
      content: "Checklist de navegação concluído.",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isOwn: false,
      status: "read",
    },
  ]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"public" | "private">("public");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLinkCopied, setMeetingLinkCopied] = useState(false);
  const [currentChannel, setCurrentChannel] = useState("operações-gerais");
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    autoSuggestions: true,
    summarization: true,
    translation: false,
  });
  const { toast } = useToast();

  const onlineCount = teamMembers.filter(m => m.status === "online" || m.status === "away").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add a system message
      const refreshActivity: WorkspaceActivity = {
        id: String(Date.now()),
        type: "system",
        action: "Dados atualizados",
        description: "Workspace sincronizado com sucesso",
        user: "Sistema",
        timestamp: new Date().toISOString(),
      };
      setActivities(prev => [refreshActivity, ...prev]);
      
      toast({
        title: "Atualizado",
        description: "Todos os dados foram sincronizados",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = useCallback((content: string, type?: ChatMessage["type"]) => {
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      userId: "current",
      userName: "Você",
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sent",
      type: type || "text",
    };
    setMessages(prev => [...prev, newMessage]);

    // Add activity
    const activity: WorkspaceActivity = {
      id: String(Date.now()),
      type: "message",
      action: "Nova mensagem",
      description: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
      user: "Você",
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [activity, ...prev]);
  }, []);

  const handleAIAssist = useCallback(async (message: string) => {
    setIsLoadingAI(true);
    
    try {
      // Try to call the edge function for real AI response
      const { data, error } = await supabase.functions.invoke("nautilus-llm", {
        body: { 
          message,
          context: "workspace_chat",
          systemPrompt: "Você é um assistente de IA para um workspace marítimo. Ajude com operações, documentação, e comunicação da equipe. Responda de forma concisa e profissional em português."
        }
      });
      
      let aiContent: string;
      
      if (error || !data?.response) {
        // Fallback to mock responses
        const aiResponses = [
          `Analisando sua mensagem sobre "${message.substring(0, 30)}...":\n\n1. Verifique os protocolos de segurança\n2. Consulte a documentação técnica\n3. Agende uma reunião com a equipe se necessário`,
          "Com base na sua solicitação, recomendo:\n\n• Revisar o checklist de operações\n• Confirmar com o comandante\n• Atualizar o log de atividades",
          "Análise do contexto marítimo:\n\n✓ Condições meteorológicas: Favoráveis\n✓ Status da embarcação: Operacional\n✓ Próxima parada: Conforme programação\n\nSugestão: Mantenha a equipe informada sobre atualizações.",
        ];
        aiContent = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      } else {
        aiContent = data.response;
      }
      
      const aiMessage: ChatMessage = {
        id: String(Date.now()),
        userId: "ai",
        userName: "Copilot IA",
        content: aiContent,
        timestamp: new Date().toISOString(),
        isOwn: false,
        isAI: true,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("AI assist error:", error);
      toast({
        title: "Erro",
        description: "Falha ao obter resposta da IA. Usando modo offline.",
        variant: "destructive",
      });
      
      // Fallback message
      const fallbackMessage: ChatMessage = {
        id: String(Date.now()),
        userId: "ai",
        userName: "Copilot IA",
        content: "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente.",
        timestamp: new Date().toISOString(),
        isOwn: false,
        isAI: true,
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  }, [toast]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o canal",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingChannel(true);
    try {
      // Simulate channel creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentChannel(newChannelName.toLowerCase().replace(/\s+/g, "-"));
      
      const activity: WorkspaceActivity = {
        id: String(Date.now()),
        type: "system",
        action: "Canal criado",
        description: `Novo canal #${newChannelName} foi criado`,
        user: "Você",
        timestamp: new Date().toISOString(),
      };
      setActivities(prev => [activity, ...prev]);
      
      toast({
        title: "Canal criado",
        description: `#${newChannelName} está pronto para uso`,
      });
      
      setShowNewChannelDialog(false);
      setNewChannelName("");
    } catch (error) {
      toast({
        title: "Erro ao criar canal",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleStartMeeting = async () => {
    // Generate meeting link
    const meetingId = `NTL-${Date.now().toString(36).toUpperCase()}`;
    const link = `https://meet.nautilus.dev/${meetingId}`;
    setMeetingLink(link);
    setShowMeetingDialog(true);
    
    const activity: WorkspaceActivity = {
      id: String(Date.now()),
      type: "meeting",
      action: "Reunião iniciada",
      description: `Nova videoconferência: ${meetingId}`,
      user: "Você",
      timestamp: new Date().toISOString(),
      priority: "medium",
    };
    setActivities(prev => [activity, ...prev]);
  };

  const handleCopyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setMeetingLinkCopied(true);
      setTimeout(() => setMeetingLinkCopied(false), 2000);
      toast({
        title: "Link copiado",
        description: "Compartilhe com a equipe",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleJoinMeeting = () => {
    window.open(meetingLink, "_blank");
    toast({
      title: "Entrando na reunião",
      description: "Abrindo em nova aba...",
    });
  };

  const handleMemberClick = (member: TeamMember) => {
    toast({
      title: member.name,
      description: `${member.role} - ${member.status === "online" ? "Online" : member.status === "away" ? "Ausente" : member.status === "busy" ? "Ocupado" : "Offline"}`,
    });
  };

  const handleDocumentUpload = (file: File) => {
    const newDoc: SharedDocument = {
      id: String(Date.now()),
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() as any || "OTHER",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      lastModified: "Agora",
      modifiedBy: "Você",
      shared: false,
    };
    setDocuments(prev => [newDoc, ...prev]);
    
    const activity: WorkspaceActivity = {
      id: String(Date.now()),
      type: "document",
      action: "Documento enviado",
      description: `${file.name} foi adicionado`,
      user: "Você",
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [activity, ...prev]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <ModulePageWrapper gradient="purple">
      <div className="container mx-auto p-4 lg:p-6 h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold">Workspace em Tempo Real</h1>
              <Badge variant="secondary" className="gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {onlineCount} online
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Colaboração e comunicação em tempo real com a equipe
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={() => setShowNewChannelDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Canal</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={handleStartMeeting}>
              <Video className="h-4 w-4" />
              Iniciar Reunião
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-[calc(100%-100px)]">
          {/* Team Panel - Left Sidebar */}
          <div className="lg:col-span-3 xl:col-span-2">
            <WorkspaceTeamPanel
              members={teamMembers}
              onMemberClick={handleMemberClick}
              onStartChat={(member) => toast({ title: "Chat", description: `Iniciando chat com ${member.name}` })}
              onStartCall={(member) => toast({ title: "Chamada", description: `Ligando para ${member.name}` })}
              onStartVideo={(member) => toast({ title: "Vídeo", description: `Chamada de vídeo com ${member.name}` })}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 xl:col-span-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-background">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-background">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Documentos</span>
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="gap-2 data-[state=active]:bg-background">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Atividades</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 hidden sm:flex">
                    <Sparkles className="h-3 w-3 text-primary" />
                    IA Integrada
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowSettingsDialog(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <TabsContent value="chat" className="h-full m-0">
                  <WorkspaceChatPanel
                    channelName={currentChannel}
                    onlineCount={onlineCount}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onAIAssist={handleAIAssist}
                    onStartCall={() => toast({ title: "Chamada", description: "Iniciando chamada de voz" })}
                    onStartVideo={handleStartMeeting}
                    isLoadingAI={isLoadingAI}
                  />
                </TabsContent>

                <TabsContent value="documents" className="h-full m-0">
                  <WorkspaceDocuments
                    documents={documents}
                    onView={(doc) => toast({ title: "Visualizando", description: doc.name })}
                    onDownload={(doc) => toast({ title: "Download", description: `Baixando ${doc.name}` })}
                    onShare={(doc) => toast({ title: "Compartilhado", description: `${doc.name} compartilhado com a equipe` })}
                    onDelete={(doc) => {
                      setDocuments(prev => prev.filter(d => d.id !== doc.id));
                      toast({ title: "Excluído", description: `${doc.name} foi removido`, variant: "destructive" });
                    }}
                    onUpload={handleDocumentUpload}
                  />
                </TabsContent>

                <TabsContent value="activities" className="h-full m-0">
                  <WorkspaceActivities
                    activities={activities}
                    onActivityClick={(activity) => toast({ title: activity.action, description: activity.description })}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Criar Novo Canal
            </DialogTitle>
            <DialogDescription>
              Crie um canal para sua equipe se comunicar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Nome do Canal</Label>
              <Input
                id="channel-name"
                placeholder="ex: operações-diárias"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Canal</Label>
              <Select value={newChannelType} onValueChange={(v: "public" | "private") => setNewChannelType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Público - Todos podem acessar
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Privado - Apenas convidados
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChannelDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateChannel} disabled={isCreatingChannel}>
              {isCreatingChannel ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Canal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Reunião Iniciada
            </DialogTitle>
            <DialogDescription>
              Compartilhe o link com sua equipe para ingressar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Input 
                value={meetingLink}
                readOnly
                className="flex-1 bg-transparent border-none"
              />
              <Button size="sm" variant="ghost" onClick={handleCopyMeetingLink}>
                {meetingLinkCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{onlineCount} membros online podem ser convidados</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingDialog(false)}>
              Fechar
            </Button>
            <Button onClick={handleJoinMeeting}>
              <Video className="h-4 w-4 mr-2" />
              Entrar na Reunião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Workspace
            </DialogTitle>
            <DialogDescription>
              Configure as opções de IA e notificações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Configurações de IA
              </h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">IA Habilitada</Label>
                  <p className="text-xs text-muted-foreground">Ativar assistente de IA no chat</p>
                </div>
                <Switch 
                  id="ai-enabled"
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-suggestions">Sugestões Automáticas</Label>
                  <p className="text-xs text-muted-foreground">Receber sugestões enquanto digita</p>
                </div>
                <Switch 
                  id="ai-suggestions"
                  checked={aiSettings.autoSuggestions}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, autoSuggestions: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-summarization">Resumo de Conversas</Label>
                  <p className="text-xs text-muted-foreground">Gerar resumos automáticos</p>
                </div>
                <Switch 
                  id="ai-summarization"
                  checked={aiSettings.summarization}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, summarization: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-translation">Tradução Automática</Label>
                  <p className="text-xs text-muted-foreground">Traduzir mensagens em outros idiomas</p>
                </div>
                <Switch 
                  id="ai-translation"
                  checked={aiSettings.translation}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, translation: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast({ title: "Configurações salvas", description: "Suas preferências foram atualizadas" });
              setShowSettingsDialog(false);
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModulePageWrapper>
  );
};

export default RealTimeWorkspaceProfessional;
