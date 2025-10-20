import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MMIOS } from "@/types/mmi";
import { useToast } from "@/hooks/use-toast";
import { Wrench } from "lucide-react";

export default function MMIOSPage() {
  const [workOrders, setWorkOrders] = useState<MMIOS[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mmi_os")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setWorkOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "pendente" | "executado" | "atrasado") => {
    try {
      const { error } = await supabase
        .from("mmi_os")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Ordem de serviço marcada como ${newStatus}`,
      });

      await fetchWorkOrders();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
      pendente: { label: "Pendente", variant: "secondary" },
      executado: { label: "Executado", variant: "default" },
      atrasado: { label: "Atrasado", variant: "destructive" },
      open: { label: "Aberto", variant: "secondary" },
      in_progress: { label: "Em Andamento", variant: "default" },
      completed: { label: "Completo", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <CardTitle>Ordens de Serviço MMI - Etapa 5</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerenciamento simplificado de ordens de serviço de manutenção
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando ordens de serviço...
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell>
                      {os.descricao || os.work_description || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(os.status)}</TableCell>
                    <TableCell>{formatDate(os.created_at)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(os.id, "pendente")}
                      >
                        Pendente
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(os.id, "executado")}
                      >
                        Executado
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(os.id, "atrasado")}
                      >
                        Atrasado
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
