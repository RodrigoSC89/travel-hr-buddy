/**
 * AuditWorkflowManager - Gerenciador de fluxo de auditorias
 * Scorecards dinâmicos para ISM, ISPS, MLC e todas 12 auditorias marítimas
 */
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AUDIT_FRAMEWORKS = [
  { id: 'ism', label: 'ISM Code', elements: 13 },
  { id: 'isps', label: 'ISPS Code', elements: 19 },
  { id: 'mlc', label: 'MLC 2006', elements: 14 },
  { id: 'solas', label: 'SOLAS', elements: 12 },
  { id: 'marpol', label: 'MARPOL', elements: 6 },
  { id: 'peo-dp', label: 'PEO-DP', elements: 15 },
  { id: 'peotram', label: 'PEOTRAM', elements: 13 },
  { id: 'sgso', label: 'SGSO (ANP)', elements: 17 },
  { id: 'psc', label: 'PSC', elements: 10 },
  { id: 'ovid', label: 'OVID/OCIMF', elements: 13 },
  { id: 'sire', label: 'SIRE 2.0', elements: 12 },
  { id: 'tmsa', label: 'TMSA', elements: 13 },
];

interface AuditRecord {
  id: string;
  audit_number: string;
  audit_type: string;
  status: string;
  created_at: string;
  vessel_id: string | null;
}

export function AuditWorkflowManager() {
  const queryClient = useQueryClient();
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audit-workflow-manager'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_audits')
        .select('id, audit_number, audit_type, status, created_at, vessel_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as AuditRecord[];
    },
    staleTime: 30000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['audit-workflow-manager'] });
    toast.success('Dados de workflow atualizados');
  };

  const metrics = useMemo(() => {
    const filtered = selectedFramework === 'all' 
      ? audits 
      : audits.filter(a => a.audit_type?.toLowerCase().includes(selectedFramework));
    
    return {
      total: filtered.length,
      planned: filtered.filter(a => a.status === 'planned').length,
      inProgress: filtered.filter(a => a.status === 'in_progress' || a.status === 'open').length,
      completed: filtered.filter(a => a.status === 'completed' || a.status === 'closed').length,
      overdue: filtered.filter(a => a.status === 'overdue').length,
    };
  }, [audits, selectedFramework]);

  const completionRate = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Audit Workflow Manager</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Frameworks</SelectItem>
              {AUDIT_FRAMEWORKS.map(fw => (
                <SelectItem key={fw.id} value={fw.id}>{fw.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Em Andamento</span>
            </div>
            <div className="text-2xl font-bold text-warning">{metrics.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Concluídas</span>
            </div>
            <div className="text-2xl font-bold text-success">{metrics.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Atrasadas</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{metrics.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Taxa de Conclusão</CardTitle>
          <CardDescription>{completionRate}% das auditorias concluídas</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Framework Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUDIT_FRAMEWORKS.map(fw => {
          const fwAudits = audits.filter(a => 
            a.audit_type?.toLowerCase().includes(fw.id)
          );
          const fwCompleted = fwAudits.filter(a => a.status === 'completed' || a.status === 'closed').length;
          const fwRate = fwAudits.length > 0 ? Math.round((fwCompleted / fwAudits.length) * 100) : 0;
          
          return (
            <Card key={fw.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{fw.label}</h4>
                    <p className="text-xs text-muted-foreground">{fw.elements} elementos</p>
                  </div>
                  <Badge variant={fwRate >= 80 ? 'default' : fwRate >= 50 ? 'secondary' : 'outline'} className="text-xs">
                    {fwRate}%
                  </Badge>
                </div>
                <Progress value={fwRate} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{fwAudits.length} auditorias</span>
                  <span>{fwCompleted} concluídas</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Audits List */}
      {audits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auditorias Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {audits.slice(0, 10).map(audit => (
                <div key={audit.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{audit.audit_number}</span>
                      <span className="text-xs text-muted-foreground ml-2">{audit.audit_type}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      audit.status === 'completed' || audit.status === 'closed' ? 'text-success border-success/30' :
                      audit.status === 'in_progress' || audit.status === 'open' ? 'text-warning border-warning/30' :
                      'text-muted-foreground'
                    )}
                  >
                    {audit.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.total === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma auditoria registrada.</p>
          <p className="text-xs mt-1">Crie uma nova auditoria para começar o workflow.</p>
        </div>
      )}
    </div>
  );
}

export default AuditWorkflowManager;
