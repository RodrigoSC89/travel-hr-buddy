import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Lock, Radio, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChannelsListProps {
  onSelectChannel: (channel: any) => void;
  selectedChannelId?: string;
  onRefresh: () => void;
}

export const ChannelsList: React.FC<ChannelsListProps> = ({
  onSelectChannel,
  selectedChannelId,
  onRefresh,
}) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChannels();

    // Subscribe to real-time channel updates
    const subscription = supabase
      .channel("channels_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "communication_channels" }, () => {
        loadChannels();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*, channel_members(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading channels",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChannelStatus = async (channelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("communication_channels")
        .update({ is_active: isActive })
        .eq("id", channelId);

      if (error) throw error;
      toast({
        title: isActive ? "Channel activated" : "Channel deactivated",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error updating channel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>Channels</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  selectedChannelId === channel.id ? "bg-accent" : ""
                }`}
                onClick={() => onSelectChannel(channel)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {channel.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {channel.is_active ? (
                      <Radio className="h-3 w-3 text-green-500" />
                    ) : (
                      <Radio className="h-3 w-3 text-gray-400" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {channel.channel_type}
                    </Badge>
                  </div>
                </div>
                {channel.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {channel.description}
                  </p>
                )}
              </div>
            ))}
            {channels.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground py-8">No channels found</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
