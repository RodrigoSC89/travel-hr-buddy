import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Gauge, 
  Zap, 
  Database, 
  Network, 
  Clock, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target: number;
  lastUpdated: Date;
}

interface OptimizationAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  category: 'database' | 'api' | 'ui' | 'cache';
  estimatedImprovement: string;
}

export const PerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationAction[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const { toast } = useToast();

  // Simular métricas de performance em tempo real
  useEffect(() => {
    const mockMetrics: PerformanceMetric[] = [
      {
        id: 'page_load',
        name: 'Carregamento de Página',
        value: 1.2,
        unit: 's',
        status: 'good',
        target: 1.0,
        lastUpdated: new Date()
      },
      {
        id: 'api_response',
        name: 'Resposta da API',
        value: 350,
        unit: 'ms',
        status: 'good',
        target: 300,
        lastUpdated: new Date()
      },
      {
        id: 'db_query',
        name: 'Consultas do Banco',
        value: 85,
        unit: 'ms',
        status: 'excellent',
        target: 100,
        lastUpdated: new Date()
      },
      {
        id: 'memory_usage',
        name: 'Uso de Memória',
        value: 68,
        unit: '%',
        status: 'warning',
        target: 70,
        lastUpdated: new Date()
      },
      {
        id: 'cache_hit',
        name: 'Taxa de Cache Hit',
        value: 92,
        unit: '%',
        status: 'excellent',
        target: 85,
        lastUpdated: new Date()
      }
    ];

    const mockOptimizations: OptimizationAction[] = [
      {
        id: 'lazy_loading',
        title: 'Implementar Lazy Loading',
        description: 'Carregar componentes sob demanda para reduzir tempo inicial',
        impact: 'high',
        effort: 'easy',
        category: 'ui',
        estimatedImprovement: '35% mais rápido'
      },
      {
        id: 'query_optimization',
        title: 'Otimizar Consultas SQL',
        description: 'Adicionar índices e otimizar queries mais lentas',
        impact: 'high',
        effort: 'moderate',
        category: 'database',
        estimatedImprovement: '50% menos latência'
      },
      {
        id: 'api_caching',
        title: 'Cache Inteligente de API',
        description: 'Implementar cache adaptativo baseado em padrões de uso',
        impact: 'medium',
        effort: 'moderate',
        category: 'cache',
        estimatedImprovement: '40% menos requisições'
      },
      {
        id: 'bundle_splitting',
        title: 'Code Splitting Avançado',
        description: 'Dividir código em chunks menores e mais eficientes',
        impact: 'medium',
        effort: 'complex',
        category: 'ui',
        estimatedImprovement: '25% menos bundle'
      }
    ];

    setMetrics(mockMetrics);
    setOptimizations(mockOptimizations);

    // Calcular score geral
    const score = mockMetrics.reduce((acc, metric) => {
      const scoreMap = { excellent: 100, good: 80, warning: 60, critical: 30 };
      return acc + scoreMap[metric.status];
    }, 0) / mockMetrics.length;
    
    setOverallScore(score);
  }, []);

  const executeOptimization = useCallback(async (optimization: OptimizationAction) => {
    setIsOptimizing(true);
    
    toast({
      title: "Otimização Iniciada",
      description: `Executando: ${optimization.title}`,
    });

    // Simular execução da otimização
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Otimização Concluída",
      description: `${optimization.title} foi aplicada com sucesso!`,
    });

    setIsOptimizing(false);
  }, [toast]);

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'text-success',
      good: 'text-info',
      warning: 'text-warning',
      critical: 'text-danger'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'good':
        return <TrendingUp className="h-4 w-4 text-info" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'bg-danger',
      medium: 'bg-warning', 
      low: 'bg-info'
    };
    return colors[impact] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Performance Score Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {Math.round(overallScore)}
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {overallScore >= 90 ? 'Excelente' : overallScore >= 70 ? 'Bom' : 'Precisa Melhoria'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="glass-effect hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metric.value}{metric.unit}
              </div>
              <div className="text-sm text-muted-foreground">
                Meta: {metric.target}{metric.unit}
              </div>
              <Progress 
                value={(metric.target - metric.value) / metric.target * 100} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações de Otimização */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Otimizações Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((optimization) => (
              <div key={optimization.id} className="border rounded-lg p-4 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{optimization.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {optimization.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      className={getImpactColor(optimization.impact)}
                    >
                      {optimization.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      {optimization.effort}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {optimization.category === 'database' && <Database className="h-4 w-4" />}
                      {optimization.category === 'api' && <Network className="h-4 w-4" />}
                      {optimization.category === 'ui' && <BarChart3 className="h-4 w-4" />}
                      {optimization.category === 'cache' && <Clock className="h-4 w-4" />}
                      <span className="text-sm capitalize">{optimization.category}</span>
                    </div>
                    <span className="text-sm font-medium text-success">
                      {optimization.estimatedImprovement}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => executeOptimization(optimization)}
                    disabled={isOptimizing}
                    className="hover-glow"
                  >
                    {isOptimizing ? 'Otimizando...' : 'Aplicar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};