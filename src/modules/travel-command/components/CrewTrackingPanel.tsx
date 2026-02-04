/**
 * Crew Tracking Panel - Duty of Care / Rastreamento de Tripulação
 * Monitoramento em tempo real da localização e status da tripulação em viagem
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin, Plane, Hotel, Ship, Phone, MessageSquare, AlertTriangle,
  CheckCircle2, Clock, Search, Filter, Navigation, Shield, Eye,
  Bell, RefreshCw, User, Calendar, ArrowRight, Wifi, WifiOff,
  Smartphone, Mail, Globe, Activity, Heart
} from "lucide-react";

interface TravelerStatus {
  id: string;
  name: string;
  position: string;
  vessel: string;
  status: "in_transit" | "at_destination" | "delayed" | "emergency" | "offline";
  currentLocation: string;
  lastUpdate: string;
  tripDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    arrivalDate: string;
    flightNumber?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
  alerts: {
    type: "delay" | "gate_change" | "cancellation" | "weather" | "emergency";
    message: string;
    time: string;
  }[];
}

// Mock travelers
const mockTravelers: TravelerStatus[] = [
  {
    id: "1",
    name: "Carlos Eduardo Santos",
    position: "Chefe de Máquinas",
    vessel: "MV Atlântico Sul",
    status: "in_transit",
    currentLocation: "Aeroporto GIG - Embarque",
    lastUpdate: "5 min atrás",
    tripDetails: {
      origin: "Rio de Janeiro (GIG)",
      destination: "Macaé (MCE)",
      departureDate: "2026-02-15 06:30",
      arrivalDate: "2026-02-15 07:15",
      flightNumber: "LA3421"
    },
    contactInfo: {
      phone: "+55 21 99999-1234",
      email: "carlos.santos@email.com",
      emergencyContact: "+55 21 88888-5678"
    },
    alerts: [
      { type: "gate_change", message: "Portão alterado: B12 → B18", time: "10 min atrás" }
    ]
  },
  {
    id: "2",
    name: "Ana Paula Silva",
    position: "Enfermeira de Bordo",
    vessel: "PSV Oceano Azul",
    status: "delayed",
    currentLocation: "Aeroporto GRU - Aguardando",
    lastUpdate: "2 min atrás",
    tripDetails: {
      origin: "São Paulo (GRU)",
      destination: "Rio de Janeiro (GIG)",
      departureDate: "2026-02-15 08:00",
      arrivalDate: "2026-02-15 09:15",
      flightNumber: "G31045"
    },
    contactInfo: {
      phone: "+55 11 97777-4321",
      email: "ana.silva@email.com",
      emergencyContact: "+55 11 96666-8765"
    },
    alerts: [
      { type: "delay", message: "Voo atrasado 45min - Nova previsão: 08:45", time: "15 min atrás" }
    ]
  },
  {
    id: "3",
    name: "Roberto Lima",
    position: "Comandante",
    vessel: "AHTS Maré Alta",
    status: "at_destination",
    currentLocation: "Hotel Macaé Business",
    lastUpdate: "1h atrás",
    tripDetails: {
      origin: "Salvador (SSA)",
      destination: "Macaé (MCE)",
      departureDate: "2026-02-14 14:00",
      arrivalDate: "2026-02-14 17:30"
    },
    contactInfo: {
      phone: "+55 71 98888-2222",
      email: "roberto.lima@email.com",
      emergencyContact: "+55 71 97777-3333"
    },
    alerts: []
  },
  {
    id: "4",
    name: "Fernanda Costa",
    position: "Operadora de ROV",
    vessel: "MV Pacífico Norte",
    status: "offline",
    currentLocation: "Última: Aeroporto VIX",
    lastUpdate: "3h atrás",
    tripDetails: {
      origin: "Vitória (VIX)",
      destination: "Macaé (MCE)",
      departureDate: "2026-02-15 10:00",
      arrivalDate: "2026-02-15 11:00"
    },
    contactInfo: {
      phone: "+55 27 99999-5555",
      email: "fernanda.costa@email.com",
      emergencyContact: "+55 27 98888-6666"
    },
    alerts: []
  }
];

// Stats
const stats = {
  inTransit: 12,
  atDestination: 8,
  delayed: 3,
  offline: 2,
  emergencies: 0,
  totalTracked: 25
};

export function CrewTrackingPanel() {
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerStatus | null>(null);
  const [filter, setFilter] = useState<"all" | "in_transit" | "at_destination" | "delayed" | "offline">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTravelers = mockTravelers.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      in_transit: { label: "Em Trânsito", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      at_destination: { label: "No Destino", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      delayed: { label: "Atrasado", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
      emergency: { label: "Emergência", className: "bg-red-500/10 text-red-600 border-red-500/20" },
      offline: { label: "Offline", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" }
    };
    const c = config[status] || config.offline;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      in_transit: <Plane className="h-4 w-4 text-blue-500" />,
      at_destination: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      delayed: <Clock className="h-4 w-4 text-orange-500" />,
      emergency: <AlertTriangle className="h-4 w-4 text-red-500" />,
      offline: <WifiOff className="h-4 w-4 text-gray-500" />
    };
    return icons[status] || icons.offline;
  };

  const handleSendMessage = (traveler: TravelerStatus) => {
    toast.success("Mensagem enviada", {
      description: `Notificação enviada para ${traveler.name}`
    });
  };

  const handleEmergencyCall = (traveler: TravelerStatus) => {
    toast.info("Ligação de emergência", {
      description: `Conectando com ${traveler.name}...`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Em Trânsito</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
              </div>
              <Plane className="h-6 w-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">No Destino</p>
                <p className="text-2xl font-bold text-green-600">{stats.atDestination}</p>
              </div>
              <Hotel className="h-6 w-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Atrasados</p>
                <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
              </div>
              <WifiOff className="h-6 w-6 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total</p>
                <p className="text-2xl font-bold">{stats.totalTracked}</p>
              </div>
              <Shield className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Travelers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Rastreamento de Tripulação
                  <Badge variant="secondary" className="ml-2">Duty of Care</Badge>
                </CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              <CardDescription>
                Monitoramento em tempo real da localização e status da tripulação em viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="in_transit">Em Trânsito</SelectItem>
                    <SelectItem value="at_destination">No Destino</SelectItem>
                    <SelectItem value="delayed">Atrasados</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Travelers List */}
              <ScrollArea className="h-[450px]">
                <div className="space-y-3 pr-4">
                  {filteredTravelers.map((traveler, idx) => (
                    <motion.div
                      key={traveler.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTraveler?.id === traveler.id ? "ring-2 ring-primary" : ""
                        } ${traveler.status === "delayed" ? "border-orange-500/50" : ""}`}
                        onClick={() => setSelectedTraveler(traveler)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {traveler.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{traveler.name}</span>
                                  {getStatusBadge(traveler.status)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {traveler.status !== "offline" ? (
                                    <Wifi className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <WifiOff className="h-3 w-3 text-gray-500" />
                                  )}
                                  {traveler.lastUpdate}
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {traveler.position} • {traveler.vessel}
                              </p>

                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">{traveler.currentLocation}</span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <span>{traveler.tripDetails.origin}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{traveler.tripDetails.destination}</span>
                                {traveler.tripDetails.flightNumber && (
                                  <>
                                    <span>•</span>
                                    <Plane className="h-3 w-3" />
                                    <span>{traveler.tripDetails.flightNumber}</span>
                                  </>
                                )}
                              </div>

                              {/* Alerts */}
                              {traveler.alerts.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  {traveler.alerts.map((alert, i) => (
                                    <div
                                      key={i}
                                      className={`flex items-center gap-2 text-xs p-2 rounded ${
                                        alert.type === "delay" ? "bg-orange-500/10 text-orange-600" :
                                        alert.type === "emergency" ? "bg-red-500/10 text-red-600" :
                                        "bg-yellow-500/10 text-yellow-600"
                                      }`}
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>{alert.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Traveler Details / Map */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-primary" />
                {selectedTraveler ? "Detalhes" : "Mapa"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTraveler ? (
                <div className="space-y-4">
                  {/* Traveler Header */}
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarFallback className="text-lg">
                        {selectedTraveler.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{selectedTraveler.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTraveler.position}</p>
                    <div className="mt-2">{getStatusBadge(selectedTraveler.status)}</div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Localização Atual</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedTraveler.currentLocation}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Atualizado: {selectedTraveler.lastUpdate}
                    </p>
                  </div>

                  {/* Trip Details */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Viagem</label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold">{selectedTraveler.tripDetails.origin.split(" ")[0]}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTraveler.tripDetails.departureDate.split(" ")[1]}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-px w-8 bg-border" />
                          <Plane className="h-4 w-4 text-primary" />
                          <div className="h-px w-8 bg-border" />
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{selectedTraveler.tripDetails.destination.split(" ")[0]}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTraveler.tripDetails.arrivalDate.split(" ")[1]}
                          </p>
                        </div>
                      </div>
                      {selectedTraveler.tripDetails.flightNumber && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Voo {selectedTraveler.tripDetails.flightNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contact */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Contato</label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTraveler.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{selectedTraveler.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Heart className="h-4 w-4" />
                        <span>{selectedTraveler.contactInfo.emergencyContact}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleSendMessage(selectedTraveler)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Mensagem
                    </Button>
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleEmergencyCall(selectedTraveler)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Ligar
                    </Button>
                  </div>

                  {selectedTraveler.status === "delayed" && (
                    <Button variant="outline" className="w-full" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Enviar Alerta de Atraso
                    </Button>
                  )}
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <Globe className="h-16 w-16 mb-4 opacity-20" />
                  <p>Selecione um tripulante</p>
                  <p className="text-sm">para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CrewTrackingPanel;
