/**
 * Compliance Auto-Checklist Generator
 * AI-powered checklist generation for any maritime standard/inspection
 * Generates tailored checklists based on vessel type, age, flag, and trade area
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { toast } from "sonner";
import {
  ClipboardCheck, Sparkles, Download, Loader2, Ship, Calendar,
  CheckCircle, AlertTriangle, FileText, Plus, Printer
} from "lucide-react";

export interface ComplianceAutoChecklistGeneratorProps {
  moduleId: string;
  moduleName: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  requirement: string;
  reference: string;
  priority: "critical" | "high" | "medium" | "low";
  checked: boolean;
  notes?: string;
}

const INSPECTION_TYPES = [
  { value: "psc", label: "Port State Control (PSC)" },
  { value: "ism_external", label: "Auditoria Externa ISM" },
  { value: "ism_internal", label: "Auditoria Interna ISM" },
  { value: "isps", label: "Verificação ISPS" },
  { value: "sire", label: "Inspeção SIRE/OCIMF" },
  { value: "cdi", label: "Inspeção CDI" },
  { value: "rightship", label: "Inspeção RightShip" },
  { value: "flag_state", label: "Auditoria Flag State" },
  { value: "class_annual", label: "Vistoria Anual Classe" },
  { value: "class_intermediate", label: "Vistoria Intermediária" },
  { value: "class_special", label: "Vistoria Especial/Renovação" },
  { value: "mlc", label: "Inspeção MLC 2006" },
  { value: "issc", label: "Verificação ISSC" },
  { value: "doc_smc", label: "Auditoria DOC/SMC" },
  { value: "peotram", label: "Auditoria PEOTRAM/ANP" },
];

const VESSEL_TYPES = [
  "Oil Tanker", "Chemical Tanker", "LNG Carrier", "LPG Carrier",
  "Bulk Carrier", "Container Ship", "General Cargo", "Ro-Ro",
  "Passenger Ship", "Offshore Supply Vessel (OSV/PSV)", "AHTS",
  "Platform/FPSO", "Tug", "Dredger", "Fishing Vessel",
];

export function ComplianceAutoChecklistGenerator({
  moduleId,
  moduleName,
}: ComplianceAutoChecklistGeneratorProps) {
  const { generate, isLoading } = useNautilusAI();
  const [inspectionType, setInspectionType] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [flagState, setFlagState] = useState("");
  const [tradeArea, setTradeArea] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState<ChecklistItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!inspectionType) {
      toast.error("Selecione o tipo de inspeção");
      return;
    }

    setIsGenerating(true);
    setGeneratedChecklist([]);

    const inspectionLabel = INSPECTION_TYPES.find(t => t.value === inspectionType)?.label || inspectionType;

    const result = await generate("qhse",
      `Gere um checklist COMPLETO e DETALHADO para a seguinte inspeção marítima:

TIPO DE INSPEÇÃO: ${inspectionLabel}
TIPO DE EMBARCAÇÃO: ${vesselType || "Não especificado"}
NOME DA EMBARCAÇÃO: ${vesselName || "Não especificado"}
ESTADO DE BANDEIRA: ${flagState || "Não especificado"}
ÁREA DE COMÉRCIO: ${tradeArea || "Não especificado"}
MÓDULO: ${moduleName}

FORMATO OBRIGATÓRIO - Retorne um JSON array com objetos contendo:
- id: string único (ex: "CHK-001")
- category: categoria do item (ex: "Certificados", "Documentação SMS", "Equipamentos de Segurança")
- requirement: descrição detalhada do que verificar
- reference: referência regulatória (ex: "SOLAS Ch.III Reg.20", "ISM Code 10.1")
- priority: "critical" | "high" | "medium" | "low"

Gere pelo menos 30 itens cobrindo TODAS as áreas relevantes para este tipo de inspeção.
Retorne APENAS o JSON array, sem texto adicional.`,
      { inspectionType, vesselType, vesselName, flagState, tradeArea, moduleId }
    );

    if (result?.response) {
      try {
        const jsonMatch = result.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const items = JSON.parse(jsonMatch[0]) as Array<Omit<ChecklistItem, "checked">>;
          setGeneratedChecklist(items.map(item => ({ ...item, checked: false })));
          toast.success(`Checklist gerado com ${items.length} itens!`);
        } else {
          toast.error("Formato de resposta inválido");
        }
      } catch {
        // Fallback: create items from text
        const lines = result.response.split("\n").filter(l => l.trim().length > 10);
        const fallbackItems: ChecklistItem[] = lines.slice(0, 30).map((line, i) => ({
          id: `CHK-${String(i + 1).padStart(3, "0")}`,
          category: "Geral",
          requirement: line.replace(/^[\d\-\.\*]+\s*/, "").trim(),
          reference: moduleName,
          priority: i < 5 ? "critical" as const : i < 15 ? "high" as const : "medium" as const,
          checked: false,
        }));
        setGeneratedChecklist(fallbackItems);
        toast.success(`Checklist gerado com ${fallbackItems.length} itens`);
      }
    }

    setIsGenerating(false);
  }, [inspectionType, vesselType, vesselName, flagState, tradeArea, moduleName, moduleId, generate]);

  const toggleItem = (id: string) => {
    setGeneratedChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const checkedCount = generatedChecklist.filter(i => i.checked).length;
  const completionRate = generatedChecklist.length > 0
    ? Math.round((checkedCount / generatedChecklist.length) * 100)
    : 0;

  const categories = [...new Set(generatedChecklist.map(i => i.category))];

  const handleExport = () => {
    const content = generatedChecklist.map(item =>
      `[${item.checked ? "X" : " "}] ${item.category} | ${item.requirement} | Ref: ${item.reference} | ${item.priority}`
    ).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${inspectionType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Checklist exportado!");
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerador Inteligente de Checklists
          </CardTitle>
          <CardDescription>
            IA gera checklists personalizados com base no tipo de inspeção, embarcação, bandeira e área de comércio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Inspeção *</Label>
              <Select value={inspectionType} onValueChange={setInspectionType}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Embarcação</Label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {VESSEL_TYPES.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome da Embarcação</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Ex: MV Atlantic Pioneer" />
            </div>
            <div>
              <Label>Estado de Bandeira</Label>
              <Input value={flagState} onChange={e => setFlagState(e.target.value)} placeholder="Ex: Liberia, Marshall Islands" />
            </div>
            <div>
              <Label>Área de Comércio</Label>
              <Input value={tradeArea} onChange={e => setTradeArea(e.target.value)} placeholder="Ex: Cabotagem Brasil, International" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={isGenerating || !inspectionType} className="w-full gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Gerar Checklist com IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Checklist */}
      {generatedChecklist.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Checklist Gerado ({generatedChecklist.length} itens)
                </CardTitle>
                <CardDescription>
                  {checkedCount}/{generatedChecklist.length} verificados • {completionRate}% completo
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
            <Progress value={completionRate} className="mt-3" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {category}
                    </h3>
                    <div className="space-y-2 ml-2">
                      {generatedChecklist.filter(i => i.category === category).map(item => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                            item.checked ? "bg-success/5 border-success/30" : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                              {item.requirement}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{item.reference}</Badge>
                              <Badge className={`text-xs ${
                                item.priority === "critical" ? "bg-destructive/20 text-destructive" :
                                item.priority === "high" ? "bg-warning/20 text-warning" :
                                item.priority === "medium" ? "bg-primary/20 text-primary" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
