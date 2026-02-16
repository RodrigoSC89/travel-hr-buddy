/**
 * Crew Appraisal & Performance Review System
 * BEATS: Compas/Stena (Crew Appraisals, KPIs, 360° Feedback)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Star, UserCheck, Award, ClipboardList, AlertTriangle, BarChart3 } from 'lucide-react';

const COMPETENCIES = [
  { id: 'technical', label: 'Competência Técnica', weight: 0.25 },
  { id: 'safety', label: 'Consciência de Segurança', weight: 0.20 },
  { id: 'teamwork', label: 'Trabalho em Equipe', weight: 0.15 },
  { id: 'leadership', label: 'Liderança', weight: 0.15 },
  { id: 'communication', label: 'Comunicação', weight: 0.10 },
  { id: 'initiative', label: 'Iniciativa & Proatividade', weight: 0.10 },
  { id: 'discipline', label: 'Disciplina & Pontualidade', weight: 0.05 },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Insatisfatório', 2: 'Precisa Melhorar', 3: 'Satisfatório', 4: 'Bom', 5: 'Excelente'
};

export function CrewAppraisalSystem() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState('');
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(COMPETENCIES.map(c => [c.id, 3]))
  );
  const [comments, setComments] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const queryClient = useQueryClient();

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['appraisal-crew'],
    queryFn: async () => {
      const { data } = await supabase.from('crew_members').select('id, full_name, rank, position').order('full_name');
      return data || [];
    },
  });

  // Store appraisals in ai_inspection_feedback (has confidence_score, feedback_text)
  const { data: appraisals = [], isLoading } = useQuery({
    queryKey: ['crew-appraisals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_inspection_feedback')
        .select('*')
        .eq('inspection_type', 'crew_appraisal')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createAppraisal = useMutation({
    mutationFn: async () => {
      const weightedScore = COMPETENCIES.reduce((sum, comp) => sum + (scores[comp.id] * comp.weight), 0);
      const crew = crewMembers.find(c => c.id === selectedCrew);
      const { error } = await supabase.from('ai_inspection_feedback').insert({
        inspection_type: 'crew_appraisal',
        inspector_id: selectedCrew,
        confidence_score: Math.round(weightedScore * 20),
        is_non_conformity: weightedScore < 3,
        feedback_text: JSON.stringify({
          crew_name: crew?.full_name,
          crew_rank: crew?.rank,
          scores,
          comments,
          recommendations,
          competencies: COMPETENCIES.map(c => ({ id: c.id, label: c.label, score: scores[c.id], weight: c.weight })),
        }),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Avaliação registrada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['crew-appraisals'] });
      setCreateOpen(false);
      setScores(Object.fromEntries(COMPETENCIES.map(c => [c.id, 3])));
      setComments('');
      setRecommendations('');
    },
    onError: () => toast.error('Erro ao registrar avaliação'),
  });

  const overallAvg = appraisals.length > 0
    ? appraisals.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / appraisals.length : 0;
  const excellentCount = appraisals.filter(a => (a.confidence_score || 0) >= 80).length;
  const needsImprovementCount = appraisals.filter(a => (a.confidence_score || 0) < 60).length;
  const weightedPreview = COMPETENCIES.reduce((sum, comp) => sum + (scores[comp.id] * comp.weight), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Avaliações', value: appraisals.length, icon: ClipboardList, color: 'text-primary' },
          { label: 'Score Médio', value: `${overallAvg.toFixed(0)}%`, icon: BarChart3, color: 'text-info' },
          { label: 'Excelentes (≥80%)', value: excellentCount, icon: Award, color: 'text-success' },
          { label: 'Atenção (<60%)', value: needsImprovementCount, icon: AlertTriangle, color: 'text-warning' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-4 flex items-center gap-3">
            <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
            <div><p className="text-xs text-muted-foreground">{kpi.label}</p><p className="text-xl font-bold">{kpi.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Avaliações</h3>
        <Button onClick={() => setCreateOpen(true)} size="sm" aria-label="Nova avaliação"><Star className="h-4 w-4 mr-1" /> Nova Avaliação</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-appr-${i}`} className="h-16 w-full" />)}</div>
      ) : appraisals.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma avaliação registrada</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {appraisals.map(appr => {
            const score = appr.confidence_score || 0;
            const scoreColor = score >= 80 ? 'text-success' : score >= 60 ? 'text-info' : 'text-warning';
            let crewName = 'N/A';
            try { const parsed = JSON.parse(appr.feedback_text || '{}'); crewName = parsed.crew_name || 'N/A'; } catch { /* skip */ }
            return (
              <Card key={appr.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{crewName}</p>
                    <p className="text-xs text-muted-foreground">{appr.created_at ? new Date(appr.created_at).toLocaleDateString('pt-BR') : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24"><Progress value={score} className="h-2" /></div>
                    <span className={`font-bold text-lg ${scoreColor}`}>{score}%</span>
                    <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                      {score >= 80 ? 'Excelente' : score >= 60 ? 'Satisfatório' : 'Atenção'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Nova Avaliação de Desempenho</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tripulante</Label>
              <Select value={selectedCrew} onValueChange={setSelectedCrew}>
                <SelectTrigger><SelectValue placeholder="Selecionar tripulante" /></SelectTrigger>
                <SelectContent>
                  {crewMembers.map(cm => (<SelectItem key={cm.id} value={cm.id}>{cm.full_name} — {cm.rank || cm.position}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Competências (1-5)</h4>
              {COMPETENCIES.map(comp => (
                <div key={comp.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1"><p className="text-sm">{comp.label} <span className="text-xs text-muted-foreground">({(comp.weight * 100).toFixed(0)}%)</span></p></div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(val => (
                      <Button key={`${comp.id}-${val}`} variant={scores[comp.id] === val ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0"
                        onClick={() => setScores(prev => ({...prev, [comp.id]: val}))} aria-label={`${comp.label}: ${RATING_LABELS[val]}`}>{val}</Button>
                    ))}
                  </div>
                  <span className="text-xs w-20 text-right text-muted-foreground">{RATING_LABELS[scores[comp.id]]}</span>
                </div>
              ))}
            </div>
            <Card className="bg-primary/5 border-primary/30"><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Score Ponderado</p>
              <p className="text-2xl font-bold text-primary">{(weightedPreview * 20).toFixed(0)}%</p>
            </CardContent></Card>
            <div><Label>Comentários</Label><Textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} placeholder="Pontos fortes, áreas de melhoria..." /></div>
            <div><Label>Recomendações</Label><Textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={2} placeholder="Treinamentos, metas..." /></div>
            <Button onClick={() => createAppraisal.mutate()} disabled={!selectedCrew || createAppraisal.isPending} className="w-full" aria-label="Salvar avaliação">
              {createAppraisal.isPending ? 'Salvando...' : 'Registrar Avaliação'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
