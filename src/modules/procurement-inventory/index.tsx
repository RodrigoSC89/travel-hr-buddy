import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Building2,
  BarChart3,
  Brain,
  FileText,
  Warehouse,
  ClipboardList,
  Settings,
  Bell,
  Filter,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react";
import ProcurementDashboard from "./components/ProcurementDashboard";
import InventorySection from "./components/InventorySection";
import RequisitionsSection from "./components/RequisitionsSection";
import PurchaseOrdersSection from "./components/PurchaseOrdersSection";
import SuppliersSection from "./components/SuppliersSection";
import ReportsSection from "./components/ReportsSection";
import AIAssistantPanel from "./components/AIAssistantPanel";
import NotificationsDialog from "./components/NotificationsDialog";
import SettingsDialog from "./components/SettingsDialog";
import FiltersDialog from "./components/FiltersDialog";

export default function ProcurementInventory() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "warning" | "alert" | "success" | "info" | "ai";
    read: boolean;
    date: Date;
  }>>([
    { id: "1", title: "Estoque baixo", message: "Filtro de óleo hidráulico abaixo do mínimo", type: "warning" as const, read: false, date: new Date() },
    { id: "2", title: "Pedido atrasado", message: "PO-2024-003 está 2 dias atrasado", type: "alert" as const, read: false, date: new Date() },
    { id: "3", title: "Requisição aprovada", message: "REQ-2024-015 foi aprovada pelo gerente", type: "success" as const, read: true, date: new Date() },
    { id: "4", title: "Nova cotação", message: "Fornecedor HidroMar enviou nova cotação", type: "info" as const, read: false, date: new Date() },
    { id: "5", title: "Previsão IA", message: "IA prevê necessidade de reposição em 7 dias", type: "ai" as const, read: false, date: new Date() },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Procurement & Inventory
                  <Badge variant="secondary" className="ml-2 bg-primary/10">
                    <Brain className="h-3 w-3 mr-1" />
                    AI-Driven
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Gestão inteligente de compras, estoque e fornecedores com IA preditiva
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar itens, pedidos, fornecedores..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={handleChange}
                />
              </div>

              {/* AI Assistant Toggle */}
              <Button
                variant={showAIPanel ? "default" : "outline"}
                size="icon"
                onClick={handleSetShowAIPanel}
                className="relative"
              >
                <Brain className="h-4 w-4" />
              </Button>

              {/* Filters */}
              <Button variant="outline" size="icon" onClick={handleSetShowFilters}>
                <Filter className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSetShowNotifications}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button variant="outline" size="icon" onClick={handleSetShowSettings}>
                <Settings className="h-4 w-4" />
              </Button>

              {/* Sync */}
              <Button variant="outline" size="sm" className="hidden md:flex">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={`grid ${showAIPanel ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"} gap-6`}>
          {/* Main Content */}
          <div className={showAIPanel ? "lg:col-span-3" : ""}>
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full max-w-4xl grid-cols-6">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  <span className="hidden sm:inline">Estoque</span>
                </TabsTrigger>
                <TabsTrigger value="requisitions" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Requisições</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Pedidos</span>
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Fornecedores</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Relatórios</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <ProcurementDashboard />
              </TabsContent>

              <TabsContent value="inventory">
                <InventorySection searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="requisitions">
                <RequisitionsSection searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="orders">
                <PurchaseOrdersSection searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="suppliers">
                <SuppliersSection searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="reports">
                <ReportsSection />
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Panel */}
          {showAIPanel && (
            <div className="lg:col-span-1">
              <AIAssistantPanel onClose={() => setShowAIPanel(false} />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NotificationsDialog
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
      />

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <FiltersDialog
        open={showFilters}
        onOpenChange={setShowFilters}
      />
    </div>
  );
}
