import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Ship, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface Order {
  id: string;
  vessel_name: string;
  system_name: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/os/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );

      toast.success("Status atualizado com sucesso");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
      case "em_andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluída";
      case "pendente":
        return "Pendente";
      case "cancelado":
        return "Cancelada";
      default:
        return status;
    }
  };

  const exportToPDF = async (order: Order) => {
    try {
      const content = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">Ordem de Serviço - ${order.id.substring(0, 8)}</h1>
          
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <div style="margin-bottom: 10px;"><strong>Embarcação:</strong> ${order.vessel_name}</div>
            <div style="margin-bottom: 10px;"><strong>Sistema:</strong> ${order.system_name}</div>
            <div style="margin-bottom: 10px;"><strong>Prioridade:</strong> ${order.priority}</div>
            <div style="margin-bottom: 10px;"><strong>Status:</strong> ${getStatusLabel(order.status)}</div>
            <div style="margin-bottom: 10px;"><strong>Criado em:</strong> ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
          </div>
          
          <div style="margin-top: 20px;">
            <h2 style="margin-bottom: 10px;">Descrição</h2>
            <p style="white-space: pre-wrap;">${order.description || "Sem descrição"}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `OS-${order.id.substring(0, 8)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(content).save();
      toast.success("PDF exportado com sucesso");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Ordens de Serviço (MMI)</h1>
        <p className="text-muted-foreground">
          Gerencie as ordens de serviço de manutenção, modernização e inspeção
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Ship className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        Embarcação: {order.vessel_name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wrench className="w-4 h-4" />
                      <span>Sistema: {order.system_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(order.priority)}>
                      Prioridade: {order.priority}
                    </Badge>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Descrição:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.description || "Sem descrição"}
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Criado em: {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(order.id, "em_andamento")}
                    disabled={order.status === "em_andamento" || order.status === "concluido"}
                  >
                    Iniciar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(order.id, "concluido")}
                    disabled={order.status === "concluido"}
                  >
                    Concluir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportToPDF(order)}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
