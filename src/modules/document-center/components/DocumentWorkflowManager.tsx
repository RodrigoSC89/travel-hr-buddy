/**
 * DocumentWorkflowManager - Gestão de Workflows de Documentos
 * Aprovações, versionamento e conformidade
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Clock, CheckCircle2, AlertTriangle, User,
  Search, Filter, Plus, ArrowRight, Eye, Edit, Download,
  Upload, History, Send, MessageSquare, Shield, Brain,
  FolderOpen, Tag, Calendar, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Document {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  status: "draft" | "pending-review" | "pending-approval" | "approved" | "expired" | "rejected";
  author: string;
  lastModified: string;
  expiryDate?: string;
  approvers: { name: string; status: "pending" | "approved" | "rejected" }[];
  vessel?: string;
  tags: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  status: "completed" | "current" | "pending";
  assignee?: string;
  completedAt?: string;
}

const documents: Document[] = [
  { 
    id: "1", 
    title: "Manual de Segurança - ISM", 
    type: "Manual", 
    category: "Segurança", 
    version: "3.2", 
    status: "pending-approval", 
    author: "Carlos Silva", 
    lastModified: "2026-02-03", 
    approvers: [
      { name: "João Santos", status: "approved" },
      { name: "Maria Costa", status: "pending" },
    ],
    vessel: "MV Atlântico Sul",
    tags: ["ISM", "Obrigatório", "Certificação"]
  },
  { 
    id: "2", 
    title: "Plano de Emergência - SOPEP", 
    type: "Plano", 
    category: "Emergência", 
    version: "2.1", 
    status: "approved", 
    author: "Pedro Oliveira", 
    lastModified: "2026-01-28", 
    expiryDate: "2027-01-28",
    approvers: [
      { name: "Comandante", status: "approved" },
    ],
    vessel: "MV Horizonte",
    tags: ["MARPOL", "Obrigatório"]
  },
  { 
    id: "3", 
    title: "Checklist Inspeção PSC", 
    type: "Checklist", 
    category: "Compliance", 
    version: "1.5", 
    status: "draft", 
    author: "Ana Ferreira", 
    lastModified: "2026-02-04", 
    approvers: [],
    tags: ["PSC", "Inspeção"]
  },
  { 
    id: "4", 
    title: "Certificado STCW - Tripulação", 
    type: "Certificado", 
    category: "Tripulação", 
    version: "1.0", 
    status: "expired", 
    author: "RH", 
    lastModified: "2025-12-15", 
    expiryDate: "2026-01-15",
    approvers: [],
    vessel: "MV Oceano",
    tags: ["STCW", "Vencido", "Urgente"]
  },
  { 
    id: "5", 
    title: "Contrato Afretamento TCP", 
    type: "Contrato", 
    category: "Comercial", 
    version: "1.3", 
    status: "pending-review", 
    author: "Jurídico", 
    lastModified: "2026-02-02", 
    approvers: [
      { name: "Diretor Comercial", status: "pending" },
      { name: "Diretor Financeiro", status: "pending" },
    ],
    tags: ["Contrato", "Comercial", "Confidencial"]
  },
];

function StatusBadge({ status }: { status: Document["status"] }) {
  const config = {
    draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
    "pending-review": { label: "Em Revisão", className: "bg-primary/10 text-primary" },
    "pending-approval": { label: "Aguard. Aprovação", className: "bg-warning/10 text-warning" },
    approved: { label: "Aprovado", className: "bg-success/10 text-success" },
    expired: { label: "Expirado", className: "bg-destructive/10 text-destructive" },
    rejected: { label: "Rejeitado", className: "bg-destructive text-destructive-foreground" },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function DocumentCard({ document }: { document: Document }) {
  const pendingApprovers = document.approvers.filter(a => a.status === "pending").length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={document.status} />
            <Badge variant="outline">{document.type}</Badge>
            <span className="text-xs text-muted-foreground">v{document.version}</span>
          </div>
          <h4 className="font-medium mt-2">{document.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {document.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {document.lastModified}
            </span>
          </div>
          {document.vessel && (
            <p className="text-xs text-muted-foreground mt-1">📍 {document.vessel}</p>
          )}
        </div>
        <div className="text-right">
          {pendingApprovers > 0 && (
            <Badge variant="secondary" className="mb-2">
              {pendingApprovers} aprovação pendente
            </Badge>
          )}
          {document.expiryDate && (
            <p className={`text-xs ${document.status === "expired" ? "text-destructive" : "text-muted-foreground"}`}>
              Exp: {document.expiryDate}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {document.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            <Tag className="h-2 w-2 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      {/* Approvers Progress */}
      {document.approvers.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            {document.approvers.map((approver, idx) => (
              <div key={idx} className="flex items-center">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={`text-xs ${
                    approver.status === "approved" ? "bg-success/20 text-success" :
                    approver.status === "rejected" ? "bg-destructive/20 text-destructive" :
                    "bg-muted"
                  }`}>
                    {approver.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {idx < document.approvers.length - 1 && (
                  <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          Visualizar
        </Button>
        {document.status === "pending-approval" && (
          <Button size="sm" className="flex-1 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aprovar
          </Button>
        )}
        {document.status === "draft" && (
          <Button size="sm" variant="secondary" className="gap-1">
            <Send className="h-3 w-3" />
            Enviar
          </Button>
        )}
        <Button size="sm" variant="ghost">
          <History className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function DocumentWorkflowManager() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = {
    total: documents.length,
    pendingApproval: documents.filter(d => d.status === "pending-approval").length,
    pendingReview: documents.filter(d => d.status === "pending-review").length,
    expired: documents.filter(d => d.status === "expired").length,
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "pending" && (d.status === "pending-approval" || d.status === "pending-review")) ||
                      (activeTab === "approved" && d.status === "approved") ||
                      (activeTab === "expired" && d.status === "expired");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Aguard. Aprovação</p>
                <p className="text-2xl font-bold text-warning">{stats.pendingApproval}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Edit className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Análise IA de Documentos</h4>
              <p className="text-sm text-muted-foreground">
                1 certificado STCW expirado requer ação imediata. 
                2 documentos aguardam sua aprovação há mais de 48h.
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Ver Pendências
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Gestão de Documentos
              </CardTitle>
              <CardDescription>Workflows de aprovação e controle de versões</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar documentos..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({documents.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({stats.pendingApproval + stats.pendingReview})
              </TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="expired" className="text-destructive">
                Expirados ({stats.expired})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
                {filteredDocs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum documento encontrado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
