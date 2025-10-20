"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocument } from "@/lib/documents/api";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id?: string;
  title?: string;
  content: string | object;
}

interface CreateFromTemplateProps {
  template: Template;
  onSaved?: (doc: any) => void;
}

/**
 * Page for creating editable documents from templates
 * Features:
 * - Variable extraction from {{variable}} syntax
 * - Variable substitution with user input
 * - Rich text editing with TipTap
 * - Save to database
 * - Export as PDF
 */
export default function CreateFromTemplate({
  template,
  onSaved,
}: CreateFromTemplateProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [content, setContent] = useState<string | object>(template.content);
  const [title, setTitle] = useState(
    `Documento baseado em ${template.title || "template"}`
  );
  const [isApplied, setIsApplied] = useState(false);
  const { toast } = useToast();

  /**
   * Extract variable names from template content
   * Matches {{variable}} pattern
   */
  const extractVariables = (raw: string): string[] => {
    const matches = raw.match(/{{(.*?)}}/g) || [];
    return Array.from(
      new Set(matches.map((m) => m.replace(/[{}]/g, "").trim()))
    );
  };

  /**
   * Handle variable input change
   */
  const handleChangeVar = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Apply variable substitution to template content
   */
  const applyVariables = () => {
    let raw =
      typeof template.content === "string"
        ? template.content
        : JSON.stringify(template.content);

    // Replace all variable occurrences
    for (const key in variables) {
      const regex = new RegExp(`{{${key}}}`, "g");
      raw = raw.replace(regex, variables[key]);
    }

    try {
      // Try to parse as JSON if original was object
      if (typeof template.content === "object") {
        const parsed = JSON.parse(raw);
        setContent(parsed);
      } else {
        setContent(raw);
      }
      setIsApplied(true);
      toast({
        title: "✅ Variáveis aplicadas",
        description: "O conteúdo foi atualizado com sucesso.",
      });
    } catch (err) {
      // If parsing fails, use as string
      setContent(raw);
      setIsApplied(true);
      toast({
        title: "✅ Variáveis aplicadas",
        description: "O conteúdo foi atualizado com sucesso.",
      });
    }
  };

  /**
   * Save document to database
   */
  const handleSave = async () => {
    try {
      const result = await createDocument({ title, content: JSON.stringify(content) });

      if (result) {
        toast({
          title: "✅ Documento salvo",
          description: "O documento foi salvo com sucesso!",
        });
        if (onSaved) {
          onSaved(result);
        }
      } else {
        toast({
          title: "❌ Erro ao salvar",
          description: "Não foi possível salvar o documento.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "❌ Erro",
        description: "Ocorreu um erro ao salvar o documento.",
        variant: "destructive",
      });
    }
  };

  /**
   * Export document as PDF
   */
  const handleExportPDF = () => {
    window.print();
  };

  const rawContent =
    typeof template.content === "string"
      ? template.content
      : JSON.stringify(template.content);
  const vars = extractVariables(rawContent);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">📄 Criar Documento a partir do Template</h1>

        <Input
          placeholder="Título do Documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
        />

        {vars.length > 0 && !isApplied && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground font-medium">
              🔧 Preencha os campos variáveis:
            </p>
            <div className="grid gap-3">
              {vars.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">{key}</label>
                  <Input
                    placeholder={`Valor para ${key}`}
                    onChange={(e) => handleChangeVar(key, e.target.value)}
                    value={variables[key] || ""}
                  />
                </div>
              ))}
            </div>
            <Button onClick={applyVariables} className="w-full">
              ⚙️ Aplicar Variáveis
            </Button>
          </div>
        )}

        {isApplied && (
          <div className="space-y-4">
            <div className="mt-6 border rounded-xl p-4 shadow-lg bg-white">
              <TipTapEditor content={content} onChange={setContent} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleExportPDF}>
                🖨️ Exportar PDF
              </Button>
              <Button onClick={handleSave}>💾 Salvar Documento</Button>
            </div>
          </div>
        )}

        {!isApplied && vars.length === 0 && (
          <div className="space-y-4">
            <div className="mt-6 border rounded-xl p-4 shadow-lg bg-white">
              <TipTapEditor content={content} onChange={setContent} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleExportPDF}>
                🖨️ Exportar PDF
              </Button>
              <Button onClick={handleSave}>💾 Salvar Documento</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
