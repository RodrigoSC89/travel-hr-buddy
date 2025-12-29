/**
 * API Center Module
 * PATCH 659: Central hub for managing external API integrations
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, Search, Cloud, Ship, Shield, 
  MessageSquare, Brain, Package, Activity,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useApiCenter } from './hooks/useApiCenter';
import { ApiCard } from './components/ApiCard';
import { ApiDetailModal } from './components/ApiDetailModal';
import { API_REGISTRY, type ApiIntegration, type ApiCategory } from './types';
import { cn } from '@/lib/utils';

const categoryConfig: Record<ApiCategory | 'all', { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: 'Todas', icon: Package },
  weather: { label: 'Meteorologia', icon: Cloud },
  maritime: { label: 'Marítimo', icon: Ship },
  security: { label: 'Segurança', icon: Shield },
  communication: { label: 'Comunicação', icon: MessageSquare },
  ai: { label: 'Inteligência Artificial', icon: Brain },
  logistics: { label: 'Logística', icon: Package }
};

export default function ApiCenter() {
  const { apis, logs, quotas, isLoading, error, testApi, toggleApi, refreshApis, getApiLogs } = useApiCenter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory | 'all'>('all');
  const [selectedApi, setSelectedApi] = useState<ApiIntegration | null>(null);

  // Merge registered APIs with database APIs
  const allApis = useMemo(() => {
    const dbApiMap = new Map(apis.map(a => [a.api_name, a]));
    
    // Create entries for registered APIs that aren't in DB yet
    const registeredApis = Object.entries(API_REGISTRY).map(([slug, config]) => {
      const dbApi = dbApiMap.get(slug);
      if (dbApi) return dbApi;
      
      return {
        id: `temp-${slug}`,
        org_id: null,
        api_name: slug,
        api_category: config.category,
        status: 'inactive' as const,
        config: {},
        last_checked: null,
        error_count: 0,
        next_check: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } satisfies ApiIntegration;
    });

    return registeredApis;
  }, [apis]);

  const filteredApis = useMemo(() => {
    return allApis.filter(api => {
      const matchesSearch = api.api_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        API_REGISTRY[api.api_name]?.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || api.api_category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allApis, searchQuery, selectedCategory]);

  const stats = useMemo(() => ({
    total: allApis.length,
    active: allApis.filter(a => a.status === 'active').length,
    inactive: allApis.filter(a => a.status === 'inactive').length,
    error: allApis.filter(a => a.status === 'error').length
  }), [allApis]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            API Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e monitore todas as integrações externas do sistema
          </p>
        </div>
        
        <Button onClick={refreshApis} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.error}</p>
                <p className="text-xs text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs 
              value={selectedCategory} 
              onValueChange={(v) => setSelectedCategory(v as ApiCategory | 'all')}
              className="w-full md:w-auto"
            >
              <TabsList className="flex-wrap h-auto gap-1">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <TabsTrigger key={key} value={key} className="gap-1">
                      <IconComponent className="h-3 w-3" />
                      <span className="hidden sm:inline">{config.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApis.map((api) => (
          <ApiCard
            key={api.id}
            api={api}
            quota={quotas.get(api.api_name)}
            onTest={testApi}
            onToggle={toggleApi}
            onClick={() => setSelectedApi(api)}
          />
        ))}
      </div>

      {filteredApis.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma API encontrada</h3>
            <p className="text-muted-foreground">
              Ajuste os filtros ou adicione novas integrações
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <ApiDetailModal
        api={selectedApi}
        logs={selectedApi ? getApiLogs(selectedApi.api_name) : []}
        quota={selectedApi ? quotas.get(selectedApi.api_name) || null : null}
        isOpen={!!selectedApi}
        onClose={() => setSelectedApi(null)}
      />
    </div>
  );
}
