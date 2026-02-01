/**
 * REVOLUTIONARY AI - Live Inventory Map
 * Funcionalidade 4: Visualização Inteligente de Estoque Marítimo
 * 
 * PATCH: Integrado com Supabase - usa hooks reais de inventário
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Package, MapPin, Ship, Warehouse, AlertTriangle, 
  Search, TrendingDown, Clock,
  Brain, Truck, RotateCcw, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  useInventoryLocations, 
  useInventoryItems, 
  useInventoryStats,
  type InventoryLocation,
  type InventoryItem
} from '@/hooks/useLiveInventoryData';

export function LiveInventoryMap() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<InventoryLocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Usar hooks reais do Supabase
  const { data: locations = [], isLoading: locationsLoading } = useInventoryLocations();
  const { data: items = [], isLoading: itemsLoading } = useInventoryItems(selectedLocation?.id);
  const stats = useInventoryStats();

  const isLoading = locationsLoading || itemsLoading;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesLocation = !selectedLocation || item.location === selectedLocation.name;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [searchTerm, filterStatus, selectedLocation, items]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando inventário...</span>
      </div>
    );
  }

  // Empty state
  if (!locations.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum local de inventário</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Cadastre embarcações e armazéns para visualizar o inventário em tempo real.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      ok: 'bg-green-500/20 text-green-400 border-green-500/30',
      excess: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'vessel': return <Ship className="h-5 w-5" />;
      case 'port': return <MapPin className="h-5 w-5" />;
      case 'warehouse': return <Warehouse className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Locais</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalLocations}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              <span className="text-xs">Itens Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Críticos</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.criticalItems}</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Estoque Baixo</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.lowStockItems}</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Vencendo</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.expiringItems}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations Map/List */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localizações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {locations.map((location) => (
                <motion.div
                  key={location.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedLocation?.id === location.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedLocation(
                      selectedLocation?.id === location.id ? null : location
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          location.type === 'vessel' ? 'bg-blue-500/20 text-blue-400' :
                          location.type === 'warehouse' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {getLocationIcon(location.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{location.name}</h4>
                          <p className="text-xs text-muted-foreground">{location.location.city}</p>
                        </div>
                        {location.criticalItems > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {location.criticalItems}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Itens:</span>
                          <span className="ml-1 font-medium">{location.itemCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Baixo:</span>
                          <span className="ml-1 font-medium text-amber-400">{location.lowStockItems}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="ml-1 font-medium">R${(location.totalValue/1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Estoque
                  {selectedLocation && (
                    <Badge variant="outline" className="ml-2">
                      {selectedLocation.name}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-8 w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 rounded-md border bg-background text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="critical">Crítico</option>
                    <option value="low">Baixo</option>
                    <option value="ok">OK</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              <Badge variant="outline" className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{item.quantity}</p>
                            <p className="text-xs text-muted-foreground">
                              de {item.minStock}-{item.maxStock}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Nível de Estoque</span>
                            <span>{Math.round((item.quantity / item.maxStock) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(item.quantity / item.maxStock) * 100} 
                            className={`h-2 ${
                              item.status === 'critical' ? '[&>div]:bg-red-500' :
                              item.status === 'low' ? '[&>div]:bg-amber-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              Lead: {item.leadTime}d
                            </span>
                          </div>
                          {item.predictedRunout && (
                            <span className="flex items-center gap-1 text-red-400">
                              <Brain className="h-3 w-3" />
                              Esgota: {item.predictedRunout.toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                          <Button size="sm" variant="outline" className="flex-1">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Repor
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Truck className="h-3 w-3 mr-1" />
                            Transferir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LiveInventoryMap;
