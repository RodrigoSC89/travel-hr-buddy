/**
 * DocumentSignatureCard - Integração Documental
 * Assinatura digital, versionamento e workflow de aprovação
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileSignature, Upload, Clock, CheckCircle, XCircle,
  Send, Eye, Download, History, Users, FileText,
  AlertCircle, ArrowRight, Pen, Lock, Shield
} from "lucide-react";

interface DocumentVersion {
  id: string;
  version: string;
  created_at: string;
  created_by: string;
  changes: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface SignatureRequest {
  id: string;
  document_name: string;
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  signers: {
    name: string;
    email: string;
    signed: boolean;
    signed_at?: string;
    role: string;
  }[];
  created_at: string;
  expires_at: string;
}

interface ApprovalWorkflow {
  id: string;
  document_name: string;
  current_step: number;
  total_steps: number;
  steps: {
    order: number;
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    approved_at?: string;
    comments?: string;
  }[];
}

export function DocumentSignatureCard() {
  const [documents, setDocuments] = useState<DocumentVersion[]>([
    {
      id: '1',
      version: '2.1',
      created_at: new Date().toISOString(),
      created_by: 'João Silva',
      changes: 'Atualização de cláusulas de SLA',
      status: 'approved'
    },
    {
      id: '2',
      version: '2.0',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      created_by: 'Maria Santos',
      changes: 'Revisão de penalidades',
      status: 'approved'
    }
  ]);

  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([
    {
      id: '1',
      document_name: 'Contrato CNT-2024-001 v2.1',
      status: 'pending',
      signers: [
        { name: 'Carlos Diretor', email: 'carlos@company.com', signed: true, signed_at: new Date().toISOString(), role: 'Diretor Operacional' },
        { name: 'Ana Gerente', email: 'ana@company.com', signed: false, role: 'Gerente de Contratos' },
        { name: 'Pedro Cliente', email: 'pedro@client.com', signed: false, role: 'Representante Legal' }
      ],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
    }
  ]);

  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: '1',
      document_name: 'BROA-2024-015',
      current_step: 2,
      total_steps: 4,
      steps: [
        { order: 1, approver: 'Comandante', role: 'Master', status: 'approved', approved_at: new Date(Date.now() - 86400000).toISOString() },
        { order: 2, approver: 'Engenheiro Chefe', role: 'Chief Engineer', status: 'pending' },
        { order: 3, approver: 'Gerente Operacional', role: 'Operations Manager', status: 'pending' },
        { order: 4, approver: 'Diretor', role: 'Director', status: 'pending' }
      ]
    }
  ]);

  const [showUpload, setShowUpload] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const requestSignature = async (documentId: string) => {
    toast.loading('Enviando solicitação de assinatura...');
    
    try {
      const { error } = await supabase.functions.invoke('contract-request-signature', {
        body: { documentId }
      });

      if (error) throw error;

      toast.dismiss();
      toast.success('Solicitação de assinatura enviada!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao solicitar assinatura');
    }
  };

  const approveStep = (workflowId: string, stepOrder: number) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id !== workflowId) return wf;
      return {
        ...wf,
        current_step: stepOrder + 1,
        steps: wf.steps.map(step => 
          step.order === stepOrder 
            ? { ...step, status: 'approved', approved_at: new Date().toISOString() }
            : step
        )
      };
    }));
    toast.success('Etapa aprovada!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'signed':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Integração Documental</h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Nova Versão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Nova Versão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <Input type="file" className="hidden" id="file-upload" />
                  <Button variant="outline" className="mt-2" onClick={() => document.getElementById('file-upload')?.click()}>
                    Selecionar Arquivo
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Descrição das Alterações</Label>
                  <Textarea placeholder="Descreva as mudanças nesta versão..." />
                </div>
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSignature} onOpenChange={setShowSignature}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Pen className="h-4 w-4 mr-2" />
                Solicitar Assinatura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitar Assinatura Digital</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Input placeholder="Selecione o documento..." />
                </div>
                <div className="space-y-2">
                  <Label>Assinantes</Label>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={`signer-${i}`} className="grid grid-cols-3 gap-2">
                        <Input placeholder="Nome" />
                        <Input placeholder="Email" />
                        <Input placeholder="Cargo" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    + Adicionar Assinante
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Prazo para Assinatura</Label>
                  <Input type="date" />
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Solicitação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Document Versions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Histórico de Versões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div key={doc.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">Versão {doc.version}</span>
                        {idx === 0 && <Badge variant="outline" className="text-xs">Atual</Badge>}
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{doc.changes}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{doc.created_by}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Signature Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Pen className="h-4 w-4 text-blue-500" />
              Assinaturas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {signatureRequests.map(req => (
                  <div key={req.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">{req.document_name}</span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      {req.signers.map((signer) => (
                        <div key={signer.name} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{signer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{signer.name}</p>
                            <p className="text-xs text-muted-foreground">{signer.role}</p>
                          </div>
                          {signer.signed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Progress 
                        value={(req.signers.filter(s => s.signed).length / req.signers.length) * 100} 
                        className="h-1.5 flex-1 mr-3"
                      />
                      <span className="text-xs text-muted-foreground">
                        {req.signers.filter(s => s.signed).length}/{req.signers.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expira em {new Date(req.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Approval Workflows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            Workflows de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map(wf => (
              <div key={wf.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{wf.document_name}</span>
                  </div>
                  <Badge variant="outline">
                    Etapa {wf.current_step} de {wf.total_steps}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  {wf.steps.map((step) => (
                    <div key={`wf-step-${step.order}-${step.approver}`} className="flex items-center">
                      <div className={`flex flex-col items-center ${step.order > 1 ? 'ml-4' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                          ${step.status === 'approved' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : step.status === 'rejected'
                            ? 'bg-red-500 border-red-500 text-white'
                            : step.order === wf.current_step
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/30'
                          }`}
                        >
                          {step.status === 'approved' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : step.status === 'rejected' ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{step.order}</span>
                          )}
                        </div>
                        <span className="text-xs mt-1 text-center max-w-[80px]">{step.approver}</span>
                        <span className="text-[10px] text-muted-foreground">{step.role}</span>
                        {step.order === wf.current_step && step.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="mt-2 h-6 text-xs"
                            onClick={() => approveStep(wf.id, step.order)}
                          >
                            Aprovar
                          </Button>
                        )}
                      </div>
                      {step.order < wf.total_steps && (
                        <ArrowRight className={`h-4 w-4 mx-2 ${
                          step.status === 'approved' ? 'text-green-500' : 'text-muted-foreground/30'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Assinatura digital com validade jurídica (ICP-Brasil)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
