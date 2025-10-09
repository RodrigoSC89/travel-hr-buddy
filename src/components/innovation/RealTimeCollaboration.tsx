import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Bell,
  Activity,
  Zap,
  Eye,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RealTimeCollaboration = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentConversation, setCurrentConversation] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeCollaboration();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      // Cleanup subscriptions
    };
  }, [user]);

  const initializeCollaboration = async () => {
    try {
      // Get or create a general conversation
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("type", "general")
        .limit(1);
      
      if (convError) throw convError;
      
      let conversationId;
      if (conversations && conversations.length > 0) {
        conversationId = conversations[0].id;
      } else {
        // Create general conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            title: "Colaboração Geral",
            type: "general",
            created_by: user.id
          })
          .select()
          .single();
        
        if (createError) throw createError;
        conversationId = newConv.id;
        
        // Add user as participant
        await supabase
          .from("conversation_participants")
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "member"
          });
      }
      
      setCurrentConversation(conversationId);
      fetchMessages(conversationId);
      fetchActiveUsers();
    } catch (error) {
      console.error("Error initializing collaboration:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender_profile:profiles!messages_sender_id_fkey(full_name)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        user: `Usuário ${msg.sender_id?.slice(0, 8) || "Anônimo"}`,
        message: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString("pt-BR", { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        type: msg.message_type || "message"
      })) || [];
      
      setRealtimeMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, status")
        .limit(10);
      
      if (error) throw error;
      
      const formattedUsers = data?.map(profile => ({
        id: profile.id,
        name: profile.full_name || "Usuário",
        avatar: profile.avatar_url || "",
        status: "online", // Mock status for now
        activity: "Ativo no sistema"
      })) || [];
      
      setActiveUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("messages")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Handle new message
          fetchMessages(currentConversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  };

  const sendMessage = async () => {
    if (newMessage.trim() && currentConversation && user) {
      try {
        const { error } = await supabase
          .from("messages")
          .insert({
            conversation_id: currentConversation,
            sender_id: user.id,
            content: newMessage,
            message_type: "text"
          });
        
        if (error) throw error;
        
        setNewMessage("");
        
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi compartilhada com a equipe."
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "online": return "bg-green-500";
    case "away": return "bg-yellow-500";
    case "busy": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
    case "update": return <Activity className="w-4 h-4 text-blue-500" />;
    case "alert": return <Bell className="w-4 h-4 text-orange-500" />;
    case "achievement": return <Zap className="w-4 h-4 text-green-500" />;
    default: return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usuários Ativos */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Colaboração em Tempo Real
          </CardTitle>
          <CardDescription>
            Veja quem está online e trabalhando no sistema agora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.activity}</p>
                </div>
                <Badge variant={user.status === "online" ? "default" : "secondary"} className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Video className="w-4 h-4 mr-2" />
              Reunião
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed de Atividades */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Feed de Atividades
          </CardTitle>
          <CardDescription>
            Atualizações e notificações em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campo de nova mensagem */}
            <div className="flex gap-2">
              <Input
                placeholder="Compartilhe uma atualização..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator />
            
            {/* Lista de mensagens */}
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {realtimeMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                    {getMessageIcon(msg.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};