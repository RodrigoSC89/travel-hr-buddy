import React, { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Video, 
  Share2, 
  Clock, 
  Bell,
  Send,
  Plus,
  Mic,
  Phone,
  MoreHorizontal,
  Circle,
  CheckCircle2
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "busy" | "offline";
  avatar?: string;
  lastSeen?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface SharedDocument {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  modifiedBy: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Cap. Roberto Silva", role: "Comandante", status: "online" },
  { id: "2", name: "Eng. Maria Santos", role: "Chefe de Máquinas", status: "online" },
  { id: "3", name: "Of. João Pereira", role: "Oficial de Náutica", status: "away", lastSeen: "5 min" },
  { id: "4", name: "Téc. Ana Costa", role: "Eletricista", status: "busy" },
  { id: "5", name: "Of. Carlos Lima", role: "Oficial de Segurança", status: "offline", lastSeen: "2h" },
];

const RECENT_MESSAGES: Message[] = [
  { id: "1", userId: "1", userName: "Cap. Roberto", content: "Relatório de operação enviado para revisão.", timestamp: "10:45", isOwn: false },
  { id: "2", userId: "2", userName: "Você", content: "Recebi. Vou analisar e retorno em 30 minutos.", timestamp: "10:47", isOwn: true },
  { id: "3", userId: "1", userName: "Cap. Roberto", content: "Perfeito. Aguardo.", timestamp: "10:48", isOwn: false },
  { id: "4", userId: "3", userName: "Of. João", content: "Checklist de navegação concluído.", timestamp: "11:02", isOwn: false },
];

const SHARED_DOCUMENTS: SharedDocument[] = [
  { id: "1", name: "Relatório Operacional Q4", type: "PDF", lastModified: "Há 10 min", modifiedBy: "Cap. Roberto" },
  { id: "2", name: "Checklist Pré-Operação", type: "DOCX", lastModified: "Há 1 hora", modifiedBy: "Of. João" },
  { id: "3", name: "Planilha de Escalas", type: "XLSX", lastModified: "Há 3 horas", modifiedBy: "Maria Santos" },
];

const getStatusColor = (status: TeamMember["status"]) => {
  switch (status) {
    case "online": return "bg-green-500";
    case "away": return "bg-yellow-500";
    case "busy": return "bg-red-500";
    default: return "bg-gray-400";
  }
};

const getStatusLabel = (status: TeamMember["status"]) => {
  switch (status) {
    case "online": return "Online";
    case "away": return "Ausente";
    case "busy": return "Ocupado";
    default: return "Offline";
  }
};

const RealTimeWorkspace = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(RECENT_MESSAGES);
  const [activeTab, setActiveTab] = useState("chat");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: String(Date.now()),
      userId: "current",
      userName: "Você",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const onlineCount = TEAM_MEMBERS.filter(m => m.status === "online").length;

  return (
    <ModulePageWrapper gradient="purple">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Workspace em Tempo Real</h1>
            <p className="text-muted-foreground mt-1">
              Colaboração e comunicação em tempo real com a equipe
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Video className="h-4 w-4" />
              Iniciar Reunião
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Canal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipe
                <Badge variant="secondary" className="ml-auto">
                  {onlineCount}/{TEAM_MEMBERS.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-3">
                  {TEAM_MEMBERS.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                      {member.status === "offline" && member.lastSeen && (
                        <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Atividades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card>
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg"># operações-gerais</CardTitle>
                          <CardDescription>{onlineCount} membros online</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[350px] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {message.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${message.isOwn ? "items-end" : ""}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.userName}</span>
                                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                              </div>
                              <div className={`p-3 rounded-lg ${message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon">
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Documentos Compartilhados</CardTitle>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SHARED_DOCUMENTS.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="p-2 rounded bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.lastModified} por {doc.modifiedBy}
                            </p>
                          </div>
                          <Badge variant="outline">{doc.type}</Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "Cap. Roberto enviou um novo documento", time: "10 min atrás", icon: FileText },
                        { action: "Of. João completou checklist de navegação", time: "30 min atrás", icon: CheckCircle2 },
                        { action: "Maria Santos atualizou escala de tripulação", time: "1 hora atrás", icon: Users },
                        { action: "Reunião de briefing iniciada", time: "2 horas atrás", icon: Video },
                      ].map((activity, index) => {
                        const IconComponent = activity.icon;
                        return (
                          <div key={index} className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-muted">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ModulePageWrapper>
  );
};

export default RealTimeWorkspace;
