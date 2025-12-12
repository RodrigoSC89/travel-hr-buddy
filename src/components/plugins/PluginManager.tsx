/**
import { useState, useMemo, useCallback } from "react";;
 * Plugin Manager - PHASE 7
 * Sistema modular de plugins e extensões
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Puzzle, 
  Search,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Package,
  Zap,
  Shield,
  BarChart3,
  Leaf,
  Ship,
  Users,
  Brain,
  Wrench,
  Globe
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  icon: React.ElementType;
  installed: boolean;
  enabled: boolean;
  featured?: boolean;
  downloads?: number;
  rating?: number;
}

const availablePlugins: Plugin[] = [
  {
    id: "esg-module",
    name: "ESG & Sustentabilidade",
    description: "Monitoramento de emissões, relatórios ESG e métricas ambientais",
    version: "2.1.0",
    author: "Nautilus Core",
    category: "compliance",
    icon: Leaf,
    installed: true,
    enabled: true,
    featured: true,
    downloads: 1520,
    rating: 4.8
  },
  {
    id: "procurement",
    name: "Procurement & Supplies",
    description: "Gestão de compras, fornecedores e contratos",
    version: "1.5.0",
    author: "Nautilus Core",
    category: "operations",
    icon: Package,
    installed: true,
    enabled: false,
    downloads: 890,
    rating: 4.5
  },
  {
    id: "advanced-ai",
    name: "IA Avançada",
    description: "Módulos de IA com RAG, análise preditiva e assistentes especializados",
    version: "3.0.0",
    author: "Nautilus AI Lab",
    category: "intelligence",
    icon: Brain,
    installed: true,
    enabled: true,
    featured: true,
    downloads: 2340,
    rating: 4.9
  },
  {
    id: "risk-management",
    name: "Gestão de Riscos",
    description: "Análise de riscos operacionais, matriz SWOT e planos de mitigação",
    version: "1.2.0",
    author: "Nautilus Core",
    category: "compliance",
    icon: Shield,
    installed: false,
    enabled: false,
    downloads: 650,
    rating: 4.3
  },
  {
    id: "fleet-optimization",
    name: "Otimização de Frota",
    description: "Algoritmos de otimização para alocação e utilização de embarcações",
    version: "1.8.0",
    author: "Nautilus Core",
    category: "operations",
    icon: Ship,
    installed: false,
    enabled: false,
    downloads: 720,
    rating: 4.6
  },
  {
    id: "crew-wellness",
    name: "Bem-estar da Tripulação",
    description: "Monitoramento de saúde, satisfação e engajamento da tripulação",
    version: "1.0.0",
    author: "Nautilus HR",
    category: "hr",
    icon: Users,
    installed: false,
    enabled: false,
    downloads: 430,
    rating: 4.4
  },
  {
    id: "maintenance-ai",
    name: "Manutenção Preditiva IA",
    description: "Previsão de falhas com machine learning e histórico de equipamentos",
    version: "2.0.0",
    author: "Nautilus AI Lab",
    category: "maintenance",
    icon: Wrench,
    installed: true,
    enabled: true,
    downloads: 1890,
    rating: 4.7
  },
  {
    id: "external-api",
    name: "Integrações Externas",
    description: "Conectores para ERPs, AIS, sistemas de navegação e APIs de terceiros",
    version: "1.3.0",
    author: "Nautilus Core",
    category: "integration",
    icon: Globe,
    installed: true,
    enabled: true,
    downloads: 1100,
    rating: 4.5
  }
];

const categories = [
  { id: "all", name: "Todos" },
  { id: "compliance", name: "Compliance" },
  { id: "operations", name: "Operações" },
  { id: "intelligence", name: "Inteligência" },
  { id: "maintenance", name: "Manutenção" },
  { id: "hr", name: "RH" },
  { id: "integration", name: "Integrações" }
];

export const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>(availablePlugins);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [installingId, setInstallingId] = useState<string | null>(null);

  const togglePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, enabled: !p.enabled } : p
    ));
    
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      toast.success(plugin.enabled ? `${plugin.name} desativado` : `${plugin.name} ativado`);
    }
  };

  const installPlugin = async (pluginId: string) => {
    setInstallingId(pluginId);
    
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, installed: true, enabled: true } : p
    ));
    
    const plugin = plugins.find(p => p.id === pluginId);
    toast.success(`${plugin?.name} instalado com sucesso!`);
    setInstallingId(null);
  };

  const uninstallPlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, installed: false, enabled: false } : p
    ));
    
    const plugin = plugins.find(p => p.id === pluginId);
    toast.success(`${plugin?.name} removido`);
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedPlugins = plugins.filter(p => p.installed);
  const enabledCount = installedPlugins.filter(p => p.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plugins Instalados</p>
                <p className="text-2xl font-bold">{installedPlugins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Package className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">{plugins.filter(p => !p.installed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versão do Sistema</p>
                <p className="text-2xl font-bold">v3.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-primary" />
                Gerenciador de Plugins
              </CardTitle>
              <CardDescription>
                Estenda as funcionalidades do Nautilus One com plugins modulares
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plugins..."
                value={searchQuery}
                onChange={handleChange}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map((plugin) => {
                const IconComponent = plugin.icon;
                return (
                  <Card key={plugin.id} className={`relative ${plugin.featured ? "border-primary/50" : ""}`}>
                    {plugin.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{plugin.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plugin.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>{plugin.author}</span>
                        {plugin.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {plugin.rating}
                          </span>
                        )}
                      </div>

                      {plugin.installed ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={plugin.enabled}
                              onCheckedChange={() => togglePlugin(plugin.id)}
                            />
                            <span className="text-sm">
                              {plugin.enabled ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleuninstallPlugin}
                          >
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleinstallPlugin}
                          disabled={installingId === plugin.id}
                        >
                          {installingId === plugin.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Instalando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Instalar
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginManager;
