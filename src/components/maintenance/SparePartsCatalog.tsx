/**
 * Spare Parts Catalog - vs AMOS/TM Master
 * Cross-referencing, min/max stock levels, reorder automation
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Package, Search, AlertTriangle, TrendingUp, BarChart3, Plus, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SparePart {
  id: string;
  part_number: string;
  description: string;
  category: string;
  location: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  unit_cost: number;
  supplier: string;
  lead_time_days: number;
  last_used: string;
  vessel_id?: string;
  criticality: "critical" | "essential" | "standard";
}

const EMPTY_PARTS: SparePart[] = [];

export function SparePartsCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["spare-parts-catalog"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("inventory_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return EMPTY_PARTS;
      return (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        part_number: (item.part_number as string) || `PN-${(item.id as string).slice(0, 6)}`,
        description: (item.description as string) || (item.item_name as string) || "N/A",
        category: (item.category as string) || "General",
        location: (item.location as string) || "Main Store",
        quantity: (item.quantity as number) || 0,
        min_stock: (item.min_stock as number) || 5,
        max_stock: (item.max_stock as number) || 50,
        unit_cost: (item.unit_cost as number) || 0,
        supplier: (item.supplier as string) || "N/A",
        lead_time_days: (item.lead_time_days as number) || 14,
        last_used: (item.updated_at as string) || new Date().toISOString(),
        criticality: ((item.criticality as string) as SparePart["criticality"]) || "standard",
      }));
    },
  });

  const belowMin = parts.filter((p: SparePart) => p.quantity < p.min_stock);
  const criticalParts = parts.filter((p: SparePart) => p.criticality === "critical");
  const totalValue = parts.reduce((sum: number, p: SparePart) => sum + p.quantity * p.unit_cost, 0);
  const stockHealth = parts.length > 0 ? Math.round(((parts.length - belowMin.length) / parts.length) * 100) : 100;

  const filtered = parts.filter((p: SparePart) =>
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Package className="h-4 w-4" />
              Total Items
            </div>
            <p className="text-2xl font-bold mt-1">{parts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              Below Min Stock
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{belowMin.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              Stock Health
            </div>
            <Progress value={stockHealth} className="mt-2" />
            <p className="text-sm font-medium mt-1">{stockHealth}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <BarChart3 className="h-4 w-4" />
              Inventory Value
            </div>
            <p className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
            <TabsTrigger value="reorder">🔔 Reorder Alerts ({belowMin.length})</TabsTrigger>
            <TabsTrigger value="critical">⚡ Critical Spares ({criticalParts.length})</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search parts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-64" />
            </div>
            <Button size="sm" variant="outline"><Filter className="h-4 w-4 mr-1" /> Filter</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Part</Button>
          </div>
        </div>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Part #</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-center p-3 font-medium">Min/Max</th>
                      <th className="text-right p-3 font-medium">Unit Cost</th>
                      <th className="text-center p-3 font-medium">Criticality</th>
                      <th className="text-left p-3 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading inventory...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No spare parts found. Add items to build your catalog.</td></tr>
                    ) : filtered.slice(0, 50).map((part: SparePart) => (
                      <tr key={part.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs">{part.part_number}</td>
                        <td className="p-3">{part.description}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{part.category}</Badge></td>
                        <td className={`p-3 text-center font-bold ${part.quantity < part.min_stock ? "text-destructive" : ""}`}>{part.quantity}</td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{part.min_stock}/{part.max_stock}</td>
                        <td className="p-3 text-right">${part.unit_cost.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={part.criticality === "critical" ? "destructive" : part.criticality === "essential" ? "secondary" : "outline"} className="text-xs">
                            {part.criticality}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs">{part.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="mt-4">
          <div className="space-y-3">
            {belowMin.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">✅ All stock levels are healthy. No reorders needed.</CardContent></Card>
            ) : belowMin.map((part: SparePart) => (
              <Card key={part.id} className="border-destructive/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{part.description}</p>
                    <p className="text-sm text-muted-foreground">PN: {part.part_number} • Current: <span className="text-destructive font-bold">{part.quantity}</span> / Min: {part.min_stock}</p>
                    <p className="text-xs text-muted-foreground mt-1">Supplier: {part.supplier} • Lead Time: {part.lead_time_days} days</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Create RFQ</Button>
                    <Button size="sm">Auto Reorder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {criticalParts.length === 0 ? (
              <Card className="md:col-span-2"><CardContent className="p-8 text-center text-muted-foreground">No critical spares defined. Mark critical equipment spares for priority management.</CardContent></Card>
            ) : criticalParts.map((part: SparePart) => (
              <Card key={part.id} className="border-warning/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="destructive" className="mb-2">CRITICAL</Badge>
                      <p className="font-medium">{part.description}</p>
                      <p className="text-sm text-muted-foreground">{part.part_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{part.quantity}</p>
                      <p className="text-xs text-muted-foreground">in stock</p>
                    </div>
                  </div>
                  <Progress value={(part.quantity / part.max_stock) * 100} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Stock Distribution by Category</CardTitle></CardHeader>
              <CardContent>
                {["Mechanical", "Electrical", "Safety", "Hydraulic", "Navigation"].map(cat => {
                  const count = parts.filter((p: SparePart) => p.category === cat).length;
                  const pct = parts.length > 0 ? (count / parts.length) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3 mb-3">
                      <span className="text-sm w-24">{cat}</span>
                      <Progress value={pct} className="flex-1" />
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Consumption Trends</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p>Consumption analytics available with 30+ days of data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SparePartsCatalog;
