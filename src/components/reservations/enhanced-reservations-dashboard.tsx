import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Download, AlertTriangle, Bot, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ReservationFilters } from "./reservation-filters";
import { ReservationForm } from "./reservation-form";
import { ReservationCard } from "./reservation-card";
import { ReservationStats } from "./reservation-stats";
import { ReservationAI } from "./reservation-ai";
import { ReservationCalendarView } from "./reservation-calendar-view";

export interface EnhancedReservation {
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

interface ReservationFiltersType {
  type: string;
  status: string;
  dateRange: { from: string; to: string } | null;
  searchTerm: string;
  crewMember: string;
}

export const EnhancedReservationsDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<EnhancedReservation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<ReservationFiltersType>({
    type: "all",
    status: "all",
    dateRange: null,
    searchTerm: "",
    crewMember: "all",
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately to get crew member names
      const userIds = [...new Set((data || []).map(item => item.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const enhancedData = (data || []).map(item => ({
        ...item,
        crew_member_name: profileMap.get(item.user_id) || "N/A",
        conflict_detected: false,
        ai_suggestions: [],
      })) as EnhancedReservation[];

      // Check for conflicts
      const conflictChecked = detectConflicts(enhancedData);
      setReservations(conflictChecked);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar reservas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (reservations: EnhancedReservation[]): EnhancedReservation[] => {
    return reservations.map(reservation => {
      const conflicts = reservations.filter(
        other =>
          other.id !== reservation.id &&
          other.user_id === reservation.user_id &&
          new Date(other.start_date) < new Date(reservation.end_date) &&
          new Date(other.end_date) > new Date(reservation.start_date)
      );

      return {
        ...reservation,
        conflict_detected: conflicts.length > 0,
        ai_suggestions:
          conflicts.length > 0
            ? [
                "Conflito de data detectado",
                "Considere reagendar uma das reservas",
                "Verifique horários de check-in/check-out",
              ]
            : [],
      };
    });
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filters.type !== "all" && reservation.reservation_type !== filters.type) return false;
    if (filters.status !== "all" && reservation.status !== filters.status) return false;
    if (
      filters.searchTerm &&
      !reservation.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !reservation.location?.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )
      return false;
    if (filters.dateRange) {
      const startDate = new Date(reservation.start_date);
      const filterStart = new Date(filters.dateRange.from);
      const filterEnd = new Date(filters.dateRange.to);
      if (startDate < filterStart || startDate > filterEnd) return false;
    }
    return true;
  });

  const handleReservationSaved = () => {
    setIsFormOpen(false);
    setSelectedReservation(null);
    fetchReservations();
  };

  const handleEdit = (reservation: EnhancedReservation) => {
    setSelectedReservation(reservation);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;

    try {
      const { error } = await supabase.from("reservations").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reserva excluída com sucesso!",
      });
      fetchReservations();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir reserva",
        variant: "destructive",
      });
    }
  };

  const exportReservations = () => {
    const csv = [
      ["Título", "Tipo", "Data Início", "Data Fim", "Local", "Status", "Tripulante"].join(","),
      ...filteredReservations.map(r =>
        [
          r.title,
          r.reservation_type,
          new Date(r.start_date).toLocaleDateString("pt-BR"),
          new Date(r.end_date).toLocaleDateString("pt-BR"),
          r.location || "",
          r.status,
          r.crew_member_name || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Reservas
          </h2>
          <p className="text-muted-foreground">
            Sistema integrado de gestão de reservas e hospedagens
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportReservations}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            IA Assistant
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics */}
          <ReservationStats reservations={reservations} />

          {/* Filters */}
          <ReservationFilters
            filters={filters}
            onFiltersChange={setFilters}
            reservations={reservations}
          />

          {/* Reservations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReservations.map(reservation => (
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
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.searchTerm || filters.type !== "all" || filters.status !== "all"
                    ? "Nenhuma reserva corresponde aos filtros aplicados"
                    : "Crie sua primeira reserva para começar"}
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reserva
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <ReservationCalendarView
            reservations={filteredReservations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="ai">
          <ReservationAI reservations={reservations} onReservationUpdate={fetchReservations} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["hotel", "transport", "embarkation", "flight", "other"].map(type => {
                    const count = reservations.filter(r => r.reservation_type === type).length;
                    const percentage =
                      reservations.length > 0 ? (count / reservations.length) * 100 : 0;
                    return (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">{type}</span>
                        <span>
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conflitos Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reservations
                    .filter(r => r.conflict_detected)
                    .map(reservation => (
                      <div key={reservation.id} className="p-2 bg-red-50 rounded">
                        <p className="font-medium text-red-800">{reservation.title}</p>
                        <p className="text-sm text-red-600">
                          {new Date(reservation.start_date).toLocaleDateString("pt-BR")} -
                          {new Date(reservation.end_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  {reservations.filter(r => r.conflict_detected).length === 0 && (
                    <p className="text-muted-foreground">Nenhum conflito detectado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
        onSaved={handleReservationSaved}
      />
    </div>
  );
};
