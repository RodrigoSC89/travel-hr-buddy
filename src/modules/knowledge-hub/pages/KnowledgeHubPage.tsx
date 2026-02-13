/**
 * Knowledge Hub - Página Principal
 * Dashboard revolucionário para gestão de conhecimento
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Brain,
  FileText,
  Search,
  Upload,
  FolderOpen,
  CheckSquare,
  ClipboardList,
  BarChart3,
  Sparkles,
  BookOpen,
  Filter,
  Grid,
  List,
  RefreshCw,
  Download,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  Clock,
  TrendingUp,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useKnowledgeHub } from '../hooks/useKnowledgeHub';
import { KnowledgeUploader } from '../components/KnowledgeUploader';
import { AIKnowledgeAssistant } from '../components/AIKnowledgeAssistant';
import type { DocumentType, DocumentCategory, KnowledgeDocument } from '../types';

const DOCUMENT_TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
  manual: <BookOpen className="h-4 w-4" />,
  procedure: <ClipboardList className="h-4 w-4" />,
  checklist: <CheckSquare className="h-4 w-4" />,
  form: <FileCheck className="h-4 w-4" />,
  certificate: <FileText className="h-4 w-4" />,
  policy: <FileText className="h-4 w-4" />,
  guideline: <FileText className="h-4 w-4" />,
  report: <BarChart3 className="h-4 w-4" />,
  training: <Brain className="h-4 w-4" />,
  safety_data_sheet: <AlertCircle className="h-4 w-4" />,
  technical_drawing: <FileText className="h-4 w-4" />,
  contract: <FileText className="h-4 w-4" />,
  regulation: <FileText className="h-4 w-4" />,
  bulletin: <FileText className="h-4 w-4" />,
  circular: <FileText className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  navigation: 'bg-blue-500/10 text-blue-600',
  safety: 'bg-red-500/10 text-red-600',
  cargo: 'bg-amber-500/10 text-amber-600',
  machinery: 'bg-slate-500/10 text-slate-600',
  crew: 'bg-purple-500/10 text-purple-600',
  environmental: 'bg-green-500/10 text-green-600',
  commercial: 'bg-indigo-500/10 text-indigo-600',
  legal: 'bg-gray-500/10 text-gray-600',
  quality: 'bg-teal-500/10 text-teal-600',
  training: 'bg-orange-500/10 text-orange-600',
  medical: 'bg-pink-500/10 text-pink-600',
  security: 'bg-rose-500/10 text-rose-600',
  emergency: 'bg-red-600/10 text-red-700',
  operations: 'bg-cyan-500/10 text-cyan-600',
  maintenance: 'bg-yellow-500/10 text-yellow-600',
  general: 'bg-gray-400/10 text-gray-500',
};

const AI_STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  extracting: { label: 'Extraindo', color: 'bg-blue-500', icon: Loader2 },
  analyzing: { label: 'Analisando', color: 'bg-purple-500', icon: Brain },
  embedding: { label: 'Indexando', color: 'bg-indigo-500', icon: Sparkles },
  completed: { label: 'Completo', color: 'bg-green-500', icon: FileCheck },
  failed: { label: 'Falhou', color: 'bg-red-500', icon: AlertCircle },
};

export default function KnowledgeHubPage() {
  const {
    documents,
    analytics,
    isLoadingDocuments,
    isUploading,
    uploadProgress,
    bulkUpload,
    search,
    searchResults,
    isSearching,
    askKnowledge,
    isAsking,
    deleteDocument,
    generateChecklist,
    generateForm,
    refreshDocuments,
  } = useKnowledgeHub();

  const [activeTab, setActiveTab] = useState('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await search(searchQuery);
    }
  };

  const handleUpload = (files: File[], metadata: Partial<KnowledgeDocument>) => {
    bulkUpload({ files, commonMetadata: metadata });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Helmet>
        <title>Knowledge Hub | Nautilus One</title>
        <meta name="description" content="Centro de conhecimento inteligente com IA" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Knowledge Hub
                <Badge className="bg-gradient-to-r from-primary to-primary/70">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Extraordinária
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Centralize manuais, procedimentos, checklists e formulários com IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalDocuments || 0}</p>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.aiProcessed || 0}</p>
                  <p className="text-xs text-muted-foreground">IA Processados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.pendingReview || 0}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.recentlyUpdated || 0}</p>
                  <p className="text-xs text-muted-foreground">Atualizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.expiringCertificates || 0}</p>
                  <p className="text-xs text-muted-foreground">Expirando</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <BarChart3 className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.complianceScore?.toFixed(0) || 0}%</p>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Assistente IA
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklists
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="manual">Manuais</SelectItem>
                    <SelectItem value="procedure">Procedimentos</SelectItem>
                    <SelectItem value="checklist">Checklists</SelectItem>
                    <SelectItem value="form">Formulários</SelectItem>
                    <SelectItem value="certificate">Certificados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="navigation">Navegação</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="crew">Tripulação</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Documents Grid/List */}
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload de manuais, procedimentos e checklists
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => {
                  const statusConfig = AI_STATUS_CONFIG[doc.aiStatus];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="group hover:shadow-lg transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className={cn(
                              "p-2 rounded-lg",
                              CATEGORY_COLORS[doc.category]
                            )}>
                              {DOCUMENT_TYPE_ICONS[doc.documentType]}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" aria-label="Mais opções do documento" title="Mais opções">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generateChecklist(doc.id)}>
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  Gerar Checklist
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generateForm(doc.id)}>
                                  <ClipboardList className="h-4 w-4 mr-2" />
                                  Gerar Formulário
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-sm line-clamp-2 mt-2">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="text-xs line-clamp-2">
                            {doc.description || 'Sem descrição'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <div className="flex items-center gap-1">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                statusConfig.color
                              )} />
                              <span>{statusConfig.label}</span>
                            </div>
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={`tag-${tag}-${i}`} variant="outline" className="text-[10px] px-1">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {filteredDocuments.map((doc) => {
                      const statusConfig = AI_STATUS_CONFIG[doc.aiStatus];
                      
                      return (
                        <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            CATEGORY_COLORS[doc.category]
                          )}>
                            {DOCUMENT_TYPE_ICONS[doc.documentType]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {doc.description || 'Sem descrição'}
                            </p>
                          </div>
                          <Badge variant="outline">{doc.documentType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              statusConfig.color
                            )} />
                            <span className="text-xs">{statusConfig.label}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Mais opções do documento" title="Mais opções">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <KnowledgeUploader 
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    O que a IA vai fazer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Extração de Texto (OCR)</p>
                      <p className="text-sm text-muted-foreground">
                        Extrai todo o texto de PDFs e imagens escaneadas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Brain className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Análise Semântica</p>
                      <p className="text-sm text-muted-foreground">
                        Identifica capítulos, procedimentos, tabelas e formulários
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Extração de Checklists</p>
                      <p className="text-sm text-muted-foreground">
                        Transforma checklists em papel em versões digitais interativas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Geração de Formulários</p>
                      <p className="text-sm text-muted-foreground">
                        Cria formulários digitais preenchíveis automaticamente
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Search className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium">Indexação Vetorial</p>
                      <p className="text-sm text-muted-foreground">
                        Permite busca semântica e perguntas em linguagem natural
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="assistant">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIKnowledgeAssistant 
                  onAsk={(q) => askKnowledge({ question: q })}
                  isLoading={isAsking}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exemplos de Perguntas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Qual o procedimento para incêndio na praça de máquinas?",
                    "Quais são os EPIs obrigatórios para trabalho em altura?",
                    "Como fazer a manutenção preventiva do gerador principal?",
                    "Quais documentos vencem nos próximos 30 dias?",
                    "Mostre o checklist de segurança para operações de carga",
                    "Quais são os requisitos MARPOL para descarte de óleo?",
                  ].map((q, i) => (
                    <Button
                      key={`kb-q-${i}-${q.slice(0,15)}`}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 text-sm"
                      onClick={() => askKnowledge({ question: q })}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 shrink-0 text-amber-500" />
                      <span className="truncate">{q}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Checklists Tab */}
          <TabsContent value="checklists">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Checklists Interativos</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Faça upload de documentos com checklists e a IA irá transformá-los 
                  em versões digitais interativas que podem ser preenchidas e assinadas.
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Checklist
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
