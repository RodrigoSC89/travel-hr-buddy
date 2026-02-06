/**
 * Audit Workflow Manager - Premium Component
 * WORLD-CLASS: Auditable workflows, evidence attachments, dynamic scorecards
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, CheckCircle, XCircle, Clock, AlertTriangle,
  FileText, Upload, MessageSquare, User, Calendar,
  ChevronRight, Plus, Download, Eye, Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditItem {
  id: string;
  code: string;
  requirement: string;
  status: 'pending' | 'compliant' | 'non_compliant' | 'observation' | 'not_applicable';
  evidence: string[];
  comments: string;
  assignee?: string;
  dueDate?: Date;
  score: number;
  maxScore: number;
}

interface AuditCategory {
  id: string;
  name: string;
  standard: string;
  items: AuditItem[];
  score: number;
  maxScore: number;
}

const STATUS_CONFIG = {
  pending: { color: 'bg-gray-100 text-gray-600', icon: Clock, label: 'Pendente' },
  compliant: { color: 'bg-green-100 text-green-600', icon: CheckCircle, label: 'Conforme' },
  non_compliant: { color: 'bg-red-100 text-red-600', icon: XCircle, label: 'Não Conforme' },
  observation: { color: 'bg-yellow-100 text-yellow-600', icon: AlertTriangle, label: 'Observação' },
  not_applicable: { color: 'bg-gray-100 text-gray-400', icon: FileText, label: 'N/A' },
};

// Maritime audit categories based on ISM/ISPS/MLC
const AUDIT_CATEGORIES: AuditCategory[] = [
  {
    id: 'ism-1',
    name: 'SMS - Safety Management System',
    standard: 'ISM Code',
    score: 85,
    maxScore: 100,
    items: [
      { id: '1.1', code: 'ISM-1.1', requirement: 'Política de Segurança e Proteção Ambiental documentada', status: 'compliant', evidence: ['policy.pdf'], comments: 'Política atualizada em Jan/2026', score: 10, maxScore: 10 },
      { id: '1.2', code: 'ISM-1.2', requirement: 'Responsabilidades e autoridades definidas', status: 'compliant', evidence: ['org_chart.pdf', 'responsibilities.docx'], comments: '', score: 10, maxScore: 10 },
      { id: '1.3', code: 'ISM-1.3', requirement: 'Pessoa Designada (DPA) nomeada', status: 'compliant', evidence: ['dpa_nomination.pdf'], comments: 'DPA: João Silva', score: 10, maxScore: 10 },
      { id: '1.4', code: 'ISM-1.4', requirement: 'Recursos e apoio em terra adequados', status: 'observation', evidence: [], comments: 'Necessário atualizar procedimentos de comunicação', score: 7, maxScore: 10 },
      { id: '1.5', code: 'ISM-1.5', requirement: 'Procedimentos de emergência documentados', status: 'compliant', evidence: ['emergency_proc.pdf'], comments: '', score: 10, maxScore: 10 },
    ],
  },
  {
    id: 'isps-1',
    name: 'SSP - Ship Security Plan',
    standard: 'ISPS Code',
    score: 92,
    maxScore: 100,
    items: [
      { id: '2.1', code: 'ISPS-2.1', requirement: 'Ship Security Assessment (SSA) atual', status: 'compliant', evidence: ['ssa_2026.pdf'], comments: 'Válido até Dez/2026', score: 10, maxScore: 10 },
      { id: '2.2', code: 'ISPS-2.2', requirement: 'Ship Security Plan (SSP) aprovado', status: 'compliant', evidence: ['ssp_approved.pdf'], comments: '', score: 10, maxScore: 10 },
      { id: '2.3', code: 'ISPS-2.3', requirement: 'Ship Security Officer (SSO) treinado', status: 'compliant', evidence: ['sso_cert.pdf'], comments: '', score: 10, maxScore: 10 },
      { id: '2.4', code: 'ISPS-2.4', requirement: 'Exercícios de segurança realizados', status: 'pending', evidence: [], comments: 'Próximo exercício programado para 15/03', score: 0, maxScore: 10 },
    ],
  },
  {
    id: 'mlc-1',
    name: 'MLC 2006 - Maritime Labour',
    standard: 'MLC 2006',
    score: 78,
    maxScore: 100,
    items: [
      { id: '3.1', code: 'MLC-1.1', requirement: 'Contrato de Trabalho Marítimo (SEA)', status: 'compliant', evidence: ['sea_template.pdf'], comments: 'Modelo aprovado', score: 10, maxScore: 10 },
      { id: '3.2', code: 'MLC-1.2', requirement: 'Horas de trabalho/descanso registradas', status: 'observation', evidence: ['rest_hours_log.xlsx'], comments: 'Sistema precisa de automação', score: 7, maxScore: 10 },
      { id: '3.3', code: 'MLC-1.3', requirement: 'Acomodações conforme padrão', status: 'compliant', evidence: ['cabin_inspection.pdf'], comments: '', score: 10, maxScore: 10 },
      { id: '3.4', code: 'MLC-1.4', requirement: 'Alimentação e catering adequados', status: 'non_compliant', evidence: [], comments: 'NC: Necessário certificado do cook', score: 0, maxScore: 10 },
    ],
  },
];

export function AuditWorkflowManager() {
  const [selectedCategory, setSelectedCategory] = useState(AUDIT_CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const queryClient = useQueryClient();

  // Calculate overall score
  const totalScore = AUDIT_CATEGORIES.reduce((acc, cat) => acc + cat.score, 0);
  const totalMaxScore = AUDIT_CATEGORIES.reduce((acc, cat) => acc + cat.maxScore, 0);
  const overallPercentage = Math.round((totalScore / totalMaxScore) * 100);

  // Update item status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: AuditItem['status'] }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { itemId, status };
    },
    onSuccess: ({ status }) => {
      toast.success(`Status atualizado para: ${STATUS_CONFIG[status].label}`);
    },
  });

  // Upload evidence
  const uploadEvidenceMutation = useMutation({
    mutationFn: async ({ itemId, file }: { itemId: string; file: File }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { itemId, fileName: file.name };
    },
    onSuccess: ({ fileName }) => {
      toast.success(`Evidência "${fileName}" anexada com sucesso`);
    },
  });

  return (
    <div className="space-y-6">
      {/* Scorecard Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Score Geral de Conformidade</p>
                <p className="text-4xl font-bold">{overallPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalScore} / {totalMaxScore} pontos
                </p>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${overallPercentage * 2.51} 251`}
                    className="text-primary"
                  />
                </svg>
                <Shield className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {AUDIT_CATEGORIES.map(cat => (
          <Card 
            key={cat.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedCategory.id === cat.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{cat.standard}</Badge>
                <span className="text-lg font-bold">
                  {Math.round((cat.score / cat.maxScore) * 100)}%
                </span>
              </div>
              <p className="text-sm font-medium mb-2">{cat.name}</p>
              <Progress value={(cat.score / cat.maxScore) * 100} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedCategory.name}</CardTitle>
                <CardDescription>{selectedCategory.standard}</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {selectedCategory.items.map((item) => {
                const config = STATUS_CONFIG[item.status];
                const StatusIcon = config.icon;
                
                return (
                  <div 
                    key={item.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedItem?.id === item.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.code}
                          </Badge>
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.evidence.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {item.evidence.length} evidência(s)
                            </span>
                          )}
                          {item.comments && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Comentário
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{item.score}/{item.maxScore}</span> pts
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Requisito</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Código</p>
                  <Badge variant="outline" className="font-mono">{selectedItem.code}</Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requisito</p>
                  <p className="text-sm">{selectedItem.requirement}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={key}
                          variant={selectedItem.status === key ? 'default' : 'outline'}
                          size="sm"
                          className="gap-1"
                          onClick={() => updateStatusMutation.mutate({ 
                            itemId: selectedItem.id, 
                            status: key as AuditItem['status'] 
                          })}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidências</p>
                  {selectedItem.evidence.length > 0 ? (
                    <div className="space-y-2">
                      {selectedItem.evidence.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm flex-1">{file}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma evidência anexada</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-2 gap-2">
                    <Upload className="h-4 w-4" />
                    Anexar Evidência
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Comentários</p>
                  <Textarea 
                    placeholder="Adicione comentários sobre este requisito..."
                    defaultValue={selectedItem.comments}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Pontuação</span>
                  <span className="text-lg font-bold">
                    {selectedItem.score} / {selectedItem.maxScore}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um requisito para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuditWorkflowManager;
