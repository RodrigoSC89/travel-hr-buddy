import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchJobs, postponeJob, createWorkOrder, type Job } from '@/services/mmi/jobsApi';
import { getAIRecommendation, type AIRecommendation } from '@/services/mmi/copilotService';
import { Loader2, Wrench, Clock, Brain } from 'lucide-react';

export default function JobCards() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [copilotDialogOpen, setCopilotDialogOpen] = useState(false);
  const [selectedJobForCopilot, setSelectedJobForCopilot] = useState<Job | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs();
      setJobs(data.jobs);
    } catch (error) {
      toast({
        title: "Erro ao carregar jobs",
        description: "Não foi possível carregar a lista de jobs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPostpone = async (jobId: string) => {
    setProcessingJobId(jobId);
    try {
      const data = await postponeJob(jobId);
      toast({
        title: "Job Postergado",
        description: data.message,
        variant: "default",
      });
      // Reload jobs to get updated data
      await loadJobs();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível postergar o job.",
        variant: "destructive",
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleCreateOS = async (jobId: string) => {
    setProcessingJobId(jobId);
    try {
      const data = await createWorkOrder(jobId);
      toast({
        title: "Ordem de Serviço Criada",
        description: `${data.message}\nOS ID: ${data.os_id}`,
        variant: "default",
      });
      // Reload jobs to get updated data
      await loadJobs();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar a OS.",
        variant: "destructive",
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleOpenCopilot = async (job: Job) => {
    setSelectedJobForCopilot(job);
    setCopilotDialogOpen(true);
    setLoadingRecommendation(true);
    setAiRecommendation(null);

    try {
      const recommendation = await getAIRecommendation(job);
      setAiRecommendation(recommendation);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível obter recomendação da IA.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando jobs...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum job encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <Card key={job.id} className="border-l-4 border-yellow-500 p-4 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-yellow-900">{job.title}</h3>
              <span className="text-xs text-gray-500">{job.due_date}</span>
            </div>
            <p className="text-sm text-gray-700">
              Componente: {job.component.name} — Embarcação: {job.component.asset.vessel}
            </p>
            <div className="flex flex-wrap gap-1 text-xs pt-1">
              <Badge variant="outline">Prioridade: {job.priority}</Badge>
              <Badge variant="outline">Status: {job.status}</Badge>
              {job.suggestion_ia && <Badge variant="secondary">💡 Sugestão IA</Badge>}
              {job.can_postpone && <Badge className="bg-green-100 text-green-800">🕒 Pode postergar</Badge>}
            </div>
            {job.suggestion_ia && (
              <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-800">
                {job.suggestion_ia}
              </div>
            )}
            <div className="flex gap-2 pt-2 flex-wrap">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleCreateOS(job.id)}
                disabled={processingJobId === job.id}
              >
                {processingJobId === job.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Wrench className="h-4 w-4 mr-1" />
                )}
                Criar OS
              </Button>
              {job.can_postpone && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAutoPostpone(job.id)}
                  disabled={processingJobId === job.id}
                >
                  {processingJobId === job.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Clock className="h-4 w-4 mr-1" />
                  )}
                  Postergar com IA
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleOpenCopilot(job)}
              >
                <Brain className="h-4 w-4 mr-1" />
                Copilot IA
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* AI Copilot Dialog */}
      <Dialog open={copilotDialogOpen} onOpenChange={setCopilotDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Copilot IA - Recomendação Contextual
            </DialogTitle>
            <DialogDescription>
              Análise inteligente baseada em histórico e casos similares
            </DialogDescription>
          </DialogHeader>

          {selectedJobForCopilot && (
            <div className="space-y-4">
              {/* Job Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Job Analisado</h4>
                <p className="text-sm"><strong>Título:</strong> {selectedJobForCopilot.title}</p>
                <p className="text-sm"><strong>Componente:</strong> {selectedJobForCopilot.component.name}</p>
                <p className="text-sm"><strong>Embarcação:</strong> {selectedJobForCopilot.component.asset.vessel}</p>
                <p className="text-sm"><strong>Prioridade:</strong> {selectedJobForCopilot.priority}</p>
              </div>

              {/* AI Recommendation */}
              {loadingRecommendation ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-muted-foreground">Consultando IA e histórico...</span>
                </div>
              ) : aiRecommendation ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-900 mb-2">🎯 Ação Técnica Recomendada</h4>
                    <p className="text-sm text-gray-700">{aiRecommendation.technical_action}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Componente</p>
                      <p className="text-sm font-semibold">{aiRecommendation.component}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Prazo Sugerido</p>
                      <p className="text-sm font-semibold">{new Date(aiRecommendation.deadline).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Requer OS?</p>
                      <p className="text-sm font-semibold">{aiRecommendation.requires_work_order ? '✓ Sim' : '✗ Não'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Casos Similares</p>
                      <p className="text-sm font-semibold">{aiRecommendation.similar_cases?.length || 0} encontrados</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-green-900 mb-2">💡 Justificativa</h4>
                    <p className="text-sm text-gray-700">{aiRecommendation.reasoning}</p>
                  </div>

                  {aiRecommendation.similar_cases && aiRecommendation.similar_cases.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm text-purple-900 mb-2">📊 Casos Similares no Histórico</h4>
                      <div className="space-y-2">
                        {aiRecommendation.similar_cases.map((case_, idx) => (
                          <div key={idx} className="bg-white p-2 rounded text-xs">
                            <p><strong>Job:</strong> {case_.job_id} | <strong>Similaridade:</strong> {(case_.similarity * 100).toFixed(1)}%</p>
                            <p><strong>Ação:</strong> {case_.action}</p>
                            <p><strong>Resultado:</strong> {case_.outcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma recomendação disponível
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
