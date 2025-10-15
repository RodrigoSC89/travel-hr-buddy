import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchJobs, postponeJob, createWorkOrder, type Job } from '@/services/mmi/jobsApi';
import { Loader2, Wrench, Clock } from 'lucide-react';

export default function JobCards() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
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
            <div className="flex gap-2 pt-2">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
