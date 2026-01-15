/**
 * AI Decision History - PATCH 853
 * Complete history with filters by period, type, and status
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  History, 
  Search, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAIDecisionsSupabase, type AIDecisionDB } from '@/hooks/useAIDecisionsSupabase';

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export function AIDecisionHistory() {
  const { decisions, loading, provideFeedback } = useAIDecisionsSupabase();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Quick date presets
  const setQuickDateRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date()
    });
  };

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter(decision => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          decision.title.toLowerCase().includes(query) ||
          decision.description.toLowerCase().includes(query) ||
          decision.justification_reasoning.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && decision.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && decision.type !== typeFilter) return false;

      // Impact filter
      if (impactFilter !== 'all' && decision.impact !== impactFilter) return false;

      // Date filter
      if (dateRange.from && dateRange.to) {
        const decisionDate = new Date(decision.created_at);
        if (!isWithinInterval(decisionDate, { 
          start: startOfDay(dateRange.from), 
          end: endOfDay(dateRange.to) 
        })) {
          return false;
        }
      }

      return true;
    });
  }, [decisions, searchQuery, statusFilter, typeFilter, impactFilter, dateRange]);

  // Statistics for filtered results
  const stats = useMemo(() => {
    const total = filteredDecisions.length;
    const approved = filteredDecisions.filter(d => d.status === 'approved').length;
    const executed = filteredDecisions.filter(d => d.status === 'executed').length;
    const rejected = filteredDecisions.filter(d => d.status === 'rejected').length;
    const pending = filteredDecisions.filter(d => d.status === 'pending').length;
    const withFeedback = filteredDecisions.filter(d => d.feedback_was_correct !== null);
    const correct = withFeedback.filter(d => d.feedback_was_correct === true).length;
    const accuracy = withFeedback.length > 0 ? Math.round((correct / withFeedback.length) * 100) : 0;

    return { total, approved, executed, rejected, pending, accuracy };
  }, [filteredDecisions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'executed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'rolled_back': return <RotateCcw className="h-4 w-4 text-orange-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/10 text-green-400 border-green-500/30',
      executed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
      rolled_back: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovada',
      executed: 'Executada',
      rejected: 'Rejeitada',
      rolled_back: 'Revertida'
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      optimization: 'bg-purple-500/10 text-purple-400',
      correction: 'bg-red-500/10 text-red-400',
      prevention: 'bg-blue-500/10 text-blue-400',
      automation: 'bg-green-500/10 text-green-400'
    };
    const labels: Record<string, string> = {
      optimization: 'Otimização',
      correction: 'Correção',
      prevention: 'Prevenção',
      automation: 'Automação'
    };
    return (
      <Badge className={styles[type] || 'bg-gray-500/10 text-gray-400'}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getImpactBadge = (impact: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-500/10 text-red-400',
      medium: 'bg-yellow-500/10 text-yellow-400',
      low: 'bg-green-500/10 text-green-400'
    };
    return (
      <Badge variant="outline" className={styles[impact] || ''}>
        {impact === 'high' ? 'Alto' : impact === 'medium' ? 'Médio' : 'Baixo'}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Título', 'Tipo', 'Status', 'Impacto', 'Confiança', 'Feedback'];
    const rows = filteredDecisions.map(d => [
      d.id,
      format(new Date(d.created_at), 'dd/MM/yyyy HH:mm'),
      d.title,
      d.type,
      d.status,
      d.impact,
      `${d.confidence}%`,
      d.feedback_was_correct === null ? '-' : d.feedback_was_correct ? 'Correto' : 'Incorreto'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-decisions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Histórico de Decisões</h2>
            <p className="text-sm text-muted-foreground">
              {stats.total} decisões encontradas • {stats.accuracy}% precisão
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="bg-card/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.executed}</div>
            <div className="text-xs text-muted-foreground">Executadas</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejeitadas</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
            <div className="text-xs text-muted-foreground">Precisão</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar decisões..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="executed">Executada</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
                <SelectItem value="rolled_back">Revertida</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="optimization">Otimização</SelectItem>
                <SelectItem value="correction">Correção</SelectItem>
                <SelectItem value="prevention">Prevenção</SelectItem>
                <SelectItem value="automation">Automação</SelectItem>
              </SelectContent>
            </Select>

            {/* Impact Filter */}
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Impacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Impactos</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[220px] justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM', { locale: ptBR })} - {format(dateRange.to, 'dd/MM', { locale: ptBR })}
                      </>
                    ) : format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                  ) : 'Selecionar período'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex gap-2 p-2 border-b">
                  <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(7)}>7d</Button>
                  <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(30)}>30d</Button>
                  <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(90)}>90d</Button>
                  <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(365)}>1a</Button>
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || impactFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setImpactFilter('all');
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decision List */}
      <Card className="bg-card/50">
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-border">
            {filteredDecisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhuma decisão encontrada</p>
                <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
              </div>
            ) : (
              filteredDecisions.map((decision) => (
                <div key={decision.id} className="p-4 hover:bg-muted/5 transition-colors">
                  {/* Decision Header */}
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(decision.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{decision.title}</span>
                          {getTypeBadge(decision.type)}
                          {getStatusBadge(decision.status)}
                          {getImpactBadge(decision.impact)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {decision.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-mono">{decision.confidence}%</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(decision.created_at), 'dd/MM HH:mm')}
                        </div>
                      </div>
                      {decision.feedback_was_correct !== null && (
                        decision.feedback_was_correct ? (
                          <ThumbsUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-400" />
                        )
                      )}
                      {expandedId === decision.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === decision.id && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                      {/* Justification */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Justificativa</h4>
                        <p className="text-sm text-muted-foreground">{decision.justification_reasoning}</p>
                      </div>

                      {/* Evidence */}
                      {decision.justification_evidence && (decision.justification_evidence as string[]).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Evidências</h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {(decision.justification_evidence as string[]).map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risks */}
                      {decision.justification_risks && (decision.justification_risks as string[]).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            Riscos Identificados
                          </h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {(decision.justification_risks as string[]).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Criada: {format(new Date(decision.created_at), 'dd/MM/yyyy HH:mm')}</span>
                        {decision.executed_at && (
                          <span>Executada: {format(new Date(decision.executed_at), 'dd/MM/yyyy HH:mm')}</span>
                        )}
                        {decision.rolled_back_at && (
                          <span>Revertida: {format(new Date(decision.rolled_back_at), 'dd/MM/yyyy HH:mm')}</span>
                        )}
                      </div>

                      {/* Feedback */}
                      {decision.feedback_was_correct === null && decision.status === 'executed' && (
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-sm text-muted-foreground">Avalie esta decisão:</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-400 hover:bg-green-400/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              provideFeedback(decision.id, true);
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" /> Correta
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400 hover:bg-red-400/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              provideFeedback(decision.id, false);
                            }}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" /> Incorreta
                          </Button>
                        </div>
                      )}

                      {/* Feedback Notes */}
                      {decision.feedback_notes && (
                        <div className="p-3 bg-muted/10 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Notas do Feedback</h4>
                          <p className="text-sm text-muted-foreground">{decision.feedback_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
