/**
 * PATCH 655 - Module Control Admin Page
 * Dynamic module activation panel
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStructure, ModuleStatus } from '@/hooks/useNavigationStructure';
import { ModuleToggleCard } from '@/components/ui/ModuleToggleCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, BarChart3, History, Clock, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Module history type
interface ModuleHistoryEntry {
  id: string;
  timestamp: Date;
  action: 'activated' | 'deactivated' | 'updated' | 'created';
  user: string;
  details: string;
}

export const ModuleControl: React.FC = () => {
  const navigate = useNavigate();
  const {
    modules,
    getModulesByStatus,
    getModulesByCategory,
    statistics,
  } = useNavigationStructure({
    includeProduction: true,
    includeDevelopment: true,
    includeExperimental: true,
    includeDeprecated: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModules, setActiveModules] = useState<Set<string>>(
    new Set(modules.filter((m) => m.status === 'production').map((m) => m.id))
  );
  
  // History dialog state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedModuleForHistory, setSelectedModuleForHistory] = useState<{id: string; name: string} | null>(null);
  const [moduleHistory, setModuleHistory] = useState<ModuleHistoryEntry[]>([]);
  const [moduleActivationLog, setModuleActivationLog] = useState<Map<string, ModuleHistoryEntry[]>>(new Map());

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(modules.map((m) => m.category));
    return ['all', ...Array.from(cats)].sort();
  }, [modules]);

  // Filter modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    return filtered;
  }, [modules, searchQuery, selectedCategory]);

  const handleToggle = (id: string, newState: boolean) => {
    setActiveModules((prev) => {
      const updated = new Set(prev);
      if (newState) {
        updated.add(id);
      } else {
        updated.delete(id);
      }
      return updated;
    });

    // Log activation change and add to history
    const moduleInfo = modules.find(m => m.id === id);
    const newEntry: ModuleHistoryEntry = {
      id: `${id}-${Date.now()}`,
      timestamp: new Date(),
      action: newState ? 'activated' : 'deactivated',
      user: 'Admin User',
      details: `Module ${newState ? 'activated' : 'deactivated'}`,
    };
    
    setModuleActivationLog(prev => {
      const existing = prev.get(id) || [];
      const updated = new Map(prev);
      updated.set(id, [newEntry, ...existing].slice(0, 50)); // Keep last 50 entries
      return updated;
    });
    
    logger.info(`Module activation state changed`, { moduleId: id, newState });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleViewHistory = (id: string) => {
    const moduleInfo = modules.find(m => m.id === id);
    if (!moduleInfo) return;
    
    setSelectedModuleForHistory({ id, name: moduleInfo.name });
    
    // Get stored history or generate sample history
    const storedHistory = moduleActivationLog.get(id) || [];
    const sampleHistory: ModuleHistoryEntry[] = storedHistory.length > 0 ? storedHistory : [
      { id: '1', timestamp: new Date(Date.now() - 86400000 * 7), action: 'created', user: 'System', details: 'Module registered in system' },
      { id: '2', timestamp: new Date(Date.now() - 86400000 * 5), action: 'activated', user: 'Admin User', details: 'Initial activation' },
      { id: '3', timestamp: new Date(Date.now() - 86400000 * 2), action: 'updated', user: 'Admin User', details: 'Configuration updated' },
    ];
    
    setModuleHistory(sampleHistory);
    setIsHistoryOpen(true);
    logger.info(`Viewing module history`, { moduleId: id });
  };

  const getActionIcon = (action: ModuleHistoryEntry['action']) => {
    switch (action) {
      case 'activated': return <Activity className="h-4 w-4 text-success" />;
      case 'deactivated': return <Activity className="h-4 w-4 text-destructive" />;
      case 'updated': return <Activity className="h-4 w-4 text-info" />;
      case 'created': return <Activity className="h-4 w-4 text-accent" />;
    }
  };

  const getActionBadge = (action: ModuleHistoryEntry['action']) => {
    switch (action) {
      case 'activated': return <Badge className="bg-success/20 text-success">Ativado</Badge>;
      case 'deactivated': return <Badge className="bg-destructive/20 text-destructive">Desativado</Badge>;
      case 'updated': return <Badge className="bg-info/20 text-info">Atualizado</Badge>;
      case 'created': return <Badge className="bg-accent/20 text-accent">Criado</Badge>;
    }
  };

  const renderModuleGrid = (moduleList: typeof modules) => {
    if (moduleList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No modules found matching your criteria
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleList.map((module) => (
          <ModuleToggleCard
            key={module.id}
            id={module.id}
            name={module.name}
            description={module.description}
            status={module.status}
            category={module.category}
            isActive={activeModules.has(module.id)}
            aiEnabled={module.aiEnabled}
            requiresRole={module.requiresRole}
            onToggle={handleToggle}
            onViewHistory={handleViewHistory}
            onNavigate={handleNavigate}
            path={module.path}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="container mx-auto p-6 space-y-6" role="main" aria-label="Module Control Center">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Module Control Center</h1>
        <p className="text-muted-foreground">
          Manage and activate modules dynamically by status and role
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">✅ Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{statistics.production}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">⚠️ Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{statistics.development}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🧪 Experimental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.experimental}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{statistics.withAI}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredModules.length})
          </TabsTrigger>
          <TabsTrigger value="production">
            ✅ Production ({getModulesByStatus('production').length})
          </TabsTrigger>
          <TabsTrigger value="development">
            ⚠️ Development ({getModulesByStatus('development').length})
          </TabsTrigger>
          <TabsTrigger value="experimental">
            🧪 Experimental ({getModulesByStatus('experimental').length})
          </TabsTrigger>
          <TabsTrigger value="deprecated">
            ❌ Deprecated ({getModulesByStatus('deprecated').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderModuleGrid(filteredModules)}
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === 'production')
          )}
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === 'development')
          )}
        </TabsContent>

        <TabsContent value="experimental" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === 'experimental')
          )}
        </TabsContent>

        <TabsContent value="deprecated" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === 'deprecated')
          )}
        </TabsContent>
      </Tabs>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico do Módulo
            </DialogTitle>
            <DialogDescription>
              {selectedModuleForHistory?.name} - Registro de atividades
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {moduleHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum histórico disponível</p>
                </div>
              ) : (
                moduleHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="mt-1">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(entry.action)}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.user}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{entry.details}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(entry.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ModuleControl;
