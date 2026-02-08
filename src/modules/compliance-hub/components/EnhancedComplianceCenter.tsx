/**
 * Enhanced Compliance Center - Compliance & Audits Premium Experience
 * PATCH COMPLIANCE-2.0 - Complete compliance management with AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, ClipboardCheck, AlertTriangle, CheckCircle, Clock,
  FileText, Award, Users, Ship, Calendar, Brain, RefreshCw,
  Plus, Download, Filter, Search, Eye, Edit, Trash2, 
  ChevronRight, Target, TrendingUp, AlertCircle, BookOpen, 
  Anchor, CheckSquare, XCircle, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface ComplianceScore {
  category: string;
  score: number;
  maxScore: number;
  status: 'compliant' | 'attention' | 'non_compliant';
  items: number;
  issues: number;
}

interface AuditChecklist {
  id: string;
  title: string;
  category: string;
  vesselName?: string;
  dueDate: Date;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface CertificateStatus {
  id: string;
  name: string;
  type: 'vessel' | 'crew' | 'company';
  vesselOrCrew: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expiring_soon' | 'expired';
  issuingAuthority: string;
}

interface NonConformity {
  id: string;
  title: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  vessel: string;
  detectedDate: Date;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'closed' | 'overdue';
  assignedTo: string;
}

interface ChecklistItem {
  id: string;
  question: string;
  category: string;
  required: boolean;
  completed: boolean;
  notes: string;
  evidence?: string;
}

export const EnhancedComplianceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);

  // Data States
  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);
  const [audits, setAudits] = useState<AuditChecklist[]>([]);
  const [certificates, setCertificates] = useState<CertificateStatus[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Compliance Scores
      setComplianceScores([
        { category: 'ISM Code', score: 92, maxScore: 100, status: 'compliant', items: 45, issues: 2 },
        { category: 'ISPS Code', score: 88, maxScore: 100, status: 'compliant', items: 32, issues: 3 },
        { category: 'MLC 2006', score: 95, maxScore: 100, status: 'compliant', items: 28, issues: 1 },
        { category: 'SOLAS', score: 78, maxScore: 100, status: 'attention', items: 56, issues: 8 },
        { category: 'MARPOL', score: 85, maxScore: 100, status: 'compliant', items: 38, issues: 4 },
        { category: 'STCW', score: 91, maxScore: 100, status: 'compliant', items: 24, issues: 2 },
      ]);

      // Audits
      setAudits([
        {
          id: '1',
          title: 'Auditoria Interna ISM',
          category: 'ISM',
          vesselName: 'MV Atlantic Star',
          dueDate: addDays(new Date(), 7),
          progress: 65,
          status: 'in_progress',
          assignedTo: 'Carlos Silva',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Inspeção ISPS',
          category: 'ISPS',
          vesselName: 'MV Pacific Explorer',
          dueDate: addDays(new Date(), 14),
          progress: 30,
          status: 'in_progress',
          assignedTo: 'Maria Santos',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Verificação MLC',
          category: 'MLC',
          vesselName: 'MV Ocean Titan',
          dueDate: addDays(new Date(), -3),
          progress: 100,
          status: 'completed',
          assignedTo: 'João Oliveira',
          priority: 'low'
        },
        {
          id: '4',
          title: 'Auditoria SOLAS',
          category: 'SOLAS',
          vesselName: 'MV Caribbean Queen',
          dueDate: addDays(new Date(), -2),
          progress: 45,
          status: 'overdue',
          assignedTo: 'Ana Costa',
          priority: 'critical'
        }
      ]);

      // Certificates
      setCertificates([
        {
          id: '1',
          name: 'DOC - Document of Compliance',
          type: 'company',
          vesselOrCrew: 'Maritime Co.',
          issueDate: new Date('2023-01-15'),
          expiryDate: addDays(new Date(), 45),
          status: 'expiring_soon',
          issuingAuthority: 'Marinha do Brasil'
        },
        {
          id: '2',
          name: 'SMC - Safety Management Certificate',
          type: 'vessel',
          vesselOrCrew: 'MV Atlantic Star',
          issueDate: new Date('2022-06-20'),
          expiryDate: addDays(new Date(), 180),
          status: 'valid',
          issuingAuthority: 'ClassNK'
        },
        {
          id: '3',
          name: 'ISSC - International Ship Security Certificate',
          type: 'vessel',
          vesselOrCrew: 'MV Pacific Explorer',
          issueDate: new Date('2021-03-10'),
          expiryDate: addDays(new Date(), -15),
          status: 'expired',
          issuingAuthority: 'Lloyd\'s Register'
        },
        {
          id: '4',
          name: 'COC - Certificate of Competency',
          type: 'crew',
          vesselOrCrew: 'Cap. Roberto Mendes',
          issueDate: new Date('2020-08-01'),
          expiryDate: addDays(new Date(), 365),
          status: 'valid',
          issuingAuthority: 'DPC'
        }
      ]);

      // Non-Conformities
      setNonConformities([
        {
          id: '1',
          title: 'Equipamento de combate a incêndio com manutenção atrasada',
          category: 'SOLAS',
          severity: 'major',
          vessel: 'MV Atlantic Star',
          detectedDate: addDays(new Date(), -10),
          dueDate: addDays(new Date(), 5),
          status: 'in_progress',
          assignedTo: 'Chefe de Máquinas'
        },
        {
          id: '2',
          title: 'Documentação de segurança incompleta',
          category: 'ISPS',
          severity: 'minor',
          vessel: 'MV Pacific Explorer',
          detectedDate: addDays(new Date(), -5),
          dueDate: addDays(new Date(), 10),
          status: 'open',
          assignedTo: 'Oficial de Proteção'
        },
        {
          id: '3',
          title: 'Registro de horas de trabalho não atualizado',
          category: 'MLC',
          severity: 'major',
          vessel: 'MV Ocean Titan',
          detectedDate: addDays(new Date(), -15),
          dueDate: addDays(new Date(), -5),
          status: 'overdue',
          assignedTo: 'Comandante'
        },
        {
          id: '4',
          title: 'Calibração de equipamentos GMDSS',
          category: 'SOLAS',
          severity: 'critical',
          vessel: 'MV Caribbean Queen',
          detectedDate: addDays(new Date(), -3),
          dueDate: addDays(new Date(), 2),
          status: 'in_progress',
          assignedTo: 'Oficial de Rádio'
        }
      ]);

      // Checklist Items for ISM Audit
      setChecklistItems([
        { id: '1', question: 'O Comandante possui autoridade adequada para tomar decisões de segurança?', category: 'ISM 5', required: true, completed: true, notes: '' },
        { id: '2', question: 'Existem procedimentos documentados para operações críticas?', category: 'ISM 7', required: true, completed: true, notes: '' },
        { id: '3', question: 'Os exercícios de emergência são realizados conforme cronograma?', category: 'ISM 8', required: true, completed: false, notes: '' },
        { id: '4', question: 'O sistema de manutenção preventiva está atualizado?', category: 'ISM 10', required: true, completed: false, notes: '' },
        { id: '5', question: 'A documentação de segurança está disponível a bordo?', category: 'ISM 11', required: true, completed: true, notes: '' },
        { id: '6', question: 'As auditorias internas estão sendo realizadas?', category: 'ISM 12', required: true, completed: true, notes: '' },
      ]);

    } catch (error) {
      logger.error('Error loading compliance data:', error);
      toast.error('Erro ao carregar dados de compliance');
    } finally {
      setLoading(false);
    }
  };

  const getOverallScore = () => {
    const total = complianceScores.reduce((acc, c) => acc + c.score, 0);
    return Math.round(total / complianceScores.length);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'valid':
      case 'completed':
      case 'closed':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'attention':
      case 'expiring_soon':
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'non_compliant':
      case 'expired':
      case 'overdue':
      case 'open':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'major': return 'bg-orange-500 text-white';
      case 'minor': return 'bg-yellow-500 text-black';
      default: return 'bg-muted';
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    toast.success('Item atualizado');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </motion.div>

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
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
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{complianceScores.filter(c => c.status === 'compliant').length}</p>
                  <p className="text-sm text-muted-foreground">Conformes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{complianceScores.filter(c => c.status === 'attention').length}</p>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{nonConformities.filter(nc => nc.status === 'open' || nc.status === 'overdue').length}</p>
                  <p className="text-sm text-muted-foreground">Não Conformidades</p>
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
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${(cat.score / 100) * 176} 176`}
                      className={cat.status === 'compliant' ? 'text-green-500' : cat.status === 'attention' ? 'text-yellow-500' : 'text-red-500'}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {cat.score}%
                  </span>
                </div>
                <Badge className={getStatusColor(cat.status)} variant="outline">
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
          </TabsTrigger>
          <TabsTrigger value="nc" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
            {nonConformities.filter(nc => nc.status !== 'closed').length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {nonConformities.filter(nc => nc.status !== 'closed').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Prazos Próximos
                </CardTitle>
                <CardDescription>Auditorias e certificados com vencimento próximo</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {audits
                      .filter(a => a.status !== 'completed')
                      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                      .slice(0, 5)
                      .map(audit => (
                        <div key={audit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${audit.status === 'overdue' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                              <ClipboardCheck className={`h-4 w-4 ${audit.status === 'overdue' ? 'text-red-500' : 'text-primary'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{audit.title}</p>
                              <p className="text-xs text-muted-foreground">{audit.vesselName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(audit.status)}>
                              {differenceInDays(audit.dueDate, new Date())} dias
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                    {certificates
                      .filter(c => c.status === 'expiring_soon' || c.status === 'expired')
                      .map(cert => (
                        <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cert.status === 'expired' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                              <Award className={`h-4 w-4 ${cert.status === 'expired' ? 'text-red-500' : 'text-yellow-500'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{cert.name}</p>
                              <p className="text-xs text-muted-foreground">{cert.vesselOrCrew}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(cert.status)}>
                              {cert.status === 'expired' ? 'Vencido' : `${differenceInDays(cert.expiryDate, new Date())} dias`}
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>Acesse funcionalidades frequentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Plus, label: 'Nova Auditoria', color: 'bg-blue-500/10 text-blue-500' },
                    { icon: FileText, label: 'Gerar Relatório', color: 'bg-green-500/10 text-green-500' },
                    { icon: AlertTriangle, label: 'Registrar NC', color: 'bg-red-500/10 text-red-500' },
                    { icon: Award, label: 'Renovar Cert.', color: 'bg-yellow-500/10 text-yellow-500' },
                    { icon: Brain, label: 'Análise IA', color: 'bg-purple-500/10 text-purple-500' },
                    { icon: Download, label: 'Exportar Dados', color: 'bg-gray-500/10 text-gray-500' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2 hover:bg-muted/50"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-4">
          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card key={audit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        audit.priority === 'critical' ? 'bg-red-500/10' :
                        audit.priority === 'high' ? 'bg-orange-500/10' :
                        audit.priority === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                      }`}>
                        <ClipboardCheck className={`h-6 w-6 ${
                          audit.priority === 'critical' ? 'text-red-500' :
                          audit.priority === 'high' ? 'text-orange-500' :
                          audit.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{audit.title}</h3>
                          <Badge variant="outline">{audit.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {audit.vesselName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {audit.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(audit.dueDate, 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{audit.progress}%</span>
                        </div>
                        <Progress value={audit.progress} className="h-2" />
                      </div>
                      <Badge className={getStatusColor(audit.status)}>
                        {audit.status === 'completed' ? 'Concluído' :
                         audit.status === 'in_progress' ? 'Em Andamento' :
                         audit.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Certificados e Documentos</CardTitle>
              <CardDescription>Status de todos os certificados da frota</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Certificado</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-left p-3 font-medium">Embarcação/Tripulante</th>
                    <th className="text-left p-3 font-medium">Autoridade</th>
                    <th className="text-left p-3 font-medium">Validade</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-medium">{cert.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {cert.type === 'vessel' ? 'Embarcação' : cert.type === 'crew' ? 'Tripulante' : 'Empresa'}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{cert.vesselOrCrew}</td>
                      <td className="p-3 text-muted-foreground text-sm">{cert.issuingAuthority}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <p>{format(cert.expiryDate, 'dd/MM/yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            {differenceInDays(cert.expiryDate, new Date())} dias
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status === 'valid' ? 'Válido' : 
                           cert.status === 'expiring_soon' ? 'Vencendo' : 'Vencido'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Non-Conformities Tab */}
        <TabsContent value="nc" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Não Conformidades Ativas</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar NC
            </Button>
          </div>

          <div className="grid gap-4">
            {nonConformities.map((nc) => (
              <Card key={nc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(nc.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{nc.title}</h4>
                          <Badge variant="outline">{nc.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {nc.vessel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {nc.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            Prazo: {format(nc.dueDate, 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(nc.status)}>
                        {nc.status === 'open' ? 'Aberta' :
                         nc.status === 'in_progress' ? 'Em Tratamento' :
                         nc.status === 'overdue' ? 'Atrasada' : 'Fechada'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Tratar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    Checklist de Auditoria ISM
                  </CardTitle>
                  <CardDescription>MV Atlantic Star - Auditoria Interna</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {checklistItems.filter(i => i.completed).length}/{checklistItems.length} itens
                  </Badge>
                  <Progress 
                    value={(checklistItems.filter(i => i.completed).length / checklistItems.length) * 100} 
                    className="w-32"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      item.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        {item.required && <Badge variant="secondary" className="text-xs">Obrigatório</Badge>}
                      </div>
                      <p className={`mt-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.question}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedComplianceCenter;
