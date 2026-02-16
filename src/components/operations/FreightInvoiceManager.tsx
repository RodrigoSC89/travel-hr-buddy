/**
 * 💰 FREIGHT INVOICE MANAGER - vs Veson IMOS
 * Freight billing, demurrage invoices, hire statements
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileText, Send, CheckCircle, Clock, AlertTriangle, Plus, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  type: "freight" | "demurrage" | "despatch" | "hire" | "bunker" | "port_disbursement";
  vessel_name: string;
  voyage_ref: string;
  counterparty: string;
  currency: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "pending" | "sent" | "acknowledged" | "disputed" | "paid" | "overdue";
  issue_date: string;
  due_date: string;
  payment_terms: string;
  notes: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: "1", invoice_number: "FRT-2026-001", type: "freight", vessel_name: "MV Pacific Explorer", voyage_ref: "V-2026-012", counterparty: "Petrobras S.A.", currency: "USD", amount: 485000, tax_amount: 0, total_amount: 485000, status: "sent", issue_date: "2026-02-10", due_date: "2026-03-12", payment_terms: "30 days", notes: "" },
  { id: "2", invoice_number: "DEM-2026-003", type: "demurrage", vessel_name: "MV Atlantic Star", voyage_ref: "V-2026-008", counterparty: "Shell Trading", currency: "USD", amount: 72500, tax_amount: 0, total_amount: 72500, status: "disputed", issue_date: "2026-02-05", due_date: "2026-03-07", payment_terms: "30 days", notes: "Dispute on laytime calculation" },
  { id: "3", invoice_number: "HIR-2026-015", type: "hire", vessel_name: "MV Nordic Wind", voyage_ref: "TC-2026-003", counterparty: "Maersk Tankers", currency: "USD", amount: 1250000, tax_amount: 0, total_amount: 1250000, status: "paid", issue_date: "2026-01-15", due_date: "2026-02-14", payment_terms: "30 days", notes: "" },
  { id: "4", invoice_number: "PDA-2026-022", type: "port_disbursement", vessel_name: "MV Pacific Explorer", voyage_ref: "V-2026-012", counterparty: "Santos Port Agent", currency: "BRL", amount: 185000, tax_amount: 9250, total_amount: 194250, status: "pending", issue_date: "2026-02-14", due_date: "2026-03-16", payment_terms: "30 days", notes: "" },
  { id: "5", invoice_number: "BNK-2026-007", type: "bunker", vessel_name: "MV Atlantic Star", voyage_ref: "V-2026-008", counterparty: "Peninsula Petroleum", currency: "USD", amount: 320000, tax_amount: 0, total_amount: 320000, status: "draft", issue_date: "2026-02-16", due_date: "2026-03-18", payment_terms: "30 days", notes: "VLSFO 380cst" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-yellow-500/20 text-yellow-400",
  sent: "bg-blue-500/20 text-blue-400",
  acknowledged: "bg-cyan-500/20 text-cyan-400",
  disputed: "bg-red-500/20 text-red-400",
  paid: "bg-green-500/20 text-green-400",
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
  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const invoices = MOCK_INVOICES;
  const filtered = filterStatus === "all" ? invoices : invoices.filter(i => i.status === filterStatus);

  const totalReceivable = invoices.filter(i => ["sent", "pending", "overdue"].includes(i.status)).reduce((s, i) => s + i.total_amount, 0);
  const totalDisputed = invoices.filter(i => i.status === "disputed").reduce((s, i) => s + i.total_amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> Total Invoices</div>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Clock className="h-4 w-4" /> Receivable</div>
            <div className="text-2xl font-bold text-yellow-400">${(totalReceivable / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" /> Disputed</div>
            <div className="text-2xl font-bold text-red-400">${(totalDisputed / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="h-4 w-4" /> Collected</div>
            <div className="text-2xl font-bold text-green-400">${(totalPaid / 1000000).toFixed(2)}M</div>
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
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{typeLabels[inv.type]}</Badge></td>
                    <td className="py-2 px-3">{inv.vessel_name}</td>
                    <td className="py-2 px-3">{inv.counterparty}</td>
                    <td className="py-2 px-3 text-right font-mono">{inv.currency} {inv.total_amount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center"><Badge className={statusColors[inv.status]}>{inv.status}</Badge></td>
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
