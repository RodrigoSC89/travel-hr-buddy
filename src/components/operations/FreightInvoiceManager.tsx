/**
 * 💰 FREIGHT INVOICE MANAGER - vs Veson IMOS
 * Freight billing, demurrage invoices, hire statements
 * CONNECTED TO REAL DATA via Supabase invoices table
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileText, Send, CheckCircle, Clock, AlertTriangle, Plus, Download, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  type: string;
  vessel_name: string;
  voyage_ref: string;
  counterparty: string;
  currency: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  notes: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  sent: "bg-info/20 text-info",
  acknowledged: "bg-accent/20 text-accent-foreground",
  disputed: "bg-destructive/20 text-destructive",
  paid: "bg-success/20 text-success",
  overdue: "bg-destructive/20 text-destructive",
};

const typeLabels: Record<string, string> = {
  freight: "Freight",
  demurrage: "Demurrage",
  despatch: "Despatch",
  hire: "Hire Statement",
  bunker: "Bunker",
  port_disbursement: "Port DA",
};

export function FreightInvoiceManager() {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["freight-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) return [];

      return data.map((inv): Invoice => ({
        id: inv.id,
        invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 6)}`,
        type: (inv.metadata as Record<string, unknown>)?.invoice_type as string || "freight",
        vessel_name: (inv.metadata as Record<string, unknown>)?.vessel_name as string || "N/A",
        voyage_ref: inv.erp_reference || "",
        counterparty: (inv.metadata as Record<string, unknown>)?.counterparty as string || "N/A",
        currency: inv.currency || "USD",
        amount: Number(inv.subtotal) || 0,
        tax_amount: Number(inv.tax_amount) || 0,
        total_amount: Number(inv.total_amount) || 0,
        status: inv.status || "draft",
        issue_date: inv.issued_at?.slice(0, 10) || inv.created_at?.slice(0, 10) || "",
        due_date: inv.due_at?.slice(0, 10) || "",
        payment_terms: inv.payment_terms || "30 days",
        notes: inv.notes || "",
      }));
    },
  });

  const filtered = filterStatus === "all" ? invoices : invoices.filter(i => i.status === filterStatus);

  const totalReceivable = invoices.filter(i => ["sent", "pending", "overdue"].includes(i.status)).reduce((s, i) => s + i.total_amount, 0);
  const totalDisputed = invoices.filter(i => i.status === "disputed").reduce((s, i) => s + i.total_amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando faturas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> Total Invoices</div>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Clock className="h-4 w-4" /> Receivable</div>
            <div className="text-2xl font-bold text-warning">${(totalReceivable / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" /> Disputed</div>
            <div className="text-2xl font-bold text-destructive">${(totalDisputed / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="h-4 w-4" /> Collected</div>
            <div className="text-2xl font-bold text-success">${totalPaid > 1000000 ? `${(totalPaid / 1000000).toFixed(2)}M` : `${(totalPaid / 1000).toFixed(0)}k`}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
        <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Freight & Commercial Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 px-3">Invoice #</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Vessel</th>
                  <th className="text-left py-2 px-3">Counterparty</th>
                  <th className="text-right py-2 px-3">Amount</th>
                  <th className="text-center py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Due Date</th>
                  <th className="text-center py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma fatura encontrada. Crie a primeira fatura.</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{typeLabels[inv.type] || inv.type}</Badge></td>
                    <td className="py-2 px-3">{inv.vessel_name}</td>
                    <td className="py-2 px-3">{inv.counterparty}</td>
                    <td className="py-2 px-3 text-right font-mono">{inv.currency} {inv.total_amount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center"><Badge className={statusColors[inv.status] || "bg-muted text-muted-foreground"}>{inv.status}</Badge></td>
                    <td className="py-2 px-3 text-xs">{inv.due_date}</td>
                    <td className="py-2 px-3 text-center">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info(`Opening invoice ${inv.invoice_number}`)}>
                        <Send className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FreightInvoiceManager;
