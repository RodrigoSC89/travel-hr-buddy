/**
 * SGSO Audit Trail - 16 Management Practices (ANP Resolution 46/2016)
 * Advanced audit system with Sim/Não/Parcial classification
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, XCircle, AlertCircle, FileText, Save, 
  ClipboardCheck, Target, Users, Shield, Anchor,
  Activity, BookOpen, Wrench, AlertTriangle, Truck,
  Building, BarChart3, FileSearch, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// 16 ANP Management Practices (Práticas de Gestão)
const MANAGEMENT_PRACTICES = [
  { id: "PG-01", name: "Liderança e Comprometimento", icon: Target, category: "leadership" },
  { id: "PG-02", name: "Política de SGSO", icon: FileText, category: "policy" },
  { id: "PG-03", name: "Objetivos e Metas", icon: Target, category: "objectives" },
  { id: "PG-04", name: "Organização e Responsabilidades", icon: Users, category: "organization" },
  { id: "PG-05", name: "Qualificação e Treinamento", icon: BookOpen, category: "training" },
  { id: "PG-06", name: "Comunicação", icon: Activity, category: "communication" },
  { id: "PG-07", name: "Documentação", icon: FileText, category: "documentation" },
  { id: "PG-08", name: "Gestão de Riscos", icon: AlertTriangle, category: "risk" },
  { id: "PG-09", name: "Integridade Mecânica", icon: Wrench, category: "mechanical" },
  { id: "PG-10", name: "Segurança de Processo", icon: Shield, category: "process" },
  { id: "PG-11", name: "Gestão de Mudanças", icon: RefreshCw, category: "change" },
  { id: "PG-12", name: "Operações e Manutenção", icon: Anchor, category: "operations" },
  { id: "PG-13", name: "Gestão de Contratadas", icon: Building, category: "contractors" },
  { id: "PG-14", name: "Logística e Transporte", icon: Truck, category: "logistics" },
  { id: "PG-15", name: "Investigação de Incidentes", icon: FileSearch, category: "incidents" },
  { id: "PG-16", name: "Auditorias e Verificações", icon: ClipboardCheck, category: "audits" },
];

type AuditStatus = "sim" | "nao" | "parcial" | "na" | "";

interface AuditItem {
  practiceId: string;
  status: AuditStatus;
  observations: string;
  evidence: string[];
  actionRequired: boolean;
  dueDate?: string;
}

interface AuditSession {
  id: string;
  auditDate: string;
  auditor: string;
  vesselId?: string;
  items: AuditItem[];
  overallScore: number;
  status: "draft" | "in_progress" | "completed" | "approved";
}

export const SGSOAuditTrail: React.FC = () => {
  const [activeTab, setActiveTab] = useState("audit");
  const [currentAudit, setCurrentAudit] = useState<AuditSession | null>(null);
  const [auditItems, setAuditItems] = useState<Record<string, AuditItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeAudit();
  }, []);

  const initializeAudit = () => {
    const initialItems: Record<string, AuditItem> = {};
    MANAGEMENT_PRACTICES.forEach(practice => {
      initialItems[practice.id] = {
        practiceId: practice.id,
        status: "",
        observations: "",
        evidence: [],
        actionRequired: false,
      };
    });
    setAuditItems(initialItems);
  };

  const updateAuditItem = (practiceId: string, field: keyof AuditItem, value: AuditItem[keyof AuditItem]) => {
    setAuditItems(prev => ({
      ...prev,
      [practiceId]: {
        ...prev[practiceId],
        [field]: value,
      },
    }));
  };

  const calculateScore = (): number => {
    const items = Object.values(auditItems);
    const evaluated = items.filter(i => i.status !== "" && i.status !== "na");
    if (evaluated.length === 0) return 0;
    
    const score = evaluated.reduce((acc, item) => {
      if (item.status === "sim") return acc + 100;
      if (item.status === "parcial") return acc + 50;
      return acc;
    }, 0);
    
    return Math.round(score / evaluated.length);
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
    case "sim":
      return <Badge className="bg-success hover:bg-success/90">Sim</Badge>;
    case "nao":
      return <Badge variant="destructive">Não</Badge>;
    case "parcial":
      return <Badge className="bg-warning hover:bg-warning/90">Parcial</Badge>;
    case "na":
      return <Badge variant="outline">N/A</Badge>;
    default:
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
    case "sim":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "nao":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "parcial":
      return <AlertCircle className="h-5 w-5 text-warning" />;
    default:
      return null;
    }
  };

  const saveAudit = async () => {
    setIsSaving(true);
    try {
      const auditData = {
        audit_date: new Date().toISOString(),
        status: "in_progress",
        score: calculateScore(),
        items: Object.values(auditItems),
        metadata: {
          practices_evaluated: Object.values(auditItems).filter(i => i.status !== "").length,
          conformities: Object.values(auditItems).filter(i => i.status === "sim").length,
          non_conformities: Object.values(auditItems).filter(i => i.status === "nao").length,
          partial: Object.values(auditItems).filter(i => i.status === "parcial").length,
        },
      };

      const { error } = await supabase
        .from("sgso_audits")
        .insert(auditData);

      if (error) throw error;

      toast({
        title: "Auditoria salva",
        description: "Os dados da auditoria foram salvos com sucesso.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const score = calculateScore();
  const conformities = Object.values(auditItems).filter(i => i.status === "sim").length;
  const nonConformities = Object.values(auditItems).filter(i => i.status === "nao").length;
  const partial = Object.values(auditItems).filter(i => i.status === "parcial").length;

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{score}%</div>
            <Progress value={score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Conformidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{conformities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Não Conformidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{nonConformities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Parciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{partial}</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Práticas de Gestão - ANP Resolução 46/2016</CardTitle>
              <CardDescription>
                Avalie cada prática de gestão conforme requisitos da ANP
              </CardDescription>
            </div>
            <Button onClick={saveAudit} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Auditoria"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {MANAGEMENT_PRACTICES.map((practice) => {
                const IconComponent = practice.icon;
                const item = auditItems[practice.id];
                
                return (
                  <Card key={practice.id} className={`
                    ${item?.status === "sim" ? "border-success/50 bg-success/5" : ""}
                    ${item?.status === "nao" ? "border-destructive/50 bg-destructive/5" : ""}
                    ${item?.status === "parcial" ? "border-warning/50 bg-warning/5" : ""}
                  `}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 min-w-[280px]">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{practice.id}</div>
                            <div className="text-sm text-muted-foreground">{practice.name}</div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Avaliação</label>
                            <Select
                              value={item?.status || "pending"}
                              onValueChange={(value) => updateAuditItem(practice.id, "status", value as AuditStatus)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sim">✅ Sim (Conforme)</SelectItem>
                                <SelectItem value="parcial">⚠️ Parcial</SelectItem>
                                <SelectItem value="nao">❌ Não (NC)</SelectItem>
                                <SelectItem value="na">➖ N/A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Observações</label>
                            <Textarea
                              placeholder="Descreva evidências e observações..."
                              value={item?.observations || ""}
                              onChange={(e) => updateAuditItem(practice.id, "observations", e.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          {getStatusIcon(item?.status || "")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
