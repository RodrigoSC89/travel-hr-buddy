import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  vessel_name: string;
  system_name: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/os/all");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
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

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const exportToPDF = (order: Order) => {
    const content = `
ORDEM DE SERVIÇO (MMI)

Embarcação: ${order.vessel_name}
Sistema: ${order.system_name}
Prioridade: ${order.priority}
Status: ${order.status}
Criada em: ${new Date(order.created_at).toLocaleDateString()}

Descrição:
${order.description}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `os-${order.id}.txt`;
    link.click();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "crítica":
        return "text-red-600 font-bold";
      case "alta":
        return "text-orange-600 font-semibold";
      case "média":
        return "text-yellow-600";
      case "baixa":
        return "text-green-600";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluída":
        return "text-green-600 font-semibold";
      case "em andamento":
        return "text-blue-600 font-semibold";
      case "pendente":
        return "text-gray-600";
      case "cancelada":
        return "text-red-600";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">🛠️ Ordens de Serviço (MMI)</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🛠️ Ordens de Serviço (MMI)</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Nenhuma ordem de serviço encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="space-y-2 p-4">
              <div>
                <b>Embarcação:</b> {order.vessel_name}
              </div>
              <div>
                <b>Sistema:</b> {order.system_name}
              </div>
              <div>
                <b>Prioridade:</b>{" "}
                <span className={getPriorityColor(order.priority)}>
                  {order.priority}
                </span>
              </div>
              <div>
                <b>Status:</b>{" "}
                <span className={getStatusColor(order.status)}>
                  {order.status}
                </span>
              </div>
              <div className="whitespace-pre-line bg-gray-100 p-3 rounded">
                {order.description}
              </div>

              <div className="space-x-2 pt-2">
                <Button
                  onClick={() => updateStatus(order.id, "concluída")}
                  disabled={order.status === "concluída"}
                  variant="success"
                  size="sm"
                >
                  ✅ Concluir
                </Button>
                <Button
                  onClick={() => updateStatus(order.id, "em andamento")}
                  disabled={order.status === "em andamento"}
                  variant="warning"
                  size="sm"
                >
                  🚧 Em Andamento
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => exportToPDF(order)}
                >
                  📄 Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
