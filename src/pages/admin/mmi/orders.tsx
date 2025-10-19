import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, Wrench, AlertTriangle, Clock, CheckCircle, XCircle, FileDown } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  vessel_name: string;
  system_name: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/os/all");
      
      if (!response.ok) {
        throw new Error("Erro ao carregar ordens de serviço");
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(errorMessage);
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
        throw new Error("Erro ao atualizar status");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, ...(status === "concluída" ? { completed_at: new Date().toISOString() } : {}) } : o))
      );
      
      toast.success("Status atualizado com sucesso!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar";
      toast.error(errorMessage);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
    case "crítica":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "alta":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "média":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "baixa":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
    case "concluída":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "em andamento":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "pendente":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "cancelada":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
    case "concluída":
      return <CheckCircle className="w-4 h-4" />;
    case "em andamento":
      return <Clock className="w-4 h-4" />;
    case "pendente":
      return <AlertTriangle className="w-4 h-4" />;
    case "cancelada":
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
    }
  };

  const exportToPDF = (order: Order) => {
    const content = `
ORDEM DE SERVIÇO (MMI)
═══════════════════════════════════════

Embarcação: ${order.vessel_name}
Sistema: ${order.system_name}
Prioridade: ${order.priority}
Status: ${order.status}
Criada em: ${new Date(order.created_at).toLocaleDateString("pt-BR")}
${order.completed_at ? `Concluída em: ${new Date(order.completed_at).toLocaleDateString("pt-BR")}` : ""}

Descrição:
${order.description}

═══════════════════════════════════════
Documento gerado em: ${new Date().toLocaleString("pt-BR")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `os-${order.id}.txt`;
    link.click();
    toast.success("PDF exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Carregando ordens de serviço...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="w-8 h-8" />
          🛠️ Ordens de Serviço (MMI)
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerenciamento de ordens de serviço de Manutenção, Modernização e Inspeção
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Nenhuma ordem de serviço encontrada.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <Ship className="w-5 h-5" />
                      {order.vessel_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold mb-1">Sistema:</div>
                  <div className="text-muted-foreground">{order.system_name}</div>
                </div>

                <div>
                  <div className="font-semibold mb-1">Descrição:</div>
                  <div className="whitespace-pre-line bg-gray-100 p-3 rounded text-sm">
                    {order.description}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Criada em: {new Date(order.created_at).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(order.created_at).toLocaleTimeString("pt-BR")}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => updateStatus(order.id, "em andamento")}
                    disabled={order.status === "em andamento" || order.status === "concluída"}
                    variant={order.status === "em andamento" ? "secondary" : "default"}
                    size="sm"
                  >
                    🚧 Em Andamento
                  </Button>
                  <Button
                    onClick={() => updateStatus(order.id, "concluída")}
                    disabled={order.status === "concluída"}
                    variant={order.status === "concluída" ? "secondary" : "default"}
                    size="sm"
                  >
                    ✅ Concluir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToPDF(order)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    📄 Exportar PDF
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
