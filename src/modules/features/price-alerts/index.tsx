import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceAlertsList } from "./components/PriceAlertsList";
import { CreateAlertForm } from "./components/CreateAlertForm";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { priceAlertsService, PriceAlert } from "@/services/price-alerts-service";

const AlertasPrecosModule = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    priceIncreases: 0,
    priceDrops: 0,
    estimatedSavings: 0
  });

  const loadStats = async () => {
    try {
      const alerts = await priceAlertsService.getAlerts();
      const activeAlerts = alerts.filter(a => a.is_active).length;
      const priceDrops = alerts.filter(a => 
        a.current_price && a.current_price <= a.target_price
      ).length;
      const priceIncreases = alerts.filter(a => 
        a.current_price && a.current_price > a.target_price
      ).length;
      const estimatedSavings = alerts.reduce((sum, a) => {
        if (a.current_price && a.current_price < a.target_price) {
          return sum + (a.target_price - a.current_price);
        }
        return sum;
      }, 0);

      setStats({
        activeAlerts,
        priceIncreases,
        priceDrops,
        estimatedSavings
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const handleEdit = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setShowCreateForm(true);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowCreateForm(false);
    setEditingAlert(null);
    loadStats();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Alertas de Preços</h1>
        </div>
        <Button onClick={handleSetShowCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancelar" : "Novo Alerta"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Monitorando</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alta de Preços</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.priceIncreases}</div>
            <p className="text-xs text-muted-foreground">Acima do alvo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Queda de Preços</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.priceDrops}</div>
            <p className="text-xs text-muted-foreground">Oportunidades</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economia Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.estimatedSavings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Em oportunidades</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {showCreateForm && (
            <CreateAlertForm 
              onSuccess={handleFormSuccess}
              editingAlert={editingAlert}
              onCancelEdit={() => {
                setEditingAlert(null);
                setShowCreateForm(false);
              }}
            />
          )}
          
          <PriceAlertsList 
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div>
          <NotificationsPanel />
        </div>
      </div>
    </div>
  );
};

export default AlertasPrecosModule;
