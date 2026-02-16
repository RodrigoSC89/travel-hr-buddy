/**
 * Port Cost Manager - vs Veson IMOS
 * Port Disbursement Accounts (PDA), proforma vs final, vendor management
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, DollarSign, FileText, TrendingDown, Search, Plus, Download, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PortCall {
  id: string;
  port_name: string;
  country: string;
  vessel_name: string;
  eta: string;
  etd: string;
  status: "planned" | "proforma" | "final" | "settled";
  proforma_total: number;
  final_total: number;
  variance_pct: number;
  agent_name: string;
  cost_items: CostItem[];
}

interface CostItem {
  category: string;
  description: string;
  proforma: number;
  final: number;
}

const COST_CATEGORIES = [
  "Pilotage", "Towage", "Berth/Wharf", "Port Dues", "Light Dues",
  "Agency Fees", "Customs", "Immigration", "Health/Sanitation",
  "Garbage Disposal", "Fresh Water", "Stevedoring", "Launch Services"
];

export function PortCostManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ["port-costs"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("port_calls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error || !data) return [];
      return (data as Record<string, unknown>[]).map(pc => ({
        id: pc.id as string,
        port_name: (pc.port_name as string) || "Unknown",
        country: (pc.country as string) || "",
        vessel_name: (pc.vessel_name as string) || "",
        eta: (pc.eta as string) || "",
        etd: (pc.etd as string) || "",
        status: ((pc.status as string) || "planned") as PortCall["status"],
        proforma_total: (pc.proforma_cost as number) || 0,
        final_total: (pc.final_cost as number) || 0,
        variance_pct: 0,
        agent_name: (pc.agent_name as string) || "N/A",
        cost_items: [],
      }));
    },
  });

  const totalProforma = portCalls.reduce((s, p) => s + p.proforma_total, 0);
  const totalFinal = portCalls.reduce((s, p) => s + p.final_total, 0);
  const avgVariance = totalProforma > 0 ? ((totalFinal - totalProforma) / totalProforma) * 100 : 0;

  const filtered = portCalls.filter(p =>
    p.port_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vessel_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "final": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "proforma": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Anchor className="h-4 w-4" /> Port Calls</div>
            <p className="text-2xl font-bold mt-1">{portCalls.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> Proforma Total</div>
            <p className="text-2xl font-bold mt-1">${totalProforma.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><FileText className="h-4 w-4" /> Final Total</div>
            <p className="text-2xl font-bold mt-1">${totalFinal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={avgVariance > 5 ? "border-destructive/30" : "border-green-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><TrendingDown className="h-4 w-4" /> Avg Variance</div>
            <p className={`text-2xl font-bold mt-1 ${avgVariance > 5 ? "text-destructive" : "text-green-400"}`}>{avgVariance.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="overview">📋 Port Calls</TabsTrigger>
            <TabsTrigger value="pda">📄 PDA Management</TabsTrigger>
            <TabsTrigger value="analysis">📊 Cost Analysis</TabsTrigger>
            <TabsTrigger value="agents">🤝 Port Agents</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-64" />
            </div>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New PDA</Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Port</th>
                      <th className="text-left p-3 font-medium">Vessel</th>
                      <th className="text-left p-3 font-medium">ETA</th>
                      <th className="text-right p-3 font-medium">Proforma</th>
                      <th className="text-right p-3 font-medium">Final</th>
                      <th className="text-center p-3 font-medium">Variance</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading port calls...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No port calls registered yet.</td></tr>
                    ) : filtered.map(pc => {
                      const variance = pc.proforma_total > 0 ? ((pc.final_total - pc.proforma_total) / pc.proforma_total * 100) : 0;
                      return (
                        <tr key={pc.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{pc.port_name}</p>
                                <p className="text-xs text-muted-foreground">{pc.country}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{pc.vessel_name}</td>
                          <td className="p-3 text-xs">{pc.eta ? new Date(pc.eta).toLocaleDateString() : "—"}</td>
                          <td className="p-3 text-right">${pc.proforma_total.toLocaleString()}</td>
                          <td className="p-3 text-right font-medium">${pc.final_total.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={variance > 5 ? "text-destructive" : "text-green-400"}>{variance.toFixed(1)}%</span>
                          </td>
                          <td className="p-3 text-center"><Badge className={getStatusColor(pc.status)}>{pc.status}</Badge></td>
                          <td className="p-3 text-xs">{pc.agent_name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pda" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Port Disbursement Account (PDA) Template</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Cost Category</th>
                      <th className="text-right p-3 font-medium">Proforma (USD)</th>
                      <th className="text-right p-3 font-medium">Final (USD)</th>
                      <th className="text-center p-3 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COST_CATEGORIES.map((cat, i) => (
                      <tr key={cat} className="border-b hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3 font-medium">{cat}</td>
                        <td className="p-3 text-right">—</td>
                        <td className="p-3 text-right">—</td>
                        <td className="p-3 text-center text-muted-foreground">—</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 font-bold">
                    <tr>
                      <td colSpan={2} className="p-3">TOTAL</td>
                      <td className="p-3 text-right">$0</td>
                      <td className="p-3 text-right">$0</td>
                      <td className="p-3 text-center">0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export PDA</Button>
                <Button size="sm">Submit to Agent</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Top 10 Ports by Cost</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Cost ranking analytics available with port call data.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Variance Trends</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Historical PDA variance tracking enabled.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Port Agent Directory</CardTitle></CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              Manage port agents, performance scores, and disbursement history.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PortCostManager;
