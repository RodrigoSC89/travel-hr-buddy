/**
 * Pool Distribution Manager - vs Veson IMOS
 * Revenue pooling, pool point calculation, vessel earnings distribution
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Ship, TrendingUp, BarChart3, Download, Plus, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PoolVessel {
  id: string;
  vessel_name: string;
  vessel_type: string;
  dwt: number;
  pool_points: number;
  trading_days: number;
  off_hire_days: number;
  revenue_earned: number;
  pool_share_pct: number;
  net_distribution: number;
}

export function PoolDistributionManager() {
  const [activeTab, setActiveTab] = useState("overview");

  const poolVessels: PoolVessel[] = [];
  const totalRevenue = poolVessels.reduce((s, v) => s + v.revenue_earned, 0);
  const totalPoints = poolVessels.reduce((s, v) => s + v.pool_points, 0);
  const avgTCE = poolVessels.length > 0 ? totalRevenue / poolVessels.reduce((s, v) => s + v.trading_days, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Ship className="h-4 w-4" /> Pool Vessels</div>
            <p className="text-2xl font-bold mt-1">{poolVessels.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> Pool Revenue</div>
            <p className="text-2xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><PieChart className="h-4 w-4" /> Total Points</div>
            <p className="text-2xl font-bold mt-1">{totalPoints.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><TrendingUp className="h-4 w-4" /> Avg TCE</div>
            <p className="text-2xl font-bold mt-1">${avgTCE.toLocaleString()}/day</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="overview">📊 Pool Overview</TabsTrigger>
            <TabsTrigger value="distribution">💰 Distribution</TabsTrigger>
            <TabsTrigger value="points">🎯 Pool Points</TabsTrigger>
            <TabsTrigger value="performance">📈 Performance</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Vessel to Pool</Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Vessel</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-right p-3 font-medium">DWT</th>
                      <th className="text-center p-3 font-medium">Pool Points</th>
                      <th className="text-center p-3 font-medium">Trading Days</th>
                      <th className="text-center p-3 font-medium">Off-Hire</th>
                      <th className="text-right p-3 font-medium">Revenue</th>
                      <th className="text-center p-3 font-medium">Share %</th>
                      <th className="text-right p-3 font-medium">Net Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poolVessels.length === 0 ? (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No vessels in the pool. Add vessels to calculate revenue distribution based on pool points methodology.
                      </td></tr>
                    ) : poolVessels.map(v => (
                      <tr key={v.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{v.vessel_name}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{v.vessel_type}</Badge></td>
                        <td className="p-3 text-right">{v.dwt.toLocaleString()}</td>
                        <td className="p-3 text-center font-bold">{v.pool_points}</td>
                        <td className="p-3 text-center">{v.trading_days}</td>
                        <td className="p-3 text-center text-destructive">{v.off_hire_days}</td>
                        <td className="p-3 text-right">${v.revenue_earned.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Progress value={v.pool_share_pct} className="w-12 h-2" />
                            <span className="text-xs">{v.pool_share_pct}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-success">${v.net_distribution.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Distribution Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pool distribution follows the weighted pool points methodology. Each vessel's share is calculated based on:
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { label: "Base Points", desc: "DWT, speed, consumption profile" },
                  { label: "Performance Adj.", desc: "Speed premium/deficit vs benchmark" },
                  { label: "Availability", desc: "Trading days minus off-hire deductions" },
                ].map(f => (
                  <Card key={f.label} className="border-border/50">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm">
                <p>Share% = (Vessel Points × Trading Days) / Σ(All Vessel Points × Trading Days) × 100</p>
                <p className="mt-1">Net Distribution = Pool Revenue × Share% − Vessel-Specific Deductions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Pool Points Configuration</CardTitle></CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              Configure pool point methodology based on vessel characteristics and performance benchmarks.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Pool TCE vs Market</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Compare pool earnings against spot and TC market indices.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Vessel Contribution Ranking</CardTitle></CardHeader>
              <CardContent className="p-8 text-center text-muted-foreground">
                Rank vessels by their revenue contribution relative to pool points.
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PoolDistributionManager;
