'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createDocument } from '@/lib/documents/api';
import { toast } from 'sonner';
import TipTapEditor from '@/components/editor/tiptap';

interface Template {
  id?: string;
  title: string;
  content: string;
}

interface CreateFromTemplateProps {
  template: Template;
}

export default function CreateFromTemplate({ template }: CreateFromTemplateProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [content, setContent] = useState(template.content);
  const [title, setTitle] = useState(`Documento baseado em ${template.title}`);
  const [variablesApplied, setVariablesApplied] = useState(false);

  /**
   * Extract variables from template content in {{variable}} format
   */
  const extractVariables = (raw: string) => {
    const matches = raw.match(/{{(.*?)}}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));
  };

  const handleChangeVar = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Apply variable substitution to template content
   */
  const applyVariables = () => {
    let raw = typeof template.content === 'string'
      ? template.content
      : JSON.stringify(template.content);

    for (const key in variables) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      raw = raw.replace(regex, variables[key]);
    }

    try {
      const parsed = JSON.parse(raw);
      setContent(parsed);
    } catch {
      setContent(raw);
    }

    setVariablesApplied(true);
    toast.success('Variáveis aplicadas com sucesso!');
  };

  /**
   * Save document to database
   */
  const handleSave = async () => {
    const result = await createDocument({ title, content, prompt: template.title });
    
    if (result) {
      toast.success('✅ Documento salvo com sucesso!');
    } else {
      toast.error('❌ Erro ao salvar documento');
    }
  };

  /**
   * Export document as PDF using browser print
   */
  const handleExportPDF = () => {
    window.print();
    toast.success('🖨️ Abrindo diálogo de impressão...');
  };

  const vars = extractVariables(JSON.stringify(template.content));

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">📄 Criar Documento a partir do Template</h1>
      
      <Input
        placeholder="Título do Documento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />

      {vars.length > 0 && !variablesApplied && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-muted-foreground font-medium">
            🔧 Preencha os campos variáveis:
          </p>
          {vars.map((key) => (
            <Input
              key={key}
              placeholder={`Valor para ${key}`}
              onChange={(e) => handleChangeVar(key, e.target.value)}
            />
          ))}
          <Button onClick={applyVariables} className="w-full">
            ⚙️ Aplicar Variáveis
          </Button>
        </div>
      )}

      <div className="mt-6 border rounded-xl p-4 shadow">
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="secondary" onClick={handleExportPDF}>
          🖨️ Exportar PDF
        </Button>
        <Button onClick={handleSave}>
          💾 Salvar Documento
        </Button>
      </div>
    </div>
  );
}
