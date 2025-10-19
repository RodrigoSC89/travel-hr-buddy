import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ClipboardCheck, 
  Calendar, 
  MessageSquare, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MMIOS } from "@/types/mmi";

export default function MMIOrdersAdminPage() {
  const [orders, setOrders] = useState<MMIOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mmi_os')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (order: MMIOS) => {
    try {
      setUpdating(order.id);

      const response = await supabase.functions.invoke('mmi-os-update', {
        body: {
          id: order.id,
          status: 'completed',
          technician_comment: order.technician_comment,
          executed_at: order.executed_at
        }
      });

      if (response.error) throw response.error;

      toast.success("✅ Ordem atualizada com sucesso");
      await loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar ordem de serviço");
    } finally {
      setUpdating(null);
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
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Aberta",
      in_progress: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8" />
            Ordens de Serviço MMI
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de ordens de serviço de manutenção
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {orders.length} Ordens
        </Badge>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">
                    {order.os_number || `OS-${order.id.slice(0, 8)}`}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Criada: {new Date(order.created_at || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
              {order.work_description && (
                <CardDescription className="mt-2">
                  {order.work_description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Execution Date Field */}
              <div className="space-y-2">
                <Label htmlFor={`executed-${order.id}`} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Execução
                </Label>
                <Input
                  id={`executed-${order.id}`}
                  type="date"
                  value={
                    order.executed_at
                      ? new Date(order.executed_at).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    setOrders(prev =>
                      prev.map(o =>
                        o.id === order.id ? { ...o, executed_at: e.target.value } : o
                      )
                    )
                  }
                  className="max-w-md"
                  disabled={order.status === 'completed'}
                />
              </div>

              {/* Technician Comment Field */}
              <div className="space-y-2">
                <Label htmlFor={`comment-${order.id}`} className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comentário Técnico
                </Label>
                <Textarea
                  id={`comment-${order.id}`}
                  placeholder="Adicione comentários técnicos ou operacionais..."
                  value={order.technician_comment || ''}
                  onChange={(e) =>
                    setOrders(prev =>
                      prev.map(o =>
                        o.id === order.id ? { ...o, technician_comment: e.target.value } : o
                      )
                    )
                  }
                  className="min-h-[100px]"
                  disabled={order.status === 'completed'}
                />
              </div>

              {/* Existing data display */}
              {order.notes && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                  <strong>Notas:</strong> {order.notes}
                </div>
              )}

              {/* Action Button */}
              {order.status !== 'completed' && (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => handleUpdateOrder(order)}
                  disabled={updating === order.id}
                >
                  {updating === order.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      ✅ Salvar Conclusão
                    </>
                  )}
                </Button>
              )}

              {order.status === 'completed' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded p-4 text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Ordem concluída</span>
                  </div>
                  {order.executed_at && (
                    <div className="text-sm mt-1">
                      Executada em: {new Date(order.executed_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardCheck className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhuma ordem de serviço encontrada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
