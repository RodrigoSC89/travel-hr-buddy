/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * TRAVEL COMMAND CENTER
 * Módulo unificado de Viagens + Smart Mobility + Reservas
 * Gestão completa de viagens corporativas, mobilidade e reservas
 */

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plane, Hotel, Car, MapPin, Calendar, Clock, DollarSign,
  Users, Leaf, Brain, AlertTriangle, CheckCircle2, TrendingUp,
  Search, QrCode, Send, Sparkles, Navigation, RefreshCw,
  Plus, Download, Building, Globe, Star, CreditCard, Shield,
  FileText, LayoutDashboard, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import reservation components
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationStats } from "@/components/reservations/reservation-stats";
import { ReservationAI } from "@/components/reservations/reservation-ai";
import { ReservationCalendarView } from "@/components/reservations/reservation-calendar-view";

// ============================================
// INTERFACES
// ============================================

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

interface EnhancedReservation {
  id: string;
  title: string;
  description?: string;
  reservation_type: "hotel" | "transport" | "embarkation" | "flight" | "other";
  start_date: string;
  end_date: string;
  location?: string;
  address?: string;
  contact_info?: string;
  confirmation_number?: string;
  supplier_url?: string;
  room_type?: string;
  total_amount?: number;
  currency?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  crew_member_name?: string;
  conflict_detected?: boolean;
  ai_suggestions?: string[];
}

// ============================================
// MOCK DATA
// ============================================

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

// ============================================
// MAIN COMPONENT
// ============================================

export default function TravelCommandCenter() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // AI Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente de viagens do Nautilus. Posso ajudar com informações sobre voos, hotéis e transfers. Como posso ajudar?" },
  ]);

  // Reservations state
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<EnhancedReservation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    dateRange: null as { from: string; to: string } | null,
    searchTerm: "",
    crewMember: "all"
  });

  useEffect(() => {
    setIsLoaded(true);
    fetchReservations();
  }, []);

  // ============================================
  // DATA FUNCTIONS
  // ============================================

  const fetchReservations = async () => {
    try {
      setReservationsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setReservations([]);
        setReservationsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        if (error.message.includes("row-level security") || error.message.includes("JWT")) {
          setReservations([]);
          setReservationsLoading(false);
          return;
        }
        throw error;
      }
      
      const userIds = [...new Set((data || []).map(item => item.user_id))].filter((id): id is string => id !== null);
      
      let profileMap = new Map<string, string | null>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      }
      
      const enhancedData = (data || []).map(item => ({
        ...item,
        reservation_type: item.reservation_type as "hotel" | "transport" | "embarkation" | "flight" | "other",
        status: item.status as "pending" | "confirmed" | "cancelled" | "completed",
        crew_member_name: item.user_id ? (profileMap.get(item.user_id) ?? "N/A") : "N/A",
        conflict_detected: false,
        ai_suggestions: []
      })) as EnhancedReservation[];

      const conflictChecked = detectConflicts(enhancedData);
      setReservations(conflictChecked);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  const detectConflicts = (reservations: EnhancedReservation[]): EnhancedReservation[] => {
    return reservations.map(reservation => {
      const conflicts = reservations.filter(other => 
        other.id !== reservation.id &&
        other.user_id === reservation.user_id &&
        new Date(other.start_date) < new Date(reservation.end_date) &&
        new Date(other.end_date) > new Date(reservation.start_date)
      );
      
      return {
        ...reservation,
        conflict_detected: conflicts.length > 0,
        ai_suggestions: conflicts.length > 0 ? [
          "Conflito de data detectado",
          "Considere reagendar uma das reservas"
        ] : []
      };
    });
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        voo: "Seu próximo voo é LA3421 (LATAM) de GIG para MCE, partindo às 08:30 do dia 20/01. Status: No horário ✅",
        hotel: "Sua reserva está confirmada no Hotel Macaé Business. Check-in: 20/01, Check-out: 21/01.",
        transfer: "Transfer agendado para 21/01 às 05:00. Van executiva da LogMar Transportes.",
        default: "Entendi sua pergunta. Para sua próxima viagem, temos voo + hotel + transfer já confirmados. Deseja mais detalhes?",
      };
      
      const key = chatMessage.toLowerCase().includes("voo") ? "voo" 
        : chatMessage.toLowerCase().includes("hotel") ? "hotel"
          : chatMessage.toLowerCase().includes("transfer") ? "transfer"
            : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  });

  const handleEdit = (reservation: EnhancedReservation) => {
    setSelectedReservation(reservation);
    setIsFormOpen(true);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;
    
    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Reserva excluída com sucesso!" });
      fetchReservations();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao excluir reserva", variant: "destructive" });
    }
  };

  const exportReservations = () => {
    const csv = [
      ["Título", "Tipo", "Data Início", "Data Fim", "Local", "Status", "Tripulante"].join(","),
      ...filteredReservations.map(r => [
        r.title,
        r.reservation_type,
        new Date(r.start_date).toLocaleDateString("pt-BR"),
        new Date(r.end_date).toLocaleDateString("pt-BR"),
        r.location || "",
        r.status,
        r.crew_member_name || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const totalCost = mockTrips.reduce((sum, t) => sum + t.cost, 0);
  const totalCarbon = mockTrips.reduce((sum, t) => sum + t.carbonFootprint, 0);
  const delayedFlights = mockTrips.filter(t => t.flight.status === "delayed").length;

  const filteredReservations = reservations.filter(reservation => {
    if (filters.type !== "all" && reservation.reservation_type !== filters.type) return false;
    if (filters.status !== "all" && reservation.status !== filters.status) return false;
    if (filters.searchTerm && !reservation.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const quickStats = [
    { icon: Plane, label: "Viagens Ativas", value: mockTrips.length.toString(), color: "primary" },
    { icon: Building, label: "Reservas", value: reservations.length.toString(), color: "info" },
    { icon: DollarSign, label: "Custo Total", value: `R$ ${(totalCost / 1000).toFixed(1)}k`, color: "success" },
    { icon: AlertTriangle, label: "Voos Atrasados", value: delayedFlights.toString(), color: "warning" },
    { icon: Leaf, label: "CO₂ (kg)", value: totalCarbon.toString(), color: "secondary" },
    { icon: QrCode, label: "Check-ins", value: "89%", color: "primary" }
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <Helmet>
        <title>Travel Command Center | Nautilus One</title>
        <meta name="description" content="Central de comando de viagens corporativas com gestão de mobilidade, reservas e IA" />
      </Helmet>

      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              ✈️ Travel Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão integrada de viagens, mobilidade e reservas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReservations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportReservations}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleSetIsFormOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn("border-l-4", `border-l-${stat.color}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={cn("h-6 w-6 opacity-70", `text-${stat.color}`)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mobility" className="gap-2">
              <Navigation className="h-4 w-4" />
              Mobilidade
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="flights" className="gap-2">
              <Plane className="h-4 w-4" />
              Voos
            </TabsTrigger>
            <TabsTrigger value="hotels" className="gap-2">
              <Hotel className="h-4 w-4" />
              Hotéis
            </TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2">
              <Car className="h-4 w-4" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              IA Assistant
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Travel Assistant */}
              <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    Assistente de Viagem IA
                    <Badge variant="secondary" className="ml-auto">
                      <Sparkles className="h-3 w-3 mr-1" />
                      LLM
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg">
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
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Viagens em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mockTrips.map((trip) => (
                      <div key={trip.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              trip.type === "mobilization" 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-blue-500/10 text-blue-600"
                            }`}>
                              <Plane className={cn("h-5 w-5", trip.type === "demobilization" && "rotate-180")} />
                            </div>
                            <div>
                              <p className="font-medium">{trip.crewMember}</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.role} • {trip.vessel}
                              </p>
                            </div>
                          </div>
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

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                            <Plane className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{trip.flight.airline} {trip.flight.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {trip.flight.departure} → {trip.flight.arrival}
                              </p>
                            </div>
                          </div>

                          {trip.hotel && (
                            <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                              <Hotel className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-xs">{trip.hotel.name}</p>
                                <p className="text-xs text-muted-foreground">{trip.hotel.location}</p>
                              </div>
                            </div>
                          )}

                          {trip.transfer && (
                            <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-xs">{trip.transfer.type}</p>
                                <p className="text-xs text-muted-foreground">{trip.transfer.provider}</p>
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
                          <Button variant="outline" size="sm">Detalhes</Button>
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
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-48">
                    <h3 className="text-lg font-semibold">IA de Otimização de Custos</h3>
                    <p className="text-sm text-muted-foreground">
                      3 oportunidades de economia identificadas combinando voos e hospedagens
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
                    <p className="text-2xl font-bold">{totalCarbon} kg</p>
                    <Progress value={65} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Transporte Terrestre</p>
                    <p className="text-2xl font-bold">45 kg</p>
                    <Progress value={30} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Compensação</p>
                    <p className="text-2xl font-bold">120 kg</p>
                    <Progress value={80} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">Meta Mensal</p>
                    <p className="text-2xl font-bold">78%</p>
                    <Progress value={78} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOBILITY TAB */}
          <TabsContent value="mobility" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockTrips.map((trip) => (
                <Card key={trip.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{trip.crewMember}</CardTitle>
                      <Badge variant={trip.type === "mobilization" ? "default" : "secondary"}>
                        {trip.type === "mobilization" ? "Mobilização" : "Desmobilização"}
                      </Badge>
                    </div>
                    <CardDescription>{trip.role} • {trip.vessel}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Voo</span>
                        </div>
                        <p className="text-sm">{trip.flight.airline} {trip.flight.number}</p>
                        <p className="text-xs text-muted-foreground">{trip.flight.departure} → {trip.flight.arrival}</p>
                        <Badge variant={trip.flight.status === "on_time" ? "outline" : "destructive"} className="mt-2">
                          {trip.flight.status === "on_time" ? "No horário" : "Atrasado"}
                        </Badge>
                      </div>

                      {trip.hotel && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Hotel className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Hotel</span>
                          </div>
                          <p className="text-sm">{trip.hotel.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.hotel.location}</p>
                        </div>
                      )}

                      {trip.transfer && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Transfer</span>
                          </div>
                          <p className="text-sm">{trip.transfer.type}</p>
                          <p className="text-xs text-muted-foreground">{trip.transfer.provider}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-4">
                        <span className="text-sm text-muted-foreground">
                          💰 R$ {trip.cost.toLocaleString()}
                        </span>
                        <span className="text-sm text-teal-600">
                          🌱 {trip.carbonFootprint} kg CO₂
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <QrCode className="h-4 w-4 mr-1" />
                          Check-in
                        </Button>
                        <Button variant="outline" size="sm">Detalhes</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* RESERVATIONS TAB */}
          <TabsContent value="reservations" className="space-y-6">
            <ReservationStats reservations={reservations} />
            <ReservationFilters 
              filters={filters} 
              onFiltersChange={(newFilters) => setFilters(newFilters as unknown}
              reservations={reservations}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {filteredReservations.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                  <Button onClick={handleSetIsFormOpen}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reserva
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FLIGHTS TAB */}
          <TabsContent value="flights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Voos</CardTitle>
                <CardDescription>Busca e reserva de passagens aéreas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Plane className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{trip.flight.airline} {trip.flight.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.flight.departure} → {trip.flight.arrival}
                          </p>
                          <p className="text-xs text-muted-foreground">{trip.crewMember}</p>
                        </div>
                      </div>
                      <Badge variant={trip.flight.status === "on_time" ? "outline" : "destructive"}>
                        {trip.flight.status === "on_time" ? "No horário" : "Atrasado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOTELS TAB */}
          <TabsContent value="hotels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Hotéis</CardTitle>
                <CardDescription>Reservas de acomodações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrips.filter(t => t.hotel).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Hotel className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{trip.hotel!.name}</p>
                          <p className="text-sm text-muted-foreground">{trip.hotel!.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip.hotel!.checkIn} - {trip.hotel!.checkOut}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Confirmado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRANSFERS TAB */}
          <TabsContent value="transfers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Transfers</CardTitle>
                <CardDescription>Transportes terrestres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrips.filter(t => t.transfer).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Car className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{trip.transfer!.type}</p>
                          <p className="text-sm text-muted-foreground">{trip.transfer!.provider}</p>
                          <p className="text-xs text-muted-foreground">{trip.transfer!.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Agendado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI TAB */}
          <TabsContent value="ai" className="space-y-4">
            <ReservationAI 
              reservations={reservations}
              onReservationUpdate={fetchReservations}
            />
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <ReservationForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onSaved={() => {
            setIsFormOpen(false);
            setSelectedReservation(null);
            fetchReservations();
          }}
        />
      </div>
    </>
  );
}
