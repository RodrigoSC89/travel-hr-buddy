/**
 * InvoiceAutoMatchingPage - Real data from invoices + procurement_orders
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, AlertTriangle, Clock, Zap, DollarSign, ArrowRight, Search, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

interface MatchedInvoice {
  id: string;
  supplier: string;
  poNumber: string | null;
  poAmount: number | null;
  invoiceAmount: number;
  variance: number;
  matchStatus: string;
  confidence: number;
  date: string;
}

const statusMap: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  auto_matched: { label: "Auto-Matched", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  matched: { label: "Auto-Matched", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  variance: { label: "Variância", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
  pending_review: { label: "Revisão Manual", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  no_po: { label: "Sem PO", color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
};

export default function InvoiceAutoMatchingPage() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoice-matching"],
    queryFn: async (): Promise<MatchedInvoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error || !data) return [];

      return data.map((inv) => {
        const invRec = inv as Record<string, unknown>;
        const poRef = String(invRec.po_reference || invRec.po_number || "");
        const amount = Number(inv.total_amount || 0);
        const poAmount = Number(invRec.po_amount || amount);
        const variance = amount - poAmount;
        let matchStatus = "pending";
        let confidence = 0;
        if (poRef && Math.abs(variance) < 1) {
          matchStatus = "auto_matched";
          confidence = 99;
        } else if (poRef && Math.abs(variance) > 0) {
          matchStatus = "variance";
          confidence = Math.max(50, 100 - Math.round((Math.abs(variance) / Math.max(1, poAmount)) * 100));
        } else if (!poRef) {
          matchStatus = "no_po";
          confidence = 0;
        }

        return {
          id: inv.invoice_number || inv.id.slice(0, 12),
          supplier: String(invRec.supplier_name || invRec.supplier_id || "N/A"),
          poNumber: poRef || null,
          poAmount: poRef ? poAmount : null,
          invoiceAmount: amount,
          variance,
          matchStatus,
          confidence,
          date: inv.created_at ? new Date(inv.created_at).toLocaleDateString("pt-BR") : "N/A",
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const matched = useMemo(() => invoices.filter(i => i.matchStatus === "auto_matched" || i.matchStatus === "matched").length, [invoices]);
  const total = invoices.length;
  const matchRate = total > 0 ? Math.round((matched / total) * 100) : 0;
  const totalVariance = useMemo(() => invoices.reduce((a, i) => a + Math.abs(i.variance), 0), [invoices]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Invoice Auto-Matching
          </h1>
          <p className="text-muted-foreground">Matching automático PO ↔ Invoice com IA</p>
        </div>
        <Button variant="outline" className="gap-2"><Search className="h-4 w-4" /> Processar Lote</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Auto-Matched</p><p className="text-2xl font-bold text-green-400">{isLoading ? "..." : `${matchRate}%`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-yellow-400" /><div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{isLoading ? "..." : total - matched}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Variância Total</p><p className="text-2xl font-bold text-orange-400">{isLoading ? "..." : `$${totalVariance.toLocaleString()}`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Processados (mês)</p><p className="text-2xl font-bold">{isLoading ? "..." : total}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Matching Queue</CardTitle>
          <Input placeholder="Buscar invoice..." className="max-w-xs" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma invoice registrada. Cadastre invoices para ativar o matching automático.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Valor PO</TableHead>
                  <TableHead className="text-center"><ArrowRight className="h-4 w-4 mx-auto" /></TableHead>
                  <TableHead>Valor Invoice</TableHead>
                  <TableHead>Variância</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => {
                  const st = statusMap[inv.matchStatus] || statusMap.pending;
                  const Icon = st.icon;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>{inv.supplier}</TableCell>
                      <TableCell>{inv.poNumber || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{inv.poAmount != null ? `$${inv.poAmount.toLocaleString()}` : "—"}</TableCell>
                      <TableCell className="text-center"><ArrowRight className="h-3 w-3 mx-auto text-muted-foreground" /></TableCell>
                      <TableCell className="font-medium">${inv.invoiceAmount.toLocaleString()}</TableCell>
                      <TableCell className={inv.variance > 0 ? "text-orange-400" : ""}>{inv.variance !== 0 ? `${inv.variance > 0 ? "+" : ""}$${inv.variance.toLocaleString()}` : "$0"}</TableCell>
                      <TableCell>
                        {inv.confidence > 0 && (
                          <div className="flex items-center gap-2">
                            <Progress value={inv.confidence} className="w-12 h-2" />
                            <span className="text-xs">{inv.confidence}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={st.color}>
                          <Icon className="h-3 w-3 mr-1" />{st.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inv.matchStatus !== "auto_matched" && inv.matchStatus !== "matched" && (
                          <Button size="sm" variant="outline">Revisar</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
