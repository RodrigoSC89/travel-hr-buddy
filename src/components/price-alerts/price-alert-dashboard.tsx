import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, TrendingDown, TrendingUp, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PriceAlert {
  id: string;
  product: string;
  currentPrice: number;
  targetPrice: number;
  url: string;
  isActive: boolean;
  createdAt: string;
  lastChecked?: string;
  priceHistory: { price: number; date: string }[];
}

export const PriceAlertDashboard = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    product: '',
    targetPrice: '',
    url: ''
  });
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    setAlerts([
      {
        id: '1',
        product: 'iPhone 15 Pro',
        currentPrice: 6999.00,
        targetPrice: 6500.00,
        url: 'https://www.apple.com/br/iphone-15-pro/',
        isActive: true,
        createdAt: '2024-01-15',
        lastChecked: '2024-01-20 14:30',
        priceHistory: [
          { price: 7200.00, date: '2024-01-15' },
          { price: 7100.00, date: '2024-01-17' },
          { price: 6999.00, date: '2024-01-20' }
        ]
      },
      {
        id: '2',
        product: 'MacBook Air M2',
        currentPrice: 8999.00,
        targetPrice: 8500.00,
        url: 'https://www.apple.com/br/macbook-air/',
        isActive: true,
        createdAt: '2024-01-10',
        lastChecked: '2024-01-20 14:25',
        priceHistory: [
          { price: 9200.00, date: '2024-01-10' },
          { price: 9100.00, date: '2024-01-15' },
          { price: 8999.00, date: '2024-01-20' }
        ]
      }
    ]);
  }, []);

  const handleAddAlert = async () => {
    if (!newAlert.product || !newAlert.targetPrice || !newAlert.url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call to get current price
    const mockCurrentPrice = Math.random() * 1000 + 500;
    
    const alert: PriceAlert = {
      id: Date.now().toString(),
      product: newAlert.product,
      currentPrice: mockCurrentPrice,
      targetPrice: parseFloat(newAlert.targetPrice),
      url: newAlert.url,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      priceHistory: [{ price: mockCurrentPrice, date: new Date().toISOString().split('T')[0] }]
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ product: '', targetPrice: '', url: '' });
    setIsAddingAlert(false);
    
    toast({
      title: "Alerta criado!",
      description: `Alerta para ${newAlert.product} foi adicionado com sucesso.`
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alerta removido",
      description: "O alerta de preço foi removido com sucesso."
    });
  };

  const getPriceChange = (alert: PriceAlert) => {
    if (alert.priceHistory.length < 2) return 0;
    const current = alert.priceHistory[alert.priceHistory.length - 1].price;
    const previous = alert.priceHistory[alert.priceHistory.length - 2].price;
    return current - previous;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertas de Preços</h1>
          <p className="text-muted-foreground">Monitore os preços dos seus produtos favoritos</p>
        </div>
        
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
                  value={newAlert.product}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, product: e.target.value }))}
                  placeholder="Ex: iPhone 15 Pro"
                />
              </div>
              <div>
                <Label htmlFor="targetPrice">Preço Alvo (R$)</Label>
                <Input
                  id="targetPrice"
                  type="number"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                  placeholder="Ex: 6500"
                />
              </div>
              <div>
                <Label htmlFor="url">URL do Produto</Label>
                <Input
                  id="url"
                  value={newAlert.url}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://exemplo.com/produto"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingAlert(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAlert}>
                  Criar Alerta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</p>
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
                  {alerts.filter(a => a.currentPrice <= a.targetPrice).length}
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
              const targetMet = alert.currentPrice <= alert.targetPrice;
              
              return (
                <Card key={alert.id} className={targetMet ? "border-green-500" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{alert.product}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {targetMet && (
                          <Badge variant="default" className="bg-green-500">
                            Meta Atingida!
                          </Badge>
                        )}
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Atual</p>
                        <p className="text-2xl font-bold">
                          R$ {alert.currentPrice.toFixed(2)}
                        </p>
                        {priceChange !== 0 && (
                          <div className={`flex items-center gap-1 text-sm ${
                            priceChange < 0 ? 'text-green-500' : 'text-red-500'
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
                          R$ {alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.currentPrice > alert.targetPrice 
                            ? `R$ ${(alert.currentPrice - alert.targetPrice).toFixed(2)} acima`
                            : `R$ ${(alert.targetPrice - alert.currentPrice).toFixed(2)} abaixo`
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Última Verificação</p>
                        <p className="text-sm">
                          {alert.lastChecked || 'Nunca verificado'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAlert(alert.id)}
                          >
                            {alert.isActive ? 'Pausar' : 'Ativar'}
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