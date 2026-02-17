import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText, Download, Plus, Search, CheckCircle, Clock,
  Calendar, Shield, AlertTriangle, Eye, Send,
  FolderOpen, FileCheck, Archive, Layers, Target, BookOpen,
  Brain, Sparkles, Loader2
} from "lucide-react";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EvidenceItem {
  id: string;
  type: string;
  name: string;
  date: string;
  source: string;
  status: "available" | "pending" | "missing";
  fileSize?: string;
}

export const AutoEvidenceBuilder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("packages");
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const { generateEvidence, loading: aiLoading } = useAIAdvisor({ profile: "inspector", language: "pt-BR" });

  // Real evidence from certificates
  const { data: certificates, isLoading: loadingCerts } = useQuery({
    queryKey: ["evidence-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Real checklists
  const { data: checklists } = useQuery({
    queryKey: ["evidence-checklists"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("operational_checklists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  // Real audits
  const { data: audits } = useQuery({
    queryKey: ["evidence-audits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_audits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Build evidence items from real data
  const evidenceItems: EvidenceItem[] = [
    ...(certificates || []).map((c: any): EvidenceItem => ({
      id: c.id,
      type: "certificate",
      name: c.certificate_number || c.certificate_type || "Certificado",
      date: c.issue_date || c.created_at,
      source: "Certificates",
      status: c.status === "active" ? "available" : c.status === "expired" ? "missing" : "pending",
      fileSize: "–",
    })),
    ...(checklists || []).map((ch: any): EvidenceItem => ({
      id: ch.id,
      type: "checklist",
      name: ch.title || ch.checklist_type || "Checklist",
      date: ch.completed_at || ch.created_at,
      source: "Checklists",
      status: ch.status === "completed" ? "available" : "pending",
    })),
    ...(audits || []).map((a: any): EvidenceItem => ({
      id: a.id,
      type: "report",
      name: a.audit_number || a.audit_type || "Auditoria",
      date: a.created_at,
      source: "Internal Audits",
      status: a.status === "completed" ? "available" : "pending",
    })),
  ];

  // Group into packages by type
  const packages = [
    {
      id: "PKG-CERTS",
      name: "Pacote de Certificados",
      type: "compliance",
      targetAudience: "IMCA",
      status: evidenceItems.filter(e => e.type === "certificate" && e.status === "missing").length === 0 ? "ready" : "in_progress",
      createdAt: new Date().toISOString(),
      items: evidenceItems.filter(e => e.type === "certificate").slice(0, 10),
      completeness: evidenceItems.filter(e => e.type === "certificate").length > 0
        ? Math.round((evidenceItems.filter(e => e.type === "certificate" && e.status === "available").length / Math.max(evidenceItems.filter(e => e.type === "certificate").length, 1)) * 100)
        : 0,
    },
    {
      id: "PKG-AUDITS",
      name: "Pacote de Auditorias",
      type: "audit",
      targetAudience: "Internal",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      items: evidenceItems.filter(e => e.type === "report").slice(0, 10),
      completeness: evidenceItems.filter(e => e.type === "report").length > 0
        ? Math.round((evidenceItems.filter(e => e.type === "report" && e.status === "available").length / Math.max(evidenceItems.filter(e => e.type === "report").length, 1)) * 100)
        : 0,
    },
    {
      id: "PKG-CHECKS",
      name: "Pacote de Checklists Operacionais",
      type: "compliance",
      targetAudience: "Petrobras",
      status: "draft",
      createdAt: new Date().toISOString(),
      items: evidenceItems.filter(e => e.type === "checklist").slice(0, 10),
      completeness: evidenceItems.filter(e => e.type === "checklist").length > 0
        ? Math.round((evidenceItems.filter(e => e.type === "checklist" && e.status === "available").length / Math.max(evidenceItems.filter(e => e.type === "checklist").length, 1)) * 100)
        : 0,
    },
  ];

  const filteredItems = evidenceItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateAISummary = async (pkg: any) => {
    setGeneratingSummary(pkg.id);
    try {
      const eventData = {
        type: pkg.type, name: pkg.name, date: pkg.createdAt,
        description: `Pacote de evidências contendo ${pkg.items.length} documentos para ${pkg.targetAudience}. Completude: ${pkg.completeness}%.`,
        items: pkg.items.map((i: any) => ({ name: i.name, type: i.type, status: i.status })),
      };
      const summary = await generateEvidence(eventData);
      setAiSummaries(prev => ({ ...prev, [pkg.id]: summary }));
      toast.success("Resumo técnico gerado!");
    } catch { toast.error("Erro ao gerar resumo"); }
    finally { setGeneratingSummary(null); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready": return <Badge className="bg-success">Pronto</Badge>;
      case "in_progress": return <Badge className="bg-primary">Em Progresso</Badge>;
      case "draft": return <Badge variant="secondary">Rascunho</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "missing": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  if (loadingCerts) {
    return <div className="space-y-4"><Skeleton className="h-12" /><div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl"><Archive className="h-8 w-8 text-primary" /></div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Auto-Evidence Builder</h2>
            <p className="text-muted-foreground">Evidências reais de certificados, auditorias e checklists</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Pacotes</p><p className="text-2xl font-bold">{packages.length}</p></div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Prontos</p><p className="text-2xl font-bold">{packages.filter(p => p.status === "ready").length}</p></div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Evidências</p><p className="text-2xl font-bold">{evidenceItems.length}</p></div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{evidenceItems.filter(e => e.status === "pending").length}</p></div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Faltantes</p><p className="text-2xl font-bold">{evidenceItems.filter(e => e.status === "missing").length}</p></div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages"><FolderOpen className="w-4 h-4 mr-2" />Pacotes de Evidências</TabsTrigger>
          <TabsTrigger value="library"><Archive className="w-4 h-4 mr-2" />Biblioteca de Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          {packages.map(pkg => (
            <Card key={pkg.id} className="hover:shadow-lg transition-all">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      {getStatusBadge(pkg.status)}
                      <Badge variant="outline">{pkg.targetAudience}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{pkg.items.length} documentos</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Completude</span>
                        <span className={`font-medium ${pkg.completeness === 100 ? "text-green-500" : pkg.completeness >= 70 ? "text-yellow-500" : "text-red-500"}`}>{pkg.completeness}%</span>
                      </div>
                      <Progress value={pkg.completeness} className="h-2" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleGenerateAISummary(pkg)} disabled={generatingSummary === pkg.id}>
                      {generatingSummary === pkg.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                      Resumo IA
                    </Button>
                    <Button size="sm" variant="outline"><Download className="w-3 h-3 mr-1" />PDF</Button>
                  </div>
                </div>
                {aiSummaries[pkg.id] && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><span className="font-medium text-sm">Resumo Técnico (IA)</span></div>
                    <pre className="whitespace-pre-wrap text-xs bg-background/50 p-3 rounded">{aiSummaries[pkg.id]}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Buscar evidências..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getItemStatusIcon(item.status)}
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.source} • {new Date(item.date).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredItems.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma evidência encontrada</p>}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
