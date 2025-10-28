import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, MessageCircle, Send, TrendingUp, Plus } from "lucide-react";
import { ExternalAPITest } from "./components/ExternalAPITest";
import { ChannelsList } from "./components/ChannelsList";
import { ChatInterface } from "./components/ChatInterface";
import { CreateChannelDialog } from "./components/CreateChannelDialog";
import { supabase } from "@/integrations/supabase/client";

const ChannelManager = () => {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState({
    activeChannels: 0,
    totalMessages: 0,
    onlineUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: channels } = await supabase
        .from("communication_channels")
        .select("id")
        .eq("is_active", true);

      const { data: messages } = await supabase
        .from("channel_messages")
        .select("id")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        activeChannels: channels?.length || 0,
        totalMessages: messages?.length || 0,
        onlineUsers: 0, // Would need presence tracking
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Channel Manager</h1>
            <p className="text-sm text-muted-foreground">Real-time communication channels</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Channel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChannels}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onlineUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Broadcasts</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChannelsList
            onSelectChannel={setSelectedChannel}
            selectedChannelId={selectedChannel?.id}
            onRefresh={loadStats}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedChannel ? (
            <ChatInterface channel={selectedChannel} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No channel selected</h3>
                <p className="text-muted-foreground">
                  Select a channel from the list to start messaging
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadStats}
      />

      {/* External API Integration Test */}
      <ExternalAPITest />
    </div>
  );
};

export default ChannelManager;
