/**
 * Spare Parts Inventory - Tier-1 Maintenance Component
 * Based on: DNV ShipManager, MarineCloud, ShipServ
 * Features: ROB tracking, min/max levels, procurement, critical spares
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, Search, Filter, Plus, AlertTriangle, CheckCircle2, 
  TrendingDown, TrendingUp, ShoppingCart, Truck, BarChart3,
  RefreshCw, ArrowRight, DollarSign, Clock, Ship, Loader2
} from "lucide-react";
import { useSpareParts, useInventoryStats, SparePart, InventoryStats } from "@/hooks/useSparePartsData";

// Default stats for loading state
const defaultStats: InventoryStats = {
  totalItems: 0,
  totalValue: 0,
  criticalItems: 0,
  lowStock: 0,
  pendingOrders: 0,
  ordersValue: 0,
  turnoverRate: 0,
  serviceLevel: 100
};

export function SparePartsInventory() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use real data hooks
  const { data: spareParts = [], isLoading: partsLoading } = useSpareParts();
  const { data: inventoryStats = defaultStats, isLoading: statsLoading } = useInventoryStats();
  
  const isLoading = partsLoading || statsLoading;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
      ok: { variant: "secondary", label: "OK", className: "bg-emerald-100 text-emerald-700" },
      low: { variant: "secondary", label: "Low Stock", className: "bg-amber-100 text-amber-700" },
      critical: { variant: "destructive", label: "Critical", className: "" },
      excess: { variant: "outline", label: "Excess", className: "border-blue-500 text-blue-600" }
    };
    const config = statusMap[status] || statusMap.ok;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getStockLevel = (rob: number, min: number, max: number) => {
    if (rob < min * 0.5) return { percent: (rob / max) * 100, color: "bg-red-500" };
    if (rob < min) return { percent: (rob / max) * 100, color: "bg-amber-500" };
    if (rob > max) return { percent: 100, color: "bg-blue-500" };
    return { percent: (rob / max) * 100, color: "bg-emerald-500" };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Spare Parts Inventory
          </h2>
          <p className="text-muted-foreground">
            Track ROB levels, manage procurement, and critical spares
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button variant="outline" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Requisition
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{inventoryStats.totalItems.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{inventoryStats.criticalItems}</p>
              <p className="text-xs text-muted-foreground">Critical Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{inventoryStats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{inventoryStats.pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(inventoryStats.ordersValue)}</p>
              <p className="text-xs text-muted-foreground">Orders Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{inventoryStats.turnoverRate}x</p>
              <p className="text-xs text-muted-foreground">Turnover Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{inventoryStats.serviceLevel}%</p>
              <p className="text-xs text-muted-foreground">Service Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part number, description, or IMPA code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="critical">Critical Spares</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Spare Parts List</CardTitle>
              <CardDescription>Complete inventory with ROB levels and status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {spareParts.map((part) => {
                    const stockLevel = getStockLevel(part.robQty, part.minQty, part.maxQty);
                    return (
                      <Card key={part.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className="font-mono">{part.partNumber}</Badge>
                                <h4 className="font-semibold">{part.description}</h4>
                                {getStatusBadge(part.status)}
                                {part.critical && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Critical
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mt-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Category</p>
                                  <p className="font-medium">{part.category}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Location</p>
                                  <p className="font-medium">{part.location}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">ROB</p>
                                  <p className="font-medium">{part.robQty} {part.unit}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Min/Max</p>
                                  <p className="font-medium">{part.minQty} / {part.maxQty} {part.unit}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Unit Cost</p>
                                  <p className="font-medium">{formatCurrency(part.unitCost)}</p>
                                </div>
                              </div>

                              {/* Stock level bar */}
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Stock Level</span>
                                  <span>Value: {formatCurrency(part.totalValue)}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${stockLevel.color} transition-all`}
                                    style={{ width: `${stockLevel.percent}%` }}
                                  />
                                </div>
                              </div>

                              {/* Additional info */}
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                {part.lastReceived && (
                                  <span className="flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    Last Received: {formatDate(part.lastReceived)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Lead Time: {part.leadTime} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <Ship className="h-3 w-3" />
                                  {part.supplier}
                                </span>
                                {part.impaCode && (
                                  <span>IMPA: {part.impaCode}</span>
                                )}
                              </div>
                            </div>

                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-purple-500" />
                Critical Spares
              </CardTitle>
              <CardDescription>Mission-critical spare parts requiring special attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spareParts.filter(p => p.critical).map((part) => (
                  <div 
                    key={part.id}
                    className={`p-4 rounded-lg border ${
                      part.status === "critical" ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" :
                      part.status === "low" ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">{part.partNumber}</Badge>
                          <h4 className="font-semibold">{part.description}</h4>
                          {getStatusBadge(part.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ROB: {part.robQty} {part.unit} | Min: {part.minQty} {part.unit} | Lead Time: {part.leadTime} days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(part.totalValue)}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Order
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription>Pending and recent purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Gestão de Ordens de Compra</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie ordens de compra de peças no módulo de Procurement.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.assign('/procurement')}>
                  Ir para Procurement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Inventory Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Value by Category</h4>
                  <div className="space-y-3">
                    {[
                      { category: "Main Engine", value: 450000, percent: 24 },
                      { category: "Navigation", value: 320000, percent: 17 },
                      { category: "Fuel System", value: 280000, percent: 15 },
                      { category: "Pumps", value: 220000, percent: 12 },
                      { category: "Other", value: 580000, percent: 32 }
                    ].map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span className="font-medium">{formatCurrency(item.value)}</span>
                        </div>
                        <Progress value={item.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Stock Health</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-emerald-200 bg-emerald-50/50">
                      <CardContent className="pt-4 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-emerald-600">2,180</p>
                        <p className="text-xs text-muted-foreground">OK Stock</p>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200 bg-amber-50/50">
                      <CardContent className="pt-4 text-center">
                        <TrendingDown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-600">34</p>
                        <p className="text-xs text-muted-foreground">Low Stock</p>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50/50">
                      <CardContent className="pt-4 text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">12</p>
                        <p className="text-xs text-muted-foreground">Critical</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardContent className="pt-4 text-center">
                        <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">230</p>
                        <p className="text-xs text-muted-foreground">Excess</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
