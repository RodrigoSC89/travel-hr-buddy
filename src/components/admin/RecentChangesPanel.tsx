/**
 * Recent Changes Panel
 * Displays recent system changes and updates for transparency
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitCommit, 
  Check, 
  AlertTriangle, 
  Clock, 
  ArrowUpCircle,
  Bug,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangeEntry {
  id: string;
  type: 'feature' | 'fix' | 'refactor' | 'update' | 'security';
  module: string;
  description: string;
  status: 'production' | 'testing' | 'rollback';
  date: string;
  author?: string;
}

// Sample recent changes - in production, this would come from an API
const RECENT_CHANGES: ChangeEntry[] = [
  {
    id: '1',
    type: 'feature',
    module: 'AI Copilot',
    description: 'Adicionado suporte a entrada de voz com Web Speech API',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '2',
    type: 'update',
    module: 'Performance',
    description: 'Web Vitals monitoring com thresholds adaptativos para redes lentas',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '3',
    type: 'refactor',
    module: 'Nautilus Command Center',
    description: 'Integração do AIInsightsPanel no NOCModeLayout',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '4',
    type: 'feature',
    module: 'IA Preditiva',
    description: 'AIPredictiveAnalytics com previsões de manutenção, combustível e tripulação',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '5',
    type: 'feature',
    module: 'IA Explicável',
    description: 'AIExplainableDecision com justificativas e confiança das decisões',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '6',
    type: 'update',
    module: 'PWA',
    description: 'Manifest.json atualizado com ícones, screenshots e shortcuts',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '7',
    type: 'fix',
    module: 'TypeScript',
    description: 'Removido @ts-nocheck de operations-dashboard.tsx e TemplateEditor.tsx',
    status: 'production',
    date: '2025-12-26',
    author: 'System'
  },
  {
    id: '8',
    type: 'update',
    module: 'Vite Config',
    description: 'Compressão Brotli/Gzip, code splitting otimizado, tree shaking ativo',
    status: 'production',
    date: '2025-12-25',
    author: 'System'
  }
];

const TYPE_CONFIG: Record<ChangeEntry['type'], { icon: typeof GitCommit; color: string; label: string }> = {
  feature: { icon: Sparkles, color: 'bg-success/10 text-success', label: 'Feature' },
  fix: { icon: Bug, color: 'bg-destructive/10 text-destructive', label: 'Fix' },
  refactor: { icon: RefreshCw, color: 'bg-primary/10 text-primary', label: 'Refactor' },
  update: { icon: ArrowUpCircle, color: 'bg-accent/10 text-accent-foreground', label: 'Update' },
  security: { icon: AlertTriangle, color: 'bg-warning/10 text-warning', label: 'Security' }
};

const STATUS_CONFIG: Record<ChangeEntry['status'], { icon: typeof Check; color: string; label: string }> = {
  production: { icon: Check, color: 'bg-success/10 text-success', label: 'Produção' },
  testing: { icon: Clock, color: 'bg-warning/10 text-warning', label: 'Em Teste' },
  rollback: { icon: AlertTriangle, color: 'bg-destructive/10 text-destructive', label: 'Rollback' }
};

export function RecentChangesPanel() {
  const [filter, setFilter] = useState<'all' | ChangeEntry['type']>('all');
  
  const filteredChanges = filter === 'all' 
    ? RECENT_CHANGES 
    : RECENT_CHANGES.filter(c => c.type === filter);

  const stats = {
    total: RECENT_CHANGES.length,
    features: RECENT_CHANGES.filter(c => c.type === 'feature').length,
    fixes: RECENT_CHANGES.filter(c => c.type === 'fix').length,
    inProduction: RECENT_CHANGES.filter(c => c.status === 'production').length,
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCommit className="h-5 w-5 text-primary" />
          Alterações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <div className="text-2xl font-bold text-success">{stats.features}</div>
            <div className="text-xs text-muted-foreground">Features</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="text-2xl font-bold text-destructive">{stats.fixes}</div>
            <div className="text-xs text-muted-foreground">Fixes</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="text-2xl font-bold text-primary">{stats.inProduction}</div>
            <div className="text-xs text-muted-foreground">Em Prod</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
            <TabsTrigger value="feature" className="text-xs">Features</TabsTrigger>
            <TabsTrigger value="fix" className="text-xs">Fixes</TabsTrigger>
            <TabsTrigger value="update" className="text-xs">Updates</TabsTrigger>
            <TabsTrigger value="refactor" className="text-xs">Refactor</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredChanges.map((change) => {
                  const typeConfig = TYPE_CONFIG[change.type];
                  const statusConfig = STATUS_CONFIG[change.status];
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div 
                      key={change.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <div className={cn('p-1.5 rounded', typeConfig.color)}>
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {change.module}
                              </Badge>
                              <Badge className={cn('text-xs', statusConfig.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">{change.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{change.date}</span>
                              {change.author && (
                                <>
                                  <span>•</span>
                                  <span>{change.author}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default RecentChangesPanel;
