/**
 * 📦 Logistics AI Hub - REVOLUTIONARY MODULE
 * Central de Logística Inteligente com IA Avançada
 * Features: Supply Chain AI, Inventory Prediction, Fleet Tracking, Smart Procurement
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Package, Truck, Brain, TrendingUp, AlertTriangle,
  MapPin, Clock, DollarSign, BarChart3, Search,
  ShoppingCart, Warehouse, Ship, Plane, CheckCircle,
  XCircle, ArrowRight, Zap, Target, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/use-ai-service';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'customs';
  eta: string;
  priority: 'standard' | 'express' | 'critical';
  carrier: string;
  mode: 'sea' | 'air' | 'land';
  weight: number;
  value: number;
  aiRisk: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  predictedDemand: number;
  reorderPoint: number;
  leadTime: number;
  unitCost: number;
  status: 'ok' | 'low' | 'critical' | 'overstock';
  aiRecommendation: string;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  reliability: number;
  avgDeliveryTime: number;
  totalOrders: number;
  activeOrders: number;
  status: 'active' | 'pending' | 'blocked';
}

interface AIOptimization {
  id: string;
  type: 'route' | 'inventory' | 'cost' | 'supplier';
  title: string;
  description: string;
  savingPotential: number;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export function LogisticsAIHub() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [optimizations, setOptimizations] = useState<AIOptimization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { sendMessage, isLoading } = useAIService({ module: 'logistics-ai' });

  // Simulated data
  useEffect(() => {
    const mockShipments: Shipment[] = [
      {
        id: 'sh1',
        trackingNumber: 'NTL-2025-001234',
        origin: 'Rotterdam, NL',
        destination: 'Santos, BR',
        status: 'in_transit',
        eta: '2025-02-05T14:00:00Z',
        priority: 'express',
        carrier: 'Maersk',
        mode: 'sea',
        weight: 2500,
        value: 125000,
        aiRisk: 12
      },
      {
        id: 'sh2',
        trackingNumber: 'NTL-2025-001235',
        origin: 'Singapore, SG',
        destination: 'Rio de Janeiro, BR',
        status: 'customs',
        eta: '2025-02-02T08:00:00Z',
        priority: 'critical',
        carrier: 'MSC',
        mode: 'sea',
        weight: 1800,
        value: 89000,
        aiRisk: 35
      },
      {
        id: 'sh3',
        trackingNumber: 'NTL-2025-001236',
        origin: 'Houston, US',
        destination: 'Paranaguá, BR',
        status: 'pending',
        eta: '2025-02-10T16:00:00Z',
        priority: 'standard',
        carrier: 'Hapag-Lloyd',
        mode: 'sea',
        weight: 3200,
        value: 178000,
        aiRisk: 8
      },
      {
        id: 'sh4',
        trackingNumber: 'NTL-2025-001237',
        origin: 'Dubai, AE',
        destination: 'Vitória, BR',
        status: 'delayed',
        eta: '2025-02-08T12:00:00Z',
        priority: 'express',
        carrier: 'Emirates Sky Cargo',
        mode: 'air',
        weight: 450,
        value: 95000,
        aiRisk: 62
      }
    ];

    const mockInventory: InventoryItem[] = [
      {
        id: 'inv1',
        name: 'Filtro de Óleo Hidráulico',
        category: 'Manutenção',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        predictedDemand: 35,
        reorderPoint: 30,
        leadTime: 14,
        unitCost: 250,
        status: 'ok',
        aiRecommendation: 'Estoque adequado para 45 dias de operação.'
      },
      {
        id: 'inv2',
        name: 'Junta de Vedação Motor',
        category: 'Manutenção',
        currentStock: 8,
        minStock: 15,
        maxStock: 50,
        predictedDemand: 12,
        reorderPoint: 15,
        leadTime: 21,
        unitCost: 180,
        status: 'critical',
        aiRecommendation: 'URGENTE: Reposição imediata necessária. Risco de parada operacional.'
      },
      {
        id: 'inv3',
        name: 'Cabo Elétrico Marítimo 25mm',
        category: 'Elétrica',
        currentStock: 1200,
        minStock: 300,
        maxStock: 800,
        predictedDemand: 150,
        reorderPoint: 400,
        leadTime: 7,
        unitCost: 45,
        status: 'overstock',
        aiRecommendation: 'Estoque excedente. Considerar redistribuição ou venda.'
      },
      {
        id: 'inv4',
        name: 'Lubrificante Marítimo Grade A',
        category: 'Consumíveis',
        currentStock: 85,
        minStock: 50,
        maxStock: 200,
        predictedDemand: 60,
        reorderPoint: 75,
        leadTime: 10,
        unitCost: 320,
        status: 'low',
        aiRecommendation: 'Próximo do ponto de reposição. Iniciar processo de compra.'
      }
    ];

    const mockSuppliers: Supplier[] = [
      { id: 'sup1', name: 'Maritime Parts Global', rating: 4.8, reliability: 96, avgDeliveryTime: 12, totalOrders: 234, activeOrders: 5, status: 'active' },
      { id: 'sup2', name: 'Ocean Equipment Ltd', rating: 4.5, reliability: 92, avgDeliveryTime: 18, totalOrders: 156, activeOrders: 3, status: 'active' },
      { id: 'sup3', name: 'Nautical Supplies Inc', rating: 4.2, reliability: 88, avgDeliveryTime: 25, totalOrders: 89, activeOrders: 2, status: 'active' },
      { id: 'sup4', name: 'SeaTech Components', rating: 3.9, reliability: 78, avgDeliveryTime: 30, totalOrders: 45, activeOrders: 0, status: 'pending' }
    ];

    const mockOptimizations: AIOptimization[] = [
      {
        id: 'opt1',
        type: 'route',
        title: 'Consolidação de Embarques',
        description: 'Combinar 3 embarques para Rotterdam pode reduzir custos de frete em 22%.',
        savingPotential: 15000,
        confidence: 94,
        impact: 'high'
      },
      {
        id: 'opt2',
        type: 'inventory',
        title: 'Otimização de Estoque',
        description: 'Redistribuir estoque excedente de cabos para unidade Santos.',
        savingPotential: 8500,
        confidence: 89,
        impact: 'medium'
      },
      {
        id: 'opt3',
        type: 'supplier',
        title: 'Alternativa de Fornecedor',
        description: 'Maritime Parts Global oferece 15% menor preço para juntas de vedação.',
        savingPotential: 4200,
        confidence: 91,
        impact: 'medium'
      },
      {
        id: 'opt4',
        type: 'cost',
        title: 'Negociação de Contrato',
        description: 'Volume de compras qualifica para desconto de 10% com Maersk.',
        savingPotential: 28000,
        confidence: 87,
        impact: 'high'
      }
    ];

    setShipments(mockShipments);
    setInventory(mockInventory);
    setSuppliers(mockSuppliers);
    setOptimizations(mockOptimizations);
  }, []);

  const handleAIOptimization = async () => {
    setIsOptimizing(true);
    try {
      await sendMessage(
        'Analise toda a cadeia de suprimentos e forneça recomendações de otimização de custos, estoque e rotas.'
      );
      toast.success('Otimização IA Concluída!', {
        description: 'Novas oportunidades de economia identificadas'
      });
    } catch (error) {
      toast.error('Erro na otimização');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_transit': return <Badge className="bg-blue-500">Em Trânsito</Badge>;
      case 'delivered': return <Badge className="bg-green-500">Entregue</Badge>;
      case 'pending': return <Badge className="bg-gray-500">Pendente</Badge>;
      case 'delayed': return <Badge className="bg-red-500">Atrasado</Badge>;
      case 'customs': return <Badge className="bg-amber-500">Alfândega</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'sea': return <Ship className="h-4 w-4" />;
      case 'air': return <Plane className="h-4 w-4" />;
      case 'land': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'border-l-green-500';
      case 'low': return 'border-l-amber-500';
      case 'critical': return 'border-l-red-500';
      case 'overstock': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const totalSavings = optimizations.reduce((acc, opt) => acc + opt.savingPotential, 0);
  const criticalInventory = inventory.filter(i => i.status === 'critical').length;
  const delayedShipments = shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Logistics AI Hub
            <Badge variant="default" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              SMART SUPPLY v4.0
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de Logística Inteligente com IA Preditiva & Otimização Autônoma
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleAIOptimization}
            disabled={isOptimizing || isLoading}
          >
            <Brain className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Otimizando...' : 'Otimizar IA'}
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nova Requisição
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Embarques Ativos</p>
                <p className="text-2xl font-bold">{shipments.length}</p>
                <p className="text-xs text-blue-500 mt-1">
                  {shipments.filter(s => s.status === 'in_transit').length} em trânsito
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Estoque</p>
                <p className="text-2xl font-bold text-red-500">{criticalInventory}</p>
                <p className="text-xs text-red-500 mt-1">Reposição urgente</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Embarques Atrasados</p>
                <p className="text-2xl font-bold text-amber-500">{delayedShipments}</p>
                <p className="text-xs text-amber-500 mt-1">Requer atenção</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Economia IA</p>
                <p className="text-2xl font-bold text-green-500">
                  ${(totalSavings / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-green-500 mt-1">Potencial identificado</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Embarques
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Otimização IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Rastreamento de Embarques
                  </CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real com previsão IA de riscos
                  </CardDescription>
                </div>
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar embarque..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {shipments.map((shipment, index) => (
                      <motion.div
                        key={shipment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              shipment.status === 'delayed' ? 'bg-red-500/10' :
                              shipment.status === 'customs' ? 'bg-amber-500/10' :
                              'bg-blue-500/10'
                            }`}>
                              {getModeIcon(shipment.mode)}
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {shipment.trackingNumber}
                                {getStatusBadge(shipment.status)}
                                <Badge variant="outline" className="capitalize">
                                  {shipment.priority}
                                </Badge>
                              </h3>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{shipment.origin}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{shipment.destination}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Transportador: {shipment.carrier} | Peso: {shipment.weight}kg
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Valor</p>
                              <p className="text-sm font-semibold">
                                ${shipment.value.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Risco IA</p>
                              <p className={`text-sm font-semibold ${
                                shipment.aiRisk > 50 ? 'text-red-500' :
                                shipment.aiRisk > 25 ? 'text-amber-500' :
                                'text-green-500'
                              }`}>
                                {shipment.aiRisk}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">ETA</p>
                              <p className="text-sm font-medium">
                                {new Date(shipment.eta).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Gestão Inteligente de Estoque
              </CardTitle>
              <CardDescription>
                Previsão de demanda e reposição automática baseada em ML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <Card key={item.id} className={`border-l-4 ${getInventoryStatusColor(item.status)}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {item.name}
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className={
                              item.status === 'critical' ? 'bg-red-500' :
                              item.status === 'low' ? 'bg-amber-500' :
                              item.status === 'overstock' ? 'bg-blue-500' :
                              'bg-green-500'
                            }>
                              {item.status === 'ok' ? 'Normal' : 
                               item.status === 'low' ? 'Baixo' :
                               item.status === 'critical' ? 'Crítico' : 'Excesso'}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.aiRecommendation}
                          </p>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Estoque: {item.currentStock} un</span>
                              <span>Max: {item.maxStock} un</span>
                            </div>
                            <Progress 
                              value={(item.currentStock / item.maxStock) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground">Demanda</p>
                            <p className="text-lg font-bold">{item.predictedDemand}</p>
                            <p className="text-xs">30 dias</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground">Lead Time</p>
                            <p className="text-lg font-bold">{item.leadTime}</p>
                            <p className="text-xs">dias</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground">Custo Un.</p>
                            <p className="text-lg font-bold">${item.unitCost}</p>
                          </div>
                        </div>
                      </div>
                      {item.status === 'critical' && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <Zap className="h-4 w-4 mr-1" /> Pedido Urgente
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Gestão de Fornecedores
              </CardTitle>
              <CardDescription>
                Avaliação contínua com scoring de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {supplier.name}
                          <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                            {supplier.status}
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            ⭐ {supplier.rating.toFixed(1)}
                          </span>
                          <span>Confiabilidade: {supplier.reliability}%</span>
                          <span>Entrega média: {supplier.avgDeliveryTime} dias</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Total Pedidos</p>
                          <p className="text-lg font-bold">{supplier.totalOrders}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Ativos</p>
                          <p className="text-lg font-bold text-blue-500">{supplier.activeOrders}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Otimizações Recomendadas por IA
              </CardTitle>
              <CardDescription>
                Economia potencial total: ${totalSavings.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((opt) => (
                  <Card key={opt.id} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            opt.type === 'route' ? 'bg-blue-500/10' :
                            opt.type === 'inventory' ? 'bg-amber-500/10' :
                            opt.type === 'supplier' ? 'bg-purple-500/10' :
                            'bg-green-500/10'
                          }`}>
                            {opt.type === 'route' && <MapPin className="h-6 w-6 text-blue-500" />}
                            {opt.type === 'inventory' && <Warehouse className="h-6 w-6 text-amber-500" />}
                            {opt.type === 'supplier' && <ShoppingCart className="h-6 w-6 text-purple-500" />}
                            {opt.type === 'cost' && <DollarSign className="h-6 w-6 text-green-500" />}
                          </div>
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {opt.title}
                              <Badge variant="outline" className={
                                opt.impact === 'high' ? 'border-green-500 text-green-500' :
                                opt.impact === 'medium' ? 'border-amber-500 text-amber-500' :
                                'border-gray-500'
                              }>
                                Impacto: {opt.impact}
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {opt.description}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              Confiança: {opt.confidence}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center p-4 rounded-lg bg-green-500/10">
                            <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-green-500">
                              ${opt.savingPotential.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Economia</p>
                          </div>
                          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                            <Zap className="h-4 w-4 mr-1" /> Aplicar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LogisticsAIHub;
