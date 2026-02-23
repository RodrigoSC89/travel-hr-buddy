import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, AlertTriangle, Clock, Zap, DollarSign, ArrowRight, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const MOCK_INVOICES = [
  { id: "INV-2026-0312", supplier: "Maritime Solutions Ltd", poNumber: "PO-2026-0089", poAmount: "$12,500", invoiceAmount: "$12,500", variance: "$0", matchStatus: "auto_matched", confidence: 99, date: "2026-02-22" },
  { id: "INV-2026-0311", supplier: "Nordic Marine Supply", poNumber: "PO-2026-0085", poAmount: "$8,200", invoiceAmount: "$8,450", variance: "+$250", matchStatus: "variance", confidence: 85, date: "2026-02-21" },
  { id: "INV-2026-0310", supplier: "Global Ship Stores", poNumber: "PO-2026-0082", poAmount: "$5,600", invoiceAmount: "$5,600", variance: "$0", matchStatus: "auto_matched", confidence: 98, date: "2026-02-20" },
  { id: "INV-2026-0309", supplier: "Asia Pacific Marine", poNumber: null, poAmount: null, invoiceAmount: "$3,200", variance: "N/A", matchStatus: "no_po", confidence: 0, date: "2026-02-19" },
  { id: "INV-2026-0308", supplier: "Mediterranean Trading", poNumber: "PO-2026-0078", poAmount: "$18,900", invoiceAmount: "$19,100", variance: "+$200", matchStatus: "pending_review", confidence: 72, date: "2026-02-18" },
  { id: "INV-2026-0307", supplier: "Maritime Solutions Ltd", poNumber: "PO-2026-0076", poAmount: "$7,800", invoiceAmount: "$7,800", variance: "$0", matchStatus: "auto_matched", confidence: 100, date: "2026-02-17" },
];

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  auto_matched: { label: "Auto-Matched", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  variance: { label: "Variância", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
  pending_review: { label: "Revisão Manual", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  no_po: { label: "Sem PO", color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
};

export default function InvoiceAutoMatchingPage() {
  const matched = MOCK_INVOICES.filter(i => i.matchStatus === "auto_matched").length;
  const total = MOCK_INVOICES.length;
  const matchRate = Math.round((matched / total) * 100);

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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Auto-Matched</p><p className="text-2xl font-bold text-green-400">{matchRate}%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-yellow-400" /><div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{total - matched}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Variância Total</p><p className="text-2xl font-bold text-orange-400">$450</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Processados (mês)</p><p className="text-2xl font-bold">156</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Matching Queue</CardTitle>
          <Input placeholder="Buscar invoice..." className="max-w-xs" />
        </CardHeader>
        <CardContent>
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
              {MOCK_INVOICES.map(inv => {
                const st = statusMap[inv.matchStatus];
                const Icon = st.icon;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.supplier}</TableCell>
                    <TableCell>{inv.poNumber || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{inv.poAmount || "—"}</TableCell>
                    <TableCell className="text-center"><ArrowRight className="h-3 w-3 mx-auto text-muted-foreground" /></TableCell>
                    <TableCell className="font-medium">{inv.invoiceAmount}</TableCell>
                    <TableCell className={inv.variance.startsWith("+") ? "text-orange-400" : ""}>{inv.variance}</TableCell>
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
                      {inv.matchStatus !== "auto_matched" && (
                        <Button size="sm" variant="outline">Revisar</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
