import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  Building,
  Plane,
  Car,
  Ship,
  User,
  DollarSign,
  FileText,
  Phone,
  Paperclip,
  Download
} from "lucide-react";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";
import { ReservationAttachments } from "./reservation-attachments";
import { ReservationPDFGenerator } from "./reservation-pdf-generator";

interface ReservationCardProps {
  reservation: EnhancedReservation;
  onEdit: (reservation: EnhancedReservation) => void;
  onDelete: (id: string) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onEdit,
  onDelete
}) => {
  const [showAttachments, setShowAttachments] = React.useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = React.useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
    case "confirmed": return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
    case "pending": return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning";
    case "cancelled": return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
    case "completed": return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "confirmed": return "Confirmada";
    case "pending": return "Pendente";
    case "cancelled": return "Cancelada";
    case "completed": return "Concluída";
    default: return "Desconhecida";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "hotel": return <Building className="h-4 w-4" />;
    case "flight": return <Plane className="h-4 w-4" />;
    case "transport": return <Car className="h-4 w-4" />;
    case "embarkation": return <Ship className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
    case "hotel": return "Hotel";
    case "flight": return "Voo";
    case "transport": return "Transporte";
    case "embarkation": return "Embarque";
    case "other": return "Outro";
    default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${
      reservation.conflict_detected ? "border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 mb-1">
              {getTypeIcon(reservation.reservation_type)}
              <span className="truncate">{reservation.title}</span>
              {reservation.conflict_detected && (
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(reservation.status)}>
                {getStatusLabel(reservation.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(reservation.reservation_type)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Dates */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium">
              {new Date(reservation.start_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            <div className="text-muted-foreground">
              até {new Date(reservation.end_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>

        {/* Location */}
        {reservation.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{reservation.location}</span>
          </div>
        )}

        {/* Crew Member */}
        {reservation.crew_member_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{reservation.crew_member_name}</span>
          </div>
        )}

        {/* Amount */}
        {reservation.total_amount && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-success">
              {formatCurrency(reservation.total_amount, reservation.currency)}
            </span>
          </div>
        )}

        {/* Confirmation Number */}
        {reservation.confirmation_number && (
          <div className="text-xs text-muted-foreground">
            Confirmação: <span className="font-mono">{reservation.confirmation_number}</span>
          </div>
        )}

        {/* Room Type */}
        {reservation.room_type && (
          <div className="text-xs text-muted-foreground">
            Tipo: {reservation.room_type}
          </div>
        )}

        {/* Contact Info */}
        {reservation.contact_info && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{reservation.contact_info}</span>
          </div>
        )}

        {/* Description */}
        {reservation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reservation.description}
          </p>
        )}

        {/* Conflict Warning */}
        {reservation.conflict_detected && (
          <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded p-2">
            <div className="flex items-center gap-2 text-destructive dark:text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Conflito detectado</span>
            </div>
            {reservation.ai_suggestions && reservation.ai_suggestions.length > 0 && (
              <div className="mt-1 text-xs text-destructive/80 dark:text-destructive/70">
                {reservation.ai_suggestions[0]}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(reservation)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAttachments(true)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPDFGenerator(true)}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {reservation.supplier_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(reservation.supplier_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(reservation.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Modals */}
      <ReservationAttachments
        reservationId={reservation.id}
        isOpen={showAttachments}
        onClose={() => setShowAttachments(false)}
      />
      
      <ReservationPDFGenerator
        reservation={reservation}
        isOpen={showPDFGenerator}
        onClose={() => setShowPDFGenerator(false)}
      />
    </Card>
  );
};