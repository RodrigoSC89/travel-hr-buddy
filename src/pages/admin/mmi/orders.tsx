import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MMIOS } from "@/types/mmi";

export default function MMIOrdersPage() {
  const [workOrders, setWorkOrders] = useState<MMIOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load work orders from database
  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mmi_os")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkOrders(data || []);
    } catch (error) {
      console.error("Error loading work orders:", error);
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    orderId: string,
    executedAt: string,
    technicianComment: string,
    status: string
  ) => {
    setSavingId(orderId);
    try {
      const { data, error } = await supabase.functions.invoke("mmi-os-update", {
        body: {
          id: orderId,
          status,
          executed_at: executedAt || null,
          technician_comment: technicianComment || null,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "✅ Ordem de serviço atualizada",
          description: "As informações foram salvas com sucesso.",
        });
        // Reload work orders to show updated data
        await loadWorkOrders();
      } else {
        throw new Error(data?.error || "Erro ao atualizar");
      }
    } catch (error) {
      console.error("Error updating work order:", error);
      toast({
        title: "❌ Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Aberta", variant: "outline" as const, emoji: "🟡" },
      in_progress: { label: "Em Andamento", variant: "default" as const, emoji: "🔵" },
      completed: { label: "Concluída", variant: "secondary" as const, emoji: "🟢" },
      cancelled: { label: "Cancelada", variant: "destructive" as const, emoji: "🔴" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return (
      <Badge variant={config.variant}>
        {config.emoji} {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📋 Gerenciamento de Ordens de Serviço</h1>
        <p className="text-muted-foreground">Carregando ordens de serviço...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📋 Gerenciamento de Ordens de Serviço</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie e atualize ordens de serviço de manutenção MMI
        </p>
      </div>

      {workOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhuma ordem de serviço encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workOrders.map((order) => (
            <WorkOrderCard
              key={order.id}
              order={order}
              onUpdate={handleUpdate}
              isSaving={savingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkOrderCardProps {
  order: MMIOS;
  onUpdate: (
    orderId: string,
    executedAt: string,
    technicianComment: string,
    status: string
  ) => Promise<void>;
  isSaving: boolean;
}

function WorkOrderCard({ order, onUpdate, isSaving }: WorkOrderCardProps) {
  const [executedAt, setExecutedAt] = useState(
    order.executed_at ? new Date(order.executed_at).toISOString().slice(0, 16) : ""
  );
  const [technicianComment, setTechnicianComment] = useState(order.technician_comment || "");
  const [status, setStatus] = useState(order.status);

  const isCompleted = status === "completed";
  const hasChanges =
    executedAt !== (order.executed_at ? new Date(order.executed_at).toISOString().slice(0, 16) : "") ||
    technicianComment !== (order.technician_comment || "") ||
    status !== order.status;

  const handleSave = () => {
    onUpdate(order.id, executedAt, technicianComment, status);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">OS-{order.id.slice(0, 8)}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Criada em: {new Date(order.created_at || "").toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{status === "open" ? "🟡 Aberta" : status === "in_progress" ? "🔵 Em Andamento" : status === "completed" ? "🟢 Concluída" : "🔴 Cancelada"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.notes && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor={`status-${order.id}`}>Status</Label>
            <select
              id={`status-${order.id}`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isCompleted || isSaving}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="open">🟡 Aberta</option>
              <option value="in_progress">🔵 Em Andamento</option>
              <option value="completed">🟢 Concluída</option>
              <option value="cancelled">🔴 Cancelada</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`executed-at-${order.id}`}>📅 Data de Execução</Label>
            <Input
              id={`executed-at-${order.id}`}
              type="datetime-local"
              value={executedAt}
              onChange={(e) => setExecutedAt(e.target.value)}
              disabled={isCompleted || isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`comment-${order.id}`}>💬 Comentário Técnico</Label>
            <Textarea
              id={`comment-${order.id}`}
              placeholder="Adicione observações técnicas sobre a execução..."
              value={technicianComment}
              onChange={(e) => setTechnicianComment(e.target.value)}
              disabled={isCompleted || isSaving}
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isCompleted || isSaving}
          className="w-full"
        >
          {isSaving ? "⏳ Salvando..." : "✅ Salvar Conclusão"}
        </Button>

        {isCompleted && (
          <p className="text-sm text-muted-foreground text-center">
            ℹ️ Ordens concluídas não podem ser editadas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
