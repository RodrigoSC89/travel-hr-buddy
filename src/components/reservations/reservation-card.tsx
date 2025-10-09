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
  Download,
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
  onDelete,
}) => {
  const [showAttachments, setShowAttachments] = React.useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = React.useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
      case "completed":
        return "Concluída";
      default:
        return "Desconhecida";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Building className="h-4 w-4" />;
      case "flight":
        return <Plane className="h-4 w-4" />;
      case "transport":
        return <Car className="h-4 w-4" />;
      case "embarkation":
        return <Ship className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "hotel":
        return "Hotel";
      case "flight":
        return "Voo";
      case "transport":
        return "Transporte";
      case "embarkation":
        return "Embarque";
      case "other":
        return "Outro";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 ${
        reservation.conflict_detected
          ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
          : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 mb-1">
              {getTypeIcon(reservation.reservation_type)}
              <span className="truncate">{reservation.title}</span>
              {reservation.conflict_detected && (
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
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
                minute: "2-digit",
              })}
            </div>
            <div className="text-muted-foreground">
              até{" "}
              {new Date(reservation.end_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
            <span className="font-medium text-green-600">
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
          <div className="text-xs text-muted-foreground">Tipo: {reservation.room_type}</div>
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
          <p className="text-sm text-muted-foreground line-clamp-2">{reservation.description}</p>
        )}

        {/* Conflict Warning */}
        {reservation.conflict_detected && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Conflito detectado</span>
            </div>
            {reservation.ai_suggestions && reservation.ai_suggestions.length > 0 && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-300">
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

          <Button variant="outline" size="sm" onClick={() => setShowAttachments(true)}>
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowPDFGenerator(true)}>
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
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
