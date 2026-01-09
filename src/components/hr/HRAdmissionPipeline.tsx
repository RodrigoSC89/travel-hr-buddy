/**
 * HR Admission Pipeline Component
 * Admissão digital com OCR e validação IA
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, FileText, CheckCircle2, Clock, 
  Send, Eye, MoreHorizontal, Brain, Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PIPELINE_STAGES = [
  { id: 'pending', label: 'Pendente', color: 'bg-gray-500' },
  { id: 'documents_sent', label: 'Docs Enviados', color: 'bg-blue-500' },
  { id: 'documents_received', label: 'Docs Recebidos', color: 'bg-purple-500' },
  { id: 'validating', label: 'Validando IA', color: 'bg-amber-500' },
  { id: 'approved', label: 'Aprovado', color: 'bg-green-500' },
  { id: 'contract_signed', label: 'Contrato Assinado', color: 'bg-teal-500' },
];

export function HRAdmissionPipeline() {
  const [admissions] = useState([
    { 
      id: '1', name: 'Lucas Ferreira', position: 'Desenvolvedor Jr', department: 'Tecnologia',
      status: 'validating', progress: 75, startDate: '2026-02-01', documents: { total: 8, received: 8, validated: 6 }
    },
    { 
      id: '2', name: 'Camila Santos', position: 'Analista de Marketing', department: 'Marketing',
      status: 'documents_received', progress: 50, startDate: '2026-02-15', documents: { total: 8, received: 8, validated: 0 }
    },
    { 
      id: '3', name: 'Ricardo Lima', position: 'Gerente Comercial', department: 'Comercial',
      status: 'approved', progress: 90, startDate: '2026-02-01', documents: { total: 10, received: 10, validated: 10 }
    },
    { 
      id: '4', name: 'Juliana Costa', position: 'Designer', department: 'Tecnologia',
      status: 'documents_sent', progress: 25, startDate: '2026-03-01', documents: { total: 8, received: 3, validated: 0 }
    },
  ]);

  const getStageInfo = (status: string) => {
    return PIPELINE_STAGES.find(s => s.id === status) || PIPELINE_STAGES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Pipeline de Admissões</h2>
          <p className="text-sm text-muted-foreground">
            {admissions.length} admissões em andamento
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Nova Admissão
        </Button>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = admissions.filter(a => a.status === stage.id).length;
          return (
            <Card key={stage.id} className={`cursor-pointer hover:border-primary/50 transition-colors ${count > 0 ? '' : 'opacity-50'}`}>
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

      {/* Admissions List */}
      <div className="grid gap-4">
        {admissions.map((admission) => {
          const stage = getStageInfo(admission.status);
          return (
            <Card key={admission.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {admission.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admission.name}</p>
                      <p className="text-sm text-muted-foreground">{admission.position}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{admission.department}</Badge>
                        <Badge variant="secondary">Início: {new Date(admission.startDate).toLocaleDateString('pt-BR')}</Badge>
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
                    </div>
                    <Progress value={admission.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Documentos: {admission.documents.received}/{admission.documents.total} recebidos, 
                      {admission.documents.validated}/{admission.documents.total} validados
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
                      <Button size="sm" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Gerar Contrato
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
