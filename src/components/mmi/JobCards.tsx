import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchJobs, postponeJob, createWorkOrder, fetchJobWithAI } from "@/services/mmi/jobsApi";
import { generatePDFReport, generateJobReport } from "@/services/mmi/pdfReportService";
import { generateOrderPDF } from "@/lib/pdf/generateOrderPDF";
import { fetchOrderById } from "@/services/mmi/ordersService";
import { MMIJob } from "@/types/mmi";
import { Loader2, Wrench, Clock, Sparkles, FileText, Download } from "lucide-react";

export default function JobCards() {
  const [jobs, setJobs] = useState<MMIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<MMIJob | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingJobPDF, setGeneratingJobPDF] = useState<string | null>(null);
  const [exportingOrderPDF, setExportingOrderPDF] = useState<string | null>(null);
  const [createdOrders, setCreatedOrders] = useState<Record<string, string>>({}); // jobId -> osId mapping
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

  const handleShowAIRecommendation = async (jobId: string) => {
    setLoadingAI(true);
    setShowAIModal(true);
    try {
      const jobWithAI = await fetchJobWithAI(jobId);
      if (jobWithAI) {
        setSelectedJob(jobWithAI);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível obter recomendação da IA.",
        variant: "destructive",
      });
      setShowAIModal(false);
    } finally {
      setLoadingAI(false);
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
      
      // Store the created order ID
      setCreatedOrders(prev => ({ ...prev, [jobId]: data.os_id }));
      
      toast({
        title: "Ordem de Serviço Criada",
        description: `${data.message}\nOS ID: ${data.os_id}`,
        variant: "default",
      });
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

  const handleExportOrderPDF = async (job: MMIJob, osId: string) => {
    setExportingOrderPDF(job.id);
    try {
      // Fetch the work order details
      const order = await fetchOrderById(osId);
      
      if (!order) {
        throw new Error("Ordem de serviço não encontrada");
      }

      // Map the order data to the format expected by generateOrderPDF
      generateOrderPDF({
        id: order.os_number || osId,
        vessel_name: job.component.asset.vessel,
        system_name: job.component.name,
        status: order.status,
        priority: job.priority,
        description: job.title + (job.suggestion_ia ? `\n\n${job.suggestion_ia}` : ""),
        executed_at: order.completion_date,
        technician_comment: order.notes,
        created_at: order.created_at || new Date().toISOString(),
      });

      toast({
        title: "PDF Exportado",
        description: `Ordem de Serviço ${order.os_number} exportada com sucesso!`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível exportar o PDF da OS.",
        variant: "destructive",
      });
    } finally {
      setExportingOrderPDF(null);
    }
  };

  const handleExportPDF = async () => {
    setGeneratingPDF(true);
    try {
      await generatePDFReport(jobs, {
        includeAIRecommendations: true,
        title: "Relatório MMI - Manutenção Inteligente",
        subtitle: "Nautilus One v1.1.0 - Sistema com IA Adaptativa",
      });
      toast({
        title: "Relatório Gerado",
        description: "PDF exportado com sucesso!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleGenerateJobReport = async (job: MMIJob) => {
    setGeneratingJobPDF(job.id);
    try {
      await generateJobReport(job, {
        includeAIRecommendations: true,
      });
      toast({
        title: "Relatório Gerado",
        description: `PDF do job "${job.title}" exportado com sucesso!`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF do job.",
        variant: "destructive",
      });
    } finally {
      setGeneratingJobPDF(null);
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
    <>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportPDF}
          disabled={generatingPDF}
        >
          {generatingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Exportar Relatório PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-l-4 border-yellow-500 p-4 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-yellow-900">{job.title}</h3>
                <span className="text-xs text-muted-foreground">{job.due_date}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Componente: {job.component.name} — Embarcação: {job.component.asset.vessel}
              </p>
              <div className="flex flex-wrap gap-1 text-xs pt-1">
                <Badge variant="outline">Prioridade: {job.priority}</Badge>
                <Badge variant="outline">Status: {job.status}</Badge>
                {job.suggestion_ia && <Badge variant="secondary">💡 Sugestão IA</Badge>}
                {job.can_postpone && <Badge className="bg-green-100 text-green-800">🕒 Pode postergar</Badge>}
              </div>
              {job.suggestion_ia && (
                <div className="mt-2 bg-muted p-2 rounded text-xs text-muted-foreground">
                  {job.suggestion_ia}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleCreateOS(job.id)}
                  disabled={processingJobId === job.id || Boolean(createdOrders[job.id])}
                >
                  {processingJobId === job.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Wrench className="h-4 w-4 mr-1" />
                  )}
                  {createdOrders[job.id] ? "OS Criada" : "Criar OS"}
                </Button>
                {createdOrders[job.id] && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExportOrderPDF(job, createdOrders[job.id])}
                    disabled={exportingOrderPDF === job.id}
                  >
                    {exportingOrderPDF === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    📄 Exportar PDF
                  </Button>
                )}
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
                  onClick={() => handleGenerateJobReport(job)}
                  disabled={generatingJobPDF === job.id}
                >
                  {generatingJobPDF === job.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  Relatório PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShowAIRecommendation(job.id)}
                  className="ml-auto"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Copilot IA
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendation Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendação IA v1.1.0 - Aprendizado Histórico
            </DialogTitle>
            <DialogDescription>
              Análise baseada em casos similares e aprendizado contínuo
            </DialogDescription>
          </DialogHeader>
          
          {loadingAI ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Analisando histórico e gerando recomendação...</span>
            </div>
          ) : selectedJob?.ai_recommendation ? (
            <div className="space-y-4">
              {/* Job Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">{selectedJob.title}</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Componente:</strong> {selectedJob.component.name}<br />
                  <strong>Embarcação:</strong> {selectedJob.component.asset.vessel}<br />
                  <strong>Prazo atual:</strong> {selectedJob.due_date}
                </p>
              </div>

              {/* AI Recommendation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">🤖 Recomendação Técnica</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Ação:</strong> {selectedJob.ai_recommendation.technical_action}</p>
                  <p><strong>Componente:</strong> {selectedJob.ai_recommendation.component}</p>
                  <p><strong>Prazo Sugerido:</strong> {selectedJob.ai_recommendation.deadline}</p>
                  <p><strong>Requer OS Formal:</strong> {selectedJob.ai_recommendation.requires_work_order ? "Sim" : "Não"}</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Raciocínio</h4>
                <p className="text-sm text-yellow-900">{selectedJob.ai_recommendation.reasoning}</p>
              </div>

              {/* Similar Cases */}
              {selectedJob.ai_recommendation.similar_cases.length > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">📊 Casos Similares (Top {selectedJob.ai_recommendation.similar_cases.length})</h4>
                  <div className="space-y-2">
                    {selectedJob.ai_recommendation.similar_cases.map((sc) => (
                      <div key={sc.job_id} className="bg-white p-3 rounded border border-green-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{sc.job_id}</span>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            {(sc.similarity * 100).toFixed(0)}% similar
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Ação:</strong> {sc.action}<br />
                          <strong>Resultado:</strong> {sc.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhuma recomendação disponível</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
