import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, Edit, TrendingDown, TrendingUp } from "lucide-react";
import { priceAlertsService, PriceAlert } from "@/services/price-alerts-service";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PriceAlertsListProps {
  onEdit: (alert: PriceAlert) => void;
  refreshTrigger?: number;
}

export const PriceAlertsList: React.FC<PriceAlertsListProps> = ({ onEdit, refreshTrigger }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"created" | "target" | "status">("created");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await priceAlertsService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [refreshTrigger]);

  useEffect(() => {
    // Real-time updates
    const channel = supabase
      .channel("price-alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "price_alerts"
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await priceAlertsService.deleteAlert(id);
      toast.success("Alerta excluído com sucesso");
      loadAlerts();
    } catch (error) {
      toast.error("Erro ao excluir alerta");
    }
  };

  const handleToggle = async (alert: PriceAlert) => {
    try {
      await priceAlertsService.toggleAlert(alert.id, !alert.is_active);
      toast.success(alert.is_active ? "Alerta desativado" : "Alerta ativado");
      loadAlerts();
    } catch (error) {
      toast.error("Erro ao alterar status do alerta");
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortBy === "created") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "target") {
      return a.target_price - b.target_price;
    } else {
      return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
    }
  };

  const isPriceDropped = (alert: PriceAlert) => {
    return alert.current_price && alert.current_price <= alert.target_price;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando alertas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Seus Alertas ({alerts.length})</h3>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "created" ? "default" : "outline"}
            size="sm"
            onClick={handleSetSortBy}
          >
            Recentes
          </Button>
          <Button
            variant={sortBy === "target" ? "default" : "outline"}
            size="sm"
            onClick={handleSetSortBy}
          >
            Preço
          </Button>
          <Button
            variant={sortBy === "status" ? "default" : "outline"}
            size="sm"
            onClick={handleSetSortBy}
          >
            Status
          </Button>
        </div>
      </div>

      {sortedAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum alerta criado ainda. Crie seu primeiro alerta!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedAlerts.map((alert) => (
            <Card key={alert.id} className={!alert.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {alert.product_name}
                      {isPriceDropped(alert) && (
                        <Badge variant="default" className="bg-green-500">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Meta Atingida!
                        </Badge>
                      )}
                    </CardTitle>
                    {alert.route && (
                      <p className="text-sm text-muted-foreground mt-1">{alert.route}</p>
                    )}
                  </div>
                  <Badge variant={alert.is_active ? "default" : "secondary"}>
                    {alert.is_active ? "Ativo" : "Pausado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Preço Alvo</p>
                    <p className="text-lg font-bold text-primary">
                      ${alert.target_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço Atual</p>
                    <p className={`text-lg font-bold ${
                      alert.current_price
                        ? alert.current_price <= alert.target_price
                          ? "text-green-500"
                          : "text-orange-500"
                        : "text-muted-foreground"
                    }`}>
                      {alert.current_price ? `$${alert.current_price.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlehandleToggle}
                  >
                    {alert.is_active ? (
                      <>
                        <BellOff className="w-4 h-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleonEdit}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handlehandleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
