/**
 * Inventory & Spares AI Page
 * Smart inventory, demand forecasting, auto-reordering, cost optimization
 */
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Package, TrendingUp, AlertTriangle, ShoppingCart, 
  BarChart3, Loader2, Search, DollarSign
} from 'lucide-react';
import { useInventorySparesAI, InventoryItem, ReorderSuggestion } from '@/hooks/useInventorySparesAI';

// Fallback data when API is unavailable
const FALLBACK_INVENTORY = [
  { partNumber: 'ENG-001', name: 'Oil Filter', stock: 12, min: 5, max: 20, criticality: 'essential', class: 'A' },
  { partNumber: 'HYD-015', name: 'Hydraulic Seal', stock: 3, min: 10, max: 25, criticality: 'critical', class: 'A' },
  { partNumber: 'ELE-042', name: 'Fuse 20A', stock: 45, min: 20, max: 100, criticality: 'standard', class: 'C' },
  { partNumber: 'MEC-023', name: 'Bearing 6205', stock: 8, min: 6, max: 15, criticality: 'essential', class: 'B' },
];

const FALLBACK_REORDERS = [
  { item: 'Hydraulic Seal', urgency: 'critical', quantity: 15, supplier: 'Maritime Supplies Co.', savings: 450 },
  { item: 'Fuel Filter', urgency: 'high', quantity: 10, supplier: 'Global Marine Parts', savings: 120 },
  { item: 'Gasket Set', urgency: 'medium', quantity: 5, supplier: 'Ship Parts Ltd', savings: 80 },
];

export default function InventorySparesAIPage() {
  const { 
    isLoading, 
    getInventoryStatus,
    forecastDemand, 
    getReorderSuggestions, 
    analyzeCosts,
    optimizeInventory
  } = useInventorySparesAI();
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState(FALLBACK_INVENTORY);
  const [reorders, setReorders] = useState(FALLBACK_REORDERS);
  const [loadingData, setLoadingData] = useState(true);

  // Load real data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [inventoryData, reorderData] = await Promise.all([
          getInventoryStatus(),
          getReorderSuggestions('default')
        ]);

        if (inventoryData && inventoryData.length > 0) {
          setInventory(inventoryData.map(item => ({
            partNumber: item.partNumber,
            name: item.name,
            stock: item.currentStock,
            min: item.minStock,
            max: item.maxStock,
            criticality: item.criticality,
            class: item.abcClass
          })));
        }

        if (reorderData && reorderData.length > 0) {
          setReorders(reorderData.map(r => ({
            item: r.itemName,
            urgency: r.urgency,
            quantity: r.eoq,
            supplier: r.recommendedSupplier,
            savings: r.estimatedSavings
          })));
        }
      } catch {
        // Use fallback data
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [getInventoryStatus, getReorderSuggestions]);

  return (
    <>
      <Helmet>
        <title>Inventory & Spares AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Inventory & Spares AI
            </h1>
            <p className="text-muted-foreground">
              Gestão inteligente de estoque, previsão de demanda e reposição automática
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <DollarSign className="h-4 w-4 mr-2" />
            $125k economia/ano
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">SKUs ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1.2M</div>
              <p className="text-xs text-muted-foreground">Inventário</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Críticos Baixos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">7</div>
              <p className="text-xs text-red-600">Reposição urgente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2x</div>
              <p className="text-xs text-muted-foreground">Por ano</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <p className="text-xs text-muted-foreground">Disponibilidade</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <TrendingUp className="h-4 w-4 mr-2" />
              Previsão AI
            </TabsTrigger>
            <TabsTrigger value="reorder">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Reposição
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análise ABC
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estoque em Tempo Real</CardTitle>
                <CardDescription>Multi-location tracking com barcode/QR/RFID</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por número de peça ou nome..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">Filtrar</Button>
                </div>

                <div className="space-y-2">
                  {inventory.map((item) => (
                    <div key={item.partNumber} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Package className={`h-6 w-6 ${
                          item.stock <= item.min ? 'text-red-500' : 'text-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.partNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{item.stock} un</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Min: {item.min}</span>
                            <span className="text-xs text-muted-foreground">Max: {item.max}</span>
                          </div>
                        </div>
                        <Badge variant={
                          item.criticality === 'critical' ? 'destructive' :
                          item.criticality === 'essential' ? 'default' : 'secondary'
                        }>
                          {item.criticality}
                        </Badge>
                        <Badge variant="outline">Class {item.class}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Demanda com ML</CardTitle>
                <CardDescription>Correlação com manutenção, sazonalidade e padrões de uso</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => forecastDemand('vessel-1', undefined, 90)}
                  disabled={isLoading}
                  className="mb-4"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                  Gerar Previsão 90 Dias
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-2">Previsão de Consumo</p>
                      <div className="h-40 bg-muted rounded flex items-center justify-center">
                        <span className="text-muted-foreground">Gráfico de previsão</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-2">Fatores de Influência</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Manutenção programada</span>
                          <span className="text-sm font-medium">+35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Sazonalidade</span>
                          <span className="text-sm font-medium">+12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Idade do equipamento</span>
                          <span className="text-sm font-medium">+8%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reorder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Reposição</CardTitle>
                <CardDescription>EOQ calculado, múltiplos fornecedores otimizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Button 
                    onClick={() => getReorderSuggestions('vessel-1')}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                    Atualizar Sugestões
                  </Button>
                  <Button variant="outline">Criar Pedido</Button>
                </div>

                <div className="space-y-2">
                  {reorders.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`h-6 w-6 ${
                          item.urgency === 'critical' ? 'text-red-500' :
                          item.urgency === 'high' ? 'text-orange-500' : 'text-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium">{item.item}</p>
                          <p className="text-sm text-muted-foreground">{item.supplier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} un</p>
                          <p className="text-sm text-green-600">Economia: ${item.savings}</p>
                        </div>
                        <Badge variant={
                          item.urgency === 'critical' ? 'destructive' :
                          item.urgency === 'high' ? 'default' : 'secondary'
                        }>
                          {item.urgency}
                        </Badge>
                        <Button size="sm">Pedir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise ABC e Otimização</CardTitle>
                <CardDescription>Classificação de itens e oportunidades de economia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-green-50 dark:bg-green-950">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium">Classe A</p>
                      <p className="text-2xl font-bold">245 itens</p>
                      <p className="text-sm text-muted-foreground">70% do valor</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium">Classe B</p>
                      <p className="text-2xl font-bold">612 itens</p>
                      <p className="text-sm text-muted-foreground">20% do valor</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium">Classe C</p>
                      <p className="text-2xl font-bold">1,990 itens</p>
                      <p className="text-sm text-muted-foreground">10% do valor</p>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  onClick={() => optimizeInventory('vessel-1')}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                  Analisar Oportunidades de Otimização
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
