import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Users,
  Search,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  message_type: "text" | "voice" | "file" | "alert";
  file_url?: string;
  voice_duration?: number;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
  sender_name?: string;
}

interface Contact {
  id: string;
  full_name: string;
  position: string;
  status: "available" | "busy" | "offline";
  avatar_url?: string;
}

interface IntegratedCommunicationProps {
  currentUserId: string;
  crewMemberId?: string;
}

export const IntegratedCommunicationSystem: React.FC<IntegratedCommunicationProps> = ({
  currentUserId,
  crewMemberId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, position")
        .neq("user_id", currentUserId)
        .order("full_name");

      if (error) throw error;

      const formattedContacts: Contact[] = (data || []).map(contact => ({
        ...contact,
        status: "available" as const, // This would be dynamic in a real implementation
        avatar_url: undefined,
      }));

      setContacts(formattedContacts);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const loadMessages = async (contactId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("crew_communications")
        .select(
          `
          *,
          sender:sender_id(full_name),
          recipient:recipient_id(full_name)
        `
        )
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        ...msg,
        message_type: msg.message_type as "text" | "voice" | "file" | "alert",
        sender_name: msg.sender?.full_name || "Unknown",
      }));

      setMessages(formattedMessages);

      // Mark messages as read
      await markMessagesAsRead(contactId);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    try {
      await supabase
        .from("crew_communications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("sender_id", senderId)
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const messageData = {
        sender_id: crewMemberId || currentUserId,
        recipient_id: selectedContact.id,
        content: newMessage.trim(),
        message_type: "text" as const,
        is_urgent: false,
        conversation_id: conversationId,
      };

      const { data, error } = await supabase
        .from("crew_communications")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          ...data,
          message_type: data.message_type as "text" | "voice" | "file" | "alert",
          sender_name: "Você",
        },
      ]);

      setNewMessage("");

      toast({
        title: "Mensagem enviada",
        description: `Mensagem enviada para ${selectedContact.full_name}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact) return;

    try {
      // Upload file to Supabase Storage
      const fileName = `communications/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("crew-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("crew-documents").getPublicUrl(fileName);

      // Send file message
      const messageData = {
        sender_id: crewMemberId || currentUserId,
        recipient_id: selectedContact.id,
        content: `Arquivo enviado: ${file.name}`,
        message_type: "file" as const,
        file_url: publicUrl,
        is_urgent: false,
        conversation_id: conversationId,
      };

      const { data, error } = await supabase
        .from("crew_communications")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        {
          ...data,
          message_type: data.message_type as "text" | "voice" | "file" | "alert",
          sender_name: "Você",
        },
      ]);

      toast({
        title: "Arquivo enviado",
        description: `Arquivo ${file.name} enviado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar arquivo",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic here
    toast({
      title: "Gravação de voz",
      description: "Funcionalidade de voz será implementada em breve",
    });
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Implement stop recording and send logic here
  };

  const filteredContacts = contacts.filter(
    contact =>
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-[600px] bg-background rounded-lg border">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Comunicação Integrada</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.position}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(selectedContact.status)}`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedContact.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedContact.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => {
                  const isOwn = message.sender_id === (crewMemberId || currentUserId);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.is_urgent && (
                            <Badge variant="destructive" className="mb-2 text-xs">
                              Urgente
                            </Badge>
                          )}
                          <p className="text-sm">{message.content}</p>
                          {message.file_url && (
                            <div className="mt-2">
                              <a
                                href={message.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline"
                              >
                                📎 Abrir arquivo
                              </a>
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : "text-left"}`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onMouseDown={startVoiceRecording}
                  onMouseUp={stopVoiceRecording}
                  className={isRecording ? "bg-red-100" : ""}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um contato para iniciar a conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
