import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  total_value: number;
  status: string;
  location: string;
}

export const InventoryManagement = memo(() => {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");

      if (error) throw error;
      setItems(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    };
  };

  const getLowStockItems = () => {
    return items.filter(item => 
      item.current_stock <= item.minimum_stock && 
      item.status !== "discontinued"
    );
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.total_value || 0), 0);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      active: "default",
      low_stock: "secondary",
      out_of_stock: "destructive",
      discontinued: "outline",
      expired: "destructive"
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  const getStockIndicator = (item: InventoryItem) => {
    const percentage = (item.current_stock / item.maximum_stock) * 100;
    if (percentage <= 25) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (percentage <= 50) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getLowStockItems().length}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(items.map(i => i.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {getLowStockItems().length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({getLowStockItems().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockItems().slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.item_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Stock: {item.current_stock} / {item.minimum_stock}
                    </div>
                    <Button size="sm" variant="outline" className="mt-1">
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Manage your inventory stock levels</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadInventoryItems} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={handleChange}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="spare_parts">Spare Parts</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
                <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="provisions">Provisions</SelectItem>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="lubricants">Lubricants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items found
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent">
                  <div className="flex-shrink-0">
                    {getStockIndicator(item)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Code: {item.item_code}</span>
                      <span>•</span>
                      <span className="capitalize">{item.category.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">
                      Stock: {item.current_stock} / {item.minimum_stock}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Value: ${item.total_value?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
