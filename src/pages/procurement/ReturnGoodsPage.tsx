import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Package, Truck, CheckCircle2, Clock, AlertTriangle, Plus, DollarSign } from "lucide-react";

const MOCK_RETURNS = [
  { id: "RET-001", poNumber: "PO-2026-0089", item: "Fuel Injector Assembly", supplier: "Maritime Solutions Ltd", vessel: "MV Atlantic Star", reason: "Defective", quantity: 2, value: "$4,200", status: "approved", returnDate: "2026-02-20", creditReceived: false },
  { id: "RET-002", poNumber: "PO-2026-0082", item: "O-Ring Kit (wrong spec)", supplier: "Global Ship Stores", vessel: "MV Pacific Voyager", reason: "Wrong Item", quantity: 10, value: "$850", status: "in_transit", returnDate: "2026-02-18", creditReceived: false },
  { id: "RET-003", poNumber: "PO-2026-0076", item: "Hydraulic Pump", supplier: "Mediterranean Trading", vessel: "MV Nordic Spirit", reason: "Surplus", quantity: 1, value: "$6,500", status: "credit_issued", returnDate: "2026-02-10", creditReceived: true },
  { id: "RET-004", poNumber: "PO-2026-0071", item: "Safety Harness (expired cert)", supplier: "Global Ship Stores", vessel: "MV Atlantic Star", reason: "Quality Issue", quantity: 5, value: "$1,250", status: "pending", returnDate: "2026-02-22", creditReceived: false },
];

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-blue-500/20 text-blue-400" },
  in_transit: { label: "Em Trânsito", color: "bg-purple-500/20 text-purple-400" },
  credit_issued: { label: "Crédito Emitido", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400" },
};

export default function ReturnGoodsPage() {
  const totalValue = MOCK_RETURNS.reduce((a, r) => a + parseFloat(r.value.replace(/[$,]/g, "")), 0);
  const creditIssued = MOCK_RETURNS.filter(r => r.creditReceived).reduce((a, r) => a + parseFloat(r.value.replace(/[$,]/g, "")), 0);

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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Devoluções Ativas</p><p className="text-2xl font-bold">{MOCK_RETURNS.filter(r => !r.creditReceived).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Valor Pendente</p><p className="text-2xl font-bold">${(totalValue - creditIssued).toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Créditos Recebidos</p><p className="text-2xl font-bold text-green-400">${creditIssued.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Truck className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Em Trânsito</p><p className="text-2xl font-bold">{MOCK_RETURNS.filter(r => r.status === "in_transit").length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Devoluções</CardTitle></CardHeader>
        <CardContent>
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
              {MOCK_RETURNS.map(r => (
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
                  <TableCell className="font-medium">{r.value}</TableCell>
                  <TableCell><Badge className={statusMap[r.status].color}>{statusMap[r.status].label}</Badge></TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
