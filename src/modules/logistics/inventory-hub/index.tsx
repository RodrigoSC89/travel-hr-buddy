/**
 * PATCH 111.0 - Inventory & Supply Management
 * Inventory Hub - Centralized stock, supplies, and logistics control
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Filter,
  RefreshCw,
  Plus,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { runAIContext } from "@/ai/kernel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  vessel_id: string | null;
  critical: boolean;
  min_threshold: number;
  last_updated: string;
  notes: string | null;
  vessel_name?: string;
  stock_status?: 'critical_low' | 'low' | 'sufficient';
}

const InventoryHub = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadInventoryItems();
    loadAIInsights();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select(`
          *,
          vessels (
            name,
            imo_code
          )
        `)
        .order('critical', { ascending: false })
        .order('quantity', { ascending: true });

      if (error) throw error;

      const processedData = (data as any)?.map((item: any) => ({
        ...item,
        vessel_name: item.vessels?.name || 'Unassigned',
        stock_status: getStockStatus(item.quantity, item.min_threshold)
      })) || [];

      setItems(processedData as any);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const response = await runAIContext({
        module: 'supply-analyzer',
        action: 'analyze',
        context: { type: 'inventory-overview' }
      });
      
      if (response.message) {
        setAiInsight(response.message);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const getStockStatus = (quantity: number, threshold: number): 'critical_low' | 'low' | 'sufficient' => {
    if (quantity <= threshold) return 'critical_low';
    if (quantity <= threshold * 1.5) return 'low';
    return 'sufficient';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical_low':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Critical
        </Badge>;
      case 'low':
        return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
          <TrendingDown className="h-3 w-3" /> Low
        </Badge>;
      default:
        return <Badge variant="secondary">Sufficient</Badge>;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesVessel = filterVessel === "all" || 
      (filterVessel === "unassigned" && !item.vessel_id) ||
      item.vessel_name === filterVessel;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesVessel && matchesSearch;
  });

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
  const vessels = Array.from(new Set(items.map(i => i.vessel_name).filter(Boolean)));

  const criticalCount = items.filter(i => i.stock_status === 'critical_low').length;
  const lowCount = items.filter(i => i.stock_status === 'low').length;
  const totalItems = items.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Inventory Hub</h1>
            <p className="text-muted-foreground">Stock & Supply Management</p>
          </div>
        </div>
        <Button onClick={loadInventoryItems} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowCount}</div>
            <p className="text-xs text-muted-foreground">Below optimal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Item types</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              AI Supply Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by vessel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessels</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel} value={vessel || ''}>{vessel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              {filteredItems.length} items {filteredItems.length !== totalItems && `(filtered from ${totalItems})`}
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading inventory...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items found matching your filters
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          {getStatusBadge(item.stock_status || 'sufficient')}
                          {item.critical && (
                            <Badge variant="outline" className="text-xs">Critical Item</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                          </div>
                          <div>
                            <span className="font-medium">Min Threshold:</span> {item.min_threshold} {item.unit}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {item.category || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Vessel:</span> {item.vessel_name}
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="ml-4"
                      >
                        Request Replenishment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryHub;
