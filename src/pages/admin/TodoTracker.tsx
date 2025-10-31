/**
 * TODO/FIXME Tracker Dashboard
 * PATCH 545 - Technical Debt Visualization
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle,
  CheckCircle2,
  Code,
  FileText,
  Filter,
  Search,
  Wrench
} from 'lucide-react';

interface TodoItem {
  file: string;
  line: number;
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX';
  category: 'feature' | 'integration' | 'validation' | 'style' | 'refactor';
  message: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function TodoTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mapped from code analysis (537 TODOs found)
  const todosByModule = [
    {
      module: 'AI Services',
      count: 97,
      files: 12,
      priority: 'high',
      items: [
        {
          file: 'src/ai/services/checklistAutoFill.ts',
          line: 90,
          type: 'TODO' as const,
          category: 'integration' as const,
          message: 'Implementar quando tabela checklist_completions existir',
          module: 'AI Services',
          priority: 'high' as const
        },
        {
          file: 'src/ai/services/incidentAnalyzer.ts',
          line: 189,
          type: 'TODO' as const,
          category: 'integration' as const,
          message: 'Implementar quando tabela dp_incidents existir',
          module: 'AI Services',
          priority: 'high' as const
        },
        {
          file: 'src/ai/services/logsAnalyzer.ts',
          line: 66,
          type: 'TODO' as const,
          category: 'integration' as const,
          message: 'Fetch logs from database when system_logs table exists',
          module: 'AI Services',
          priority: 'high' as const
        }
      ]
    },
    {
      module: 'Admin Components',
      count: 156,
      files: 28,
      priority: 'medium',
      items: [
        {
          file: 'src/components/admin/organization-stats-cards.tsx',
          line: 16,
          type: 'TODO' as const,
          category: 'integration' as const,
          message: 'buscar dados reais',
          module: 'Admin Components',
          priority: 'medium' as const
        }
      ]
    },
    {
      module: 'AI Features',
      count: 89,
      files: 15,
      priority: 'medium',
      items: [
        {
          file: 'src/components/ai/advanced-ai-insights.tsx',
          line: 175,
          type: 'TODO' as const,
          category: 'feature' as const,
          message: 'Open implementation workflow dialog',
          module: 'AI Features',
          priority: 'medium' as const
        },
        {
          file: 'src/components/ai/integrated-ai-assistant.tsx',
          line: 437,
          type: 'TODO' as const,
          category: 'feature' as const,
          message: 'Implement settings dialog with model selection, temperature, etc.',
          module: 'AI Features',
          priority: 'medium' as const
        }
      ]
    },
    {
      module: 'Validation Components',
      count: 195,
      files: 42,
      priority: 'low',
      items: []
    }
  ];

  const totalTodos = todosByModule.reduce((sum, m) => sum + m.count, 0);
  const highPriority = todosByModule.filter(m => m.priority === 'high').reduce((sum, m) => sum + m.count, 0);
  const mediumPriority = todosByModule.filter(m => m.priority === 'medium').reduce((sum, m) => sum + m.count, 0);

  const categories = [
    { id: 'all', name: 'Todos', count: totalTodos },
    { id: 'feature', name: 'Features', count: 156 },
    { id: 'integration', name: 'Integrations', count: 186 },
    { id: 'validation', name: 'Validation', count: 195 },
    { id: 'refactor', name: 'Refactor', count: 0 }
  ];

  const filteredModules = todosByModule.filter(m => 
    m.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="h-8 w-8" />
            TODO & Technical Debt Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            PATCH 545 - Mapeamento de TODOs, FIXMEs e dívida técnica
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total TODOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTodos}</div>
            <p className="text-xs text-muted-foreground">Across 97+ files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highPriority}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Medium Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{mediumPriority}</div>
            <p className="text-xs text-muted-foreground">Plan for sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Modules Affected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todosByModule.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
                <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TODOs by Module */}
      <Card>
        <CardHeader>
          <CardTitle>TODOs by Module</CardTitle>
          <CardDescription>
            Technical debt grouped by module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredModules.map((module, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        <CardTitle className="text-lg">{module.module}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            module.priority === 'high' ? 'destructive' :
                            module.priority === 'medium' ? 'secondary' : 'outline'
                          }
                        >
                          {module.priority}
                        </Badge>
                        <Badge variant="outline">{module.count} TODOs</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {module.files} files affected
                    </p>
                  </CardHeader>
                  <CardContent>
                    {module.items.length > 0 && (
                      <div className="space-y-2">
                        {module.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="p-3 border rounded-lg bg-muted/30"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <code className="text-xs font-mono">{item.file}</code>
                              <Badge variant="outline" className="text-xs">
                                Line {item.line}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={item.type !== 'TODO' ? 'destructive' : 'secondary'}>
                                {item.type}
                              </Badge>
                              <Badge variant="outline">{item.category}</Badge>
                              <p className="text-sm flex-1">{item.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">High Priority (97 items)</p>
              <p className="text-sm text-muted-foreground">
                AI Services integration TODOs - Requires Supabase tables creation
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Create Sprint
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Medium Priority (245 items)</p>
              <p className="text-sm text-muted-foreground">
                Feature implementations and UI refinements
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Plan Sprint
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Documentation (195 items)</p>
              <p className="text-sm text-muted-foreground">
                Validation and documentation TODOs
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
