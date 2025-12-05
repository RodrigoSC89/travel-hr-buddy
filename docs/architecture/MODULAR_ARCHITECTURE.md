# 🧩 Arquitetura Modular - Sistema de Plugins

## Visão Geral

O Nautilus One utiliza uma arquitetura modular baseada em **plugins** que permite adicionar novos módulos sem modificar o código existente.

## Estrutura do Plugin System

```
src/lib/plugins/
├── plugin-system.ts      # Core do sistema de plugins
├── plugin-loader.ts      # Carregamento dinâmico
├── plugin-registry.ts    # Registro de plugins
├── hooks/
│   ├── use-plugin.ts     # Hook para usar plugins
│   └── use-plugin-api.ts # Hook para API do plugin
└── modules/
    ├── fleet/
    ├── crew/
    ├── maintenance/
    └── [novo-modulo]/
```

## Anatomia de um Plugin

```typescript
// src/lib/plugins/modules/exemplo/index.ts
import { PluginDefinition } from '../../plugin-system';

export const exemploPlugin: PluginDefinition = {
  // Metadados
  id: 'exemplo-plugin',
  name: 'Exemplo Plugin',
  version: '1.0.0',
  description: 'Plugin de exemplo para demonstração',
  author: 'Nautilus Team',
  
  // Dependências
  dependencies: ['core', 'ai-engine'],
  
  // Configuração
  config: {
    enabled: true,
    settings: {
      maxItems: 100,
      enableAI: true
    }
  },
  
  // Rotas
  routes: [
    {
      path: '/exemplo',
      component: () => import('./pages/ExemploPage'),
      exact: true,
      permissions: ['exemplo.read']
    },
    {
      path: '/exemplo/:id',
      component: () => import('./pages/ExemploDetailPage'),
      permissions: ['exemplo.read']
    }
  ],
  
  // Menu
  navigation: {
    label: 'Exemplo',
    icon: 'Package',
    order: 10,
    group: 'operations'
  },
  
  // Permissões
  permissions: [
    'exemplo.read',
    'exemplo.create',
    'exemplo.update',
    'exemplo.delete',
    'exemplo.admin'
  ],
  
  // Capacidades de IA
  aiCapabilities: {
    enabled: true,
    commands: [
      {
        trigger: 'analisar exemplo',
        description: 'Analisa dados do módulo exemplo',
        handler: 'analyzeExemplo'
      }
    ],
    context: `
      Você está no módulo Exemplo.
      Este módulo gerencia [descrição].
      Comandos disponíveis: listar, criar, editar, excluir.
    `
  },
  
  // Ciclo de vida
  lifecycle: {
    onInit: async (context) => {
      console.log('Plugin inicializando...');
      // Setup inicial
    },
    onReady: async (context) => {
      console.log('Plugin pronto!');
      // Após carregamento completo
    },
    onDestroy: async (context) => {
      console.log('Plugin destruindo...');
      // Cleanup
    }
  },
  
  // API interna
  api: {
    getItems: async () => { /* ... */ },
    createItem: async (data) => { /* ... */ },
    updateItem: async (id, data) => { /* ... */ },
    deleteItem: async (id) => { /* ... */ }
  },
  
  // Eventos
  events: {
    'item:created': [],
    'item:updated': [],
    'item:deleted': []
  },
  
  // Hooks de extensão
  hooks: {
    'dashboard:widgets': () => import('./widgets/ExemploWidget'),
    'reports:templates': () => import('./reports/ExemploReport'),
    'ai:commands': () => import('./ai/ExemploCommands')
  }
};
```

## Criando um Novo Módulo

### Passo 1: Estrutura de Pastas

```bash
src/lib/plugins/modules/novo-modulo/
├── index.ts              # Definição do plugin
├── pages/
│   ├── NovoModuloPage.tsx
│   └── NovoModuloDetailPage.tsx
├── components/
│   ├── NovoModuloList.tsx
│   ├── NovoModuloForm.tsx
│   └── NovoModuloCard.tsx
├── hooks/
│   └── use-novo-modulo.ts
├── api/
│   └── novo-modulo-api.ts
├── widgets/
│   └── NovoModuloWidget.tsx
├── ai/
│   └── NovoModuloAI.ts
└── types/
    └── index.ts
```

### Passo 2: Definir Tipos

```typescript
// src/lib/plugins/modules/novo-modulo/types/index.ts
export interface NovoModuloItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface NovoModuloFilters {
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NovoModuloState {
  items: NovoModuloItem[];
  loading: boolean;
  error: string | null;
  filters: NovoModuloFilters;
}
```

### Passo 3: Criar Hook

```typescript
// src/lib/plugins/modules/novo-modulo/hooks/use-novo-modulo.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NovoModuloItem, NovoModuloFilters } from '../types';
import { useOfflineSync } from '@/lib/offline/hooks';

export function useNovoModulo(filters?: NovoModuloFilters) {
  const queryClient = useQueryClient();
  const { queueOperation, isOffline } = useOfflineSync();

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['novo-modulo', filters],
    queryFn: async () => {
      let query = supabase
        .from('novo_modulo')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NovoModuloItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (item: Partial<NovoModuloItem>) => {
      if (isOffline) {
        await queueOperation({
          type: 'CREATE',
          table: 'novo_modulo',
          data: item,
          priority: 'normal'
        });
        return { ...item, id: `temp-${Date.now()}` };
      }

      const { data, error } = await supabase
        .from('novo_modulo')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novo-modulo'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<NovoModuloItem>) => {
      if (isOffline) {
        await queueOperation({
          type: 'UPDATE',
          table: 'novo_modulo',
          data: { id, ...data },
          priority: 'normal'
        });
        return { id, ...data };
      }

      const { data: result, error } = await supabase
        .from('novo_modulo')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novo-modulo'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isOffline) {
        await queueOperation({
          type: 'DELETE',
          table: 'novo_modulo',
          data: { id },
          priority: 'low'
        });
        return;
      }

      const { error } = await supabase
        .from('novo_modulo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novo-modulo'] });
    }
  });

  return {
    items: data ?? [],
    isLoading,
    error,
    isOffline,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

### Passo 4: Criar Componentes

```typescript
// src/lib/plugins/modules/novo-modulo/components/NovoModuloList.tsx
import React from 'react';
import { useNovoModulo } from '../hooks/use-novo-modulo';
import { NovoModuloCard } from './NovoModuloCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NovoModuloList() {
  const { items, isLoading, error } = useNovoModulo();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum item encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <NovoModuloCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Passo 5: Criar Página

```typescript
// src/lib/plugins/modules/novo-modulo/pages/NovoModuloPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { NovoModuloList } from '../components/NovoModuloList';
import { NovoModuloForm } from '../components/NovoModuloForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { NetworkStatusBadge } from '@/components/performance/NetworkStatusBadge';

export function NovoModuloPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo Módulo</h1>
          <p className="text-muted-foreground">
            Gerencie os itens do novo módulo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkStatusBadge variant="minimal" />
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NovoModuloForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista */}
      <NovoModuloList />
    </div>
  );
}

export default NovoModuloPage;
```

### Passo 6: Definir Plugin

```typescript
// src/lib/plugins/modules/novo-modulo/index.ts
import { PluginDefinition } from '../../plugin-system';

export const novoModuloPlugin: PluginDefinition = {
  id: 'novo-modulo',
  name: 'Novo Módulo',
  version: '1.0.0',
  description: 'Descrição do novo módulo',
  
  routes: [
    {
      path: '/novo-modulo',
      component: () => import('./pages/NovoModuloPage'),
      permissions: ['novo-modulo.read']
    }
  ],
  
  navigation: {
    label: 'Novo Módulo',
    icon: 'Package',
    order: 15,
    group: 'operations'
  },
  
  permissions: [
    'novo-modulo.read',
    'novo-modulo.create',
    'novo-modulo.update',
    'novo-modulo.delete'
  ],
  
  aiCapabilities: {
    enabled: true,
    commands: [
      {
        trigger: 'listar novo modulo',
        description: 'Lista itens do novo módulo',
        handler: 'listItems'
      }
    ],
    context: 'Módulo para gerenciamento de [descrição].'
  }
};
```

### Passo 7: Registrar Plugin

```typescript
// src/lib/plugins/registry.ts
import { novoModuloPlugin } from './modules/novo-modulo';

export const plugins = [
  // ... outros plugins
  novoModuloPlugin
];
```

---

## APIs Internas para Comunicação

### Event Bus

```typescript
// src/lib/plugins/event-bus.ts
type EventHandler = (data: any) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler) {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
    
    // Retorna função para unsubscribe
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  emit(event: string, data?: any) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

export const eventBus = new EventBus();

// Uso em plugins:
// eventBus.emit('maintenance:order-created', { id: '123' });
// eventBus.on('maintenance:order-created', (data) => { ... });
```

### Plugin Context

```typescript
// src/lib/plugins/plugin-context.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { PluginSystem } from './plugin-system';

interface PluginContextValue {
  plugins: PluginSystem;
  getPlugin: (id: string) => any;
  isPluginEnabled: (id: string) => boolean;
  callPluginAPI: (pluginId: string, method: string, ...args: any[]) => Promise<any>;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const plugins = useMemo(() => PluginSystem.getInstance(), []);

  const value: PluginContextValue = {
    plugins,
    getPlugin: (id) => plugins.getPlugin(id),
    isPluginEnabled: (id) => plugins.isEnabled(id),
    callPluginAPI: async (pluginId, method, ...args) => {
      const plugin = plugins.getPlugin(pluginId);
      if (!plugin?.api?.[method]) {
        throw new Error(`API method ${method} not found in plugin ${pluginId}`);
      }
      return plugin.api[method](...args);
    }
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within PluginProvider');
  }
  return context;
}
```

---

## Pontos de Extensão

### 1. Dashboard Widgets

```typescript
// Registrar widget no dashboard
hooks: {
  'dashboard:widgets': () => ({
    id: 'novo-modulo-summary',
    title: 'Resumo Novo Módulo',
    component: () => import('./widgets/SummaryWidget'),
    size: 'medium',
    order: 5
  })
}
```

### 2. Relatórios

```typescript
// Adicionar template de relatório
hooks: {
  'reports:templates': () => ({
    id: 'novo-modulo-report',
    name: 'Relatório Novo Módulo',
    generator: () => import('./reports/NovoModuloReport')
  })
}
```

### 3. Comandos de IA

```typescript
// Estender capacidades da IA
hooks: {
  'ai:commands': () => ([
    {
      trigger: /analis(ar|e) novo modulo/i,
      handler: async (context) => {
        // Lógica do comando
        return 'Análise do novo módulo...';
      }
    }
  ])
}
```

### 4. Notificações

```typescript
// Registrar tipos de notificação
hooks: {
  'notifications:types': () => ([
    {
      type: 'novo-modulo.created',
      title: 'Novo item criado',
      icon: 'Package'
    },
    {
      type: 'novo-modulo.alert',
      title: 'Alerta do módulo',
      priority: 'high'
    }
  ])
}
```

---

## Carregamento Dinâmico

```typescript
// src/lib/plugins/plugin-loader.ts
export async function loadPlugin(pluginId: string) {
  const pluginModule = await import(`./modules/${pluginId}/index.ts`);
  const plugin = pluginModule.default || pluginModule[`${pluginId}Plugin`];
  
  // Validar estrutura
  validatePlugin(plugin);
  
  // Inicializar
  if (plugin.lifecycle?.onInit) {
    await plugin.lifecycle.onInit({ pluginId });
  }
  
  return plugin;
}

export async function loadPluginComponent(
  pluginId: string, 
  componentPath: string
) {
  return import(`./modules/${pluginId}/${componentPath}`);
}
```

---

## Checklist para Novo Módulo

```
□ Criar estrutura de pastas
□ Definir tipos TypeScript
□ Implementar hook principal
□ Criar componentes base (List, Form, Card)
□ Criar página principal
□ Definir plugin com metadados
□ Configurar rotas
□ Adicionar ao menu de navegação
□ Definir permissões
□ Implementar capacidades de IA
□ Criar widget para dashboard (opcional)
□ Adicionar testes
□ Documentar API
□ Registrar no plugin registry
```

---

*Documentação de arquitetura modular gerada em: 2025-12-05*
