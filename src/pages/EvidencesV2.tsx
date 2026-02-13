/**
 * EvidencesV2 - Gestão de Evidências
 * Upload, categorização e busca de evidências com IA
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileUploadDialog } from "@/components/evidence/FileUploadDialog";
import { 
  FolderOpen, Brain, Upload, Search, FileText, Image, 
  CheckCircle, Clock
} from "lucide-react";

interface Evidence {
  id: string;
  title: string;
  type: string;
  category: string;
  uploaded_at: string;
  module: string;
  status: string;
}

const QUICK_QUESTIONS = [
  "Quais evidências são obrigatórias?",
  "Como categorizar documentos?",
  "Formato aceito para upload?",
  "Como buscar evidências antigas?",
  "Tempo de retenção?",
  "OCR funciona em PDFs?"
];

const EVIDENCE_FIELDS = [
  { name: "evidence_title", label: "Título da Evidência", type: "text" as const, required: true },
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "inspection", label: "Inspeção" },
    { value: "audit", label: "Auditoria" },
    { value: "training", label: "Treinamento" },
    { value: "incident", label: "Incidente" },
    { value: "certification", label: "Certificação" }
  ], required: true },
  { name: "observed_condition", label: "Descrição", type: "textarea" as const, required: true },
];

export default function EvidencesV2() {
  const [evidences, setEvidences] = useState<Evidence[]>([
    { id: "1", title: "PSC Report - Santos", type: "pdf", category: "inspection", uploaded_at: "2025-01-02", module: "MLC", status: "approved" },
    { id: "2", title: "Drill Report - Fire", type: "pdf", category: "training", uploaded_at: "2025-01-01", module: "Drill Simulator", status: "approved" },
    { id: "3", title: "Photo - Equipment Check", type: "image", category: "audit", uploaded_at: "2024-12-30", module: "PEOTRAM", status: "pending" },
  ]);

  const handleUploadComplete = (files: { id: string; name: string; type: string; url: string }[]) => {
    const newEvidences: Evidence[] = files.map(file => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      category: 'audit',
      uploaded_at: new Date().toISOString().split('T')[0],
      module: 'Upload Manual',
      status: 'pending'
    }));
    
    setEvidences(prev => [...newEvidences, ...prev]);
  };

  const stats = [
    { label: "Total Evidências", value: evidences.length, icon: FolderOpen, color: "blue" as const },
    { label: "PDFs", value: evidences.filter(e => e.type === 'pdf').length, icon: FileText, color: "green" as const },
    { label: "Imagens", value: evidences.filter(e => e.type === 'image').length, icon: Image, color: "purple" as const },
    { label: "Pendentes", value: evidences.filter(e => e.status === 'pending').length, icon: Clock, color: "orange" as const },
  ];

  const columns = [
    { key: "title", label: "Título", sortable: true },
    { key: "type", label: "Tipo", render: (item: Evidence) => (
      <Badge variant="outline">{item.type === 'pdf' ? 'PDF' : 'Imagem'}</Badge>
    )},
    { key: "category", label: "Categoria", render: (item: Evidence) => <Badge variant="secondary">{item.category}</Badge> },
    { key: "module", label: "Módulo" },
    { key: "uploaded_at", label: "Upload", render: (item: Evidence) => new Date(item.uploaded_at).toLocaleDateString('pt-BR') },
    { key: "status", label: "Status", render: (item: Evidence) => (
      <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
        {item.status === 'approved' ? 'Aprovado' : 'Pendente'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={FolderOpen}
      title="Evidências"
      description="Gestão centralizada de evidências com OCR e categorização IA"
      gradient="purple"
      badges={[
        { icon: Brain, label: "IA Categorização" },
        { icon: Search, label: "OCR Search" },
        { icon: Upload, label: "Multi-Upload" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="evidences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="evidences">Evidências</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Gerar Evidência</TabsTrigger>
        </TabsList>

        <TabsContent value="evidences">
          <DataTableV2
            data={evidences}
            columns={columns}
            title="Base de Evidências"
            icon={FolderOpen}
            searchable
            searchPlaceholder="Buscar evidências..."
            onRefresh={() => { setEvidences([...evidences]); }}
            actions={[
              { label: "Visualizar", icon: FileText, onClick: (item) => toast.info(item.title, { description: `Categoria: ${item.category} | Status: ${item.status} | Módulo: ${item.module || 'N/A'}`, duration: 6000 }) },
              { label: "Aprovar", icon: CheckCircle, onClick: (item) => {
                setEvidences(prev => prev.map(e => e.id === item.id ? { ...e, status: 'approved' } : e));
                toast.success(`Evidência "${item.title}" aprovada`);
              }},
            ]}
            filters={[
              { key: "category", label: "Categoria", options: [
                { value: "inspection", label: "Inspeção" },
                { value: "audit", label: "Auditoria" },
                { value: "training", label: "Treinamento" }
              ]}
            ]}
          />
        </TabsContent>

        <TabsContent value="upload">
          <CardV2 icon={Upload} title="Upload de Evidências" description="Arraste arquivos ou clique para selecionar" gradient="blue">
            <FileUploadDialog 
              onUploadComplete={handleUploadComplete}
              maxFiles={10}
              maxSizeMB={50}
            />
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Evidências"
            moduleContext="gestão de evidências, upload de documentos, OCR, categorização"
            systemPrompt="Você é especialista em gestão de evidências e documentação. Ajude com categorização, busca, requisitos de retenção e OCR."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="evidences-ai"
            accentColor="purple"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Evidências"
            moduleContext="gestão de evidências, documentação, compliance"
            edgeFunctionName="evidences-generate"
            fields={EVIDENCE_FIELDS}
            accentColor="purple"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
