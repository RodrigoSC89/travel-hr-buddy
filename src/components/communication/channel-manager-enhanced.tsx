import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Radio,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  Activity,
  Shield,
  Plus
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'group' | 'department' | 'broadcast' | 'emergency';
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  member_count: number;
  last_message_at?: string;
  settings: any;
  created_at: string;
}

interface ChannelStatus {
  channel_id: string;
  status: 'online' | 'offline' | 'connecting' | 'error' | 'maintenance';
  message?: string;
  created_at: string;
}

interface ChannelPermission {
  id: string;
  channel_id: string;
  user_id: string;
  permission_level: 'admin' | 'moderator' | 'member' | 'read_only';
  can_send: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_manage_members: boolean;
}

export const ChannelManagerEnhanced: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelStatuses, setChannelStatuses] = useState<Map<string, ChannelStatus>>(new Map());
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<ChannelPermission[]>([]);
  const [statusLogs, setStatusLogs] = useState<ChannelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "group" as const,
    is_public: true
  });

  useEffect(() => {
    fetchChannels();
    subscribeToChannelUpdates();
    
    return () => {
      // Cleanup subscriptions
    };
  }, []);

  const subscribeToChannelUpdates = () => {
    // Subscribe to real-time updates
    const channelsSubscription = supabase
      .channel('channels-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_channels'
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    const statusSubscription = supabase
      .channel('channel-status-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_status_logs'
        },
        (payload) => {
          const status = payload.new as ChannelStatus;
          setChannelStatuses(prev => new Map(prev).set(status.channel_id, status));
        }
      )
      .subscribe();
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communication_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
      
      // Fetch status for each channel
      data?.forEach(channel => {
        fetchChannelStatus(channel.id);
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelStatus = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_status_logs')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setChannelStatuses(prev => new Map(prev).set(channelId, data));
      }
    } catch (error) {
      console.error('Error fetching channel status:', error);
    }
  };

  const fetchChannelPermissions = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_permissions')
        .select('*')
        .eq('channel_id', channelId);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchStatusLogs = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_status_logs')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStatusLogs(data || []);
    } catch (error) {
      console.error('Error fetching status logs:', error);
    }
  };

  const createChannel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please log in", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('communication_channels')
        .insert([{
          ...formData,
          created_by: user.id,
          is_active: true
        }]);

      if (error) throw error;

      toast({ title: "Success", description: "Channel created successfully" });
      setIsCreateOpen(false);
      resetForm();
      fetchChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      });
    }
  };

  const toggleChannelStatus = async (channelId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('communication_channels')
        .update({ is_active: newStatus })
        .eq('id', channelId);

      if (error) throw error;

      // Log status change
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('channel_status_logs')
        .insert([{
          channel_id: channelId,
          status: newStatus ? 'online' : 'offline',
          message: `Channel ${newStatus ? 'activated' : 'deactivated'} by user`,
          created_by: user?.id
        }]);

      toast({
        title: "Success",
        description: `Channel ${newStatus ? 'activated' : 'deactivated'}`
      });
      fetchChannels();
    } catch (error) {
      console.error('Error toggling channel:', error);
      toast({
        title: "Error",
        description: "Failed to update channel status",
        variant: "destructive"
      });
    }
  };

  const openChannelDetails = (channel: Channel) => {
    setSelectedChannel(channel);
    fetchChannelPermissions(channel.id);
    fetchStatusLogs(channel.id);
    setIsDetailsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "group",
      is_public: true
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return "bg-green-500";
      case 'offline':
        return "bg-gray-500";
      case 'connecting':
        return "bg-yellow-500";
      case 'error':
        return "bg-red-500";
      case 'maintenance':
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <MessageSquare className="h-5 w-5" />;
      case 'department':
        return <Users className="h-5 w-5" />;
      case 'broadcast':
        return <Radio className="h-5 w-5" />;
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesType = filterType === "all" || channel.type === filterType;
    const status = channelStatuses.get(channel.id)?.status;
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Wifi className="h-8 w-8" />
                Channel Manager
              </CardTitle>
              <CardDescription>
                Manage communication channels with real-time status monitoring
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="broadcast">Broadcast</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channels Grid */}
          {loading ? (
            <div className="text-center py-8">Loading channels...</div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No channels found. Create your first channel to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredChannels.map((channel) => {
                const status = channelStatuses.get(channel.id);
                
                return (
                  <Card
                    key={channel.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openChannelDetails(channel)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {getChannelIcon(channel.type)}
                          <div>
                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{channel.type}</Badge>
                              {channel.is_public && <Badge variant="secondary">Public</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusIcon(status?.status)}
                          <Switch
                            checked={channel.is_active}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChannelStatus(channel.id, channel.is_active);
                            }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground line-clamp-2">
                          {channel.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{channel.member_count || 0} members</span>
                          </div>
                          {status && (
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getStatusColor(status.status)}`} />
                              <span className="text-xs capitalize">{status.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsCreateOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter channel name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="type">Channel Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
              <Label htmlFor="public">Public Channel</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createChannel} disabled={!formData.name}>
                Create Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Channel Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <Tabs defaultValue="status">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {getStatusIcon(channelStatuses.get(selectedChannel.id)?.status)}
                      <div>
                        <div className="font-semibold capitalize">
                          {channelStatuses.get(selectedChannel.id)?.status || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {channelStatuses.get(selectedChannel.id)?.message || 'No status message'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-2">
                  {permissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No permissions configured yet.
                    </p>
                  ) : (
                    permissions.map((perm) => (
                      <Card key={perm.id}>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{perm.user_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {perm.permission_level}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {perm.can_send && <Badge variant="outline">Send</Badge>}
                              {perm.can_edit && <Badge variant="outline">Edit</Badge>}
                              {perm.can_delete && <Badge variant="outline">Delete</Badge>}
                              {perm.can_manage_members && <Badge variant="outline">Manage</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2">
                  {statusLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No status logs available.
                    </p>
                  ) : (
                    statusLogs.map((log) => (
                      <Card key={log.channel_id + log.created_at}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(log.status)}
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium capitalize">{log.status}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString()}
                                </span>
                              </div>
                              {log.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
