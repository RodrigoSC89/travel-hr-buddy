import { useEffect, useState, useCallback, useMemo } from "react";;

/**
 * PATCH 378: Enhanced Channel Manager with Permissions & Real-time
 * Complete WebSocket integration, permissions management, and communication logs
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus, Send, Users, Shield, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: string;
  is_active: boolean;
  max_members?: number;
  created_at: string;
  created_by: string;
}

interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  message_content: string;
  message_type: string;
  created_at: string;
  read_by?: string[];
}

interface Permission {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  can_read: boolean;
  can_write: boolean;
  can_moderate: boolean;
  granted_at: string;
}

export const EnhancedChannelManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connected" | "disconnected">("disconnected");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    channel_type: "general",
    max_members: 50
  });

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      loadPermissions(selectedChannel.id);
      subscribeToChannel(selectedChannel.id);
    }

    return () => {
      unsubscribeFromChannel();
    });
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("Error loading channels:", error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  });

  const loadMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from("channel_messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadPermissions = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from("channel_permissions")
        .select("*")
        .eq("channel_id", channelId);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  let channelSubscription: unknown = null;

  const subscribeToChannel = (channelId: string) => {
    channelSubscription = supabase
      .channel(`channel-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
          toast({
            title: "Connected",
            description: "Real-time updates enabled",
          });
        }
      });
  };

  const unsubscribeFromChannel = () => {
    if (channelSubscription) {
      supabase.removeChannel(channelSubscription);
      channelSubscription = null;
      setRealtimeStatus("disconnected");
    }
  };

  const handleCreateChannel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("communication_channels")
        .insert([{
          ...formData,
          created_by: user.id,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Channel created successfully"
      });

      setIsCreateOpen(false);
      resetForm();
      loadChannels();
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedChannel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("channel_messages")
        .insert([{
          channel_id: selectedChannel.id,
          sender_id: user.id,
          message_content: messageContent,
          message_type: "text"
        }]);

      if (error) throw error;

      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      channel_type: "general",
      max_members: 50
    });
  });

  const getChannelTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      general: "bg-blue-100 text-blue-800",
      emergency: "bg-red-100 text-red-800",
      technical: "bg-green-100 text-green-800",
      operations: "bg-purple-100 text-purple-800"
    };

    return <Badge className={variants[type] || "bg-gray-100"}>{type}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Channel Manager</h1>
          <p className="text-muted-foreground">
            Real-time communication channels with WebSocket support
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Channels List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Channels</CardTitle>
                <CardDescription>Active communication channels</CardDescription>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={resetForm}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                      Create a new communication channel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Channel Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Operations Team"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Channel description..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={formData.channel_type} 
                          onValueChange={(value) => setFormData({ ...formData, channel_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Max Members</Label>
                        <Input
                          type="number"
                          value={formData.max_members}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleSetIsCreateOpen}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChannel}>Create Channel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : channels.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No channels found. Create your first channel.
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {channels.map((channel) => (
                    <Card
                      key={channel.id}
                      className={`cursor-pointer transition-all ${
                        selectedChannel?.id === channel.id ? "ring-2 ring-primary" : "hover:shadow-md"
                      }`}
                      onClick={handleSetSelectedChannel}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{channel.name}</div>
                            {channel.description && (
                              <div className="text-xs text-gray-500 mt-1">{channel.description}</div>
                            )}
                            <div className="mt-2">
                              {getChannelTypeBadge(channel.channel_type)}
                            </div>
                          </div>
                          {channel.is_active && (
                            <Badge className="bg-green-100 text-green-800">
                              <Activity className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedChannel ? selectedChannel.name : "Select a Channel"}
                </CardTitle>
                {selectedChannel && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {realtimeStatus === "connected" ? (
                        <><Activity className="h-3 w-3 mr-1" /> Connected</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Disconnected</>
                      )}
                    </Badge>
                    {getChannelTypeBadge(selectedChannel.channel_type)}
                  </div>
                )}
              </div>
              {selectedChannel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSetIsPermissionsOpen}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Permissions
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedChannel ? (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="text-xs font-medium text-gray-600">
                              User {message.sender_id.substring(0, 8)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(new Date(message.created_at), "HH:mm")}
                            </div>
                          </div>
                          <div className="text-sm">{message.message_content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={messageContent}
                    onChange={handleChange}
                    placeholder="Type a message..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                Select a channel to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Channel Permissions</DialogTitle>
            <DialogDescription>
              Manage user permissions for {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-sm text-gray-500 mb-4">
              {permissions.length} permission(s) configured
            </div>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between border-b pb-2">
                  <div className="text-sm">
                    <div className="font-medium">User {permission.user_id.substring(0, 12)}</div>
                    <Badge variant="outline" className="text-xs mt-1">{permission.role}</Badge>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {permission.can_read && <Badge className="bg-blue-100 text-blue-800">Read</Badge>}
                    {permission.can_write && <Badge className="bg-green-100 text-green-800">Write</Badge>}
                    {permission.can_moderate && <Badge className="bg-purple-100 text-purple-800">Moderate</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSetIsPermissionsOpen}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
