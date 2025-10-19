/**
 * MMI Orders Audit Panel
 * Administrative panel for managing and auditing service orders
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { FileDown, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { MMIOrder } from "@/services/mmi/ordersService";
import { fetchAllOrders, getOrderStats, type MMIOrderStats } from "@/services/mmi/ordersService";

export default function AuditoriaOSPage() {
  const [orders, setOrders] = useState<MMIOrder[]>([]);
  const [stats, setStats] = useState<MMIOrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsData = await getOrderStats();
      setStats(statsData);

      // Load all orders
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
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
      case "pending":
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
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      in_progress: "Em Progresso",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      critical: "Crítica",
    };
    return labels[priority] || priority;
  };

  const columns: Column<MMIOrder>[] = [
    {
      key: "order_number",
      header: "Nº OS",
      sortable: true,
    },
    {
      key: "vessel_name",
      header: "Embarcação",
      sortable: true,
    },
    {
      key: "system_name",
      header: "Sistema",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value: unknown) => {
        const status = value as string;
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </span>
          </Badge>
        );
      },
    },
    {
      key: "priority",
      header: "Prioridade",
      sortable: true,
      render: (value: unknown) => {
        const priority = value as string;
        return (
          <Badge variant="outline" className={getPriorityColor(priority)}>
            {getPriorityLabel(priority)}
          </Badge>
        );
      },
    },
    {
      key: "technician_comment",
      header: "Comentário Técnico",
      render: (value: unknown) => {
        const comment = value as string | undefined;
        return comment ? (
          <span className="text-sm text-muted-foreground line-clamp-2">{comment}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">N/A</span>
        );
      },
    },
    {
      key: "executed_at",
      header: "Data Execução",
      sortable: true,
      render: (value: unknown) => {
        const date = value as string | undefined;
        return date ? (
          <span className="text-sm">
            {format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">-</span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧾 Auditoria de Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">
            Painel administrativo de auditoria de OS
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="default" disabled>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">ordens de serviço</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.in_progress}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        searchable
        sortable
        pagination
        pageSize={10}
        title="Ordens de Serviço"
        description={`${orders.length} ${orders.length === 1 ? "ordem encontrada" : "ordens encontradas"}`}
      />
    </div>
  );
}
