/**
 * Time Charter Manager - vs Veson IMOS
 * TC-In / TC-Out management with hire calculations
 */
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, DollarSign, Calendar, Clock, FileText, Plus, 
  TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Anchor 
} from "lucide-react";
import { toast } from "sonner";

interface TimeCharter {
  id: string;
  charterId: string;
  type: "tc-in" | "tc-out";
  vessel: string;
  counterparty: string;
  hireRate: number;
  currency: string;
  period: string;
  commencementDate: string;
  redeliveryDate: string;
  status: "active" | "pending" | "expired" | "terminated";
  address: string;
  bunkerOnDelivery: { ifo: number; mdo: number };
  bunkerOnRedelivery?: { ifo: number; mdo: number };
  offHireDays: number;
  totalHireEarned: number;
  cpForm: string;
}

const MOCK_CHARTERS: TimeCharter[] = [
  {
    id: "1", charterId: "TC-IN-2026-001", type: "tc-in",
    vessel: "MV Atlantic Pioneer", counterparty: "Nordic Tankers AS",
    hireRate: 18500, currency: "USD/day", period: "12 months ± 30 days",
    commencementDate: "2026-01-15", redeliveryDate: "2027-01-15",
    status: "active", address: "5% Total Commission",
    bunkerOnDelivery: { ifo: 850, mdo: 120 },
    offHireDays: 2.5, totalHireEarned: 573500, cpForm: "NYPE 2015"
  },
  {
    id: "2", charterId: "TC-OUT-2026-003", type: "tc-out",
    vessel: "MV Pacific Guardian", counterparty: "Maersk Chartering",
    hireRate: 22000, currency: "USD/day", period: "6 months ± 15 days",
    commencementDate: "2026-02-01", redeliveryDate: "2026-08-01",
    status: "active", address: "3.75% Address Commission",
    bunkerOnDelivery: { ifo: 1200, mdo: 180 },
    offHireDays: 0, totalHireEarned: 330000, cpForm: "SHELLTIME 4"
  },
  {
    id: "3", charterId: "TC-IN-2026-005", type: "tc-in",
    vessel: "MV Nordic Star", counterparty: "Trafigura Maritime",
    hireRate: 15800, currency: "USD/day", period: "3 months firm",
    commencementDate: "2026-03-01", redeliveryDate: "2026-06-01",
    status: "pending", address: "2.5% ADDCOMM",
    bunkerOnDelivery: { ifo: 650, mdo: 95 },
    offHireDays: 0, totalHireEarned: 0, cpForm: "BALTIME 1939 (revised)"
  },
];

export function TCCharterManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewCharter, setShowNewCharter] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const activeCharters = MOCK_CHARTERS.filter(c => c.status === "active");
  const totalDailyHire = activeCharters.reduce((s, c) => s + c.hireRate, 0);
  const totalEarned = MOCK_CHARTERS.reduce((s, c) => s + c.totalHireEarned, 0);
  const totalOffHire = MOCK_CHARTERS.reduce((s, c) => s + c.offHireDays, 0);

  const filtered = typeFilter === "all" 
    ? MOCK_CHARTERS 
    : MOCK_CHARTERS.filter(c => c.type === typeFilter);

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Anchor className="h-7 w-7 text-primary" />
            Time Charter Management
          </h1>
          <p className="text-muted-foreground">TC-In / TC-Out • Hire statements • Off-hire tracking • NYPE / SHELLTIME</p>
        </div>
        <Dialog open={showNewCharter} onOpenChange={setShowNewCharter}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Charter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Time Charter</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="tc-in">TC-In (Charter In)</SelectItem><SelectItem value="tc-out">TC-Out (Charter Out)</SelectItem></SelectContent></Select></div>
                <div><Label>CP Form</Label><Select><SelectTrigger><SelectValue placeholder="CP Form" /></SelectTrigger><SelectContent><SelectItem value="nype">NYPE 2015</SelectItem><SelectItem value="shell">SHELLTIME 4</SelectItem><SelectItem value="baltime">BALTIME</SelectItem><SelectItem value="gentime">GENTIME</SelectItem></SelectContent></Select></div>
                <div><Label>Hire Rate (USD/day)</Label><Input type="number" placeholder="18500" /></div>
                <div><Label>Commission %</Label><Input type="number" placeholder="3.75" /></div>
                <div><Label>Commencement</Label><Input type="date" /></div>
                <div><Label>Redelivery</Label><Input type="date" /></div>
              </div>
              <Button className="w-full" onClick={() => { setShowNewCharter(false); toast.success("Charter TC-IN-2026-006 created"); }}>Create Charter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Ship className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{activeCharters.length}</p><p className="text-xs text-muted-foreground">Active Charters</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">${totalDailyHire.toLocaleString()}</p><p className="text-xs text-muted-foreground">Daily Hire Rate</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">${(totalEarned / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Hire Earned</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{totalOffHire}</p><p className="text-xs text-muted-foreground">Off-Hire Days</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{MOCK_CHARTERS.filter(c => c.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Charters</TabsTrigger>
          <TabsTrigger value="hire-statement">Hire Statement</TabsTrigger>
          <TabsTrigger value="off-hire">Off-Hire Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="tc-in">TC-In</SelectItem><SelectItem value="tc-out">TC-Out</SelectItem></SelectContent></Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charter ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>CP Form</TableHead>
                  <TableHead>Hire Rate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Off-Hire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(charter => (
                  <TableRow key={charter.id}>
                    <TableCell className="font-mono font-medium">{charter.charterId}</TableCell>
                    <TableCell><Badge variant={charter.type === "tc-in" ? "default" : "secondary"}>{charter.type.toUpperCase()}</Badge></TableCell>
                    <TableCell>{charter.vessel}</TableCell>
                    <TableCell>{charter.counterparty}</TableCell>
                    <TableCell className="text-xs">{charter.cpForm}</TableCell>
                    <TableCell className="font-medium">${charter.hireRate.toLocaleString()}/day</TableCell>
                    <TableCell className="text-xs">{charter.commencementDate} → {charter.redeliveryDate}</TableCell>
                    <TableCell><Badge variant={charter.status === "active" ? "default" : "outline"}>{charter.status}</Badge></TableCell>
                    <TableCell>{charter.offHireDays > 0 ? <span className="text-warning font-medium">{charter.offHireDays}d</span> : <span className="text-success">0</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="hire-statement" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Hire Statement - MV Atlantic Pioneer (Jan 2026)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Days</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell>Hire: 15 Jan → 14 Feb 2026</TableCell><TableCell className="text-right">31.00</TableCell><TableCell className="text-right">$18,500</TableCell><TableCell className="text-right font-medium">$573,500.00</TableCell></TableRow>
                  <TableRow><TableCell className="text-destructive">Less: Off-hire (Engine repair)</TableCell><TableCell className="text-right text-destructive">-2.50</TableCell><TableCell className="text-right">$18,500</TableCell><TableCell className="text-right text-destructive">-$46,250.00</TableCell></TableRow>
                  <TableRow><TableCell>Less: Address Commission (5%)</TableCell><TableCell className="text-right">—</TableCell><TableCell className="text-right">5.00%</TableCell><TableCell className="text-right text-destructive">-$26,362.50</TableCell></TableRow>
                  <TableRow className="border-t-2"><TableCell className="font-bold">Net Hire Due</TableCell><TableCell /><TableCell /><TableCell className="text-right font-bold text-lg">$500,887.50</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.success("Hire statement exported to PDF")}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
                <Button onClick={() => toast.success("Hire statement sent to counterparty")}>Send Statement</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="off-hire" className="space-y-4">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Charter</TableHead><TableHead>Period</TableHead><TableHead>Duration</TableHead><TableHead>Reason</TableHead><TableHead>Deduction</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>TC-IN-2026-001</TableCell><TableCell>Feb 5-7, 2026</TableCell><TableCell>2.5 days</TableCell><TableCell>Main engine turbocharger repair</TableCell><TableCell className="text-destructive font-medium">-$46,250</TableCell><TableCell><Badge>Agreed</Badge></TableCell></TableRow>
                <TableRow><TableCell>TC-OUT-2026-003</TableCell><TableCell>—</TableCell><TableCell>0 days</TableCell><TableCell>—</TableCell><TableCell>$0</TableCell><TableCell><Badge variant="outline">None</Badge></TableCell></TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Charter Revenue by Vessel (YTD)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { vessel: "MV Atlantic Pioneer", rev: 573500, pct: 63 },
                  { vessel: "MV Pacific Guardian", rev: 330000, pct: 37 },
                ].map(v => (
                  <div key={v.vessel} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>{v.vessel}</span><span className="font-medium">${(v.rev / 1000).toFixed(0)}K</span></div>
                    <Progress value={v.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Utilization Rate</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { vessel: "MV Atlantic Pioneer", util: 92, offHire: 2.5 },
                  { vessel: "MV Pacific Guardian", util: 100, offHire: 0 },
                ].map(v => (
                  <div key={v.vessel} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="font-medium text-sm">{v.vessel}</p><p className="text-xs text-muted-foreground">{v.offHire} off-hire days</p></div>
                    <div className="text-right"><p className="text-xl font-bold">{v.util}%</p><p className="text-xs text-muted-foreground">utilization</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default TCCharterManager;
