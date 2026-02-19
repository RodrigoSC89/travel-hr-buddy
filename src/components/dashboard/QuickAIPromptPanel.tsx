/**
 * QuickAIPromptPanel - Quick-access AI prompt panel with pre-built maritime queries
 * Provides instant AI analysis without navigating to full chat
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Ship, Shield, Wrench, DollarSign, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const quickPrompts = [
  { label: "Resumo Compliance", icon: Shield, prompt: "Faça um resumo do status de compliance da frota, incluindo certificados vencidos e próximos vencimentos." },
  { label: "Status Manutenção", icon: Wrench, prompt: "Analise o backlog de manutenção e identifique as ordens de serviço mais críticas." },
  { label: "Análise Crew", icon: Users, prompt: "Resuma a situação da tripulação: certificações vencidas, fadiga e gaps de competência." },
  { label: "Custos Operacionais", icon: DollarSign, prompt: "Faça uma análise dos custos operacionais e identifique oportunidades de economia." },
  { label: "Fleet Overview", icon: Ship, prompt: "Forneça um overview completo da frota: status de cada embarcação, viagens ativas e alertas pendentes." },
  { label: "Gerar Relatório", icon: FileText, prompt: "Gere um relatório executivo com os principais KPIs operacionais da semana." },
];

export function QuickAIPromptPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setResult("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-proxy", {
        body: {
          prompt: text,
          context: "maritime-operations",
          module: "quick-prompt",
        },
      });
      if (error) throw error;
      const response = typeof data === "string" ? data : data?.response || data?.result || JSON.stringify(data);
      setResult(response);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar";
      // Fallback: provide a helpful response even without AI
      setResult(`⚠️ O serviço de IA não está disponível no momento. Erro: ${msg}\n\nSugestão: Acesse o Chat IA completo na aba "Chat & Voice" para consultas avançadas.`);
      toast.error("Falha na consulta IA", { description: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
    handleSubmit(text);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick AI Prompt
          <Badge variant="outline" className="text-[10px] ml-auto">Nauti Brain</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Prompt Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleQuickPrompt(qp.prompt)}
              disabled={isLoading}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30 hover:bg-muted hover:border-border/60 transition-all text-left text-xs font-medium disabled:opacity-50 active:scale-[0.97]"
            >
              <qp.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Prompt Input */}
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Faça uma pergunta sobre a operação marítima..."
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(prompt);
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => handleSubmit(prompt)}
            disabled={isLoading || !prompt.trim()}
            className="shrink-0 h-[60px] w-10"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuickAIPromptPanel;
