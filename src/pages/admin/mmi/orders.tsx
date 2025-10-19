import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, FileDown, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface Order {
  id: string;
  forecast_id?: string;
  vessel_name: string;
  system_name: string;
  description: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  priority: "baixa" | "normal" | "alta" | "crítica";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export default function MMIOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/os/all");
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "em_andamento" | "concluido"
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch("/api/os/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(
        `Ordem atualizada para: ${
          newStatus === "em_andamento" ? "Em Andamento" : "Concluída"
        }`
      );
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar ordem de serviço");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "crítica":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "alta":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "normal":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "baixa":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "em_andamento":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pendente":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "cancelado":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluída";
      case "cancelado":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "baixa":
        return "Baixa";
      case "normal":
        return "Média";
      case "alta":
        return "Alta";
      case "crítica":
        return "Crítica";
      default:
        return priority;
    }
  };

  const exportOrderToPDF = async (order: Order) => {
    try {
      const content = `
        <div style="padding: 30px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px;">
            <h1 style="color: #1e40af; margin: 0;">Ordem de Serviço MMI</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">ID: ${order.id}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Informações da Embarcação
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <strong style="color: #475569;">Embarcação:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${order.vessel_name}</p>
              </div>
              <div>
                <strong style="color: #475569;">Sistema:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${order.system_name}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Status e Prioridade
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <strong style="color: #475569;">Status:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${getStatusLabel(order.status)}</p>
              </div>
              <div>
                <strong style="color: #475569;">Prioridade:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${getPriorityLabel(order.priority)}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Descrição
            </h2>
            <p style="margin: 0; color: #0f172a; line-height: 1.6;">${order.description || "Sem descrição"}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Datas
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <strong style="color: #475569;">Criado em:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <div>
                <strong style="color: #475569;">Atualizado em:</strong>
                <p style="margin: 5px 0; color: #0f172a;">${format(new Date(order.updated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
            <p>Documento gerado automaticamente em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            <p style="margin: 5px 0 0 0;">Sistema de Gestão MMI - Travel HR Buddy</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `OS-${order.id}-${format(new Date(), "yyyyMMdd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(content).save();
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as ordens de serviço do sistema MMI
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestão de Ordens de Serviço</h1>
        <p className="text-muted-foreground mt-2">
          {orders.length} {orders.length === 1 ? "ordem" : "ordens"} de serviço
        </p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Ship className="w-5 h-5" />
                    {order.vessel_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {order.system_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(order.priority)} variant="outline">
                    {getPriorityLabel(order.priority)}
                  </Badge>
                  <Badge className={getStatusColor(order.status)} variant="outline">
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Descrição:</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.description || "Sem descrição"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Criado em:{" "}
                      {format(
                        new Date(order.created_at),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pendente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "em_andamento")}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Iniciar"
                        )}
                      </Button>
                    )}
                    {order.status === "em_andamento" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "concluido")}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Concluir"
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportOrderToPDF(order)}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
