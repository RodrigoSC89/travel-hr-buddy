// PATCH 486.0 - Communication Center (Unified)
// Consolidates communication/ and communications/ modules
// Features: Real-time messaging, radio/satellite monitoring, system status

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Users, 
  Send, 
  Plus, 
  Hash, 
  Radio, 
  Satellite, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string;
  is_private: boolean;
  created_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id?: string;
  content: string;
  created_at: string;
  user?: {
    email?: string;
  };
}

interface RadioChannel {
  id: string;
  name: string;
  type: "radio" | "satellite";
  status: "online" | "offline" | "standby";
  latency: number;
  uptime: number;
  users: number;
}

export const CommunicationCenter: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  // Radio/Satellite channels (from communications module)
  const [radioChannels] = useState<RadioChannel[]>([
    {
      id: "1",
      name: "VHF Canal 16",
      type: "radio",
      status: "online",
      latency: 12,
      uptime: 99.8,
      users: 45
    },
    {
      id: "2",
      name: "Satélite Inmarsat",
      type: "satellite",
      status: "online",
      latency: 450,
      uptime: 98.5,
      users: 12
    },
    {
      id: "3",
      name: "Canal Emergência",
      type: "radio",
      status: "standby",
      latency: 8,
      uptime: 100,
      users: 0
    }
  ]);

  // System status metrics
  const [systemStatus] = useState({
    websocket: "connected",
    database: "synced",
    mqtt: "active",
    lastSync: new Date().toISOString()
  });

  useEffect(() => {
    fetchChannels();
    setupRealtimeSubscription();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Use demo channels if not authenticated
        const demoChannels: Channel[] = [
          {
            id: "demo-1",
            name: "general",
            description: "General communication channel",
            channel_type: "public",
            is_private: false,
            created_at: new Date().toISOString()
          },
          {
            id: "demo-2",
            name: "bridge",
            description: "Bridge team communications",
            channel_type: "public",
            is_private: false,
            created_at: new Date().toISOString()
          }
        ];
        setChannels(demoChannels);
        setSelectedChannel(demoChannels[0]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChannels(data || []);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from("channel_messages")
        .select("*, user:profiles(email)")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Use demo messages for demo channels
      if (channelId.startsWith("demo-")) {
        setMessages([
          {
            id: "msg-1",
            channel_id: channelId,
            content: "Welcome to the communication center!",
            created_at: new Date(Date.now() - 300000).toISOString(),
            user: { email: "system@nautilus.ai" }
          }
        ]);
      }
    }
  };

  const setupRealtimeSubscription = async () => {
    realtimeChannelRef.current = supabase
      .channel("communication-center-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communication_channels",
        },
        (payload) => {
          console.log("Channel change detected", payload);
          fetchChannels();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
        },
        (payload) => {
          if (selectedChannel && payload.new.channel_id === selectedChannel.id) {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Demo mode
      if (!user || selectedChannel.id.startsWith("demo-")) {
        const demoMessage: Message = {
          id: `msg-${Date.now()}`,
          channel_id: selectedChannel.id,
          content: newMessage,
          created_at: new Date().toISOString(),
          user: { email: "demo@nautilus.ai" }
        };
        setMessages((prev) => [...prev, demoMessage]);
        setNewMessage("");
        toast({
          title: "Message sent (Demo)",
          description: `Sent to ${selectedChannel.name}`,
        });
        return;
      }

      const { error } = await supabase
        .from("channel_messages")
        .insert({
          channel_id: selectedChannel.id,
          user_id: user.id,
          content: newMessage,
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Message sent",
        description: `Sent to ${selectedChannel.name}`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: "bg-green-500",
      offline: "bg-red-500",
      standby: "bg-yellow-500",
      connected: "bg-green-500",
      synced: "bg-green-500",
      active: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    if (status === "online" || status === "connected" || status === "active") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (status === "standby") {
      return <Activity className="h-4 w-4 text-yellow-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Center</h1>
          <p className="text-muted-foreground">
            Unified hub for messaging, radio/satellite monitoring, and system status
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          PATCH 486.0
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">Active channel messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {radioChannels.reduce((sum, ch) => sum + ch.users, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Operational</div>
            <p className="text-xs text-muted-foreground">All systems nominal</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">
            <Hash className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="radio">
            <Radio className="h-4 w-4 mr-2" />
            Radio/Satellite
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            System Status
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab - Real-time messaging with Supabase */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Channel List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Channels</CardTitle>
                <Button size="sm" className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Channel
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChannel?.id === channel.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          <span className="font-medium text-sm">{channel.name}</span>
                        </div>
                        {channel.is_private && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>
                  {selectedChannel ? (
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      {selectedChannel.name}
                    </div>
                  ) : (
                    "Select a channel"
                  )}
                </CardTitle>
                {selectedChannel?.description && (
                  <CardDescription>{selectedChannel.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {message.user?.email || "Unknown User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        No messages yet. Be the first to send a message!
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={!selectedChannel}
                  />
                  <Button onClick={handleSendMessage} disabled={!selectedChannel || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radio/Satellite Tab */}
        <TabsContent value="radio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {radioChannels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{channel.name}</CardTitle>
                    {getStatusIcon(channel.status)}
                  </div>
                  <CardDescription>
                    {channel.type === "radio" ? (
                      <Radio className="h-4 w-4 inline mr-1" />
                    ) : (
                      <Satellite className="h-4 w-4 inline mr-1" />
                    )}
                    {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(channel.status)}>
                        {channel.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency:</span>
                      <span>{channel.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span>{channel.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users:</span>
                      <span>{channel.users}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">WebSocket Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.websocket)}
                    <Badge className={getStatusColor(systemStatus.websocket)}>
                      {systemStatus.websocket}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database)}
                    <Badge className={getStatusColor(systemStatus.database)}>
                      {systemStatus.database}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">MQTT Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.mqtt)}
                    <Badge className={getStatusColor(systemStatus.mqtt)}>
                      {systemStatus.mqtt}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last Synchronization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {new Date(systemStatus.lastSync).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
              <CardDescription>
                Configure your communication preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings panel coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;
