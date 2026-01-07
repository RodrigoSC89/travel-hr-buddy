/**
 * MMI Orders Page
 * Manages work orders for MMI maintenance operations
 * Note: Uses mmi_work_orders table via type assertion (not in generated types)
 */
import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Lazy import XLSX para não incluir ~2MB no bundle inicial
const loadXLSX = () => import("xlsx").then(m => m);
const loadHtml2pdf = () => import("html2pdf.js").then(m => m.default);

// Interface that matches the mmi_os table schema
interface MMIOSRecord {
  id: string;
  order_number?: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  vessel_id?: string;
  equipment_id?: string;
  scheduled_date?: string;
  executed_at?: string;
  technician_comment?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  notes?: string;
}

// Alias for component props
type MMIOS = MMIOSRecord;

export default function MMIOrdersPage() {
  const [workOrders, setWorkOrders] = useState<MMIOSRecord[]>([]);
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
      // Use mmi_maintenance_jobs as fallback (mmi_work_orders not in schema)
      const { data, error } = await supabase
        .from("mmi_maintenance_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Map maintenance jobs to work order format
      const mappedData: MMIOSRecord[] = (data || []).map(job => ({
        id: job.id,
        order_number: job.component_name || undefined,
        title: job.description || undefined,
        description: job.description || undefined,
        status: job.status || "open",
        priority: job.priority || undefined,
        assigned_to: job.assigned_to || undefined,
        vessel_id: job.vessel_id || undefined,
        equipment_id: job.component_id || undefined,
        scheduled_date: job.scheduled_date || undefined,
        executed_at: job.completed_date || undefined,
        technician_comment: undefined,
        created_at: job.created_at || new Date().toISOString(),
        updated_at: job.updated_at || undefined,
        metadata: undefined,
        notes: undefined,
      }));
      setWorkOrders(mappedData);
    } catch (error) {
      logger.error("Error loading work orders:", error);
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
      logger.error("Error updating work order:", error);
      toast({
        title: "❌ Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const exportToCSV = async () => {
    const xlsx = await loadXLSX();
    const worksheet = xlsx.utils.json_to_sheet(workOrders);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ordens de Serviço");
    xlsx.writeFile(workbook, "ordens-de-servico.xlsx");
  };

  const exportToPDF = async () => {
    const element = document.getElementById("os-table");
    if (element) {
      const html2pdf = await loadHtml2pdf();
      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: "ordens-de-servico.pdf",
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .save();
    }
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
        <>
          <div className="flex justify-end gap-2">
            <Button onClick={exportToCSV} variant="secondary">
              📊 Exportar CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              📄 Exportar PDF
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table id="os-table" className="w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">OS</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Criada em</th>
                  <th className="border p-2 text-left">Executada em</th>
                  <th className="border p-2 text-left">Comentário Técnico</th>
                  <th className="border p-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border p-2">OS-{order.id.slice(0, 8)}</td>
                    <td className="border p-2">
                      {order.status === "open"
                        ? "🟡 Aberta"
                        : order.status === "in_progress"
                          ? "🔵 Em Andamento"
                          : order.status === "completed"
                            ? "🟢 Concluída"
                            : "🔴 Cancelada"}
                    </td>
                    <td className="border p-2">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {order.executed_at
                        ? new Date(order.executed_at).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="border p-2">{order.technician_comment || "-"}</td>
                    <td className="border p-2">{order.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
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
            <Badge variant="outline">
              {status === "open"
                ? "🟡 Aberta"
                : status === "in_progress"
                  ? "🔵 Em Andamento"
                  : status === "completed"
                    ? "🟢 Concluída"
                    : "🔴 Cancelada"}
            </Badge>
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
