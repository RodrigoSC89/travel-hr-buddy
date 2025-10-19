"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocument } from "@/lib/documents/api";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

const TipTapEditor = dynamic(() => import("@/components/editor/tiptap"), { ssr: false });

interface Template {
  id?: string;
  title: string;
  content: string | object;
}

export default function CreateFromTemplate({ template }: { template: Template }) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [content, setContent] = useState<string>(
    typeof template.content === "string" ? template.content : JSON.stringify(template.content)
  );
  const [title, setTitle] = useState(`Documento baseado em ${template.title}`);
  const [variablesApplied, setVariablesApplied] = useState(false);

  const extractVariables = (raw: string) => {
    const matches = raw.match(/{{(.*?)}}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
  };

  const handleChangeVar = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const applyVariables = () => {
    let raw = typeof template.content === "string"
      ? template.content
      : JSON.stringify(template.content);

    for (const key in variables) {
      const regex = new RegExp(`{{${key}}}`, "g");
      raw = raw.replace(regex, variables[key]);
    }

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(raw);
      setContent(parsed);
    } catch {
      // If not valid JSON, use as string
      setContent(raw);
    }

    setVariablesApplied(true);
    toast({
      title: "Variáveis aplicadas",
      description: "As variáveis foram substituídas com sucesso.",
    });
  };

  const handleSave = async () => {
    try {
      const documentId = await createDocument({ title, content });
      if (documentId) {
        toast({
          title: "✅ Documento salvo com sucesso!",
          description: `Documento "${title}" foi salvo no banco de dados.`,
        });
      }
    } catch (error) {
      logger.error("Error saving document:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const vars = extractVariables(
    typeof template.content === "string" 
      ? template.content 
      : JSON.stringify(template.content)
  );

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">📄 Criar Documento a partir do Template</h1>

      <Input
        placeholder="Título do Documento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {vars.length > 0 && !variablesApplied && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">🔧 Preencha os campos variáveis:</p>
          {vars.map((key) => (
            <Input
              key={key}
              placeholder={`Valor para ${key}`}
              onChange={(e) => handleChangeVar(key, e.target.value)}
            />
          ))}
          <Button onClick={applyVariables}>⚙️ Aplicar Variáveis</Button>
        </div>
      )}

      <div className="mt-6 border rounded-xl p-4 shadow">
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="secondary" onClick={handlePrint}>
          🖨️ Exportar PDF
        </Button>
        <Button onClick={handleSave}>
          💾 Salvar Documento
        </Button>
      </div>
    </div>
  );
}
