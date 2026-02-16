/**
 * 🔧 WARRANTY CLAIMS TRACKER - vs AMOS/TM Master
 * Equipment warranty tracking, claims management, supplier follow-up
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, DollarSign, Clock, CheckCircle, AlertTriangle, FileText, Plus, Download, Wrench } from "lucide-react";
import { toast } from "sonner";

interface WarrantyClaim {
  id: string;
  claim_number: string;
  vessel: string;
  equipment: string;
  manufacturer: string;
  failure_description: string;
  failure_date: string;
  claim_date: string;
  warranty_expiry: string;
  claim_amount: number;
  recovered_amount: number;
  status: "draft" | "submitted" | "under_review" | "approved" | "partial" | "rejected" | "closed";
  days_open: number;
}

const CLAIMS: WarrantyClaim[] = [
  { id: "1", claim_number: "WC-2026-001", vessel: "MV Pacific Explorer", equipment: "Main Engine Turbocharger #2", manufacturer: "MAN Energy Solutions", failure_description: "Bearing failure causing excessive vibration and oil leakage", failure_date: "2026-01-15", claim_date: "2026-01-20", warranty_expiry: "2027-06-30", claim_amount: 185000, recovered_amount: 0, status: "under_review", days_open: 27 },
  { id: "2", claim_number: "WC-2026-002", vessel: "MV Atlantic Star", equipment: "BWMS UV Module", manufacturer: "Alfa Laval", failure_description: "UV lamp housing corrosion and control unit malfunction", failure_date: "2026-01-28", claim_date: "2026-02-01", warranty_expiry: "2026-12-15", claim_amount: 42000, recovered_amount: 42000, status: "approved", days_open: 15 },
  { id: "3", claim_number: "WC-2025-018", vessel: "MV Nordic Wind", equipment: "ECDIS Display Unit #1", manufacturer: "Furuno", failure_description: "Screen flickering and GPS receiver intermittent failure", failure_date: "2025-11-10", claim_date: "2025-11-15", warranty_expiry: "2026-08-01", claim_amount: 28000, recovered_amount: 21000, status: "partial", days_open: 93 },
  { id: "4", claim_number: "WC-2026-003", vessel: "MV Pacific Explorer", equipment: "Cargo Pump #3 Seal", manufacturer: "Framo", failure_description: "Mechanical seal failure during discharge operations", failure_date: "2026-02-05", claim_date: "2026-02-08", warranty_expiry: "2026-09-01", claim_amount: 65000, recovered_amount: 0, status: "submitted", days_open: 8 },
  { id: "5", claim_number: "WC-2025-012", vessel: "MV Atlantic Star", equipment: "Aux Engine #2 Injectors", manufacturer: "Wärtsilä", failure_description: "Premature wear on fuel injector nozzles (< 4000 running hours)", failure_date: "2025-09-20", claim_date: "2025-09-25", warranty_expiry: "2026-03-15", claim_amount: 35000, recovered_amount: 0, status: "rejected", days_open: 144 },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/20 text-blue-400",
  under_review: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-green-500/20 text-green-400",
  partial: "bg-cyan-500/20 text-cyan-400",
  rejected: "bg-red-500/20 text-red-400",
  closed: "bg-muted text-muted-foreground",
};

export function WarrantyClaimsTracker() {
  const totalClaimed = CLAIMS.reduce((s, c) => s + c.claim_amount, 0);
  const totalRecovered = CLAIMS.reduce((s, c) => s + c.recovered_amount, 0);
  const recoveryRate = totalClaimed > 0 ? (totalRecovered / totalClaimed) * 100 : 0;
  const openClaims = CLAIMS.filter(c => !["closed", "rejected"].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> Open Claims</div>
            <div className="text-2xl font-bold">{openClaims}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="h-4 w-4" /> Total Claimed</div>
            <div className="text-2xl font-bold text-yellow-400">${(totalClaimed / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="h-4 w-4" /> Recovered</div>
            <div className="text-2xl font-bold text-green-400">${(totalRecovered / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground mb-1">Recovery Rate</div>
            <div className="text-2xl font-bold text-blue-400">{recoveryRate.toFixed(1)}%</div>
            <Progress value={recoveryRate} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Claim</Button>
        <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Warranty Claims Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs">
                  <th className="text-left py-2 px-2">Claim #</th>
                  <th className="text-left py-2 px-2">Vessel</th>
                  <th className="text-left py-2 px-2">Equipment</th>
                  <th className="text-left py-2 px-2">Manufacturer</th>
                  <th className="text-right py-2 px-2">Claimed</th>
                  <th className="text-right py-2 px-2">Recovered</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-center py-2 px-2">Days Open</th>
                </tr>
              </thead>
              <tbody>
                {CLAIMS.map(c => (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-2 font-mono text-xs">{c.claim_number}</td>
                    <td className="py-2 px-2 text-xs">{c.vessel}</td>
                    <td className="py-2 px-2 text-xs max-w-[200px] truncate">{c.equipment}</td>
                    <td className="py-2 px-2 text-xs">{c.manufacturer}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">${c.claim_amount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs text-green-400">${c.recovered_amount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-center"><Badge className={`text-[10px] ${statusColors[c.status]}`}>{c.status.replace('_', ' ')}</Badge></td>
                    <td className="py-2 px-2 text-center">
                      <span className={c.days_open > 90 ? 'text-red-400' : c.days_open > 30 ? 'text-yellow-400' : ''}>{c.days_open}d</span>
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

export default WarrantyClaimsTracker;
