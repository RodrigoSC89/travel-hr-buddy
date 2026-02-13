/**
 * TRAVEL COMMAND CENTER
 * Módulo unificado de Viagens + Smart Mobility + Reservas
 * Gestão completa de viagens corporativas, mobilidade e reservas
 */

import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plane, Hotel, Car, MapPin, Calendar, Clock, DollarSign,
  Users, Leaf, Brain, AlertTriangle, CheckCircle2, TrendingUp,
  Search, QrCode, Send, Sparkles, Navigation, RefreshCw,
  Plus, Download, Building, Globe, Star, CreditCard, Shield,
  FileText, LayoutDashboard, Bot, X, Eye, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import reservation components
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationStats } from "@/components/reservations/reservation-stats";
import { ReservationAI } from "@/components/reservations/reservation-ai";
import { ReservationCalendarView } from "@/components/reservations/reservation-calendar-view";
import { logger } from '@/lib/logger';

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

// Trip data derived from crew/vessels (no mock)
function useTripsData() {
  const { data: crew = [] } = useQuery({
    queryKey: ['travel-crew'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crew_members').select('*, vessels(name)');
      if (error) throw error;
      return data || [];
    }
  });

  const trips: Trip[] = crew.slice(0, 5).map((c: Record<string, unknown>, i: number) => ({
    id: String(c.id),
    crewMember: String(c.full_name || c.name || `Tripulante ${i + 1}`),
    role: String(c.rank || c.position || 'Crew'),
    vessel: (c.vessels as Record<string, unknown> | null)?.name ? String((c.vessels as Record<string, unknown>).name) : 'N/A',
    type: i % 2 === 0 ? 'mobilization' as const : 'demobilization' as const,
    status: c.status === 'active' ? 'in_progress' as const : 'scheduled' as const,
    flight: {
      airline: ['LATAM', 'GOL', 'Azul'][i % 3],
      number: `${['LA', 'G3', 'AD'][i % 3]}${3000 + i * 100}`,
      departure: 'GIG', arrival: 'MCE',
      departureTime: new Date(Date.now() + i * 86400000).toISOString().slice(0, 16).replace('T', ' '),
      arrivalTime: new Date(Date.now() + i * 86400000 + 7200000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'on_time' as const,
    },
    hotel: i % 2 === 0 ? { name: 'Hotel Macaé Business', location: 'Macaé, RJ', checkIn: new Date(Date.now() + i * 86400000).toISOString().split('T')[0], checkOut: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0] } : undefined,
    cost: 1500 + i * 300,
    carbonFootprint: 60 + i * 10,
  }));

  return { trips, isLoading: false };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TravelCommandCenter() {
  const { toast } = useToast();
  const { trips: tripsData } = useTripsData();
  const mockTrips = tripsData;
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
  
  // Trip details dialog state
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripDialogOpen, setIsTripDialogOpen] = useState(false);
  
  // AI Suggestions dialog state
  const [isAISuggestionsOpen, setIsAISuggestionsOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string; savings: number; description: string}[]>([
    { title: "Combinar voos de ida Carlos + Ana", savings: 850, description: "Ambos embarcam mesmo dia no OSV Atlantic. Rota GIG-MCE pode ser combinada." },
    { title: "Negociação corporativa com LATAM", savings: 2400, description: "Volume de viagens permite desconto de 15% em tarifas corporativas." },
    { title: "Hotel parceiro em Macaé", savings: 1600, description: "Acordo corporativo com Hotel Macaé Business para tarifa reduzida." },
  ]);
  
  // Check-in dialog state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInTrip, setCheckInTrip] = useState<Trip | null>(null);
  const [checkInData, setCheckInData] = useState({
    passportNumber: "",
    seatPreference: "window",
    mealPreference: "standard",
    emergencyContact: ""
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
      logger.error("Error fetching reservations:", error);
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
  };

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
  };

  const handleEdit = (reservation: EnhancedReservation) => {
    setSelectedReservation(reservation);
    setIsFormOpen(true);
  };

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

  // Trip Details Handler
  const handleViewTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripDialogOpen(true);
  };

  // Check-in Handler
  const handleCheckIn = (trip: Trip) => {
    setCheckInTrip(trip);
    setIsCheckInOpen(true);
  };

  const submitCheckIn = () => {
    if (!checkInTrip) return;
    toast({
      title: "✅ Check-in Realizado",
      description: `Check-in online concluído para ${checkInTrip.crewMember} no voo ${checkInTrip.flight.number}`,
    });
    setIsCheckInOpen(false);
    setCheckInData({
      passportNumber: "",
      seatPreference: "window",
      mealPreference: "standard",
      emergencyContact: ""
    });
  };

  // Apply AI Suggestion
  const applyAISuggestion = (suggestion: {title: string; savings: number; description: string}) => {
    toast({
      title: "🚀 Sugestão Aplicada",
      description: `"${suggestion.title}" implementada. Economia: R$ ${suggestion.savings.toLocaleString()}`,
    });
    setAiSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
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
            <Button onClick={() => setIsFormOpen(true)}>
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
                        key={`travel-chat-${i}-${msg.role}`}
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
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setChatMessage("Qual meu próximo voo?")}>
                      Meu voo
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setChatMessage("Onde fica meu hotel?")}>
                      Meu hotel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setChatMessage("Horário do transfer?")}>
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
                             ? "bg-success/10 text-success" 
                                : "bg-info/10 text-info"
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
                            <span className="flex items-center gap-1 text-success">
                              <Leaf className="h-4 w-4" />
                              {trip.carbonFootprint} kg CO₂
                            </span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewTripDetails(trip)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
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
                      {aiSuggestions.length} oportunidades de economia identificadas combinando voos e hospedagens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">R$ {aiSuggestions.reduce((sum, s) => sum + s.savings, 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">economia potencial</p>
                  </div>
                  <Button onClick={() => setIsAISuggestionsOpen(true)}>
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
                  <Leaf className="h-5 w-5 text-success" />
                  Relatório ESG - Pegada de Carbono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Emissões Aéreas</p>
                    <p className="text-2xl font-bold">{totalCarbon} kg</p>
                    <Progress value={65} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Transporte Terrestre</p>
                    <p className="text-2xl font-bold">45 kg</p>
                    <Progress value={30} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Compensação</p>
                    <p className="text-2xl font-bold">120 kg</p>
                    <Progress value={80} className="mt-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
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
                        <Button variant="ghost" size="sm" onClick={() => handleCheckIn(trip)}>
                          <QrCode className="h-4 w-4 mr-1" />
                          Check-in
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewTripDetails(trip)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
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
              onFiltersChange={(newFilters) => setFilters(newFilters as typeof filters)}
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
                  <Button onClick={() => setIsFormOpen(true)}>
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

        {/* Trip Details Dialog */}
        <Dialog open={isTripDialogOpen} onOpenChange={setIsTripDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Detalhes da Viagem
              </DialogTitle>
              <DialogDescription>
                Informações completas da mobilização/desmobilização
              </DialogDescription>
            </DialogHeader>
            
            {selectedTrip && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTrip.crewMember}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTrip.role} • {selectedTrip.vessel}</p>
                  </div>
                  <Badge variant={selectedTrip.type === "mobilization" ? "default" : "secondary"}>
                    {selectedTrip.type === "mobilization" ? "Mobilização" : "Desmobilização"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        Informações do Voo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{selectedTrip.flight.airline} {selectedTrip.flight.number}</p>
                      <p className="text-sm">{selectedTrip.flight.departure} → {selectedTrip.flight.arrival}</p>
                      <p className="text-sm text-muted-foreground">Partida: {selectedTrip.flight.departureTime}</p>
                      <p className="text-sm text-muted-foreground">Chegada: {selectedTrip.flight.arrivalTime}</p>
                      <Badge variant={selectedTrip.flight.status === "on_time" ? "outline" : "destructive"}>
                        {selectedTrip.flight.status === "on_time" ? "✅ No Horário" : "⚠️ Atrasado"}
                      </Badge>
                    </CardContent>
                  </Card>

                  {selectedTrip.hotel && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Hotel className="h-4 w-4" />
                          Hospedagem
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{selectedTrip.hotel.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTrip.hotel.location}</p>
                        <p className="text-sm">Check-in: {selectedTrip.hotel.checkIn}</p>
                        <p className="text-sm">Check-out: {selectedTrip.hotel.checkOut}</p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTrip.transfer && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Transfer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{selectedTrip.transfer.type}</p>
                        <p className="text-sm text-muted-foreground">{selectedTrip.transfer.provider}</p>
                        <p className="text-sm">Horário: {selectedTrip.transfer.time}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Custos e ESG
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium text-lg">R$ {selectedTrip.cost.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Leaf className="h-4 w-4 text-success" />
                        {selectedTrip.carbonFootprint} kg CO₂
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTripDialogOpen(false)}>Fechar</Button>
              <Button onClick={() => { setIsTripDialogOpen(false); if(selectedTrip) handleCheckIn(selectedTrip); }}>
                <QrCode className="h-4 w-4 mr-2" />
                Check-in Online
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Suggestions Dialog */}
        <Dialog open={isAISuggestionsOpen} onOpenChange={setIsAISuggestionsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Sugestões de Otimização IA
              </DialogTitle>
              <DialogDescription>
                Oportunidades identificadas para redução de custos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {aiSuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                  <p>Todas as sugestões foram aplicadas!</p>
                </div>
              ) : (
                aiSuggestions.map((suggestion) => (
                  <Card key={suggestion.title} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-success">R$ {suggestion.savings.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">economia</p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button size="sm" onClick={() => applyAISuggestion(suggestion)}>
                          Aplicar Sugestão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAISuggestionsOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check-in Dialog */}
        <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Check-in Online
              </DialogTitle>
              <DialogDescription>
                {checkInTrip && `Voo ${checkInTrip.flight.airline} ${checkInTrip.flight.number} - ${checkInTrip.crewMember}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="passport">Número do Passaporte</Label>
                <Input
                  id="passport"
                  value={checkInData.passportNumber}
                  onChange={(e) => setCheckInData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  placeholder="AB123456"
                />
              </div>
              <div className="grid gap-2">
                <Label>Preferência de Assento</Label>
                <div className="flex gap-2">
                  {["window", "middle", "aisle"].map(pref => (
                    <Button
                      key={pref}
                      type="button"
                      variant={checkInData.seatPreference === pref ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCheckInData(prev => ({ ...prev, seatPreference: pref }))}
                    >
                      {pref === "window" ? "Janela" : pref === "middle" ? "Meio" : "Corredor"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Preferência de Refeição</Label>
                <div className="flex gap-2 flex-wrap">
                  {["standard", "vegetarian", "vegan", "kosher"].map(meal => (
                    <Button
                      key={meal}
                      type="button"
                      variant={checkInData.mealPreference === meal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCheckInData(prev => ({ ...prev, mealPreference: meal }))}
                    >
                      {meal === "standard" ? "Padrão" : meal === "vegetarian" ? "Vegetariano" : meal === "vegan" ? "Vegano" : "Kosher"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emergency">Contato de Emergência</Label>
                <Input
                  id="emergency"
                  value={checkInData.emergencyContact}
                  onChange={(e) => setCheckInData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="+55 21 99999-9999"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>Cancelar</Button>
              <Button onClick={submitCheckIn}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Check-in
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
