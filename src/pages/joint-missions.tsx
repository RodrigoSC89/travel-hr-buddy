/**
 * PATCH 519 - Protocolo de Missões Conjuntas v2
 * Enhanced joint mission coordination with external entities and real-time sync
 */

// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Radio,
  MessageSquare,
  Activity,
  Ship,
  Plane,
  Satellite,
  AlertTriangle,
  Plus,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExternalEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  organization: string;
  status: string;
  location: any;
}

interface JointMission {
  id: string;
  mission_name: string;
  mission_type: string;
  status: string;
  priority: string;
  start_time: string;
  objectives: any[];
}

interface MissionChat {
  id: string;
  mission_id: string;
  entity_id: string;
  message: string;
  message_type: string;
  priority: string;
  timestamp: string;
}

export default function JointMissionsPage() {
  const [entities, setEntities] = useState<ExternalEntity[]>([]);
  const [missions, setMissions] = useState<JointMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<JointMission | null>(null);
  const [chatMessages, setChatMessages] = useState<MissionChat[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadEntities();
    loadMissions();
    initializeRealtime();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      loadChatMessages(selectedMission.id);
    }
  }, [selectedMission]);

  const loadEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('external_entities')
        .select('*')
        .order('entity_name');

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error('Error loading entities:', error);
      toast.error('Failed to load entities');
    }
  };

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('joint_missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
      
      if (data && data.length > 0 && !selectedMission) {
        setSelectedMission(data[0]);
      }
    } catch (error) {
      console.error('Error loading missions:', error);
      toast.error('Failed to load missions');
    }
  };

  const loadChatMessages = async (missionId: string) => {
    try {
      const { data, error } = await supabase
        .from('mission_chat')
        .select('*')
        .eq('mission_id', missionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const initializeRealtime = () => {
    const channel = supabase
      .channel('joint-missions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_chat'
        },
        () => {
          if (selectedMission) {
            loadChatMessages(selectedMission.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'joint_missions'
        },
        () => {
          loadMissions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMission) return;

    try {
      const { error } = await supabase
        .from('mission_chat')
        .insert({
          mission_id: selectedMission.id,
          message: newMessage,
          message_type: 'text',
          priority: 'normal'
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'vessel': return Ship;
      case 'aircraft': return Plane;
      case 'satellite': return Satellite;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Protocolo de Missões Conjuntas v2
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PATCH 519 - Enhanced joint mission coordination with external entities
          </p>
        </div>
        <Badge className="bg-blue-500">
          <Radio className="h-3 w-3 mr-1 animate-pulse" />
          Real-time Sync
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">External Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entities.length}</div>
            <p className="text-xs text-muted-foreground">Registered entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {missions.filter(m => m.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {entities.filter(e => e.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to deploy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No missions</p>
              ) : (
                missions.map(mission => (
                  <Card
                    key={mission.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMission?.id === mission.id ? 'border-primary' : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{mission.mission_name}</h4>
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(mission.priority)} variant="outline">
                            {mission.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {mission.mission_type}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mission Details & Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mission Communication
            </CardTitle>
            <CardDescription>
              {selectedMission ? selectedMission.mission_name : 'Select a mission'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMission ? (
              <div className="space-y-4">
                {/* Mission Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <div className="font-medium">{selectedMission.status}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Priority</span>
                    <div className="font-medium">{selectedMission.priority}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Type</span>
                    <div className="font-medium">{selectedMission.mission_type}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Started</span>
                    <div className="font-medium">
                      {new Date(selectedMission.start_time).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No messages yet</p>
                  ) : (
                    chatMessages.map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge variant={msg.message_type === 'alert' ? 'destructive' : 'outline'}>
                                {msg.message_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a mission to view communication</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* External Entities */}
      <Card>
        <CardHeader>
          <CardTitle>External Entities</CardTitle>
          <CardDescription>Participating organizations and assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {entities.length === 0 ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                No entities registered
              </p>
            ) : (
              entities.map(entity => {
                const Icon = getEntityIcon(entity.entity_type);
                return (
                  <Card key={entity.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <h4 className="font-medium">{entity.entity_name}</h4>
                        </div>
                        <div className="space-y-1 text-xs">
                          <Badge variant="outline">{entity.entity_type}</Badge>
                          <p className="text-muted-foreground">{entity.organization}</p>
                          <Badge className={
                            entity.status === 'available' ? 'bg-green-500' :
                            entity.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                          }>
                            {entity.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
