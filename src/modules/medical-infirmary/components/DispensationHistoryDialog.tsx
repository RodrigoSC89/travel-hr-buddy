/**
 * Dispensation History Dialog - View medication dispensation logs
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, User, Calendar, Pill, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DispensationRecord {
  id: string;
  medication_name: string;
  quantity_dispensed: number;
  unit: string;
  dispensed_to: string;
  dispensed_by: string;
  reason: string;
  created_at: string;
  batch_number?: string;
}

interface DispensationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: DispensationRecord[];
  isLoading?: boolean;
}

export function DispensationHistoryDialog({
  open,
  onOpenChange,
  records,
  isLoading,
}: DispensationHistoryDialogProps) {
  const handleExport = () => {
    toast.success("Exportando histórico de dispensações...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Dispensações
          </DialogTitle>
          <DialogDescription>
            Registro completo de todas as retiradas de medicamentos
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhuma dispensação registrada</p>
              <p className="text-sm">Os registros aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium">{record.medication_name}</span>
                      <Badge variant="secondary">
                        {record.quantity_dispensed} {record.unit}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Paciente: {record.dispensed_to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Responsável: {record.dispensed_by}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Motivo:</strong> {record.reason}
                  </div>

                  {record.batch_number && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Lote: {record.batch_number}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import { toast } from "sonner";
