/**
 * Audit Workflow Manager - Premium Component
 * WORLD-CLASS: Real Supabase data + dynamic scorecards + AI analysis
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, CheckCircle, XCircle, Clock, AlertTriangle,
  FileText, Upload, MessageSquare, ChevronRight, Plus, 
  Download, Eye, Paperclip, Brain, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface AuditItem {
  id: string;
  code: string;
  requirement: string;
  status: 'pending' | 'compliant' | 'non_compliant' | 'observation' | 'not_applicable';
  evidence: string[];
  comments: string;
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
  pending: { color: 'bg-muted text-muted-foreground', icon: Clock, label: 'Pendente' },
  compliant: { color: 'bg-success/10 text-success', icon: CheckCircle, label: 'Conforme' },
  non_compliant: { color: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Não Conforme' },
  observation: { color: 'bg-warning/10 text-warning', icon: AlertTriangle, label: 'Observação' },
  not_applicable: { color: 'bg-muted text-muted-foreground', icon: FileText, label: 'N/A' },
};

function mapItemStatus(status: string | null): AuditItem['status'] {
  const s = (status || '').toLowerCase();
  if (s.includes('compliant') && !s.includes('non')) return 'compliant';
  if (s.includes('non_compliant') || s.includes('failed')) return 'non_compliant';
  if (s.includes('observation')) return 'observation';
  if (s.includes('n/a') || s.includes('not_applicable')) return 'not_applicable';
  return 'pending';
}

export function AuditWorkflowManager() {
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  // ===== REAL DATA from Supabase =====
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-compliance-items'],
    queryFn: async (): Promise<AuditCategory[]> => {
      const { data, error } = await supabase
        .from('compliance_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by regulation/item_type
      const grouped = new Map<string, AuditItem[]>();
      (data || []).forEach(item => {
        const key = item.regulation || item.item_type || 'General';
        if (!grouped.has(key)) grouped.set(key, []);
        
        const status = mapItemStatus(item.status);
        const score = status === 'compliant' ? 10 : status === 'observation' ? 7 : status === 'not_applicable' ? 10 : 0;
        
        grouped.get(key)!.push({
          id: item.id,
          code: `${(item.regulation || 'GEN').substring(0, 4).toUpperCase()}-${item.id.substring(0, 4)}`,
          requirement: item.title || item.description || 'Requisito de compliance',
          status,
          evidence: item.evidence_urls || [],
          comments: item.description || '',
          score,
          maxScore: 10,
        });
      });

      if (grouped.size === 0) {
        // Provide ISM/ISPS/MLC structure for empty state
        return [
          { id: 'ism', name: 'ISM Code - Safety Management', standard: 'ISM Code', items: [], score: 0, maxScore: 100 },
          { id: 'isps', name: 'ISPS Code - Ship Security', standard: 'ISPS Code', items: [], score: 0, maxScore: 100 },
          { id: 'mlc', name: 'MLC 2006 - Maritime Labour', standard: 'MLC 2006', items: [], score: 0, maxScore: 100 },
        ];
      }

      return Array.from(grouped.entries()).map(([key, items]) => {
        const totalScore = items.reduce((s, i) => s + i.score, 0);
        const maxScore = items.reduce((s, i) => s + i.maxScore, 0);
        return {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          name: key,
          standard: key.includes('ISM') ? 'ISM Code' : key.includes('ISPS') ? 'ISPS Code' : key.includes('MLC') ? 'MLC 2006' : key,
          items,
          score: totalScore,
          maxScore: maxScore || 100,
        };
      });
    },
  });

  const selectedCategory = categories[selectedCategoryIdx] || categories[0];

  // ===== AI AUDIT ANALYSIS =====
  const runAIAudit = async () => {
    setAiLoading(true);
    try {
      const auditSummary = categories.map(cat => ({
        standard: cat.standard,
        name: cat.name,
        score: cat.score,
        maxScore: cat.maxScore,
        percent: cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0,
        nonCompliant: cat.items.filter(i => i.status === 'non_compliant').length,
        pending: cat.items.filter(i => i.status === 'pending').length,
        observations: cat.items.filter(i => i.status === 'observation').length,
      }));

      const ncList = categories.flatMap(c => 
        c.items.filter(i => i.status === 'non_compliant').map(i => `- ${i.code}: ${i.requirement}`)
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Analise os resultados da auditoria marítima:\n\nScore geral: ${overallPercentage}%\nCategorias: ${JSON.stringify(auditSummary)}\n\nNão-conformidades:\n${ncList || 'Nenhuma'}\n\nForneça:\n1. Avaliação geral de compliance\n2. Riscos prioritários (PSC, Flag State)\n3. Plano de ação para não-conformidades\n4. Prazo recomendado para correção\n5. Impacto em inspeções PSC`,
          }],
          agentId: 'compliance',
        },
      });

      if (error) throw error;
      setAiAuditReport(data?.response || data?.choices?.[0]?.message?.content || 'Relatório indisponível');
      toast.success('Relatório AI de auditoria gerado');
    } catch {
      toast.error('Erro ao gerar relatório AI');
    } finally {
      setAiLoading(false);
    }
  };

  // ===== UPDATE STATUS (real) =====
  const updateStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: AuditItem['status'] }) => {
      const { error } = await supabase
        .from('compliance_items')
        .update({ status })
        .eq('id', itemId);
      if (error) throw error;
      return { itemId, status };
    },
    onSuccess: ({ status }) => {
      toast.success(`Status atualizado para: ${STATUS_CONFIG[status].label}`);
      queryClient.invalidateQueries({ queryKey: ['audit-compliance-items'] });
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  // Calculate overall score
  const totalScore = categories.reduce((acc, cat) => acc + cat.score, 0);
  const totalMaxScore = categories.reduce((acc, cat) => acc + cat.maxScore, 0);
  const overallPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

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
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                    <RefreshCw className="h-3 w-3" /> Atualizar
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2" onClick={runAIAudit} disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Relatório AI
                  </Button>
                </div>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray={`${overallPercentage * 2.51} 251`} className="text-primary" />
                </svg>
                <Shield className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {categories.slice(0, 2).map((cat, idx) => (
          <Card 
            key={cat.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedCategoryIdx === idx ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedCategoryIdx(idx)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{cat.standard}</Badge>
                <span className="text-lg font-bold">
                  {cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0}%
                </span>
              </div>
              <p className="text-sm font-medium mb-2">{cat.name}</p>
              <Progress value={cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{cat.items.length} itens</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional categories */}
      {categories.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {categories.slice(2).map((cat, idx) => (
            <Button
              key={cat.id}
              variant={selectedCategoryIdx === idx + 2 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategoryIdx(idx + 2)}
            >
              {cat.standard} ({cat.items.length})
            </Button>
          ))}
        </div>
      )}

      {/* AI Audit Report */}
      {aiAuditReport && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Brain className="h-4 w-4" />
                Relatório AI de Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px]">
                <p className="text-sm whitespace-pre-wrap">{aiAuditReport}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedCategory?.name || 'Compliance'}</CardTitle>
                <CardDescription>{selectedCategory?.standard} • {selectedCategory?.items.length || 0} itens</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando itens de compliance...</div>
            ) : !selectedCategory || selectedCategory.items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item de compliance cadastrado</p>
                <p className="text-xs mt-1">Adicione itens de auditoria para começar</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
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
                              <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                              <span className="font-medium text-sm">{item.requirement}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {item.evidence.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {item.evidence.length} evidência(s)
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
              </ScrollArea>
            )}
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
                          disabled={updateStatusMutation.isPending}
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
                      {selectedItem.evidence.map((file) => (
                        <div key={file} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm flex-1 truncate">{file}</span>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma evidência anexada</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.doc,.docx,.jpg,.png';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      const path = `audit-evidence/${Date.now()}-${file.name}`;
                      const { error } = await supabase.storage.from('documents').upload(path, file);
                      if (error) { toast.error(`Erro: ${error.message}`); return; }
                      toast.success(`Evidência "${file.name}" anexada com sucesso`);
                    };
                    input.click();
                  }}>
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
                  <span className="text-lg font-bold">{selectedItem.score} / {selectedItem.maxScore}</span>
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
