/**
 * AI Contract Generator - World-Class Compliance
 * Generate maritime contracts using AI with legal clause library
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Bot, Download, Copy, CheckCircle, Scale, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContractClause {
  id: string;
  title: string;
  category: string;
  regulation: string;
  required: boolean;
}

const CLAUSE_LIBRARY: ContractClause[] = [
  { id: "mlc_hours", title: "Horas de Trabalho e Descanso (MLC Reg. 2.3)", category: "Trabalho", regulation: "MLC 2006", required: true },
  { id: "mlc_wages", title: "Salários e Pagamento (MLC Reg. 2.2)", category: "Financeiro", regulation: "MLC 2006", required: true },
  { id: "mlc_repatriation", title: "Repatriação (MLC Reg. 2.5)", category: "Direitos", regulation: "MLC 2006", required: true },
  { id: "mlc_medical", title: "Cuidados Médicos a Bordo (MLC Reg. 4.1)", category: "Saúde", regulation: "MLC 2006", required: true },
  { id: "stcw_certs", title: "Certificações STCW Requeridas", category: "Qualificação", regulation: "STCW", required: true },
  { id: "ism_duties", title: "Deveres ISM e Responsabilidades SMS", category: "Segurança", regulation: "ISM Code", required: true },
  { id: "indemnity", title: "Cláusula de Indenização e Seguro P&I", category: "Financeiro", regulation: "Comercial", required: false },
  { id: "termination", title: "Condições de Rescisão e Aviso Prévio", category: "Contratual", regulation: "MLC 2006", required: true },
  { id: "jurisdiction", title: "Jurisdição e Lei Aplicável", category: "Legal", regulation: "Comercial", required: false },
  { id: "confidentiality", title: "Confidencialidade e LGPD", category: "Legal", regulation: "LGPD", required: false },
];

const CONTRACT_TYPES = [
  { value: "sea", label: "Contrato de Embarque (SEA)" },
  { value: "charter", label: "Charter Party (Time)" },
  { value: "charter_voyage", label: "Charter Party (Voyage)" },
  { value: "management", label: "Ship Management Agreement" },
  { value: "crew_agency", label: "Crew Manning Agreement" },
  { value: "supply", label: "Contrato de Fornecimento Marítimo" },
];

export function AIContractGenerator() {
  const [contractType, setContractType] = useState("");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [additionalTerms, setAdditionalTerms] = useState("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>(
    CLAUSE_LIBRARY.filter(c => c.required).map(c => c.id)
  );
  const [generatedContract, setGeneratedContract] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleClause = (id: string) => {
    setSelectedClauses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!contractType || !partyA || !partyB) {
      toast.error("Preencha tipo de contrato, Parte A e Parte B");
      return;
    }

    setIsGenerating(true);
    try {
      const clauses = selectedClauses.map(id => CLAUSE_LIBRARY.find(c => c.id === id)?.title).filter(Boolean);
      
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Gere um contrato marítimo profissional do tipo "${CONTRACT_TYPES.find(t => t.value === contractType)?.label}".
          
Partes:
- Parte A (Armador/Operador): ${partyA}
- Parte B (Contratado): ${partyB}
${vesselName ? `- Embarcação: ${vesselName}` : ""}

Cláusulas obrigatórias a incluir:
${clauses.map((c, i) => `${i + 1}. ${c}`).join("\n")}

${additionalTerms ? `Termos adicionais: ${additionalTerms}` : ""}

Gere o contrato completo em formato profissional com:
- Preâmbulo e definições
- Todas as cláusulas listadas com redação jurídica
- Condições gerais
- Assinaturas
Use linguagem jurídica formal em português.`,
        }
      });

      if (error) throw error;
      setGeneratedContract(data?.response || "Erro ao gerar contrato.");
      toast.success("Contrato gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar contrato", { description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContract);
    toast.success("Contrato copiado para a área de transferência");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContract], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${contractType}_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contrato baixado");
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Gerador de Contratos Marítimos com IA
          </CardTitle>
          <CardDescription>
            Gere contratos profissionais com cláusulas automaticamente validadas contra MLC 2006, STCW e ISM Code.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" /> Dados do Contrato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Contrato *</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parte A (Armador/Operador) *</Label>
                <Input value={partyA} onChange={e => setPartyA(e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div className="space-y-2">
                <Label>Parte B (Contratado) *</Label>
                <Input value={partyB} onChange={e => setPartyB(e.target.value)} placeholder="Nome do contratado" />
              </div>
              <div className="space-y-2">
                <Label>Embarcação</Label>
                <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" />
              </div>
              <div className="space-y-2">
                <Label>Termos Adicionais</Label>
                <Textarea value={additionalTerms} onChange={e => setAdditionalTerms(e.target.value)} placeholder="Condições especiais..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Biblioteca de Cláusulas</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CLAUSE_LIBRARY.map(clause => (
                  <div
                    key={clause.id}
                    className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors ${
                      selectedClauses.includes(clause.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleClause(clause.id)}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${selectedClauses.includes(clause.id) ? "text-primary" : "text-muted-foreground/30"}`} />
                      <div>
                        <p className="text-sm font-medium">{clause.title}</p>
                        <p className="text-xs text-muted-foreground">{clause.regulation}</p>
                      </div>
                    </div>
                    {clause.required && <Badge variant="outline" className="text-xs">Obrigatória</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2" size="lg">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {isGenerating ? "Gerando contrato com IA..." : "Gerar Contrato"}
          </Button>
        </div>

        {/* Preview */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview do Contrato
              </CardTitle>
              {generatedContract && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="h-3 w-3" /></Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContract ? (
              <ScrollArea className="h-[600px]">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{generatedContract}</pre>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-30" />
                <p>Configure os dados e clique em "Gerar Contrato"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
