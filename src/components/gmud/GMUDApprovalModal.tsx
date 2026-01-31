/**
 * GMUDApprovalModal - Modal de aprovação GMUD com assinatura digital
 * Suporta workflow sequencial e coleta de assinaturas
 */

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
import { logger } from '@/lib/logger';
  PenTool,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Send,
  Loader2,
  FileText,
  Shield,
} from 'lucide-react';

interface GMUDApprovalModalProps {
  open: boolean;
  onClose: () => void;
  gmudData: {
    id: string;
    gmud_number: string;
    title: string;
    description: string;
    change_type: string;
    impact_assessment?: string;
    risk_level?: string;
    rollback_plan?: string;
    implementation_date?: string;
    current_step: number;
    total_steps: number;
    approvers: Array<{
      id: string;
      role: string;
      status: 'pending' | 'approved' | 'rejected';
      signed_at?: string;
      comments?: string;
    }>;
  };
  approvalId: string;
  userRole: string;
  onApprovalComplete?: () => void;
}

export function GMUDApprovalModal({
  open,
  onClose,
  gmudData,
  approvalId,
  userRole,
  onApprovalComplete,
}: GMUDApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async (approvalAction: 'approve' | 'reject') => {
    if (approvalAction === 'approve' && sigCanvas.current?.isEmpty()) {
      toast.error('Assinatura digital é obrigatória para aprovação');
      return;
    }

    if (approvalAction === 'reject' && !comments.trim()) {
      toast.error('Comentário é obrigatório para rejeição');
      return;
    }

    setSubmitting(true);
    setAction(approvalAction);

    try {
      const signatureData = approvalAction === 'approve' 
        ? sigCanvas.current?.toDataURL() 
        : null;

      // Invocar Edge Function para processar aprovação
      const { data, error } = await supabase.functions.invoke('gmud-workflow', {
        body: {
          action: approvalAction,
          approvalId,
          gmudId: gmudData.id,
          signatureData,
          comments: comments.trim(),
          approverRole: userRole,
        },
      });

      if (error) throw error;

      toast.success(
        approvalAction === 'approve'
          ? 'GMUD aprovada com sucesso!'
          : 'GMUD rejeitada. Solicitante será notificado.'
      );

      onApprovalComplete?.();
      onClose();
    } catch (error) {
      logger.error('Erro ao processar aprovação:', error);
      toast.error('Erro ao processar aprovação. Tente novamente.');
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  };

  const getImpactBadge = (level?: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary">Médio</Badge>;
      case 'low':
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'technical':
        return <Badge className="bg-info text-info-foreground">Técnica</Badge>;
      case 'procedural':
        return <Badge variant="secondary">Processual</Badge>;
      case 'emergency':
        return <Badge variant="destructive">Emergencial</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const progressPercent = (gmudData.current_step / gmudData.total_steps) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Aprovar GMUD {gmudData.gmud_number}
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes da mudança e forneça sua assinatura digital para aprovar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da GMUD */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{gmudData.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {gmudData.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {getTypeBadge(gmudData.change_type)}
                {getImpactBadge(gmudData.risk_level)}
                {gmudData.implementation_date && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(gmudData.implementation_date).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>

              {/* Progresso do workflow */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Aprovação</span>
                  <span>{gmudData.current_step} de {gmudData.total_steps} aprovadores</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Análise de Impacto */}
          {gmudData.impact_assessment && (
            <Card className="p-4 bg-warning/5 border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Análise de Impacto</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gmudData.impact_assessment}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Plano de Rollback */}
          {gmudData.rollback_plan && (
            <Card className="p-4 bg-info/5 border-info/20">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <h4 className="font-medium text-info">Plano de Rollback</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gmudData.rollback_plan}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Status dos Aprovadores */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Status de Aprovação</h4>
            <div className="flex flex-wrap gap-2">
              {gmudData.approvers.map((approver, idx) => (
                <Badge
                  key={approver.id || idx}
                  variant={
                    approver.status === 'approved'
                      ? 'default'
                      : approver.status === 'rejected'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="flex items-center gap-1"
                >
                  {approver.status === 'approved' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : approver.status === 'rejected' ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {approver.role}
                </Badge>
              ))}
            </div>
          </Card>

          <Separator />

          {/* Área de Assinatura Digital */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Assinatura Digital
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
            <div className="border-2 border-dashed rounded-lg bg-background p-2">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 150,
                  className: 'w-full rounded bg-white',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Assine acima para confirmar sua aprovação. A assinatura será registrada com timestamp.
            </p>
          </div>

          {/* Comentários */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentários (obrigatório para rejeição)</Label>
            <Textarea
              id="comments"
              placeholder="Adicione observações ou justificativa..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleSubmit('reject')}
            disabled={submitting}
          >
            {submitting && action === 'reject' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Rejeitar
          </Button>
          <Button
            onClick={() => handleSubmit('approve')}
            disabled={submitting}
            className="bg-success hover:bg-success/90"
          >
            {submitting && action === 'approve' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Aprovar e Assinar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GMUDApprovalModal;
