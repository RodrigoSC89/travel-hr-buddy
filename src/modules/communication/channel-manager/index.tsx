import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Send, Plus, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateChannelDialog } from './components/CreateChannelDialog';
import { ChannelMessages } from './components/ChannelMessages';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string;
  is_private: boolean;
  created_at: string;
}

export const ChannelManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchChannels();
    setupRealtimeSubscription();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  const fetchChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get public channels and user's private channels
      const { data, error } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChannels(data || []);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load channels',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const { data: { user } } = supabase.auth.getUser();
    
    // Subscribe to channel updates
    realtimeChannelRef.current = supabase
      .channel('channel-manager-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_channels',
        },
        (payload) => {
          console.log('Channel change detected', payload);
          fetchChannels();
        }
      )
      .subscribe();
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
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Channel Manager</h1>
            <p className="text-muted-foreground">
              Real-time communication channels with automatic updates
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Channel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Channels List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Channels
            </CardTitle>
            <CardDescription>{channels.length} active channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-left truncate">{channel.name}</span>
                    {channel.is_private && (
                      <Badge variant="outline" className="ml-2">
                        Private
                      </Badge>
                    )}
                  </Button>
                ))}
                {channels.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No channels available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <div className="lg:col-span-3">
          {selectedChannel ? (
            <ChannelMessages channel={selectedChannel} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Channel Selected</h3>
                <p className="text-muted-foreground">
                  Select a channel to view messages or create a new one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchChannels}
      />
    </div>
  );
};

export default ChannelManager;
