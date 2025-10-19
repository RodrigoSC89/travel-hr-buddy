import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Save, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WorkOrder {
  id: string;
  job_id: string | null;
  status: "open" | "in_progress" | "completed" | "cancelled";
  executed_at: string | null;
  technician_comment: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function MMIOrdersAdminPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mmi_os")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "open":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: "Aberta",
      in_progress: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleUpdateOrder = async (orderId: string) => {
    try {
      setSavingId(orderId);
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Call the edge function to update the order
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/mmi-os-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            id: orderId,
            status: order.status,
            executed_at: order.executed_at,
            technician_comment: order.technician_comment,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar OS");
      }

      toast.success("OS atualizada com sucesso!");
      await loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar OS");
    } finally {
      setSavingId(null);
    }
  };

  const updateOrderField = (
    orderId: string,
    field: keyof WorkOrder,
    value: string | null
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando ordens de serviço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço MMI</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as ordens de serviço de manutenção
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total: {orders.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhuma ordem de serviço encontrada
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">OS-{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Criada: {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-2 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Execução
                  </label>
                  <Input
                    type="datetime-local"
                    value={order.executed_at?.slice(0, 16) || ""}
                    onChange={(e) =>
                      updateOrderField(order.id, "executed_at", e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                    disabled={order.status === "completed"}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">💬 Comentário Técnico</label>
                  <Textarea
                    placeholder="Adicione comentários técnicos ou operacionais..."
                    value={order.technician_comment || ""}
                    onChange={(e) =>
                      updateOrderField(order.id, "technician_comment", e.target.value)
                    }
                    disabled={order.status === "completed"}
                    className="w-full min-h-[100px] resize-y"
                  />
                </div>

                <Button
                  onClick={() => handleUpdateOrder(order.id)}
                  disabled={savingId === order.id || order.status === "completed"}
                  className="w-full"
                >
                  {savingId === order.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Conclusão
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
