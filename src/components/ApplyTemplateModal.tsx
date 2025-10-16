import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface AIDocumentTemplate {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_private: boolean;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ApplyTemplateModalProps {
  onApply: (content: string) => void;
}

export default function ApplyTemplateModal({ onApply }: ApplyTemplateModalProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<AIDocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AIDocumentTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [step, setStep] = useState<"select" | "fill" | "ai">("select");

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTemplate) {
      extractVariables(selectedTemplate.content);
      setStep("fill");
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      logger.error("Error loading templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar a lista de templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.matchAll(regex);
    const vars: Record<string, string> = {};
    
    for (const match of matches) {
      const varName = match[1].trim();
      if (!vars[varName]) {
        vars[varName] = "";
      }
    }
    
    setVariables(vars);
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o template que deseja gerar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingAI(true);
      
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { title: aiPrompt },
      });

      if (error) throw error;

      if (data?.content) {
        onApply(data.content);
        toast({
          title: "Template gerado com sucesso!",
          description: "O conteúdo foi inserido no editor.",
        });
        setOpen(false);
        resetModal();
      }
    } catch (error) {
      logger.error("Error generating template with AI:", error);
      toast({
        title: "Erro ao gerar template",
        description: "Não foi possível gerar o template com IA.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    let processedContent = selectedTemplate.content;

    // Replace all variables with user inputs
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      processedContent = processedContent.replace(regex, value || `{{${key}}}`);
    });

    onApply(processedContent);
    toast({
      title: "Template aplicado!",
      description: "O conteúdo foi inserido no editor.",
    });
    setOpen(false);
    resetModal();
  };

  const resetModal = () => {
    setSelectedTemplate(null);
    setVariables({});
    setAiPrompt("");
    setStep("select");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          📂 Aplicar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && "Selecionar Template"}
            {step === "fill" && "Preencher Variáveis"}
            {step === "ai" && "Gerar Template com IA"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Escolha um template existente ou gere um novo com IA"}
            {step === "fill" && "Preencha as variáveis do template"}
            {step === "ai" && "Descreva o template que deseja gerar"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setStep("ai")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Template com IA
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label>Templates Salvos</Label>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum template disponível</p>
                </div>
              ) : (
                <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="font-medium">{template.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {template.content.substring(0, 100)}...
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "fill" && selectedTemplate && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedTemplate.title}</p>
            </div>

            {Object.keys(variables).length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Preencha os campos abaixo. Você pode deixar em branco para manter os placeholders.
                </p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {Object.keys(variables).map((varName) => (
                    <div key={varName} className="space-y-2">
                      <Label htmlFor={varName}>{varName}</Label>
                      <Input
                        id={varName}
                        placeholder={`Valor para ${varName}`}
                        value={variables[varName]}
                        onChange={(e) =>
                          setVariables({ ...variables, [varName]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este template não possui variáveis para preencher.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>
                Voltar
              </Button>
              <Button onClick={handleApplyTemplate}>
                Aplicar Template
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "ai" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Descreva o template que deseja gerar</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Ex: Relatório mensal de vendas com seções de resumo, métricas principais e conclusões"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>
                Voltar
              </Button>
              <Button onClick={handleGenerateWithAI} disabled={generatingAI}>
                {generatingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
