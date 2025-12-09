import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  History, 
  Users, 
  Shield,
  Plus,
  Eye,
  Edit,
  Send,
  Download
} from 'lucide-react';
import { 
  createDocument, 
  getDocuments, 
  submitForApproval, 
  processApproval,
  getApprovalHistory,
  type Document,
  type ApprovalStep,
  type DocumentCategory
} from '@/lib/documents';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-yellow-500/20 text-yellow-600',
  pending_approval: 'bg-yellow-500/20 text-yellow-600',
  approved: 'bg-green-500/20 text-green-600',
  rejected: 'bg-red-500/20 text-red-600',
  superseded: 'bg-gray-500/20 text-gray-600',
  archived: 'bg-gray-500/20 text-gray-600'
};

const categoryLabels: Record<string, string> = {
  ism_procedure: 'Procedimento ISM',
  mlc_agreement: 'Acordo MLC',
  psc_checklist: 'Checklist PSC',
  audit_report: 'Relatório de Auditoria',
  safety_manual: 'Manual de Segurança',
  crew_certificate: 'Certificado de Tripulação',
  vessel_certificate: 'Certificado de Embarcação',
  emergency_procedure: 'Procedimento de Emergência',
  training_record: 'Registro de Treinamento',
  maintenance_procedure: 'Procedimento de Manutenção'
};

export const DocumentWorkflowPanel: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'ism_procedure' as DocumentCategory,
    description: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments({});
      setDocuments(docs);
      setPendingApprovals([]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const doc = await createDocument({
        organization_id: '', // Will be set by RLS
        document_number: `DOC-${Date.now()}`,
        title: newDoc.title,
        category: newDoc.category,
        description: newDoc.description,
        status: 'draft'
      });
      
      if (doc) {
        toast.success('Documento criado com sucesso');
        setIsCreateOpen(false);
        setNewDoc({ title: '', category: 'ism_procedure', description: '' });
        loadDocuments();
      }
    } catch (error) {
      toast.error('Erro ao criar documento');
    }
  };

  const handleSubmitForApproval = async (documentId: string) => {
    try {
      await submitForApproval(documentId, [
        { step_name: 'Revisão Técnica', required_role: 'technical_reviewer' },
        { step_name: 'Aprovação Final', required_role: 'manager' }
      ]);
      toast.success('Documento enviado para aprovação');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao enviar para aprovação');
    }
  };

  const handleApprove = async (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => {
    try {
      await processApproval(approvalId, decision, comments, undefined, undefined);
      toast.success(decision === 'approved' ? 'Documento aprovado' : 'Documento rejeitado');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao processar aprovação');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Workflow de Documentos ISM/MLC</h2>
          <p className="text-muted-foreground">Controle de versão, aprovação e distribuição</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Documento</DialogTitle>
              <DialogDescription>
                Crie um documento controlado para o sistema ISM/MLC
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                  id="title"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="Nome do documento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={newDoc.category} 
                  onValueChange={(v) => setNewDoc({ ...newDoc, category: v as DocumentCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="Descrição do documento"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateDocument}>Criar Documento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expirados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <Clock className="h-4 w-4" />
            Aprovações ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Controlados</CardTitle>
              <CardDescription>Gerenciamento de documentos ISM/MLC com controle de versão</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum documento cadastrado</p>
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    Criar Primeiro Documento
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{doc.title}</h4>
                              <Badge variant="outline">{doc.document_number}</Badge>
                              <Badge className={statusColors[doc.status]}>
                                {doc.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {categoryLabels[doc.category]} • Versão {doc.version}
                            </p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {doc.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSubmitForApproval(doc.id)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aprovações Pendentes</CardTitle>
              <CardDescription>Documentos aguardando sua revisão e aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma aprovação pendente</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div 
                        key={approval.id} 
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{approval.step_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Etapa {approval.step_order} • {approval.required_role}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleApprove(approval.id, 'rejected', 'Documento rejeitado')}
                            >
                              Rejeitar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(approval.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Versões</CardTitle>
              <CardDescription>Rastreamento completo de alterações e aprovações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um documento para ver o histórico</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentWorkflowPanel;
