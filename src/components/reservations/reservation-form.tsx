import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarIcon, 
  MapPin, 
  DollarSign, 
  User, 
  Building, 
  Phone, 
  ExternalLink,
  AlertTriangle,
  Bookmark
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";
import { ReservationTemplates } from "./reservation-templates";

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: EnhancedReservation | null;
  onSaved: () => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  reservation,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reservation_type: "hotel" as EnhancedReservation["reservation_type"],
    start_date: "",
    end_date: "",
    location: "",
    address: "",
    contact_info: "",
    confirmation_number: "",
    supplier_url: "",
    room_type: "",
    total_amount: "",
    currency: "BRL",
    status: "confirmed" as EnhancedReservation["status"],
    notes: ""
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (reservation) {
      setFormData({
        title: reservation.title,
        description: reservation.description || "",
        reservation_type: reservation.reservation_type,
        start_date: new Date(reservation.start_date).toISOString().slice(0, 16),
        end_date: new Date(reservation.end_date).toISOString().slice(0, 16),
        location: reservation.location || "",
        address: reservation.address || "",
        contact_info: reservation.contact_info || "",
        confirmation_number: reservation.confirmation_number || "",
        supplier_url: reservation.supplier_url || "",
        room_type: reservation.room_type || "",
        total_amount: reservation.total_amount?.toString() || "",
        currency: reservation.currency || "BRL",
        status: reservation.status,
        notes: reservation.notes || ""
      });
    } else {
      resetForm();
    }
  }, [reservation, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reservation_type: "hotel",
      start_date: "",
      end_date: "",
      location: "",
      address: "",
      contact_info: "",
      confirmation_number: "",
      supplier_url: "",
      room_type: "",
      total_amount: "",
      currency: "BRL",
      status: "confirmed",
      notes: ""
    });
  };

  const handleTemplateUse = (templateData: any) => {
    setFormData({
      ...formData,
      title: templateData.title || "",
      description: templateData.description || "",
      reservation_type: templateData.reservation_type || "hotel",
      location: templateData.location || "",
      address: templateData.address || "",
      contact_info: templateData.contact_info || "",
      supplier_url: templateData.supplier_url || "",
      room_type: templateData.room_type || "",
      currency: templateData.currency || "BRL",
      notes: templateData.notes || ""
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Erro de validação",
        description: "Data de início e fim são obrigatórias",
        variant: "destructive"
      });
      return false;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: "Erro de validação",
        description: "Data de fim deve ser posterior à data de início",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setLoading(true);

    try {
      const reservationData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        reservation_type: formData.reservation_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        location: formData.location.trim() || null,
        address: formData.address.trim() || null,
        contact_info: formData.contact_info.trim() || null,
        confirmation_number: formData.confirmation_number.trim() || null,
        supplier_url: formData.supplier_url.trim() || null,
        room_type: formData.room_type.trim() || null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        currency: formData.currency,
        status: formData.status,
        notes: formData.notes.trim() || null,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (reservation) {
        const { error } = await supabase
          .from("reservations")
          .update(reservationData)
          .eq("id", reservation.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Reserva atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from("reservations")
          .insert([{
            ...reservationData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Reserva criada com sucesso!"
        });
      }

      onSaved();
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar reserva. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
    case "hotel": return "Hotel / Hospedagem";
    case "flight": return "Voo";
    case "transport": return "Transporte Terrestre";
    case "embarkation": return "Embarque";
    case "other": return "Outro";
    default: return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {reservation ? "Editar Reserva" : "Nova Reserva"}
                </DialogTitle>
                <DialogDescription>
                  {reservation ? "Edite os detalhes da reserva" : "Crie uma nova reserva com todas as informações necessárias"}
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Templates
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Hotel Santos Dumont - Rio de Janeiro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Reserva *</Label>
                    <Select
                      value={formData.reservation_type}
                      onValueChange={(value: EnhancedReservation["reservation_type"]) => 
                        setFormData({ ...formData, reservation_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Hotel / Hospedagem
                          </div>
                        </SelectItem>
                        <SelectItem value="transport">Transporte Terrestre</SelectItem>
                        <SelectItem value="flight">Voo</SelectItem>
                        <SelectItem value="embarkation">Embarque</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes adicionais sobre a reserva..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dates and Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Datas e Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data/Hora de Início *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data/Hora de Fim *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Rio de Janeiro, RJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua, número, bairro, CEP"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes da Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmation_number">Número de Confirmação</Label>
                    <Input
                      id="confirmation_number"
                      value={formData.confirmation_number}
                      onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
                      placeholder="Ex: ABC123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room_type">Tipo de Quarto/Serviço</Label>
                    <Input
                      id="room_type"
                      value={formData.room_type}
                      onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                      placeholder="Ex: Quarto duplo standard"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_amount">Valor Total</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                        placeholder="0.00"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: EnhancedReservation["status"]) => 
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
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact and Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contato e Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Informações de Contato</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact_info"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        placeholder="Telefone, email, etc."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier_url">Link do Fornecedor</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="supplier_url"
                        type="url"
                        value={formData.supplier_url}
                        onChange={(e) => setFormData({ ...formData, supplier_url: e.target.value })}
                        placeholder="https://..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações internas, requisitos especiais, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : (reservation ? "Atualizar Reserva" : "Criar Reserva")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <ReservationTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onUseTemplate={handleTemplateUse}
      />
    </>
  );
};