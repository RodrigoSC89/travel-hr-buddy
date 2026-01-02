import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, Ship, Calendar, User, BarChart3, 
  CheckCircle, XCircle, Eye, Trash2, FileText,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useOVIDInspection, OVIDInspection } from '@/hooks/useOVIDInspection';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface OVIDInspectionHistoryProps {
  onSelectInspection?: (inspectionId: string) => void;
  onNewInspection?: () => void;
}

export const OVIDInspectionHistory: React.FC<OVIDInspectionHistoryProps> = ({
  onSelectInspection,
  onNewInspection,
}) => {
  const [inspections, setInspections] = useState<OVIDInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'list' | 'chart'>('list');
  const { loadHistory } = useOVIDInspection();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await loadHistory();
      setInspections(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, [loadHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">Em Andamento</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreTrend = (index: number) => {
    if (index >= inspections.length - 1) return null;
    const current = inspections[index].compliance_score;
    const previous = inspections[index + 1].compliance_score;
    
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Chart data
  const chartData = [...inspections]
    .reverse()
    .slice(-10)
    .map(insp => ({
      date: new Date(insp.inspection_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      vessel: insp.vessel_name.substring(0, 15),
      score: insp.compliance_score,
      compliant: insp.compliant_count,
      nonCompliant: insp.non_compliant_count,
    }));

  // Statistics
  const stats = {
    total: inspections.length,
    completed: inspections.filter(i => i.status === 'completed').length,
    avgScore: inspections.length > 0 
      ? Math.round(inspections.reduce((acc, i) => acc + (i.compliance_score || 0), 0) / inspections.length)
      : 0,
    bestScore: inspections.length > 0 
      ? Math.max(...inspections.map(i => i.compliance_score || 0))
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Inspeções OVID
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} inspeções registradas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('list')}
          >
            Lista
          </Button>
          <Button
            variant={selectedView === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('chart')}
          >
            Gráficos
          </Button>
          {onNewInspection && (
            <Button size="sm" onClick={onNewInspection}>
              Nova Inspeção
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>
                  {stats.avgScore}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Melhor Score</p>
                <p className="text-2xl font-bold text-green-500">{stats.bestScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view */}
      {selectedView === 'chart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução do Score de Conformidade</CardTitle>
              <CardDescription>Últimas 10 inspeções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conformidades vs Não Conformidades</CardTitle>
              <CardDescription>Comparativo por inspeção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="compliant" fill="hsl(142, 76%, 36%)" name="Conforme" />
                    <Bar dataKey="nonCompliant" fill="hsl(0, 84%, 60%)" name="Não Conforme" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando histórico...
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma inspeção registrada</p>
                {onNewInspection && (
                  <Button className="mt-4" onClick={onNewInspection}>
                    Iniciar Primeira Inspeção
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {inspections.map((insp, index) => (
                    <div
                      key={insp.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onSelectInspection?.(insp.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Ship className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{insp.vessel_name}</h4>
                              {getStatusBadge(insp.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              IMO: {insp.imo_number} | {insp.vessel_type}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {insp.inspector_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(insp.inspection_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getScoreColor(insp.compliance_score)}`}>
                              {insp.compliance_score}%
                            </span>
                            {getScoreTrend(index)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              {insp.compliant_count}
                            </span>
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="w-3 h-3" />
                              {insp.non_compliant_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
