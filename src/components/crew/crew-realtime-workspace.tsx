import { useMemo, useState } from "react";;
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  MessageSquare,
  FileText,
  Activity,
  Phone,
  Video,
  Bell,
  Send,
  Mic,
  Paperclip,
  Clock,
  Circle,
  MonitorPlay
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: "document" | "message" | "task" | "system";
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

export const CrewRealtimeWorkspace = memo(() => {
  const [messageInput, setMessageInput] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("operacoes-gerais");

  const teamMembers: TeamMember[] = useMemo(() => [
    { id: "1", name: "Cap. Roberto Silva", role: "Comandante", initials: "CR", status: "online" },
    { id: "2", name: "Eng. Maria Santos", role: "Chefe de Máquinas", initials: "EM", status: "online" },
    { id: "3", name: "Of. João Pereira", role: "Oficial de Náutica", initials: "OJ", status: "away" },
    { id: "4", name: "Téc. Ana Costa", role: "Eletricista", initials: "TA", status: "busy" },
    { id: "5", name: "Of. Carlos Lima", role: "Oficial de Segurança", initials: "OC", status: "offline", lastSeen: "2h" }
  ], []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", senderId: "1", senderName: "Cap. Roberto", senderInitials: "CR", content: "Relatório de operação enviado para revisão.", timestamp: "10:45" },
    { id: "2", senderId: "current", senderName: "Você", senderInitials: "V", content: "Recebido. Vou analisar o relatório em 30 minutos.", timestamp: "10:47", isCurrentUser: true },
    { id: "3", senderId: "1", senderName: "Cap. Roberto", senderInitials: "CR", content: "Perfeito. Aguardo.", timestamp: "10:48" },
    { id: "4", senderId: "3", senderName: "Of. João", senderInitials: "OJ", content: "Checklist de navegação concluído.", timestamp: "11:02" }
  ]);

  const documents: Document[] = useMemo(() => [
    { id: "1", name: "Relatório de Operação - Março", type: "PDF", uploadedBy: "Cap. Roberto", uploadedAt: "10:30", size: "2.4 MB" },
    { id: "2", name: "Checklist de Segurança", type: "XLSX", uploadedBy: "Of. Carlos", uploadedAt: "09:15", size: "156 KB" },
    { id: "3", name: "Plano de Manutenção", type: "DOCX", uploadedBy: "Eng. Maria", uploadedAt: "Ontem", size: "1.8 MB" }
  ], []);

  const activities: Activity[] = useMemo(() => [
    { id: "1", user: "Cap. Roberto", action: "enviou relatório de operação", timestamp: "10:45", type: "document" },
    { id: "2", user: "Of. João", action: "concluiu checklist de navegação", timestamp: "11:02", type: "task" },
    { id: "3", user: "Eng. Maria", action: "atualizou plano de manutenção", timestamp: "09:30", type: "document" },
    { id: "4", user: "Sistema", action: "backup automático realizado", timestamp: "08:00", type: "system" }
  ], []);

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
    case "online": return "bg-success";
    case "away": return "bg-warning";
    case "busy": return "bg-destructive";
    case "offline": return "bg-muted-foreground/50";
    });
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current",
      senderName: "Você",
      senderInitials: "V",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };

  const onlineCount = teamMembers.filter(m => m.status === "online" || m.status === "away").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workspace em Tempo Real</h2>
          <p className="text-muted-foreground">Colaboração e comunicação em tempo real com a equipe</p>
        </div>
        <Button className="gap-2">
          <MonitorPlay className="h-4 w-4" />
          Iniciar Reunião
        </Button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Panel */}
        <Card className="lg:col-span-1 border-2 border-dashed border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Equipe
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {onlineCount}/{teamMembers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4 pt-0">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <Circle 
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(member.status)} rounded-full border-2 border-background`}
                        fill="currentColor"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                    {member.lastSeen && (
                      <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat and Content Panel */}
        <Card className="lg:col-span-3">
          <Tabs defaultValue="chat" className="h-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
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
                    <Activity className="h-4 w-4" />
                    Atividades
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
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

            <CardContent className="pt-4">
              <TabsContent value="chat" className="mt-0">
                {/* Channel Header */}
                <div className="flex items-center gap-3 pb-4 border-b mb-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold"># {selectedChannel}</h3>
                    <p className="text-xs text-muted-foreground">{onlineCount} membros online</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isCurrentUser ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={`text-xs ${message.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {message.senderInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${message.isCurrentUser ? "items-end" : ""}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{message.senderName}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <div className={`mt-1 px-3 py-2 rounded-lg max-w-md ${
                            message.isCurrentUser 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.uploadedBy} • {doc.uploadedAt} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className={`p-2 rounded ${
                        activity.type === "document" ? "bg-info/10" :
                          activity.type === "task" ? "bg-success/10" :
                            activity.type === "message" ? "bg-primary/10" :
                              "bg-muted"
                      }`}>
                        {activity.type === "document" && <FileText className="h-4 w-4 text-info" />}
                        {activity.type === "task" && <Activity className="h-4 w-4 text-success" />}
                        {activity.type === "message" && <MessageSquare className="h-4 w-4 text-primary" />}
                        {activity.type === "system" && <Clock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CrewRealtimeWorkspace;
