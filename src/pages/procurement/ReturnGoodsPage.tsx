/**
 * ReturnGoodsPage - Gestão de devoluções
 * Dados reais da tabela purchase_requisitions (filtered for returns) + procurement_orders
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Package, Truck, CheckCircle2, Clock, DollarSign, Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReturnItem {
  id: string;
  poNumber: string;
  item: string;
  supplier: string;
  vessel: string;
  reason: string;
  quantity: number;
  value: number;
  status: string;
  returnDate: string;
  creditReceived: boolean;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-blue-500/20 text-blue-400" },
  in_transit: { label: "Em Trânsito", color: "bg-purple-500/20 text-purple-400" },
  credit_issued: { label: "Crédito Emitido", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400" },
  cancelled: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

export default function ReturnGoodsPage() {
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["return-goods"],
    queryFn: async (): Promise<ReturnItem[]> => {
      const { data, error } = await supabase
        .from("procurement_orders")
        .select("*")
        .in("status", ["returned", "cancelled", "rejected", "pending_return"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((d, i) => {
          const rec = d as Record<string, unknown>;
          return {
            id: `RET-${String(i + 1).padStart(3, "0")}`,
            poNumber: d.order_number || d.id.slice(0, 8),
            item: String(rec.description || rec.title || "Item"),
            supplier: String(rec.supplier_name || d.supplier_id || "N/A"),
            vessel: String(rec.vessel_name || d.vessel_id || "N/A"),
            reason: String(rec.return_reason || "Devolução"),
            quantity: Number(rec.quantity || 1),
            value: Number(d.total_amount || 0),
            status: d.status || "pending",
            returnDate: d.created_at ? new Date(d.created_at).toLocaleDateString("pt-BR") : "N/A",
            creditReceived: d.status === "credit_issued",
          };
        });
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const totalValue = useMemo(() => returns.reduce((a, r) => a + r.value, 0), [returns]);
  const creditIssued = useMemo(() => returns.filter(r => r.creditReceived).reduce((a, r) => a + r.value, 0), [returns]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            Return Goods Management
          </h1>
          <p className="text-muted-foreground">Gestão de devoluções, créditos e logística reversa</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Devolução</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Devoluções Ativas</p><p className="text-2xl font-bold">{isLoading ? "..." : returns.filter(r => !r.creditReceived).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Valor Pendente</p><p className="text-2xl font-bold">{isLoading ? "..." : `$${(totalValue - creditIssued).toLocaleString()}`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Créditos Recebidos</p><p className="text-2xl font-bold text-green-400">{isLoading ? "..." : `$${creditIssued.toLocaleString()}`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Truck className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Em Trânsito</p><p className="text-2xl font-bold">{isLoading ? "..." : returns.filter(r => r.status === "in_transit").length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Devoluções</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : returns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma devolução registrada. O sistema rastreia devoluções automaticamente a partir de ordens de compra.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Embarcação</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Crédito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell>
                      <div>
                        <p>{r.item}</p>
                        <p className="text-xs text-muted-foreground">{r.poNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell>{r.vessel}</TableCell>
                    <TableCell><Badge variant="outline">{r.reason}</Badge></TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell className="font-medium">${r.value.toLocaleString()}</TableCell>
                    <TableCell><Badge className={(statusMap[r.status] || statusMap.pending).color}>{(statusMap[r.status] || statusMap.pending).label}</Badge></TableCell>
                    <TableCell>
                      {r.creditReceived ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
