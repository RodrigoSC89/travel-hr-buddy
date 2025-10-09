import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Smartphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Reservation {
  id: string;
  title: string;
  description?: string;
  reservation_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export const ReservationsDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reservation_type: "",
    start_date: "",
    end_date: "",
    location: "",
    status: "confirmed" as "pending" | "confirmed" | "cancelled",
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const triggerHaptics = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log("Haptics not available");
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setReservations((data || []) as Reservation[]);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar reservas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await triggerHaptics();

    try {
      const reservationData = {
        ...formData,
        user_id: user.id,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (selectedReservation) {
        const { error } = await supabase
          .from("reservations")
          .update(reservationData)
          .eq("id", selectedReservation.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Reserva atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase.from("reservations").insert([reservationData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Reserva criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar reserva",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    await triggerHaptics();

    try {
      const { error } = await supabase.from("reservations").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reserva excluída com sucesso!",
      });
      fetchReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir reserva",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reservation_type: "",
      start_date: "",
      end_date: "",
      location: "",
      status: "confirmed" as "pending" | "confirmed" | "cancelled",
    });
    setSelectedReservation(null);
  };

  const openEditDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      title: reservation.title,
      description: reservation.description || "",
      reservation_type: reservation.reservation_type,
      start_date: new Date(reservation.start_date).toISOString().slice(0, 16),
      end_date: new Date(reservation.end_date).toISOString().slice(0, 16),
      location: reservation.location || "",
      status: reservation.status,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendente";
    case "cancelled":
      return "Cancelada";
    default:
      return "Desconhecida";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Reservas
            <Smartphone className="h-5 w-5 text-green-500" />
          </h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas reservas e agendamentos - Compatível com mobile
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedReservation ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
              <DialogDescription>
                {selectedReservation ? "Edite os detalhes da reserva" : "Crie uma nova reserva"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da reserva"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formData.reservation_type}
                  onValueChange={value => setFormData({ ...formData, reservation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viagem">Viagem</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="embarcacao">Embarcação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data/Hora Início</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data/Hora Fim</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Local</label>
                <Input
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Local da reserva"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição adicional"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "confirmed" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {selectedReservation ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === "confirmed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === "cancelled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map(reservation => (
          <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{reservation.title}</CardTitle>
                <Badge className={getStatusColor(reservation.status)}>
                  {getStatusLabel(reservation.status)}
                </Badge>
              </div>
              <CardDescription className="capitalize">
                {reservation.reservation_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(reservation.start_date).toLocaleString("pt-BR")} -
                    {new Date(reservation.end_date).toLocaleString("pt-BR")}
                  </span>
                </div>
                {reservation.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{reservation.location}</span>
                  </div>
                )}
                {reservation.description && (
                  <p className="text-sm text-muted-foreground">{reservation.description}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(reservation)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(reservation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira reserva para começar a organizar seus agendamentos
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Reserva
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
