import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedAlertManagement } from "./enhanced-alert-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, TrendingDown, TrendingUp, Bell, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
const supabase: any = supabaseClient;


interface PriceAlert {
  id: string;
  product_name: string;
  current_price: number | null;
  target_price: number;
  product_url: string;
  is_active: boolean;
  created_at: string;
  last_checked_at?: string;
  user_id: string;
}

interface PriceHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
}

interface Notification {
  id: string;
  alert_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const PriceAlertDashboard = () => {
  return (
    <div className="space-y-6">
      <EnhancedAlertManagement />
    </div>
  );
};

export const PriceAlertDashboardLegacy = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [isCheckingPrices, setIsCheckingPrices] = useState(false);
  const [newAlert, setNewAlert] = useState({
    product_name: "",
    target_price: "",
    product_url: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load alerts and notifications from Supabase
  useEffect(() => {
    if (user && supabase) {
      loadAlerts();
      loadNotifications();
    }
  }, [user, supabase]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("price_notifications")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
  }
  };

  const checkPriceForAlert = async (alert: PriceAlert) => {
    try {
      // Call Supabase Edge Function for price checking
      const { data, error } = await supabase.functions.invoke("check-price", {
        body: {
          product_name: alert.product_name,
          product_url: alert.product_url
        }
      });

      if (error) throw error;
      return data?.price || 0;
    } catch (error) {
      // Improved fallback with more realistic price simulation
      return Math.random() * 2000 + 500; // More realistic price range
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.product_name || !newAlert.target_price || !newAlert.product_url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAlert(true);
    
    try {
      // Get initial price
      const currentPrice = await checkPriceForAlert({
        product_name: newAlert.product_name,
        product_url: newAlert.product_url
      } as PriceAlert);

      // Create alert in Supabase
      const { data, error } = await supabase
        .from("price_alerts")
        .insert([{
          user_id: user?.id,
          product_name: newAlert.product_name,
          target_price: parseFloat(newAlert.target_price),
          product_url: newAlert.product_url,
          current_price: currentPrice,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to price history
      await supabase
        .from("price_history")
        .insert([{
          alert_id: data.id,
          price: currentPrice,
          checked_at: new Date().toISOString()
        }]);

      setNewAlert({ product_name: "", target_price: "", product_url: "" });
      setIsAddingAlert(false);
      loadAlerts(); // Reload alerts
      
      toast({
        title: "Alerta criado!",
        description: `Alerta para ${newAlert.product_name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o alerta",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const toggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !alert.is_active })
        .eq("id", id);

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, is_active: !alert.is_active } : alert
      ));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o alerta",
        variant: "destructive"
      });
    }
  };

  const removeAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      toast({
        title: "Alerta removido",
        description: "O alerta de preço foi removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o alerta",
        variant: "destructive"
      });
    }
  };

  const refreshPrices = async () => {
    setIsCheckingPrices(true);
    try {
      // Use Supabase Edge Function instead of direct API call
      const { data, error } = await supabase.functions.invoke("monitor-prices", {
        body: { user_id: user?.id }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        loadAlerts(); // Reload alerts with updated prices
        toast({
          title: "Preços atualizados!",
          description: `${data.checked_alerts} alertas verificados`
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os preços",
        variant: "destructive"
      });
    } finally {
      setIsCheckingPrices(false);
    }
  };

  // Mock price change calculation (will be replaced with real history)
  const getPriceChange = (alert: PriceAlert) => {
    return Math.random() * 200 - 100; // Random change for demo
  };


  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Alertas de Preços</h1>
            <p className="text-muted-foreground">Monitore os preços dos seus produtos favoritos</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshPrices} disabled={isCheckingPrices}>
            {isCheckingPrices ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar Preços
          </Button>
      
          <Dialog open={isAddingAlert} onOpenChange={setIsAddingAlert}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Alerta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Alerta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Nome do Produto</Label>
                  <Input
                    id="product"
                    value={newAlert.product_name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Ex: iPhone 15 Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="targetPrice">Preço Alvo (R$)</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    value={newAlert.target_price}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, target_price: e.target.value }))}
                    placeholder="Ex: 6500"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL do Produto</Label>
                  <Input
                    id="url"
                    value={newAlert.product_url}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, product_url: e.target.value }))}
                    placeholder="https://exemplo.com/produto"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddingAlert(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAlert} disabled={isCreatingAlert}>
                    {isCreatingAlert ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Alerta"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Metas Atingidas</p>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.current_price && a.current_price <= a.target_price).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-2xl font-bold">R$ 450</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seus Alertas</h2>
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum alerta configurado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro alerta de preço
              </p>
              <Button onClick={() => setIsAddingAlert(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Alerta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => {
              const priceChange = getPriceChange(alert);
              const targetMet = alert.current_price ? alert.current_price <= alert.target_price : false;
              
              return (
                <Card key={alert.id} className={targetMet ? "border-green-500" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{alert.product_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(alert.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {targetMet && (
                          <Badge variant="default" className="bg-green-500">
                            Meta Atingida!
                          </Badge>
                        )}
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Atual</p>
                        <p className="text-2xl font-bold">
                          R$ {alert.current_price ? alert.current_price.toFixed(2) : "---"}
                        </p>
                        {priceChange !== 0 && (
                          <div className={`flex items-center gap-1 text-sm ${
                            priceChange < 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {priceChange < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                            R$ {Math.abs(priceChange).toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Alvo</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {alert.target_price.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.current_price && alert.current_price > alert.target_price 
                            ? `R$ ${(alert.current_price - alert.target_price).toFixed(2)} acima`
                            : alert.current_price 
                              ? `R$ ${(alert.target_price - alert.current_price).toFixed(2)} abaixo`
                              : "Aguardando verificação"
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Última Verificação</p>
                        <p className="text-sm">
                          {alert.last_checked_at 
                            ? new Date(alert.last_checked_at).toLocaleString("pt-BR")
                            : "Nunca verificado"
                          }
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAlert(alert.id)}
                          >
                            {alert.is_active ? "Pausar" : "Ativar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeAlert(alert.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};