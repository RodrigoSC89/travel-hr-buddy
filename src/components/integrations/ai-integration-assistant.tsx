import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

interface AISuggestion {
  id: string;
  type: 'optimization' | 'security' | 'new-integration' | 'error-fix';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  actions: string[];
}

interface DiagnosticResult {
  integration: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  performance: {
    responseTime: number;
    successRate: number;
    errorRate: number;
  };
}

export const AIIntegrationAssistant: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [suggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      type: 'optimization',
      title: 'Otimizar Cache da API Supabase',
      description: 'Implementar cache inteligente pode reduzir latência em 45% e diminuir custos de requisições.',
      priority: 'medium',
      estimatedImpact: 'Redução de 45% na latência',
      actions: ['Configurar Redis Cache', 'Implementar TTL dinâmico', 'Monitorar hit rate']
    },
    {
      id: '2',
      type: 'new-integration',
      title: 'Integração Slack Recomendada',
      description: 'Baseado no seu uso de alertas, uma integração com Slack pode melhorar a comunicação da equipe.',
      priority: 'low',
      estimatedImpact: 'Melhoria na comunicação de 60%',
      actions: ['Configurar webhook Slack', 'Criar templates de mensagem', 'Definir canais por tipo']
    },
    {
      id: '3',
      type: 'security',
      title: 'Renovação de Token Automática',
      description: 'Alguns tokens expirarão em breve. Configure renovação automática para evitar interrupções.',
      priority: 'high',
      estimatedImpact: 'Prevenção de downtime',
      actions: ['Implementar refresh automático', 'Configurar alertas de expiração', 'Backup de credenciais']
    },
    {
      id: '4',
      type: 'error-fix',
      title: 'Correção WhatsApp Business',
      description: 'Detectamos falhas intermitentes na API do WhatsApp. Implementar retry com backoff exponencial.',
      priority: 'critical',
      estimatedImpact: 'Eliminar 80% dos erros',
      actions: ['Implementar retry logic', 'Configurar circuit breaker', 'Monitorar rate limits']
    }
  ]);

  const [diagnostics] = useState<DiagnosticResult[]>([
    {
      integration: 'Supabase Database',
      status: 'healthy',
      issues: [],
      recommendations: ['Considere implementar connection pooling para melhor performance'],
      performance: { responseTime: 120, successRate: 99.8, errorRate: 0.2 }
    },
    {
      integration: 'WhatsApp Business',
      status: 'warning',
      issues: ['Rate limit atingido 3x hoje', 'Token expira em 5 dias'],
      recommendations: ['Implementar queue para mensagens', 'Configurar renovação automática de token'],
      performance: { responseTime: 560, successRate: 94.5, errorRate: 5.5 }
    },
    {
      integration: 'Microsoft Outlook',
      status: 'critical',
      issues: ['Falha de autenticação', 'Endpoint deprecated'],
      recommendations: ['Atualizar para Graph API v2.0', 'Reconfigurar OAuth scope'],
      performance: { responseTime: 1200, successRate: 78.2, errorRate: 21.8 }
    }
  ]);

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/20 text-warning border-warning/30';
      case 'medium': return 'bg-primary/20 text-primary border-primary/30';
      case 'low': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4" />;
      case 'new-integration': return <Zap className="w-4 h-4" />;
      case 'error-fix': return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
    }
  };

  const runDiagnostics = async () => {
    setIsAnalyzing(true);
    // Simular análise IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Assistente IA de Integrações
                </CardTitle>
                <CardDescription>
                  Análises inteligentes e sugestões personalizadas para otimizar suas integrações
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={runDiagnostics}
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sugestões IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
            <CardDescription>
              Recomendações baseadas em análise de uso e performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 border border-border/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(suggestion.type)}
                      <div>
                        <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-success">
                      Impacto Estimado: {suggestion.estimatedImpact}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Ações Recomendadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Implementar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="w-5 h-5 text-primary" />
              Diagnóstico Inteligente
            </CardTitle>
            <CardDescription>
              Análise automática de saúde e performance das integrações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => (
                <div key={index} className="p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{diagnostic.integration}</h4>
                    <div className="flex items-center gap-2">
                      {diagnostic.status === 'healthy' && <CheckCircle className="w-4 h-4 text-success" />}
                      {diagnostic.status === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                      {diagnostic.status === 'critical' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <span className={`text-sm font-medium ${getStatusColor(diagnostic.status)}`}>
                        {diagnostic.status === 'healthy' ? 'Saudável' : 
                         diagnostic.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Tempo Resposta</p>
                      <p className="font-medium text-foreground">{diagnostic.performance.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Sucesso</p>
                      <p className="font-medium text-foreground">{diagnostic.performance.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Erro</p>
                      <p className="font-medium text-foreground">{diagnostic.performance.errorRate}%</p>
                    </div>
                  </div>
                  
                  {diagnostic.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-destructive mb-1">Problemas Detectados:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {diagnostic.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-destructive">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Recomendações IA:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {diagnostic.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-primary" />
            Ações Rápidas IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-medium">Auto-Otimizar</span>
              <span className="text-xs text-muted-foreground text-center">
                Aplica melhorias automáticas
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <span className="font-medium">Resolver Erros</span>
              <span className="text-xs text-muted-foreground text-center">
                Corrige problemas comuns
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="w-6 h-6 text-success" />
              <span className="font-medium">Melhorar Performance</span>
              <span className="text-xs text-muted-foreground text-center">
                Otimiza velocidade e estabilidade
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Lightbulb className="w-6 h-6 text-accent" />
              <span className="font-medium">Sugerir Integrações</span>
              <span className="text-xs text-muted-foreground text-center">
                Recomenda novas conexões
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};