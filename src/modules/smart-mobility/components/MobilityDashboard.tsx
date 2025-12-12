import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Leaf,
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  QrCode,
  Send,
  Sparkles,
  Navigation,
  RefreshCw,
} from "lucide-react";

interface Trip {
  id: string;
  crewMember: string;
  role: string;
  vessel: string;
  type: "mobilization" | "demobilization";
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  flight: {
    airline: string;
    number: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    status: "on_time" | "delayed" | "cancelled";
  };
  hotel?: {
    name: string;
    location: string;
    checkIn: string;
    checkOut: string;
  };
  transfer?: {
    type: string;
    provider: string;
    time: string;
  };
  cost: number;
  carbonFootprint: number;
}

const mockTrips: Trip[] = [
  {
    id: "1",
    crewMember: "Carlos Silva",
    role: "Comandante",
    vessel: "OSV Atlantic",
    type: "mobilization",
    status: "scheduled",
    flight: {
      airline: "LATAM",
      number: "LA3421",
      departure: "GIG",
      arrival: "MCE",
      departureTime: "2024-01-20 08:30",
      arrivalTime: "2024-01-20 10:15",
      status: "on_time",
    },
    hotel: {
      name: "Hotel Macaé Business",
      location: "Macaé, RJ",
      checkIn: "2024-01-20",
      checkOut: "2024-01-21",
    },
    transfer: {
      type: "Van executiva",
      provider: "LogMar Transportes",
      time: "2024-01-21 05:00",
    },
    cost: 2450,
    carbonFootprint: 89,
  },
  {
    id: "2",
    crewMember: "Ana Santos",
    role: "DPO",
    vessel: "PSV Brasil",
    type: "demobilization",
    status: "in_progress",
    flight: {
      airline: "GOL",
      number: "G3 1045",
      departure: "MCE",
      arrival: "GRU",
      departureTime: "2024-01-19 14:00",
      arrivalTime: "2024-01-19 15:45",
      status: "delayed",
    },
    cost: 1890,
    carbonFootprint: 75,
  },
  {
    id: "3",
    crewMember: "Roberto Lima",
    role: "Chefe de Máquinas",
    vessel: "AHTS Power",
    type: "mobilization",
    status: "completed",
    flight: {
      airline: "Azul",
      number: "AD4521",
      departure: "VCP",
      arrival: "MCE",
      departureTime: "2024-01-18 06:00",
      arrivalTime: "2024-01-18 07:30",
      status: "on_time",
    },
    hotel: {
      name: "Ibis Macaé",
      location: "Macaé, RJ",
      checkIn: "2024-01-18",
      checkOut: "2024-01-19",
    },
    cost: 1650,
    carbonFootprint: 62,
  },
];

export default function MobilityDashboard() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente de viagens do Nautilus. Posso ajudar com informações sobre voos, hotéis e transfers. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    // Simulated AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        voo: "Seu próximo voo é LA3421 (LATAM) de GIG para MCE, partindo às 08:30 do dia 20/01. Status: No horário ✅",
        hotel: "Sua reserva está confirmada no Hotel Macaé Business. Check-in: 20/01, Check-out: 21/01. Endereço: Av. Atlântica, 1500 - Macaé, RJ",
        transfer: "Transfer agendado para 21/01 às 05:00. Van executiva da LogMar Transportes. O motorista entrará em contato 30min antes.",
        default: "Entendi sua pergunta. Deixe-me verificar as informações no sistema... Para sua próxima viagem, temos voo + hotel + transfer já confirmados. Deseja mais detalhes sobre algum item específico?",
      };
      
      const key = chatMessage.toLowerCase().includes("voo") ? "voo" 
        : chatMessage.toLowerCase().includes("hotel") ? "hotel"
          : chatMessage.toLowerCase().includes("transfer") ? "transfer"
            : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  });

  const totalCost = mockTrips.reduce((sum, t) => sum + t.cost, 0);
  const totalCarbon = mockTrips.reduce((sum, t) => sum + t.carbonFootprint, 0);
  const delayedFlights = mockTrips.filter(t => t.flight.status === "delayed").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viagens Ativas</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <Plane className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">R$ {(totalCost / 1000).toFixed(1)}k</p>
                <p className="text-xs text-green-600">↓ 12% vs mês anterior</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voos Atrasados</p>
                <p className="text-2xl font-bold">{delayedFlights}</p>
                <p className="text-xs text-amber-600">Remarcação automática ativa</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pegada CO₂</p>
                <p className="text-2xl font-bold">{totalCarbon} kg</p>
                <p className="text-xs text-teal-600">ESG tracking ativo</p>
              </div>
              <Leaf className="h-8 w-8 text-teal-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-ins Digitais</p>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-purple-600">↑ 15% adoção</p>
              </div>
              <QrCode className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Travel Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Assistente de Viagem
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre seu voo, hotel..."
                value={chatMessage}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Meu voo
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Meu hotel
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Viagens em Andamento
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        trip.type === "mobilization" 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {trip.type === "mobilization" ? <Plane className="h-5 w-5" /> : <Plane className="h-5 w-5 rotate-180" />}
                      </div>
                      <div>
                        <p className="font-medium">{trip.crewMember}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.role} • {trip.vessel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        trip.status === "completed" ? "default" :
                          trip.status === "delayed" ? "destructive" :
                            trip.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {trip.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {trip.status === "delayed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {trip.status === "scheduled" ? "Agendada" :
                          trip.status === "in_progress" ? "Em andamento" :
                            trip.status === "completed" ? "Concluída" : "Atrasada"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Flight */}
                    <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{trip.flight.airline} {trip.flight.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.flight.departure} → {trip.flight.arrival}
                        </p>
                        <Badge variant={trip.flight.status === "on_time" ? "outline" : "destructive"} className="mt-1 text-xs">
                          {trip.flight.status === "on_time" ? "No horário" : "Atrasado"}
                        </Badge>
                      </div>
                    </div>

                    {/* Hotel */}
                    {trip.hotel && (
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{trip.hotel.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.hotel.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip.hotel.checkIn} - {trip.hotel.checkOut}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transfer */}
                    {trip.transfer && (
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{trip.transfer.type}</p>
                          <p className="text-xs text-muted-foreground">{trip.transfer.provider}</p>
                          <p className="text-xs text-muted-foreground">{trip.transfer.time}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        R$ {trip.cost.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-teal-600">
                        <Leaf className="h-4 w-4" />
                        {trip.carbonFootprint} kg CO₂
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <QrCode className="h-4 w-4 mr-1" />
                        Check-in
                      </Button>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Panel */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">IA de Otimização de Custos</h3>
              <p className="text-sm text-muted-foreground">
                O sistema identificou 3 oportunidades de economia combinando voos e hospedagens
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">R$ 4.850</p>
              <p className="text-sm text-muted-foreground">economia potencial</p>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Ver Sugestões
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ESG Carbon Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-teal-500" />
            Relatório ESG - Pegada de Carbono
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <p className="text-sm text-muted-foreground">Emissões Aéreas</p>
              <p className="text-2xl font-bold">1.2 ton</p>
              <Progress value={60} className="mt-2 h-2" />
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-muted-foreground">Transporte Terrestre</p>
              <p className="text-2xl font-bold">0.3 ton</p>
              <Progress value={25} className="mt-2 h-2" />
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-muted-foreground">Hospedagem</p>
              <p className="text-2xl font-bold">0.1 ton</p>
              <Progress value={10} className="mt-2 h-2" />
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Offset Disponível</p>
              <p className="text-2xl font-bold">R$ 320</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Compensar CO₂
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
