import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChannelManagerHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const { data: channels } = useQuery({
    queryKey: ["communication-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["channel-messages", selectedChannel],
    queryFn: async () => {
      if (!selectedChannel) return [];
      const { data, error } = await supabase
        .from("channel_messages")
        .select("*")
        .eq("channel_id", selectedChannel)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChannel,
  });

  useEffect(() => {
    if (!selectedChannel) return;

    const channel = supabase
      .channel(`channel-${selectedChannel}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${selectedChannel}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["channel-messages", selectedChannel] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel, queryClient]);

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("communication_channels")
        .insert({
          name: channelName,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-channels"] });
      toast({
        title: "Canal criado",
        description: "O canal foi criado com sucesso.",
      });
      setIsDialogOpen(false);
      setChannelName("");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error} = await supabase
        .from("channel_messages")
        .insert({
          channel_id: selectedChannel!,
          sender_id: user.id,
          message_content: messageContent,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessageContent("");
      toast({
        title: "Mensagem enviada",
      });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">Channel Manager</h1>
          <p className="text-muted-foreground mt-2">
            Comunicação em tempo real via WebSocket
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Canal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Canal de Comunicação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Canal</label>
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Ex: Operações - Navio A"
                />
              </div>
              <Button
                onClick={() => createChannelMutation.mutate()}
                disabled={!channelName || createChannelMutation.isPending}
                className="w-full"
              >
                {createChannelMutation.isPending ? "Criando..." : "Criar Canal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-lg">Canais Ativos</h2>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {channels?.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {(channel as any).channel_name || (channel as any).name}
                  {channel.is_active && (
                    <Badge variant="default" className="ml-auto">
                      Online
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 p-4 flex flex-col">
          {selectedChannel ? (
            <>
              <h2 className="font-semibold text-lg mb-4">Mensagens</h2>
              <ScrollArea className="flex-1 h-[400px] mb-4">
                <div className="space-y-3">
                  {messages?.map((msg) => (
                    <div key={msg.id} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{msg.message_content}</p>
                      <span className="text-xs text-muted-foreground">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && messageContent.trim()) {
                      sendMessageMutation.mutate();
                    }
                  }}
                />
                <Button
                  onClick={() => sendMessageMutation.mutate()}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione um canal para ver as mensagens
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
