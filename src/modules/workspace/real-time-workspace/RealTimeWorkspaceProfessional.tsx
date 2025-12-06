import React, { useState, useEffect, useCallback } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw
} from "lucide-react";
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
  const [documents] = useState<SharedDocument[]>(SHARED_DOCUMENTS);
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
  const { toast } = useToast();

  const onlineCount = teamMembers.filter(m => m.status === "online" || m.status === "away").length;

  const handleSendMessage = useCallback((content: string) => {
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      userId: "current",
      userName: "Você",
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sent",
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
      // Simulate AI response (in production, this would call the edge function)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponses = [
        `Entendi sua mensagem sobre "${message.substring(0, 30)}...". Aqui estão algumas sugestões:\n\n1. Verifique os protocolos de segurança\n2. Consulte a documentação técnica\n3. Agende uma reunião com a equipe`,
        `Com base na sua solicitação, recomendo:\n\n• Revisar o checklist de operações\n• Confirmar com o comandante\n• Atualizar o log de atividades`,
        `Analisando o contexto marítimo:\n\n✓ Condições meteorológicas: Favoráveis\n✓ Status da embarcação: Operacional\n✓ Próxima parada: Em 6 horas`,
      ];
      
      const aiMessage: ChatMessage = {
        id: String(Date.now()),
        userId: "ai",
        userName: "Assistente IA",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date().toISOString(),
        isOwn: false,
        isAI: true,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Resposta da IA",
        description: "O assistente gerou uma resposta",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao obter resposta da IA",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [toast]);

  const handleStartMeeting = () => {
    toast({
      title: "Iniciando reunião",
      description: "Preparando sala de videoconferência...",
    });
    
    const activity: WorkspaceActivity = {
      id: String(Date.now()),
      type: "meeting",
      action: "Reunião iniciada",
      description: "Nova videoconferência iniciada",
      user: "Você",
      timestamp: new Date().toISOString(),
      priority: "medium",
    };
    setActivities(prev => [activity, ...prev]);
  };

  const handleNewChannel = () => {
    toast({
      title: "Novo canal",
      description: "Funcionalidade de criação de canal",
    });
  };

  const handleMemberClick = (member: TeamMember) => {
    toast({
      title: member.name,
      description: `${member.role} - ${member.status}`,
    });
  };

  const handleDocumentView = (doc: SharedDocument) => {
    toast({
      title: "Abrindo documento",
      description: doc.name,
    });
  };

  const handleDocumentDownload = (doc: SharedDocument) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${doc.name}...`,
    });
  };

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
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleNewChannel}>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <TabsContent value="chat" className="h-full m-0">
                  <WorkspaceChatPanel
                    channelName="operações-gerais"
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
                    onView={handleDocumentView}
                    onDownload={handleDocumentDownload}
                    onShare={(doc) => toast({ title: "Compartilhar", description: `Compartilhando ${doc.name}` })}
                    onDelete={(doc) => toast({ title: "Excluir", description: `${doc.name} foi excluído`, variant: "destructive" })}
                    onUpload={(file) => toast({ title: "Upload", description: `Enviando ${file.name}` })}
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
    </ModulePageWrapper>
  );
};

export default RealTimeWorkspaceProfessional;
