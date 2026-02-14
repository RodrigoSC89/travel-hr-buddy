/**
 * HR Admission Pipeline Component
 * Pipeline de admissão com dados reais do Supabase
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  UserPlus, FileText, CheckCircle2, Clock, 
  Send, Eye, MoreHorizontal, Brain, Upload, RefreshCw, XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useHRAdmissions, 
  useUpdateHRAdmissionStatus, 
  useCancelHRAdmission,
  countDocuments,
  getAdmissionProgress,
  type HRAdmission 
} from '@/hooks/useHRAdmissions';
import { HRAdmissionModal } from './HRAdmissionModal';
import { toast } from 'sonner';

const PIPELINE_STAGES = [
  { id: 'pending', label: 'Pendente', color: 'bg-muted-foreground' },
  { id: 'documents_sent', label: 'Docs Enviados', color: 'bg-primary' },
  { id: 'documents_received', label: 'Docs Recebidos', color: 'bg-secondary' },
  { id: 'validating', label: 'Validando IA', color: 'bg-warning' },
  { id: 'approved', label: 'Aprovado', color: 'bg-success' },
  { id: 'contract_signed', label: 'Contrato Assinado', color: 'bg-accent' },
  { id: 'completed', label: 'Concluído', color: 'bg-success' },
];

export function HRAdmissionPipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real data from Supabase
  const { data: admissions = [], isLoading, error, refetch } = useHRAdmissions();
  const updateStatus = useUpdateHRAdmissionStatus();
  const cancelAdmission = useCancelHRAdmission();

  const getStageInfo = (status: string | null) => {
    return PIPELINE_STAGES.find(s => s.id === status) || PIPELINE_STAGES[0];
  };

  const handleAdvanceStage = async (admission: HRAdmission) => {
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === admission.status);
    if (currentIndex < PIPELINE_STAGES.length - 1) {
      const nextStatus = PIPELINE_STAGES[currentIndex + 1].id;
      await updateStatus.mutateAsync({ id: admission.id, status: nextStatus });
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta admissão?')) {
      await cancelAdmission.mutateAsync(id);
    }
  };

  const handleGenerateContract = (admission: HRAdmission) => {
    toast.success('Contrato gerado!', {
      description: `Contrato de ${admission.candidate_name} foi gerado com sucesso.`,
    });
  };

  // Filter out cancelled admissions for display
  const activeAdmissions = admissions.filter(a => a.status !== 'cancelled');

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={`stat-skeleton-${i}`} className="h-16" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={`card-skeleton-${i}`} className="h-32" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive mb-4">Erro ao carregar admissões</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-lg font-semibold">Pipeline de Admissões</h2>
            <p className="text-sm text-muted-foreground">
              {activeAdmissions.length} admissões em andamento
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Atualizar pipeline" title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Nova Admissão
        </Button>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = activeAdmissions.filter(a => a.status === stage.id).length;
          return (
            <Card 
              key={stage.id} 
              className={`cursor-pointer hover:border-primary/50 transition-colors ${count > 0 ? '' : 'opacity-50'}`}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground truncate">{stage.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {activeAdmissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma admissão em andamento</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Iniciar primeira admissão
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Admissions List */
        <div className="grid gap-4">
          {activeAdmissions.map((admission) => {
            const stage = getStageInfo(admission.status);
            const progress = getAdmissionProgress(admission);
            const docsReceived = countDocuments(admission.documents_received);
            const docsValidated = countDocuments(admission.documents_validated);
            const docsTotal = countDocuments(admission.documents_requested) || 8;
            
            return (
              <Card key={admission.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {admission.candidate_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admission.candidate_name}</p>
                        <p className="text-sm text-muted-foreground">{admission.position}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{admission.department || 'Sem dept.'}</Badge>
                          {admission.proposed_start_date && (
                            <Badge variant="secondary">
                              Início: {new Date(admission.proposed_start_date).toLocaleDateString('pt-BR')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Progress */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <span className="text-sm font-medium">{stage.label}</span>
                        {admission.status === 'validating' && (
                          <Brain className="h-4 w-4 text-amber-500 animate-pulse" />
                        )}
                        {admission.ai_validation_score && (
                          <Badge variant="outline" className="text-xs">
                            IA: {admission.ai_validation_score}%
                          </Badge>
                        )}
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Documentos: {docsReceived}/{docsTotal} recebidos, {docsValidated}/{docsTotal} validados
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {admission.status === 'documents_sent' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Send className="h-3 w-3" />
                          Reenviar
                        </Button>
                      )}
                      {admission.status === 'approved' && (
                        <Button size="sm" className="gap-1" onClick={() => handleGenerateContract(admission)}>
                          <FileText className="h-3 w-3" />
                          Gerar Contrato
                        </Button>
                      )}
                      {admission.status !== 'completed' && admission.status !== 'cancelled' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAdvanceStage(admission)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Avançar
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Mais opções do candidato" title="Mais opções">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Upload className="h-4 w-4" /> Upload Documento
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Send className="h-4 w-4" /> Enviar Lembrete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => handleCancel(admission.id)}
                          >
                            <XCircle className="h-4 w-4" /> Cancelar Admissão
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Admission Modal */}
      <HRAdmissionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
