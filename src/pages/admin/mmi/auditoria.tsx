"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAllOrders, getOrderStats, type MMIOrder, type OrderStats } from "@/services/mmi/ordersService";
import { Search, Download, Filter, RefreshCw } from "lucide-react";

export default function AuditoriaPage() {
  const [orders, setOrders] = useState<MMIOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<MMIOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        fetchAllOrders(),
        getOrderStats(),
      ]);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search and filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
      setCurrentPage(1);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Embarcação", "Sistema", "Status", "Prioridade", "Criado em"];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.vessel_name,
      order.system_name,
      order.status,
      order.priority,
      new Date(order.created_at).toLocaleString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria-os-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      concluido: { variant: "default", label: "Concluído" },
      em_andamento: { variant: "secondary", label: "Em Andamento" },
      pendente: { variant: "outline", label: "Pendente" },
      cancelado: { variant: "destructive", label: "Cancelado" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      crítica: "bg-red-500 text-white",
      alta: "bg-orange-500 text-white",
      normal: "bg-yellow-500 text-white",
      baixa: "bg-green-500 text-white",
    };
    return (
      <Badge className={colors[priority] || "bg-gray-500 text-white"}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧾 Auditoria de Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">
            Painel completo de monitoramento e auditoria de OS
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="icon">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de OS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completion_rate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>
                {filteredOrders.length} {filteredOrders.length === 1 ? "registro" : "registros"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por embarcação, sistema, descrição ou status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando dados...
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Comentário Técnico</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.vessel_name}</TableCell>
                      <TableCell>{order.system_name}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.technician_comment || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de{" "}
                    {filteredOrders.length} registros
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
