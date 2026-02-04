/**
 * Enhanced Compliance Center with Premium UX
 * PATCH COMPLIANCE-3.0 - Ultimate Compliance Experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, ClipboardCheck, AlertTriangle, CheckCircle, Clock,
  FileText, Award, Users, Ship, Calendar, Brain, RefreshCw,
  Plus, Download, Eye, Edit, Target, TrendingUp, Building2,
  BookOpen, Anchor, CheckSquare, XCircle, Timer, Sparkles,
  FileCheck, ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModuleOnboarding, QuickActionsBar, InteractiveKPICard, ActionableAlertList } from '@/components/ui/module-enhancements';

const ComplianceHubEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showNewAudit, setShowNewAudit] = useState(false);
  const [showNewNC, setShowNewNC] = useState(false);

  // Onboarding steps
  const onboardingSteps = [
    {
      title: 'Centro de Compliance Marítimo',
      description: 'Gerencie conformidade com ISM, ISPS, MLC, SOLAS, MARPOL e STCW em um dashboard unificado.',
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      tip: 'O score geral é calculado automaticamente com base em todas as regulamentações'
    },
    {
      title: 'Auditorias e Checklists',
      description: 'Execute auditorias internas com checklists digitais e assinatura eletrônica.',
      icon: <ClipboardCheck className="h-6 w-6 text-green-500" />,
      tip: 'Use os templates pré-configurados para auditorias padrão'
    },
    {
      title: 'Gestão de Certificados',
      description: 'Monitore vencimentos de certificados com alertas automáticos 90, 60 e 30 dias antes.',
      icon: <Award className="h-6 w-6 text-yellow-500" />,
      tip: 'Configure renovações automáticas para documentos recorrentes'
    },
    {
      title: 'Não Conformidades',
      description: 'Registre e acompanhe tratativas com workflow de aprovação e evidências.',
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      tip: 'NCs críticas geram alertas imediatos para toda a cadeia de comando'
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 'new-audit',
      label: 'Nova Auditoria',
      icon: <ClipboardCheck className="h-4 w-4" />,
      onClick: () => setShowNewAudit(true),
      variant: 'default' as const
    },
    {
      id: 'new-nc',
      label: 'Registrar NC',
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: () => setShowNewNC(true),
      badge: 4
    },
    {
      id: 'expiring-certs',
      label: 'Certificados Vencendo',
      icon: <Award className="h-4 w-4" />,
      onClick: () => setActiveTab('certificates'),
      badge: 3
    },
    {
      id: 'export-report',
      label: 'Exportar Relatório',
      icon: <Download className="h-4 w-4" />,
      onClick: () => toast.success('Relatório de compliance exportado!')
    },
    {
      id: 'ai-risk',
      label: 'Análise de Risco IA',
      icon: <Brain className="h-4 w-4" />,
      onClick: () => toast.info('Análise de risco iniciada...'),
      variant: 'secondary' as const
    }
  ];

  // Alerts
  const [alerts] = useState([
    {
      id: '1',
      title: 'Certificado ISSC Expirado',
      message: 'O certificado ISSC do MV Pacific Explorer expirou há 15 dias. Regularização urgente necessária.',
      severity: 'critical' as const,
      timestamp: new Date(),
      source: 'Certificados',
      actions: [
        { label: 'Iniciar Renovação', onClick: () => toast.success('Processo de renovação iniciado') }
      ]
    },
    {
      id: '2',
      title: 'Auditoria SOLAS Atrasada',
      message: 'A auditoria SOLAS do MV Caribbean Queen está 2 dias atrasada. Prioridade crítica.',
      severity: 'critical' as const,
      timestamp: new Date(),
      source: 'Auditorias',
      actions: [
        { label: 'Continuar Auditoria', onClick: () => setActiveTab('audits') }
      ]
    },
    {
      id: '3',
      title: 'DOC Vencendo em 45 Dias',
      message: 'O Document of Compliance da empresa vence em 45 dias. Agende renovação.',
      severity: 'warning' as const,
      timestamp: addDays(new Date(), -1),
      source: 'Certificados',
      actions: [
        { label: 'Agendar Renovação', onClick: () => toast.success('Renovação agendada'), variant: 'outline' as const }
      ]
    }
  ]);

  // Compliance Scores
  const complianceScores = [
    { category: 'ISM Code', score: 92, items: 45, issues: 2, status: 'compliant' },
    { category: 'ISPS Code', score: 88, items: 32, issues: 3, status: 'compliant' },
    { category: 'MLC 2006', score: 95, items: 28, issues: 1, status: 'compliant' },
    { category: 'SOLAS', score: 78, items: 56, issues: 8, status: 'attention' },
    { category: 'MARPOL', score: 85, items: 38, issues: 4, status: 'compliant' },
    { category: 'STCW', score: 91, items: 24, issues: 2, status: 'compliant' },
  ];

  const getOverallScore = () => {
    const total = complianceScores.reduce((acc, c) => acc + c.score, 0);
    return Math.round(total / complianceScores.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Onboarding */}
      <ModuleOnboarding
        moduleId="compliance-hub"
        moduleName="Centro de Compliance"
        steps={onboardingSteps}
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20">
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro de Compliance</h1>
            <p className="text-muted-foreground">Gestão de conformidade regulatória marítima</p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Score: {getOverallScore()}%
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowNewAudit(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <QuickActionsBar actions={quickActions} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <ActionableAlertList 
          alerts={alerts}
          onDismiss={(id) => toast.info('Alerta removido')}
          maxVisible={3}
        />
      )}

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-muted-foreground">Score Geral de Compliance</h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-primary">{getOverallScore()}%</span>
                  <Badge className="bg-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3% vs mês anterior
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{complianceScores.filter(c => c.status === 'compliant').length}</p>
                  <p className="text-sm text-muted-foreground">Conformes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{complianceScores.filter(c => c.status === 'attention').length}</p>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">4</p>
                  <p className="text-sm text-muted-foreground">NCs Abertas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">3</p>
                  <p className="text-sm text-muted-foreground">Auditorias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {complianceScores.map((cat, index) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-sm mb-2">{cat.category}</h3>
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                      strokeDasharray={`${(cat.score / 100) * 176} 176`}
                      className={cat.status === 'compliant' ? 'text-green-500' : cat.status === 'attention' ? 'text-yellow-500' : 'text-red-500'}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {cat.score}%
                  </span>
                </div>
                <Badge variant="outline" className={cat.status === 'compliant' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                  {cat.issues} pendências
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificados
            <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="nc" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
            <Badge variant="destructive" className="ml-1">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Prazos Próximos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { title: 'Auditoria ISM - MV Atlantic Star', date: addDays(new Date(), 7), type: 'audit', priority: 'high' },
                      { title: 'Renovação DOC', date: addDays(new Date(), 45), type: 'certificate', priority: 'medium' },
                      { title: 'Inspeção ISPS - MV Pacific', date: addDays(new Date(), 14), type: 'audit', priority: 'medium' },
                      { title: 'Verificação MLC', date: addDays(new Date(), 21), type: 'audit', priority: 'low' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {item.type === 'audit' ? <ClipboardCheck className="h-4 w-4 text-blue-500" /> : <Award className="h-4 w-4 text-yellow-500" />}
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(item.date, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          item.priority === 'high' ? 'destructive' : 
                          item.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {differenceInDays(item.date, new Date())} dias
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { action: 'Auditoria ISM concluída', user: 'Carlos Silva', vessel: 'MV Ocean Titan', status: 'success' },
                      { action: 'NC registrada - SOLAS', user: 'Maria Santos', vessel: 'MV Atlantic Star', status: 'warning' },
                      { action: 'Certificado SMC renovado', user: 'Sistema', vessel: 'MV Pacific Explorer', status: 'info' },
                      { action: 'Checklist diário preenchido', user: 'João Oliveira', vessel: 'MV Caribbean Queen', status: 'success' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div className={`p-2 rounded-lg ${
                          item.status === 'success' ? 'bg-green-500/10' :
                          item.status === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                        }`}>
                          {item.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                           item.status === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                           <Clock className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.user} • {item.vessel}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Auditorias</CardTitle>
                <CardDescription>Auditorias internas e externas</CardDescription>
              </div>
              <Button onClick={() => setShowNewAudit(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Auditoria
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: '1', title: 'Auditoria Interna ISM', vessel: 'MV Atlantic Star', progress: 65, status: 'in_progress', priority: 'high', dueDate: addDays(new Date(), 7) },
                  { id: '2', title: 'Inspeção ISPS', vessel: 'MV Pacific Explorer', progress: 30, status: 'in_progress', priority: 'medium', dueDate: addDays(new Date(), 14) },
                  { id: '3', title: 'Verificação MLC', vessel: 'MV Ocean Titan', progress: 100, status: 'completed', priority: 'low', dueDate: addDays(new Date(), -3) },
                  { id: '4', title: 'Auditoria SOLAS', vessel: 'MV Caribbean Queen', progress: 45, status: 'overdue', priority: 'critical', dueDate: addDays(new Date(), -2) },
                ].map((audit) => (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        audit.status === 'completed' ? 'bg-green-500/10' :
                        audit.status === 'overdue' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        <ClipboardCheck className={`h-5 w-5 ${
                          audit.status === 'completed' ? 'text-green-500' :
                          audit.status === 'overdue' ? 'text-red-500' : 'text-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{audit.title}</p>
                          <Badge variant={
                            audit.priority === 'critical' ? 'destructive' :
                            audit.priority === 'high' ? 'secondary' : 'outline'
                          }>
                            {audit.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{audit.vessel}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={audit.progress} className="w-32 h-2" />
                          <span className="text-xs text-muted-foreground">{audit.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={
                          audit.status === 'completed' ? 'default' :
                          audit.status === 'overdue' ? 'destructive' : 'secondary'
                        }>
                          {audit.status === 'completed' ? 'Concluída' :
                           audit.status === 'overdue' ? 'Atrasada' : 'Em Andamento'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(audit.dueDate, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Certificados</CardTitle>
              <CardDescription>Monitoramento de certificados e documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'DOC - Document of Compliance', type: 'company', entity: 'Maritime Co.', expiry: addDays(new Date(), 45), status: 'expiring' },
                  { name: 'SMC - Safety Management Certificate', type: 'vessel', entity: 'MV Atlantic Star', expiry: addDays(new Date(), 180), status: 'valid' },
                  { name: 'ISSC - International Ship Security', type: 'vessel', entity: 'MV Pacific Explorer', expiry: addDays(new Date(), -15), status: 'expired' },
                  { name: 'COC - Certificate of Competency', type: 'crew', entity: 'Cap. Roberto Mendes', expiry: addDays(new Date(), 365), status: 'valid' },
                ].map((cert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      cert.status === 'expired' ? 'border-red-500/50 bg-red-500/5' :
                      cert.status === 'expiring' ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        cert.type === 'vessel' ? 'bg-blue-500/10' :
                        cert.type === 'crew' ? 'bg-purple-500/10' : 'bg-green-500/10'
                      }`}>
                        {cert.type === 'vessel' ? <Ship className="h-5 w-5 text-blue-500" /> :
                         cert.type === 'crew' ? <Users className="h-5 w-5 text-purple-500" /> :
                         <Building2 className="h-5 w-5 text-green-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">{cert.entity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">Vencimento: {format(cert.expiry, "dd/MM/yyyy")}</p>
                        <Badge variant={
                          cert.status === 'expired' ? 'destructive' :
                          cert.status === 'expiring' ? 'secondary' : 'default'
                        }>
                          {cert.status === 'expired' ? 'Expirado' :
                           cert.status === 'expiring' ? 'Vencendo' : 'Válido'}
                        </Badge>
                      </div>
                      {(cert.status === 'expired' || cert.status === 'expiring') && (
                        <Button size="sm">Renovar</Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nc">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Não Conformidades</CardTitle>
                <CardDescription>Registro e tratamento de não conformidades</CardDescription>
              </div>
              <Button onClick={() => setShowNewNC(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar NC
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Equipamento de combate a incêndio com manutenção atrasada', category: 'SOLAS', severity: 'major', vessel: 'MV Atlantic Star', status: 'in_progress' },
                  { title: 'Documentação de segurança incompleta', category: 'ISPS', severity: 'minor', vessel: 'MV Pacific Explorer', status: 'open' },
                  { title: 'Registro de horas de trabalho não atualizado', category: 'MLC', severity: 'major', vessel: 'MV Ocean Titan', status: 'overdue' },
                  { title: 'Calibração de equipamentos GMDSS', category: 'SOLAS', severity: 'critical', vessel: 'MV Caribbean Queen', status: 'in_progress' },
                ].map((nc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        nc.severity === 'critical' ? 'bg-red-500' :
                        nc.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{nc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{nc.category}</Badge>
                          <span className="text-sm text-muted-foreground">{nc.vessel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        nc.status === 'overdue' ? 'destructive' :
                        nc.status === 'open' ? 'secondary' : 'default'
                      }>
                        {nc.status === 'overdue' ? 'Atrasada' :
                         nc.status === 'open' ? 'Aberta' : 'Em Tratamento'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Checklists de Auditoria
              </CardTitle>
              <CardDescription>Templates e execuções de checklists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Checklist ISM - Segurança', items: 45, completed: 38, category: 'ISM' },
                  { name: 'Checklist ISPS - Proteção', items: 32, completed: 32, category: 'ISPS' },
                  { name: 'Checklist MLC - Tripulação', items: 28, completed: 25, category: 'MLC' },
                  { name: 'Checklist SOLAS - Equipamentos', items: 56, completed: 42, category: 'SOLAS' },
                  { name: 'Checklist MARPOL - Ambiental', items: 38, completed: 38, category: 'MARPOL' },
                  { name: 'Checklist STCW - Certificações', items: 24, completed: 20, category: 'STCW' },
                ].map((checklist, i) => (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge>{checklist.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {checklist.completed}/{checklist.items}
                        </span>
                      </div>
                      <h4 className="font-medium mb-2">{checklist.name}</h4>
                      <Progress value={(checklist.completed / checklist.items) * 100} className="h-2" />
                      <div className="flex justify-between mt-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm">
                          Continuar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Audit Dialog */}
      <Dialog open={showNewAudit} onOpenChange={setShowNewAudit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Auditoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Auditoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ism">ISM Code</SelectItem>
                  <SelectItem value="isps">ISPS Code</SelectItem>
                  <SelectItem value="mlc">MLC 2006</SelectItem>
                  <SelectItem value="solas">SOLAS</SelectItem>
                  <SelectItem value="marpol">MARPOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Embarcação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atlantic">MV Atlantic Star</SelectItem>
                  <SelectItem value="pacific">MV Pacific Explorer</SelectItem>
                  <SelectItem value="ocean">MV Ocean Titan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Prevista</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre a auditoria" />
            </div>
            <Button className="w-full" onClick={() => {
              toast.success('Auditoria criada com sucesso!');
              setShowNewAudit(false);
            }}>
              Criar Auditoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New NC Dialog */}
      <Dialog open={showNewNC} onOpenChange={setShowNewNC}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Não Conformidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input placeholder="Descrição da não conformidade" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ism">ISM</SelectItem>
                    <SelectItem value="isps">ISPS</SelectItem>
                    <SelectItem value="solas">SOLAS</SelectItem>
                    <SelectItem value="marpol">MARPOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Menor</SelectItem>
                    <SelectItem value="major">Maior</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Embarcação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atlantic">MV Atlantic Star</SelectItem>
                  <SelectItem value="pacific">MV Pacific Explorer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Detalhes</Label>
              <Textarea placeholder="Descreva a não conformidade em detalhes" />
            </div>
            <Button className="w-full" onClick={() => {
              toast.success('NC registrada com sucesso!');
              setShowNewNC(false);
            }}>
              Registrar NC
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceHubEnhanced;
