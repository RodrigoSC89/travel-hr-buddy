/**
 * Insurance & P&I Manager - vs Cloud Fleet Manager
 * Hull & Machinery, P&I Club, claims tracking, policy renewals
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, AlertTriangle, FileText, Clock, Plus, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Policy {
  id: string;
  type: "H&M" | "P&I" | "FD&D" | "War Risk" | "Loss of Hire" | "Cargo";
  insurer: string;
  vessel: string;
  premium: number;
  coverage: number;
  deductible: number;
  start_date: string;
  end_date: string;
  status: "active" | "expiring" | "expired" | "renewal";
}

interface Claim {
  id: string;
  policy_type: string;
  vessel: string;
  incident_date: string;
  description: string;
  amount_claimed: number;
  amount_recovered: number;
  status: "open" | "under_review" | "approved" | "paid" | "rejected";
}

export function InsurancePIManager() {
  const [activeTab, setActiveTab] = useState("policies");

  // Empty state - ready for real data
  const policies: Policy[] = [];
  const claims: Claim[] = [];

  const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
  const totalCoverage = policies.reduce((s, p) => s + p.coverage, 0);
  const openClaims = claims.filter(c => c.status === "open" || c.status === "under_review").length;
  const totalClaimed = claims.reduce((s, c) => s + c.amount_claimed, 0);
  const totalRecovered = claims.reduce((s, c) => s + c.amount_recovered, 0);
  const recoveryRate = totalClaimed > 0 ? (totalRecovered / totalClaimed) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Shield className="h-4 w-4" /> Active Policies</div>
            <p className="text-2xl font-bold mt-1">{policies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> Annual Premium</div>
            <p className="text-2xl font-bold mt-1">${totalPremium.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><AlertTriangle className="h-4 w-4" /> Open Claims</div>
            <p className="text-2xl font-bold mt-1">{openClaims}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><FileText className="h-4 w-4" /> Recovery Rate</div>
            <Progress value={recoveryRate} className="mt-2" />
            <p className="text-sm font-medium mt-1">{recoveryRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="policies">🛡️ Policies</TabsTrigger>
            <TabsTrigger value="claims">📋 Claims ({openClaims})</TabsTrigger>
            <TabsTrigger value="renewals">🔄 Renewals</TabsTrigger>
            <TabsTrigger value="analytics">📊 Loss Analysis</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Policy</Button>
          </div>
        </div>

        <TabsContent value="policies" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Vessel</th>
                      <th className="text-left p-3 font-medium">Insurer / P&I Club</th>
                      <th className="text-right p-3 font-medium">Premium</th>
                      <th className="text-right p-3 font-medium">Coverage</th>
                      <th className="text-right p-3 font-medium">Deductible</th>
                      <th className="text-center p-3 font-medium">Expiry</th>
                      <th className="text-center p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No insurance policies registered. Add H&M, P&I, and War Risk policies to begin tracking.
                      </td></tr>
                    ) : policies.map(p => (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="p-3"><Badge variant="outline">{p.type}</Badge></td>
                        <td className="p-3">{p.vessel}</td>
                        <td className="p-3">{p.insurer}</td>
                        <td className="p-3 text-right">${p.premium.toLocaleString()}</td>
                        <td className="p-3 text-right">${(p.coverage / 1000000).toFixed(1)}M</td>
                        <td className="p-3 text-right">${p.deductible.toLocaleString()}</td>
                        <td className="p-3 text-center text-xs">{new Date(p.end_date).toLocaleDateString()}</td>
                        <td className="p-3 text-center"><Badge>{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Policy Types Overview */}
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[
              { type: "H&M", title: "Hull & Machinery", desc: "Physical damage coverage for vessel structure and machinery" },
              { type: "P&I", title: "Protection & Indemnity", desc: "Third-party liability, crew injury, pollution, cargo damage" },
              { type: "FD&D", title: "Freight, Demurrage & Defence", desc: "Legal costs for commercial disputes, charter party claims" },
              { type: "War Risk", title: "War Risk Insurance", desc: "Coverage for war zones, piracy, terrorism, confiscation" },
              { type: "Loss of Hire", title: "Loss of Hire", desc: "Revenue loss during repair periods following insured damage" },
              { type: "Cargo", title: "Cargo Insurance", desc: "Marine cargo coverage (ICC A/B/C), general average contribution" },
            ].map(pt => (
              <Card key={pt.type} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">{pt.type}</Badge>
                  <p className="font-medium">{pt.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No claims registered. File H&M or P&I claims when incidents occur.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Upcoming Renewals</CardTitle></CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              Policy renewal calendar with 60-day advance reminders.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Loss Ratio by Category</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Claims vs premium analysis by insurance type.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Claims Timeline</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Historical claims tracking and frequency analysis.
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InsurancePIManager;
