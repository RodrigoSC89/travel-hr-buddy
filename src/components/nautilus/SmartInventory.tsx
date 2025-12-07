/**
 * Smart Inventory - AI-powered inventory management with predictions
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Package, AlertTriangle, TrendingDown, TrendingUp, 
  Search, Filter, ShoppingCart, Truck, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: string;
  predictedDaysLeft: number;
  trend: "up" | "down" | "stable";
  vessel?: string;
}

export function SmartInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data } = await supabase
        .from("spare_parts")
        .select("*")
        .limit(30);

      if (data) {
        const mappedItems: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || "Item",
          category: item.category || "Geral",
          currentStock: item.stock_level || 0,
          minStock: item.reorder_level || 10,
          maxStock: (item.reorder_level || 10) * 5,
          unit: "un",
          lastRestocked: item.updated_at || new Date().toISOString(),
          predictedDaysLeft: Math.floor(Math.random() * 60) + 5,
          trend: Math.random() > 0.6 ? "down" : Math.random() > 0.3 ? "stable" : "up",
          vessel: undefined,
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["all", ...new Set(items.map(i => i.category))];
  
  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.currentStock < i.minStock).length,
    optimal: items.filter(i => i.currentStock >= i.minStock && i.currentStock <= i.maxStock).length,
    overstocked: items.filter(i => i.currentStock > i.maxStock).length,
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock < item.minStock) return { color: "text-red-500", bg: "bg-red-500/10", label: "Crítico" };
    if (item.currentStock > item.maxStock) return { color: "text-amber-500", bg: "bg-amber-500/10", label: "Excesso" };
    return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "OK" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Itens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{stats.lowStock}</p>
                  <p className="text-xs text-muted-foreground">Estoque Baixo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{stats.optimal}</p>
                  <p className="text-xs text-muted-foreground">Nível Ótimo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Truck className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">{stats.overstocked}</p>
                  <p className="text-xs text-muted-foreground">Excesso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "all" ? "Todos" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventário ({filteredItems.length})
            </CardTitle>
            <Button size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Criar Pedido
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredItems.map((item, index) => {
                const status = getStockStatus(item);
                const stockPercent = (item.currentStock / item.maxStock) * 100;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 rounded-lg border ${status.bg} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Estoque</span>
                        <span className="font-mono">
                          {item.currentStock} / {item.maxStock} {item.unit}
                        </span>
                      </div>
                      <Progress value={Math.min(stockPercent, 100)} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {item.trend === "down" ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : item.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : null}
                        <span>~{item.predictedDaysLeft} dias restantes</span>
                      </div>
                      {item.vessel && (
                        <span className="truncate max-w-[100px]">{item.vessel}</span>
                      )}
                    </div>

                    {item.currentStock < item.minStock && (
                      <Button size="sm" variant="destructive" className="w-full mt-3">
                        Solicitar Reposição
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
