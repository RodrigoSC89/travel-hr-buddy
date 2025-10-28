// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
}

interface Message {
  id: string;
  user_id: string;
  message_text: string;
  created_at: string;
  is_edited: boolean;
}

interface ChannelMessagesProps {
  channel: Channel;
}

export const ChannelMessages: React.FC<ChannelMessagesProps> = ({ channel }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const realtimeChannelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await fetchMessages();
        setupRealtimeSubscription();
      }
    };

    initialize();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [channel.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("channel_messages")
        .select("*")
        .eq("channel_id", channel.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    realtimeChannelRef.current = supabase
      .channel(`messages-${channel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          console.log("New message received", payload);
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase.from("channel_messages").insert({
        channel_id: channel.id,
        user_id: currentUserId,
        message_text: newMessage.trim(),
        message_type: "text",
      });

      if (error) throw error;

      setNewMessage("");
      
      // Show visual confirmation
      toast({
        title: "Message sent",
        description: "Your message has been delivered",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span># {channel.name}</span>
          <Badge variant="outline">Real-time</Badge>
        </CardTitle>
        {channel.description && (
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea ref={scrollAreaRef} className="h-[500px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.user_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.message_text}</p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.user_id === currentUserId && (
                      <CheckCheck className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
