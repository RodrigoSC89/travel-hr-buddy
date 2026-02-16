/**
 * 💰 CREW PAYROLL CALCULATOR - vs Compas/Stena
 * Multi-currency payroll, ITF scales, allotments, overtime, leave pay
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Calculator, Download, TrendingUp, Clock, Globe, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PayrollEntry {
  id: string;
  crew_name: string;
  rank: string;
  vessel: string;
  nationality: string;
  currency: string;
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  leave_pay: number;
  subsistence: number;
  bonus: number;
  deductions: number;
  allotment: number;
  net_onboard: number;
  net_allotment: number;
  total_cost: number;
  status: "draft" | "approved" | "processed" | "paid";
  period: string;
}

const PAYROLL_DATA: PayrollEntry[] = [
  { id: "1", crew_name: "Carlos Silva", rank: "Master", vessel: "MV Pacific Explorer", nationality: "Brazilian", currency: "USD", base_salary: 12500, overtime_hours: 24, overtime_rate: 78.12, leave_pay: 2083, subsistence: 500, bonus: 0, deductions: 450, allotment: 8000, net_onboard: 8508, net_allotment: 8000, total_cost: 16958, status: "approved", period: "Feb 2026" },
  { id: "2", crew_name: "Mikhail Petrov", rank: "Chief Engineer", vessel: "MV Pacific Explorer", nationality: "Russian", currency: "USD", base_salary: 11800, overtime_hours: 32, overtime_rate: 73.75, leave_pay: 1967, subsistence: 500, bonus: 0, deductions: 380, allotment: 7500, net_onboard: 8747, net_allotment: 7500, total_cost: 16627, status: "approved", period: "Feb 2026" },
  { id: "3", crew_name: "Rajesh Kumar", rank: "2nd Officer", vessel: "MV Atlantic Star", nationality: "Indian", currency: "USD", base_salary: 5200, overtime_hours: 40, overtime_rate: 32.50, leave_pay: 867, subsistence: 300, bonus: 200, deductions: 180, allotment: 3500, net_onboard: 4187, net_allotment: 3500, total_cost: 7867, status: "draft", period: "Feb 2026" },
  { id: "4", crew_name: "Juan Garcia", rank: "AB Seaman", vessel: "MV Atlantic Star", nationality: "Filipino", currency: "USD", base_salary: 1800, overtime_hours: 48, overtime_rate: 11.25, leave_pay: 300, subsistence: 200, bonus: 100, deductions: 85, allotment: 1200, net_onboard: 1655, net_allotment: 1200, total_cost: 2940, status: "processed", period: "Feb 2026" },
  { id: "5", crew_name: "Olaf Hansen", rank: "Chief Officer", vessel: "MV Nordic Wind", nationality: "Norwegian", currency: "USD", base_salary: 9500, overtime_hours: 28, overtime_rate: 59.37, leave_pay: 1583, subsistence: 400, bonus: 0, deductions: 320, allotment: 6000, net_onboard: 6825, net_allotment: 6000, total_cost: 13145, status: "paid", period: "Jan 2026" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-info/20 text-info",
  processed: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
};

export function CrewPayrollCalculator() {
  const [filterVessel, setFilterVessel] = useState("all");
  const data = filterVessel === "all" ? PAYROLL_DATA : PAYROLL_DATA.filter(p => p.vessel === filterVessel);
  const vessels = [...new Set(PAYROLL_DATA.map(p => p.vessel))];

  const totalCost = data.reduce((s, p) => s + p.total_cost, 0);
  const totalOT = data.reduce((s, p) => s + (p.overtime_hours * p.overtime_rate), 0);
  const avgSalary = data.length > 0 ? data.reduce((s, p) => s + p.base_salary, 0) / data.length : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Users className="h-4 w-4" /> Crew Count</div>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="h-4 w-4" /> Total Payroll</div>
            <div className="text-2xl font-bold text-success">${(totalCost / 1000).toFixed(1)}k</div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Clock className="h-4 w-4" /> Overtime Cost</div>
            <div className="text-2xl font-bold text-warning">${(totalOT / 1000).toFixed(1)}k</div>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /> Avg Base Salary</div>
            <div className="text-2xl font-bold text-info">${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterVessel} onValueChange={setFilterVessel}>
          <SelectTrigger className="w-60"><SelectValue placeholder="All Vessels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vessels</SelectItem>
            {vessels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2"><Calculator className="h-4 w-4" /> Run Payroll</Button>
        <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Payroll Register — Feb 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Rank</th>
                  <th className="text-left py-2 px-2">Vessel</th>
                  <th className="text-right py-2 px-2">Base</th>
                  <th className="text-right py-2 px-2">OT (h)</th>
                  <th className="text-right py-2 px-2">OT $</th>
                  <th className="text-right py-2 px-2">Leave Pay</th>
                  <th className="text-right py-2 px-2">Deductions</th>
                  <th className="text-right py-2 px-2">Allotment</th>
                  <th className="text-right py-2 px-2 font-semibold">Total</th>
                  <th className="text-center py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(p => (
                  <tr key={p.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-2 font-medium">{p.crew_name}</td>
                    <td className="py-2 px-2 text-xs">{p.rank}</td>
                    <td className="py-2 px-2 text-xs">{p.vessel}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">${p.base_salary.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-xs">{p.overtime_hours}h</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">${(p.overtime_hours * p.overtime_rate).toFixed(0)}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">${p.leave_pay.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs text-destructive">-${p.deductions}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">${p.allotment.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs font-bold">${p.total_cost.toLocaleString()}</td>
                    <td className="py-2 px-2 text-center"><Badge className={`text-[10px] ${statusColors[p.status]}`}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/30 font-bold">
                  <td colSpan={9} className="py-2 px-2 text-right">TOTAL</td>
                  <td className="py-2 px-2 text-right font-mono">${totalCost.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CrewPayrollCalculator;
