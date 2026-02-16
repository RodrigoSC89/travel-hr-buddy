/**
 * Procurement Workflow Manager - vs AMOS/TM Master
 * Complete RFQ → PO → Invoice → Delivery pipeline
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Package, FileText, DollarSign, Truck, Clock, CheckCircle2, 
  AlertTriangle, Plus, Search, Filter, ArrowRight, BarChart3,
  Send, Eye, ShoppingCart
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseRequisition {
  id: string;
  prNumber: string;
  vessel: string;
  department: string;
  requestedBy: string;
  items: RequisitionItem[];
  priority: "critical" | "urgent" | "routine" | "planned";
  status: "draft" | "pending_approval" | "approved" | "rfq_sent" | "po_issued" | "delivered" | "closed";
  totalEstimate: number;
  currency: string;
  createdAt: string;
  requiredDate: string;
  approvedBy?: string;
  notes?: string;
}

interface RequisitionItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: string;
  impaCode?: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  prId: string;
  suppliers: string[];
  sentDate: string;
  dueDate: string;
  status: "sent" | "received" | "evaluated" | "awarded";
  quotations: Quotation[];
}

interface Quotation {
  supplier: string;
  totalPrice: number;
  currency: string;
  deliveryDays: number;
  validUntil: string;
  score: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  vessel: string;
  items: RequisitionItem[];
  totalAmount: number;
  currency: string;
  status: "issued" | "confirmed" | "shipped" | "delivered" | "invoiced" | "paid";
  deliveryPort: string;
  eta: string;
  trackingNumber?: string;
}

const MOCK_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: "1", prNumber: "PR-2026-0142", vessel: "MV Atlantic Pioneer",
    department: "Engine", requestedBy: "Chief Engineer",
    items: [
      { id: "1", partNumber: "FLT-0045", description: "Fuel Oil Filter Element 10μm", quantity: 24, unit: "pcs", estimatedPrice: 85, category: "Filters", impaCode: "27.13.01" },
      { id: "2", partNumber: "GSK-0122", description: "Cylinder Head Gasket Set", quantity: 6, unit: "sets", estimatedPrice: 450, category: "Engine Spares", impaCode: "27.01.05" },
    ],
    priority: "urgent", status: "approved", totalEstimate: 4740, currency: "USD",
    createdAt: "2026-02-10", requiredDate: "2026-03-01", approvedBy: "Fleet Manager"
  },
  {
    id: "2", prNumber: "PR-2026-0143", vessel: "MV Pacific Guardian",
    department: "Deck", requestedBy: "Chief Officer",
    items: [
      { id: "3", partNumber: "RPE-0089", description: "Mooring Rope 72mm PP", quantity: 2, unit: "coils", estimatedPrice: 3200, category: "Deck Equipment", impaCode: "23.02.01" },
    ],
    priority: "routine", status: "pending_approval", totalEstimate: 6400, currency: "USD",
    createdAt: "2026-02-12", requiredDate: "2026-04-15"
  },
  {
    id: "3", prNumber: "PR-2026-0141", vessel: "MV Nordic Star",
    department: "Safety", requestedBy: "Safety Officer",
    items: [
      { id: "4", partNumber: "LSA-0034", description: "EPIRB Battery Replacement", quantity: 4, unit: "pcs", estimatedPrice: 280, category: "Safety Equipment", impaCode: "43.01.08" },
      { id: "5", partNumber: "LSA-0056", description: "Immersion Suit Type I", quantity: 10, unit: "pcs", estimatedPrice: 520, category: "Safety Equipment", impaCode: "43.03.01" },
    ],
    priority: "critical", status: "rfq_sent", totalEstimate: 6320, currency: "USD",
    createdAt: "2026-02-08", requiredDate: "2026-02-25"
  },
];

const MOCK_POS: PurchaseOrder[] = [
  {
    id: "1", poNumber: "PO-2026-0098", supplier: "Wärtsila Marine Parts",
    vessel: "MV Atlantic Pioneer", totalAmount: 4250, currency: "USD",
    items: MOCK_REQUISITIONS[0].items,
    status: "shipped", deliveryPort: "Rotterdam", eta: "2026-02-28",
    trackingNumber: "WMP-NL-2026-4455"
  },
  {
    id: "2", poNumber: "PO-2026-0095", supplier: "MarineTech Supplies",
    vessel: "MV Nordic Star", totalAmount: 5890, currency: "USD",
    items: MOCK_REQUISITIONS[2].items,
    status: "confirmed", deliveryPort: "Singapore", eta: "2026-03-05"
  },
];

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  urgent: "bg-warning text-warning-foreground",
  routine: "bg-primary text-primary-foreground",
  planned: "bg-muted text-muted-foreground",
};

const statusFlow = ["draft", "pending_approval", "approved", "rfq_sent", "po_issued", "delivered", "closed"];

export function ProcurementWorkflow() {
  const [activeTab, setActiveTab] = useState("requisitions");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showNewPR, setShowNewPR] = useState(false);

  const stats = {
    totalOpen: MOCK_REQUISITIONS.filter(r => !["closed", "delivered"].includes(r.status)).length,
    pendingApproval: MOCK_REQUISITIONS.filter(r => r.status === "pending_approval").length,
    activePOs: MOCK_POS.filter(po => !["paid"].includes(po.status)).length,
    totalSpend: MOCK_POS.reduce((s, po) => s + po.totalAmount, 0),
    criticalItems: MOCK_REQUISITIONS.filter(r => r.priority === "critical").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-primary" />
            Procurement & Supply Chain
          </h1>
          <p className="text-muted-foreground">IMPA-coded requisitions • RFQ automation • PO tracking</p>
        </div>
        <Dialog open={showNewPR} onOpenChange={setShowNewPR}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Requisition</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Purchase Requisition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Vessel</Label><Select><SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger><SelectContent><SelectItem value="v1">MV Atlantic Pioneer</SelectItem><SelectItem value="v2">MV Pacific Guardian</SelectItem></SelectContent></Select></div>
                <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value="engine">Engine</SelectItem><SelectItem value="deck">Deck</SelectItem><SelectItem value="safety">Safety</SelectItem><SelectItem value="galley">Galley</SelectItem></SelectContent></Select></div>
                <div><Label>Priority</Label><Select><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="routine">Routine</SelectItem><SelectItem value="planned">Planned</SelectItem></SelectContent></Select></div>
                <div><Label>Required By</Label><Input type="date" /></div>
              </div>
              <div><Label>Notes</Label><Textarea placeholder="Additional notes..." /></div>
              <Button className="w-full" onClick={() => { setShowNewPR(false); toast.success("Requisition PR-2026-0144 created"); }}>
                Create Requisition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{stats.totalOpen}</p><p className="text-xs text-muted-foreground">Open PRs</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{stats.pendingApproval}</p><p className="text-xs text-muted-foreground">Pending Approval</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Truck className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{stats.activePOs}</p><p className="text-xs text-muted-foreground">Active POs</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">${(stats.totalSpend / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Spend</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{stats.criticalItems}</p><p className="text-xs text-muted-foreground">Critical Items</p></CardContent></Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="rfq">RFQ & Quotes</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search PRs..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="routine">Routine</SelectItem></SelectContent></Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REQUISITIONS.map(pr => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-mono font-medium">{pr.prNumber}</TableCell>
                    <TableCell>{pr.vessel}</TableCell>
                    <TableCell>{pr.department}</TableCell>
                    <TableCell>{pr.items.length} items</TableCell>
                    <TableCell><Badge className={priorityColors[pr.priority]}>{pr.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{pr.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="font-medium">${pr.totalEstimate.toLocaleString()}</TableCell>
                    <TableCell>{pr.requiredDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                        {pr.status === "approved" && <Button size="sm" variant="ghost" onClick={() => toast.success("RFQ sent to 3 suppliers")}><Send className="h-4 w-4" /></Button>}
                        {pr.status === "pending_approval" && <Button size="sm" variant="ghost" onClick={() => toast.success("PR approved")}><CheckCircle2 className="h-4 w-4 text-success" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Workflow Pipeline */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Procurement Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {statusFlow.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>{MOCK_REQUISITIONS.filter(r => r.status === step).length}</div>
                      <p className="text-xs mt-1 capitalize text-muted-foreground">{step.replace(/_/g, " ")}</p>
                    </div>
                    {i < statusFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>RFQ Comparison Matrix</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criteria</TableHead>
                    <TableHead className="text-center">Wärtsila Marine</TableHead>
                    <TableHead className="text-center">MarineTech</TableHead>
                    <TableHead className="text-center">Global Ship Supply</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Total Price</TableCell><TableCell className="text-center font-medium text-success">$4,250</TableCell><TableCell className="text-center">$4,890</TableCell><TableCell className="text-center">$5,120</TableCell></TableRow>
                  <TableRow><TableCell>Delivery (days)</TableCell><TableCell className="text-center font-medium text-success">14</TableCell><TableCell className="text-center">18</TableCell><TableCell className="text-center">12</TableCell></TableRow>
                  <TableRow><TableCell>Quality Score</TableCell><TableCell className="text-center">95%</TableCell><TableCell className="text-center">88%</TableCell><TableCell className="text-center font-medium text-success">92%</TableCell></TableRow>
                  <TableRow><TableCell>Past Performance</TableCell><TableCell className="text-center font-medium text-success">4.8/5</TableCell><TableCell className="text-center">4.2/5</TableCell><TableCell className="text-center">4.5/5</TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">Overall Score</TableCell><TableCell className="text-center font-bold text-success">92/100 ⭐</TableCell><TableCell className="text-center font-bold">78/100</TableCell><TableCell className="text-center font-bold">85/100</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end"><Button onClick={() => toast.success("PO issued to Wärtsila Marine Parts")}>Award to Best Supplier</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Port</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_POS.map(po => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{po.vessel}</TableCell>
                    <TableCell className="font-medium">${po.totalAmount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={po.status === "shipped" ? "default" : "outline"}>{po.status}</Badge></TableCell>
                    <TableCell>{po.deliveryPort}</TableCell>
                    <TableCell>{po.eta}</TableCell>
                    <TableCell className="font-mono text-xs">{po.trackingNumber || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Spend by Category</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { cat: "Engine Spares", pct: 38, val: "$45.2K" },
                  { cat: "Safety Equipment", pct: 22, val: "$26.1K" },
                  { cat: "Deck Equipment", pct: 18, val: "$21.3K" },
                  { cat: "Filters & Consumables", pct: 12, val: "$14.2K" },
                  { cat: "Galley & Provisions", pct: 10, val: "$11.8K" },
                ].map(item => (
                  <div key={item.cat} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>{item.cat}</span><span className="font-medium">{item.val} ({item.pct}%)</span></div>
                    <Progress value={item.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Supplier Performance</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Wärtsila Marine Parts", score: 95, orders: 42, onTime: "98%" },
                  { name: "MarineTech Supplies", score: 88, orders: 28, onTime: "92%" },
                  { name: "Global Ship Supply", score: 85, orders: 35, onTime: "89%" },
                  { name: "Orient Maritime Co.", score: 82, orders: 19, onTime: "87%" },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.orders} orders • {s.onTime} on-time</p></div>
                    <Badge variant={s.score >= 90 ? "default" : "secondary"}>{s.score}/100</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProcurementWorkflow;
