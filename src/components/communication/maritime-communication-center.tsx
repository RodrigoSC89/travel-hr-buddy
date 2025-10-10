import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Radio,
  Send,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
  Mail,
  Satellite,
  MapPin,
} from "lucide-react";

interface MaritimeCommunication {
  id: string;
  vessel_id: string;
  vessel_name: string;
  message_type:
    | "emergency"
    | "general"
    | "weather_alert"
    | "maintenance"
    | "navigation"
    | "port_authority";
  content: string;
  priority: "low" | "normal" | "high" | "critical";
  status: "sent" | "delivered" | "acknowledged" | "resolved";
  sent_at: string;
  acknowledged_at?: string;
  coordinates?: { latitude: number; longitude: number };
  sender_role: string;
  response_required: boolean;
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: "vhf" | "satellite" | "email" | "emergency" | "internal";
  status: "active" | "inactive" | "maintenance";
  participants: string[];
  last_activity: string;
}

export const MaritimeCommunicationCenter = () => {
  const [communications, setCommunications] = useState<MaritimeCommunication[]>([]);
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [newMessage, setNewMessage] = useState({
    vessel_id: "",
    message_type: "general" as const,
    content: "",
    priority: "normal" as const,
    coordinates: { latitude: 0, longitude: 0 },
  });
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunications();
    loadChannels();
    setupRealTimeUpdates();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);

      // Mock communications data
      const mockCommunications: MaritimeCommunication[] = [
        {
          id: "1",
          vessel_id: "mv-atlantic-001",
          vessel_name: "MV Atlantic Explorer",
          message_type: "emergency",
          content: "Vazamento no compartimento de máquinas. Solicitando assistência imediata.",
          priority: "critical",
          status: "acknowledged",
          sent_at: "2024-01-20T14:30:00Z",
          acknowledged_at: "2024-01-20T14:32:00Z",
          coordinates: { latitude: -23.5505, longitude: -46.6333 },
          sender_role: "captain",
          response_required: true,
        },
        {
          id: "2",
          vessel_id: "ms-ocean-002",
          vessel_name: "MS Ocean Pioneer",
          message_type: "weather_alert",
          content: "Tempestade se aproximando. Ventos de 45 nós. Alterando rota para sudeste.",
          priority: "high",
          status: "delivered",
          sent_at: "2024-01-20T12:15:00Z",
          coordinates: { latitude: -25.4284, longitude: -48.6732 },
          sender_role: "first_officer",
          response_required: false,
        },
        {
          id: "3",
          vessel_id: "mv-pacific-003",
          vessel_name: "MV Pacific Star",
          message_type: "navigation",
          content: "Aproximando do Porto de Santos. ETA 16:30. Solicitando atracação no cais 5.",
          priority: "normal",
          status: "sent",
          sent_at: "2024-01-20T10:45:00Z",
          coordinates: { latitude: -23.9618, longitude: -46.3322 },
          sender_role: "captain",
          response_required: true,
        },
        {
          id: "4",
          vessel_id: "ms-baltic-004",
          vessel_name: "MS Baltic Wind",
          message_type: "maintenance",
          content:
            "Motor auxiliar apresentando ruídos anômalos. Programando inspeção no próximo porto.",
          priority: "normal",
          status: "delivered",
          sent_at: "2024-01-20T08:30:00Z",
          sender_role: "engineer",
          response_required: false,
        },
        {
          id: "5",
          vessel_id: "mv-nordic-005",
          vessel_name: "MV Nordic Crown",
          message_type: "general",
          content: "Tripulação em boa saúde. Operações normais. Próximo relatório em 6 horas.",
          priority: "low",
          status: "delivered",
          sent_at: "2024-01-20T06:00:00Z",
          sender_role: "captain",
          response_required: false,
        },
      ];

      setCommunications(mockCommunications);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar comunicações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const mockChannels: CommunicationChannel[] = [
        {
          id: "vhf-16",
          name: "VHF Canal 16 (Emergência)",
          type: "emergency",
          status: "active",
          participants: ["Todas as embarcações", "Guarda Costeira"],
          last_activity: "2024-01-20T14:30:00Z",
        },
        {
          id: "vhf-68",
          name: "VHF Canal 68 (Operações)",
          type: "vhf",
          status: "active",
          participants: ["Frota Nautilus", "Porto de Santos"],
          last_activity: "2024-01-20T12:15:00Z",
        },
        {
          id: "sat-primary",
          name: "Satélite Principal",
          type: "satellite",
          status: "active",
          participants: ["Todas as embarcações", "Centro de Controle"],
          last_activity: "2024-01-20T10:45:00Z",
        },
        {
          id: "internal-ops",
          name: "Operações Internas",
          type: "internal",
          status: "active",
          participants: ["Gestão de Frota", "Capitães"],
          last_activity: "2024-01-20T08:30:00Z",
        },
      ];

      setChannels(mockChannels);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const setupRealTimeUpdates = () => {
    // Set up real-time communication updates
    const interval = setInterval(() => {
      // Checking for new communications
    }, 30000);

    return () => clearInterval(interval);
  };

  const sendMessage = async () => {
    try {
      if (!newMessage.content.trim() || !newMessage.vessel_id) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Call the maritime communication edge function
      const { data, error } = await supabase.functions.invoke("maritime-communication", {
        body: {
          vessel_id: newMessage.vessel_id,
          message_type: newMessage.message_type,
          content: newMessage.content,
          priority: newMessage.priority,
          coordinates: newMessage.coordinates,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso",
      });

      // Reset form and close dialog
      setNewMessage({
        vessel_id: "",
        message_type: "general",
        content: "",
        priority: "normal",
        coordinates: { latitude: 0, longitude: 0 },
      });
      setIsNewMessageOpen(false);

      // Reload communications
      loadCommunications();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  const getMessageTypeColor = (type: MaritimeCommunication["message_type"]) => {
    switch (type) {
      case "emergency":
        return "bg-status-error";
      case "weather_alert":
        return "bg-warning";
      case "navigation":
        return "bg-info";
      case "maintenance":
        return "bg-warning";
      case "port_authority":
        return "bg-primary";
      case "general":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getMessageTypeText = (type: MaritimeCommunication["message_type"]) => {
    switch (type) {
      case "emergency":
        return "Emergência";
      case "weather_alert":
        return "Alerta Meteorológico";
      case "navigation":
        return "Navegação";
      case "maintenance":
        return "Manutenção";
      case "port_authority":
        return "Autoridade Portuária";
      case "general":
        return "Geral";
      default:
        return "Desconhecido";
    }
  };

  const getPriorityColor = (priority: MaritimeCommunication["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "normal":
        return "text-blue-600 bg-blue-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-muted-foreground bg-gray-100";
    }
  };

  const getStatusIcon = (status: MaritimeCommunication["status"]) => {
    switch (status) {
      case "sent":
        return Clock;
      case "delivered":
        return CheckCircle;
      case "acknowledged":
        return Radio;
      case "resolved":
        return CheckCircle;
      default:
        return MessageSquare;
    }
  };

  const getChannelIcon = (type: CommunicationChannel["type"]) => {
    switch (type) {
      case "vhf":
        return Radio;
      case "satellite":
        return Satellite;
      case "email":
        return Mail;
      case "emergency":
        return AlertTriangle;
      case "internal":
        return MessageSquare;
      default:
        return Radio;
    }
  };

  const filteredCommunications = communications.filter(
    comm => selectedChannel === "all" || comm.message_type === selectedChannel
  );

  const emergencyCount = communications.filter(c => c.message_type === "emergency").length;
  const pendingCount = communications.filter(
    c => c.response_required && c.status !== "resolved"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Centro de Comunicações Marítimas</h2>
          <p className="text-muted-foreground">
            Comunicação em tempo real com a frota e autoridades portuárias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Radio className="h-3 w-3" />
            {channels.filter(c => c.status === "active").length} Canais Ativos
          </Badge>

          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Nova Mensagem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Embarcação</Label>
                    <Select
                      value={newMessage.vessel_id}
                      onValueChange={value =>
                        setNewMessage(prev => ({ ...prev, vessel_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar embarcação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mv-atlantic-001">MV Atlantic Explorer</SelectItem>
                        <SelectItem value="ms-ocean-002">MS Ocean Pioneer</SelectItem>
                        <SelectItem value="mv-pacific-003">MV Pacific Star</SelectItem>
                        <SelectItem value="ms-baltic-004">MS Baltic Wind</SelectItem>
                        <SelectItem value="mv-nordic-005">MV Nordic Crown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tipo de Mensagem</Label>
                    <Select
                      value={newMessage.message_type}
                      onValueChange={(value: any) =>
                        setNewMessage(prev => ({ ...prev, message_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="navigation">Navegação</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="weather_alert">Alerta Meteorológico</SelectItem>
                        <SelectItem value="emergency">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={newMessage.priority}
                    onValueChange={(value: any) =>
                      setNewMessage(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage.content}
                    onChange={e => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={newMessage.coordinates.latitude}
                      onChange={e =>
                        setNewMessage(prev => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            latitude: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={newMessage.coordinates.longitude}
                      onChange={e =>
                        setNewMessage(prev => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            longitude: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Alerts */}
      {(emergencyCount > 0 || pendingCount > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {emergencyCount} emergência(s) ativa(s) e {pendingCount}{" "}
            mensagem(ens) pendente(s) de resposta.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{communications.length}</div>
            <div className="text-sm text-muted-foreground">Mensagens Hoje</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Radio className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {channels.filter(c => c.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Canais Ativos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{emergencyCount}</div>
            <div className="text-sm text-muted-foreground">Emergências</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="emergency">Emergências</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          {/* Message Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant={selectedChannel === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel("all")}
                >
                  Todas
                </Button>
                <Button
                  variant={selectedChannel === "emergency" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel("emergency")}
                >
                  Emergências
                </Button>
                <Button
                  variant={selectedChannel === "navigation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel("navigation")}
                >
                  Navegação
                </Button>
                <Button
                  variant={selectedChannel === "weather_alert" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel("weather_alert")}
                >
                  Meteorológico
                </Button>
                <Button
                  variant={selectedChannel === "maintenance" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel("maintenance")}
                >
                  Manutenção
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredCommunications.map(comm => {
              const StatusIcon = getStatusIcon(comm.status);

              return (
                <Card
                  key={comm.id}
                  className={`border-l-4 ${
                    comm.message_type === "emergency"
                      ? "border-red-500 bg-red-50"
                      : comm.priority === "high"
                        ? "border-orange-500 bg-orange-50"
                        : "border-border"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <StatusIcon className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{comm.vessel_name}</h3>
                            <Badge
                              className={`${getMessageTypeColor(comm.message_type)} text-card-foreground`}
                            >
                              {getMessageTypeText(comm.message_type)}
                            </Badge>
                            <Badge className={getPriorityColor(comm.priority)}>
                              {comm.priority === "critical"
                                ? "Crítica"
                                : comm.priority === "high"
                                  ? "Alta"
                                  : comm.priority === "normal"
                                    ? "Normal"
                                    : "Baixa"}
                            </Badge>
                            {comm.response_required && (
                              <Badge variant="outline">Resposta Necessária</Badge>
                            )}
                          </div>

                          <p className="text-sm mb-3">{comm.content}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(comm.sent_at).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {comm.sender_role}
                            </div>
                            {comm.coordinates && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {comm.coordinates.latitude.toFixed(4)},{" "}
                                {comm.coordinates.longitude.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {comm.response_required && comm.status !== "resolved" && (
                          <Button size="sm">Responder</Button>
                        )}
                        {comm.status === "sent" && (
                          <Button size="sm" variant="outline">
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map(channel => {
              const ChannelIcon = getChannelIcon(channel.type);

              return (
                <Card key={channel.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <ChannelIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{channel.name}</h3>
                          <Badge
                            className={
                              channel.status === "active"
                                ? "bg-status-active text-status-active-foreground"
                                : channel.status === "maintenance"
                                  ? "bg-warning text-warning-foreground"
                                  : "bg-status-inactive text-status-inactive-foreground"
                            }
                          >
                            {channel.status === "active"
                              ? "Ativo"
                              : channel.status === "maintenance"
                                ? "Manutenção"
                                : "Inativo"}
                          </Badge>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Conectar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Participantes:</strong> {channel.participants.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Última atividade: {new Date(channel.last_activity).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Protocolos de Emergência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications
                  .filter(c => c.message_type === "emergency")
                  .map(emergency => (
                    <div
                      key={emergency.id}
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-red-800">{emergency.vessel_name}</h3>
                          <p className="text-sm text-red-700">{emergency.content}</p>
                          <p className="text-xs text-red-600">
                            {new Date(emergency.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm">
                            Resposta de Emergência
                          </Button>
                          <Button variant="outline" size="sm">
                            Contatar Guarda Costeira
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {communications.filter(c => c.message_type === "emergency").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600">
                      Nenhuma Emergência Ativa
                    </h3>
                    <p className="text-muted-foreground">
                      Todas as embarcações estão operando normalmente
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
