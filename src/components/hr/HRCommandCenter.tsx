/**
 * 👥 HR Command Center - REVOLUTIONARY MODULE
 * Central de RH Unificada com IA Avançada
 * Features: People Analytics, Turnover Prediction, Wellness AI, MLC Compliance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Brain, Heart, TrendingUp, TrendingDown, AlertTriangle,
  Award, Calendar, DollarSign, Clock, FileText, 
  Shield, Target, Activity, Zap, CheckCircle,
  UserCheck, UserX, GraduationCap, Briefcase, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/use-ai-service';

interface CrewMember {
  id: string;
  name: string;
  position: string;
  vessel: string;
  status: 'onboard' | 'onleave' | 'training' | 'available';
  fatigueScore: number;
  wellnessScore: number;
  turnoverRisk: number;
  mlcCompliance: number;
  certExpiring: number;
  contractEnd: string;
  avatar?: string;
}

interface HRMetric {
  id: string;
  title: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: React.ReactNode;
  color: string;
}

interface WellnessAlert {
  id: string;
  crewMemberId: string;
  crewName: string;
  type: 'fatigue' | 'stress' | 'health' | 'morale';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  timestamp: string;
}

interface ComplianceItem {
  id: string;
  regulation: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  score: number;
  lastAudit: string;
  nextAudit: string;
  issues: number;
}

export function HRCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [wellnessAlerts, setWellnessAlerts] = useState<WellnessAlert[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { sendMessage, isLoading } = useAIService({ module: 'hr-ai' });

  // Simulated data
  useEffect(() => {
    const mockCrew: CrewMember[] = [
      {
        id: 'crew1',
        name: 'Carlos Silva',
        position: 'Capitão',
        vessel: 'MV Atlantic Pioneer',
        status: 'onboard',
        fatigueScore: 78,
        wellnessScore: 85,
        turnoverRisk: 12,
        mlcCompliance: 98,
        certExpiring: 1,
        contractEnd: '2025-06-15'
      },
      {
        id: 'crew2',
        name: 'Maria Santos',
        position: 'Oficial de Navegação',
        vessel: 'MV Pacific Star',
        status: 'onboard',
        fatigueScore: 45,
        wellnessScore: 62,
        turnoverRisk: 35,
        mlcCompliance: 92,
        certExpiring: 3,
        contractEnd: '2025-03-20'
      },
      {
        id: 'crew3',
        name: 'João Pereira',
        position: 'Engenheiro Chefe',
        vessel: 'MV Ocean Spirit',
        status: 'training',
        fatigueScore: 92,
        wellnessScore: 88,
        turnoverRisk: 8,
        mlcCompliance: 100,
        certExpiring: 0,
        contractEnd: '2025-12-01'
      },
      {
        id: 'crew4',
        name: 'Ana Costa',
        position: 'Oficial DP',
        vessel: 'MV Atlantic Pioneer',
        status: 'onleave',
        fatigueScore: 95,
        wellnessScore: 90,
        turnoverRisk: 5,
        mlcCompliance: 96,
        certExpiring: 2,
        contractEnd: '2025-08-10'
      },
      {
        id: 'crew5',
        name: 'Roberto Lima',
        position: 'Marinheiro',
        vessel: 'MV Pacific Star',
        status: 'onboard',
        fatigueScore: 38,
        wellnessScore: 55,
        turnoverRisk: 58,
        mlcCompliance: 88,
        certExpiring: 4,
        contractEnd: '2025-02-28'
      }
    ];

    const mockAlerts: WellnessAlert[] = [
      {
        id: 'alert1',
        crewMemberId: 'crew5',
        crewName: 'Roberto Lima',
        type: 'fatigue',
        severity: 'high',
        message: 'Nível de fadiga crítico detectado. 14 horas contínuas de trabalho.',
        recommendation: 'Reduzir carga horária e garantir 10h de descanso conforme MLC 2006.',
        timestamp: new Date().toISOString()
      },
      {
        id: 'alert2',
        crewMemberId: 'crew2',
        crewName: 'Maria Santos',
        type: 'morale',
        severity: 'medium',
        message: 'Indicadores de satisfação em declínio nas últimas 2 semanas.',
        recommendation: 'Agendar conversa com RH. Verificar condições de trabalho.',
        timestamp: new Date().toISOString()
      },
      {
        id: 'alert3',
        crewMemberId: 'crew2',
        crewName: 'Maria Santos',
        type: 'stress',
        severity: 'medium',
        message: 'Padrão de estresse elevado identificado via análise de comunicações.',
        recommendation: 'Oferecer suporte psicológico. Monitorar próximos 7 dias.',
        timestamp: new Date().toISOString()
      }
    ];

    const mockCompliance: ComplianceItem[] = [
      {
        id: 'comp1',
        regulation: 'MLC 2006 - Horas de Trabalho',
        status: 'compliant',
        score: 96,
        lastAudit: '2025-01-15',
        nextAudit: '2025-04-15',
        issues: 0
      },
      {
        id: 'comp2',
        regulation: 'STCW - Certificações',
        status: 'warning',
        score: 85,
        lastAudit: '2025-01-10',
        nextAudit: '2025-03-10',
        issues: 6
      },
      {
        id: 'comp3',
        regulation: 'MLC 2006 - Bem-estar',
        status: 'compliant',
        score: 92,
        lastAudit: '2024-12-20',
        nextAudit: '2025-03-20',
        issues: 2
      },
      {
        id: 'comp4',
        regulation: 'ISM Code - Tripulação',
        status: 'compliant',
        score: 98,
        lastAudit: '2025-01-05',
        nextAudit: '2025-07-05',
        issues: 0
      }
    ];

    setCrewMembers(mockCrew);
    setWellnessAlerts(mockAlerts);
    setComplianceItems(mockCompliance);
  }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await sendMessage(
        'Analise todos os indicadores de RH da tripulação e forneça recomendações para melhorar bem-estar, reduzir turnover e garantir conformidade MLC.'
      );
      toast.success('Análise IA de RH Concluída!', {
        description: 'Recomendações disponíveis'
      });
    } catch (error) {
      toast.error('Erro na análise');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboard': return <Badge className="bg-green-500">A Bordo</Badge>;
      case 'onleave': return <Badge className="bg-blue-500">Em Licença</Badge>;
      case 'training': return <Badge className="bg-purple-500">Treinamento</Badge>;
      case 'available': return <Badge className="bg-gray-500">Disponível</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 20) return 'text-green-500';
    if (risk < 40) return 'text-amber-500';
    if (risk < 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Calculate summary metrics
  const totalCrew = crewMembers.length;
  const onboardCount = crewMembers.filter(c => c.status === 'onboard').length;
  const avgWellness = Math.round(crewMembers.reduce((acc, c) => acc + c.wellnessScore, 0) / totalCrew);
  const avgTurnoverRisk = Math.round(crewMembers.reduce((acc, c) => acc + c.turnoverRisk, 0) / totalCrew);
  const highRiskCount = crewMembers.filter(c => c.turnoverRisk > 40).length;
  const expiringCerts = crewMembers.reduce((acc, c) => acc + c.certExpiring, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            HR Command Center
            <Badge variant="default" className="bg-gradient-to-r from-violet-600 to-purple-600">
              PEOPLE AI v4.0
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de RH Unificada com IA Preditiva, Wellness AI & MLC Compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || isLoading}
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analisando...' : 'Análise IA'}
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
            <Users className="h-4 w-4 mr-2" />
            Novo Tripulante
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Tripulação Total</p>
                <p className="text-2xl font-bold">{totalCrew}</p>
                <p className="text-xs text-blue-500 mt-1">{onboardCount} a bordo</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Bem-estar Médio</p>
                <p className={`text-2xl font-bold ${getScoreColor(avgWellness)}`}>{avgWellness}%</p>
                <p className="text-xs text-green-500 mt-1">+3% vs mês anterior</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Risco Turnover</p>
                <p className={`text-2xl font-bold ${getRiskColor(avgTurnoverRisk)}`}>{avgTurnoverRisk}%</p>
                <p className="text-xs text-amber-500 mt-1">{highRiskCount} em risco alto</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingDown className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Certs Expirando</p>
                <p className="text-2xl font-bold text-red-500">{expiringCerts}</p>
                <p className="text-xs text-red-500 mt-1">Próximos 60 dias</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <FileText className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Wellness</p>
                <p className="text-2xl font-bold text-purple-500">{wellnessAlerts.length}</p>
                <p className="text-xs text-purple-500 mt-1">Requer atenção</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <AlertTriangle className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wellness IA
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            MLC Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Tripulação
              </CardTitle>
              <CardDescription>
                Monitoramento inteligente com predição de turnover e fadiga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {crewMembers.map((crew, index) => (
                      <motion.div
                        key={crew.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={crew.avatar} />
                              <AvatarFallback className="bg-primary/10">
                                {crew.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {crew.name}
                                {getStatusBadge(crew.status)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {crew.position} • {crew.vessel}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Contrato: {new Date(crew.contractEnd).toLocaleDateString('pt-BR')}
                                </span>
                                {crew.certExpiring > 0 && (
                                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                                    {crew.certExpiring} cert(s) expirando
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Fadiga</p>
                              <p className={`text-lg font-bold ${getScoreColor(crew.fatigueScore)}`}>
                                {crew.fatigueScore}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Wellness</p>
                              <p className={`text-lg font-bold ${getScoreColor(crew.wellnessScore)}`}>
                                {crew.wellnessScore}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Turnover</p>
                              <p className={`text-lg font-bold ${getRiskColor(crew.turnoverRisk)}`}>
                                {crew.turnoverRisk}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">MLC</p>
                              <p className={`text-lg font-bold ${getScoreColor(crew.mlcCompliance)}`}>
                                {crew.mlcCompliance}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Wellness AI - Alertas Inteligentes
              </CardTitle>
              <CardDescription>
                Detecção proativa de fadiga, estresse e bem-estar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessAlerts.map((alert) => (
                  <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          {alert.type === 'fatigue' && <Clock className="h-6 w-6" />}
                          {alert.type === 'stress' && <Activity className="h-6 w-6" />}
                          {alert.type === 'morale' && <Heart className="h-6 w-6" />}
                          {alert.type === 'health' && <Shield className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              {alert.crewName}
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {alert.type}
                              </Badge>
                            </h4>
                          </div>
                          <p className="text-sm mt-2">{alert.message}</p>
                          <div className="mt-3 p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Brain className="h-4 w-4 text-primary" />
                              Recomendação IA:
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.recommendation}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              Ver Perfil
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600">
                              <CheckCircle className="h-4 w-4 mr-1" /> Tomar Ação
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Conformidade MLC 2006 & STCW
              </CardTitle>
              <CardDescription>
                Status de compliance com auditoria automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {item.regulation}
                          <Badge className={
                            item.status === 'compliant' ? 'bg-green-500' :
                            item.status === 'warning' ? 'bg-amber-500' :
                            'bg-red-500'
                          }>
                            {item.status === 'compliant' ? 'Conforme' :
                             item.status === 'warning' ? 'Atenção' : 'Não Conforme'}
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Última auditoria: {new Date(item.lastAudit).toLocaleDateString('pt-BR')}</span>
                          <span>Próxima: {new Date(item.nextAudit).toLocaleDateString('pt-BR')}</span>
                          {item.issues > 0 && (
                            <Badge variant="outline" className="text-amber-500">
                              {item.issues} pendência(s)
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Score de Conformidade</span>
                            <span className={getScoreColor(item.score)}>{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências de Turnover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de Tendências</p>
                    <p className="text-sm">ML Prediction: -15% próx. trimestre</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Índice de Bem-estar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Evolução do Wellness Score</p>
                    <p className="text-sm">Tendência: +3% mensal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HRCommandCenter;
