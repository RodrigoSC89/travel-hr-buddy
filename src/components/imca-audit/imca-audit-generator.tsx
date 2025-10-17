/**
 * IMCA Audit Generator Component
 * Main UI for generating and managing IMCA DP technical audits
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Ship, FileText, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  generateIMCAAudit,
  saveIMCAAudit,
  exportIMCAAuditAsMarkdown,
} from "@/services/imca-audit-service";
import type {
  IMCAAuditRequest,
  IMCAAuditResult,
  DPClass,
} from "@/types/imca-audit";
import {
  getRiskLevelColor,
  getPriorityColor,
} from "@/types/imca-audit";

// Form validation schema
const auditFormSchema = z.object({
  vesselName: z.string().min(3, "Nome da embarcação deve ter no mínimo 3 caracteres"),
  dpClass: z.enum(["DP1", "DP2", "DP3"], {
    required_error: "Selecione a classe DP",
  }),
  location: z.string().min(3, "Local deve ter no mínimo 3 caracteres"),
  auditObjective: z.string().min(10, "Objetivo deve ter no mínimo 10 caracteres"),
  incidentDetails: z.string().optional(),
  environmentalConditions: z.string().optional(),
  systemStatus: z.string().optional(),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

export function IMCAAuditGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditResult, setAuditResult] = useState<IMCAAuditResult | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      vesselName: "",
      dpClass: undefined,
      location: "",
      auditObjective: "",
      incidentDetails: "",
      environmentalConditions: "",
      systemStatus: "",
    },
  });

  const onSubmit = async (values: AuditFormValues) => {
    setIsGenerating(true);
    try {
      const request: IMCAAuditRequest = {
        vesselName: values.vesselName,
        dpClass: values.dpClass as DPClass,
        location: values.location,
        auditObjective: values.auditObjective,
        operationalData: {
          incidentDetails: values.incidentDetails || undefined,
          environmentalConditions: values.environmentalConditions || undefined,
          systemStatus: values.systemStatus || undefined,
        },
      };

      const result = await generateIMCAAudit(request);
      setAuditResult(result);
      setActiveTab("results");
      toast.success("Auditoria gerada com sucesso!");
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditResult) return;

    setIsSaving(true);
    try {
      const saved = await saveIMCAAudit(auditResult);
      setAuditResult(saved);
      toast.success("Auditoria salva com sucesso!");
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erro ao salvar auditoria. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!auditResult) return;

    try {
      exportIMCAAuditAsMarkdown(auditResult);
      toast.success("Auditoria exportada com sucesso!");
    } catch (error) {
      console.error("Error exporting audit:", error);
      toast.error("Erro ao exportar auditoria. Tente novamente.");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Auditoria Técnica IMCA</h1>
            <p className="text-muted-foreground">
              Sistema de Auditoria para Embarcações DP
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="operational">Dados Operacionais</TabsTrigger>
          <TabsTrigger value="results" disabled={!auditResult}>
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas da Auditoria</CardTitle>
              <CardDescription>
                Preencha os dados principais da embarcação e objetivo da auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="vesselName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Embarcação</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: DP Construction Vessel Alpha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dpClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classe DP</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a classe DP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DP1">DP1</SelectItem>
                            <SelectItem value="DP2">DP2</SelectItem>
                            <SelectItem value="DP3">DP3</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Classe de posicionamento dinâmico da embarcação
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bacia de Santos, Brasil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auditObjective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo da Auditoria</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Avaliação técnica pós-incidente para identificação de não conformidades e melhorias"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("operational")}
                    >
                      Próximo
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational">
          <Card>
            <CardHeader>
              <CardTitle>Dados Operacionais (Opcional)</CardTitle>
              <CardDescription>
                Forneça informações adicionais para uma análise mais detalhada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="incidentDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detalhes de Incidente</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Falha no propulsor #3 durante operações de lançamento de ROV"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Se houver incidente relacionado, descreva os detalhes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condições Ambientais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Mar agitado com ondas de 2-3m, ventos de 25 nós"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status dos Sistemas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Sistema principal operando normalmente, backup em modo standby"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Voltar
                    </Button>
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando Auditoria...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar Auditoria
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {auditResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{auditResult.vesselName}</CardTitle>
                      <CardDescription>
                        {auditResult.location} - {auditResult.auditDate.toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSaveAudit}
                        disabled={isSaving || !!auditResult.id}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Salvar"
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleExportMarkdown}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar MD
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pontuação Geral</h3>
                    <div className="text-4xl font-bold text-primary">
                      {auditResult.overallScore}/100
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Resumo Executivo</h3>
                    <p className="text-sm text-muted-foreground">{auditResult.summary}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Não Conformidades</h3>
                    <div className="space-y-3">
                      {auditResult.nonConformities.map((nc, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold">{nc.module}</div>
                              <Badge variant={getRiskLevelColor(nc.riskLevel) as any}>
                                {nc.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {nc.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <strong>Norma:</strong> {nc.standard}
                            </div>
                            <div className="text-xs mt-2">
                              <strong>Recomendação:</strong> {nc.recommendation}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Plano de Ação</h3>
                    <div className="space-y-3">
                      {auditResult.actionPlan.map((action, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold">{action.description}</div>
                              <Badge variant={getPriorityColor(action.priority) as any}>
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <strong>Responsável:</strong> {action.responsible}
                              </div>
                              <div>
                                <strong>Prazo:</strong>{" "}
                                {action.deadline.toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
