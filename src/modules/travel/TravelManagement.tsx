/**
 * PATCH 298: Travel Management Component
 * PATCH 866: Fully refactored to align with actual database schema
 * Uses: travel_itineraries table with correct column names
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Plus, 
  Download, 
  MapPin, 
  Calendar,
  Clock,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

// Type aligned with actual database schema
type TravelItineraryRow = Database["public"]["Tables"]["travel_itineraries"]["Row"];

// Extended type for UI display
interface TravelItinerary extends TravelItineraryRow {
  segments_parsed?: TravelSegment[];
}

interface TravelSegment {
  type: string;
  carrier?: string;
  booking_ref?: string;
  departure_time?: string;
  arrival_time?: string;
  cost?: number;
}

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return jsPDF;
};

const TravelManagement = () => {
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItinerary, setShowNewItinerary] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Form data aligned with actual schema
  const [formData, setFormData] = useState({
    trip_name: "",
    origin: "",
    destination: "",
    departure_date: "",
    return_date: "",
    status: "pending"
  });

  const loadItineraries = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("travel_itineraries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Parse segments JSONB safely
      const parsed = (data || []).map(item => ({
        ...item,
        segments_parsed: item.segments && Array.isArray(item.segments) 
          ? (item.segments as unknown as TravelSegment[]) 
          : []
      }));
      
      setItineraries(parsed);
    } catch (error) {
      logger.error("Error loading itineraries:", error);
      toast({
        title: "Error loading itineraries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  const createItinerary = async () => {
    if (!formData.trip_name || !formData.origin || !formData.destination || !formData.departure_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome da viagem, origem, destino e data de partida",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("travel_itineraries")
        .insert({
          trip_name: formData.trip_name,
          origin: formData.origin,
          destination: formData.destination,
          departure_date: formData.departure_date,
          return_date: formData.return_date || null,
          status: formData.status,
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "✅ Itinerário Criado",
        description: "Seu itinerário foi criado com sucesso",
      });

      setShowNewItinerary(false);
      setFormData({
        trip_name: "",
        origin: "",
        destination: "",
        departure_date: "",
        return_date: "",
        status: "pending"
      });
      loadItineraries();
    } catch (error) {
      logger.error("Error creating itinerary:", error);
      toast({
        title: "Erro ao criar itinerário",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const exportToPDF = async (itinerary: TravelItinerary) => {
    try {
      const JsPDF = await loadJsPDF();
      const doc = new JsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("Travel Itinerary", 14, 20);
      
      // Itinerary details
      doc.setFontSize(12);
      doc.text(`Trip: ${itinerary.trip_name}`, 14, 35);
      doc.text(`Status: ${itinerary.status}`, 14, 42);
      doc.text(`From: ${itinerary.origin}`, 14, 49);
      doc.text(`To: ${itinerary.destination}`, 14, 56);
      doc.text(`Departure: ${format(new Date(itinerary.departure_date), "dd/MM/yyyy")}`, 14, 63);
      if (itinerary.return_date) {
        doc.text(`Return: ${format(new Date(itinerary.return_date), "dd/MM/yyyy")}`, 14, 70);
      }
      if (itinerary.total_cost) {
        doc.text(`Total Cost: $${Number(itinerary.total_cost).toFixed(2)}`, 14, 77);
      }
      
      doc.save(`itinerary_${itinerary.id.slice(0, 8)}.pdf`);
      
      toast({
        title: "PDF Exported",
        description: "Itinerary exported successfully",
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-info text-info-foreground">Concluído</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Viagens</h1>
          <p className="text-muted-foreground">Gerencie itinerários e reservas de viagem</p>
        </div>
        <Dialog open={showNewItinerary} onOpenChange={setShowNewItinerary}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Itinerário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Itinerário</DialogTitle>
              <DialogDescription>Preencha os dados da viagem</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="trip_name">Nome da Viagem *</Label>
                <Input
                  id="trip_name"
                  value={formData.trip_name}
                  onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                  placeholder="Ex: Embarque Santos - Rio"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origem *</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destino *</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Santos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_date">Data de Partida *</Label>
                  <Input
                    id="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="return_date">Data de Retorno</Label>
                  <Input
                    id="return_date"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewItinerary(false)}>
                Cancelar
              </Button>
              <Button onClick={createItinerary} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Criar Itinerário
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Itinerários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itineraries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {itineraries.filter(i => i.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {itineraries.filter(i => i.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itinerários</CardTitle>
          <CardDescription>Lista de viagens cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum itinerário cadastrado</p>
              <Button className="mt-4" onClick={() => setShowNewItinerary(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Itinerário
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {itineraries.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <span className="font-medium">{itinerary.trip_name}</span>
                          {getStatusBadge(itinerary.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {itinerary.origin} → {itinerary.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(itinerary.departure_date), "dd/MM/yyyy")}
                          </span>
                          {itinerary.total_cost && (
                            <span>${Number(itinerary.total_cost).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToPDF(itinerary)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelManagement;
