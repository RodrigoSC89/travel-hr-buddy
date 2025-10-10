import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Share2, MapPin, Calendar, DollarSign, Phone, ExternalLink } from "lucide-react";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";

interface ReservationPDFGeneratorProps {
  reservation: EnhancedReservation;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationPDFGenerator: React.FC<ReservationPDFGeneratorProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      // Create a new window for the PDF content
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const pdfContent = generatePDFContent();

      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Trigger print after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFContent = () => {
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

    const getTypeLabel = (type: string) => {
      switch (type) {
        case "hotel":
          return "Hotel / Hospedagem";
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

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprovante de Reserva - ${reservation.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .reservation-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .reservation-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        
        .status-confirmed { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-cancelled { background: #fecaca; color: #991b1b; }
        .status-completed { background: #dbeafe; color: #1e40af; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-section {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
        }
        
        .info-section h3 {
            color: #2563eb;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: flex-start;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            min-width: 120px;
        }
        
        .info-value {
            text-align: right;
            flex: 1;
            word-break: break-word;
        }
        
        .description {
            background: #f1f5f9;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
        }
        
        .qr-placeholder {
            width: 100px;
            height: 100px;
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px auto;
            color: #64748b;
            font-size: 10px;
            text-align: center;
        }
        
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
        
        .amount-highlight {
            background: #dcfce7;
            color: #166534;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 18px;
        }
        
        .confirmation-code {
            background: #1e293b;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 16px;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>COMPROVANTE DE RESERVA</h1>
        <p>Sistema Nautilus One - Gestão de Reservas</p>
        <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
    </div>
    
    <div class="reservation-info">
        <h2 class="reservation-title">${reservation.title}</h2>
        <span class="status-badge status-${reservation.status}">
            ${getStatusLabel(reservation.status)}
        </span>
        <div style="margin-top: 10px;">
            <strong>Tipo:</strong> ${getTypeLabel(reservation.reservation_type)}
        </div>
    </div>
    
    <div class="info-grid">
        <div class="info-section">
            <h3>📅 Datas e Horários</h3>
            <div class="info-row">
                <span class="info-label">Início:</span>
                <span class="info-value">
                    ${new Date(reservation.start_date).toLocaleDateString("pt-BR")} às 
                    ${new Date(reservation.start_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Término:</span>
                <span class="info-value">
                    ${new Date(reservation.end_date).toLocaleDateString("pt-BR")} às 
                    ${new Date(reservation.end_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Duração:</span>
                <span class="info-value">
                    ${Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24))} dias
                </span>
            </div>
        </div>
        
        <div class="info-section">
            <h3>📍 Localização</h3>
            ${
              reservation.location
                ? `
            <div class="info-row">
                <span class="info-label">Local:</span>
                <span class="info-value">${reservation.location}</span>
            </div>
            `
                : ""
            }
            ${
              reservation.address
                ? `
            <div class="info-row">
                <span class="info-label">Endereço:</span>
                <span class="info-value">${reservation.address}</span>
            </div>
            `
                : ""
            }
            ${
              reservation.contact_info
                ? `
            <div class="info-row">
                <span class="info-label">Contato:</span>
                <span class="info-value">${reservation.contact_info}</span>
            </div>
            `
                : ""
            }
        </div>
        
        ${
          reservation.confirmation_number || reservation.room_type || reservation.total_amount
            ? `
        <div class="info-section">
            <h3>🏷️ Detalhes da Reserva</h3>
            ${
              reservation.confirmation_number
                ? `
            <div class="info-row">
                <span class="info-label">Confirmação:</span>
                <span class="info-value confirmation-code">${reservation.confirmation_number}</span>
            </div>
            `
                : ""
            }
            ${
              reservation.room_type
                ? `
            <div class="info-row">
                <span class="info-label">Tipo/Serviço:</span>
                <span class="info-value">${reservation.room_type}</span>
            </div>
            `
                : ""
            }
            ${
              reservation.total_amount
                ? `
            <div class="info-row">
                <span class="info-label">Valor Total:</span>
                <span class="info-value amount-highlight">
                    ${formatCurrency(reservation.total_amount, reservation.currency)}
                </span>
            </div>
            `
                : ""
            }
        </div>
        `
            : ""
        }
        
        <div class="info-section">
            <h3>👤 Informações do Responsável</h3>
            <div class="info-row">
                <span class="info-label">Tripulante:</span>
                <span class="info-value">${reservation.crew_member_name || "N/A"}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Criado em:</span>
                <span class="info-value">${new Date(reservation.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            ${
              reservation.updated_at !== reservation.created_at
                ? `
            <div class="info-row">
                <span class="info-label">Atualizado:</span>
                <span class="info-value">${new Date(reservation.updated_at).toLocaleDateString("pt-BR")}</span>
            </div>
            `
                : ""
            }
        </div>
    </div>
    
    ${
      reservation.description
        ? `
    <div class="description">
        <h3 style="margin-bottom: 10px; color: #2563eb;">📝 Observações:</h3>
        <p>${reservation.description}</p>
    </div>
    `
        : ""
    }
    
    ${
      reservation.notes
        ? `
    <div class="description">
        <h3 style="margin-bottom: 10px; color: #2563eb;">📋 Notas Internas:</h3>
        <p>${reservation.notes}</p>
    </div>
    `
        : ""
    }
    
    ${
      reservation.supplier_url
        ? `
    <div style="text-align: center; margin: 20px 0;">
        <p><strong>Link do Fornecedor:</strong></p>
        <a href="${reservation.supplier_url}" target="_blank" style="color: #2563eb; text-decoration: none;">
            ${reservation.supplier_url}
        </a>
    </div>
    `
        : ""
    }
    
    <div class="qr-placeholder">
        QR Code
        <br>
        (Futuro)
    </div>
    
    <div class="footer">
        <p><strong>Documento gerado automaticamente pelo Sistema Nautilus One</strong></p>
        <p>Este documento comprova a reserva realizada e deve ser apresentado quando solicitado</p>
        <p>Para dúvidas ou alterações, entre em contato com o departamento responsável</p>
        <p style="margin-top: 10px; font-size: 10px;">
            ID da Reserva: ${reservation.id} | 
            Gerado em: ${new Date().toISOString()}
        </p>
    </div>
</body>
</html>
    `;
  };

  const shareReservation = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reserva: ${reservation.title}`,
        text: `Detalhes da reserva de ${reservation.title} - ${getStatusLabel(reservation.status)}`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      const shareText = `Reserva: ${reservation.title}\nData: ${new Date(reservation.start_date).toLocaleDateString("pt-BR")}\nStatus: ${getStatusLabel(reservation.status)}`;
      navigator.clipboard.writeText(shareText);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Comprovante de Reserva
          </DialogTitle>
          <DialogDescription>
            Gere um comprovante profissional em PDF para impressão ou envio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{reservation.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    reservation.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : reservation.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                  }
                >
                  {getStatusLabel(reservation.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(reservation.start_date).toLocaleDateString("pt-BR")} -
                      {new Date(reservation.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {reservation.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{reservation.location}</span>
                    </div>
                  )}

                  {reservation.total_amount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-green-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: reservation.currency || "BRL",
                        }).format(reservation.total_amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {reservation.confirmation_number && (
                    <div className="text-sm">
                      <span className="font-medium">Confirmação: </span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">
                        {reservation.confirmation_number}
                      </span>
                    </div>
                  )}

                  {reservation.contact_info && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{reservation.contact_info}</span>
                    </div>
                  )}

                  {reservation.supplier_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={reservation.supplier_url}
                        target="_blank"
                        className="text-primary hover:underline truncate"
                        rel="noreferrer"
                      >
                        Site do fornecedor
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {reservation.description && (
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm">{reservation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={generatePDF} disabled={generating} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              {generating ? "Gerando PDF..." : "Gerar PDF / Imprimir"}
            </Button>

            <Button variant="outline" onClick={shareReservation} className="flex-1 sm:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>

            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Fechar
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center">
            O comprovante incluirá todas as informações da reserva, códigos de confirmação e será
            gerado no formato adequado para impressão ou envio digital.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
