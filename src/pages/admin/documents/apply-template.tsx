import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocument } from "@/lib/documents/api";
import { toast } from "@/hooks/use-toast";
import TipTapEditor from "@/components/editor/tiptap-preview";

interface Template {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_private: boolean;
}

interface ApplyTemplateProps {
  template: Template;
}

export default function ApplyTemplate({ template }: ApplyTemplateProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState("");

  // Extrai {{variaveis}} do conteúdo do template
  const extractVariables = (content: string) => {
    const matches = content.match(/{{(.*?)}}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
  };

  const vars = extractVariables(template.content);

  const handleChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const generatePreview = () => {
    let content = template.content;
    for (const key of vars) {
      content = content.replaceAll(`{{${key}}}`, variables[key] || "");
    }
    setPreview(content);
  };

  const handleSave = async () => {
    if (!preview) {
      toast({
        title: "Erro",
        description: "Por favor, gere o preview antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    const doc = {
      title: `Doc: ${template.title}`,
      content: preview,
    };
    
    const result = await createDocument(doc);
    
    if (result) {
      toast({
        title: "Sucesso",
        description: "Documento salvo com sucesso!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 mt-6 p-4 border rounded-xl">
      <h2 className="text-xl font-semibold">📄 Aplicar Template</h2>
      {vars.length === 0 && <p>✅ Nenhuma variável para preencher.</p>}

      {vars.map((key) => (
        <Input
          key={key}
          placeholder={`Preencher: ${key}`}
          onChange={(e) => handleChange(key, e.target.value)}
        />
      ))}

      <div className="flex space-x-2">
        <Button onClick={generatePreview}>👁️ Gerar Preview</Button>
        <Button onClick={handleSave}>💾 Salvar Documento</Button>
      </div>

      {preview && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">📋 Preview:</h3>
          <TipTapEditor content={preview} readOnly />
        </div>
      )}
    </div>
  );
}
