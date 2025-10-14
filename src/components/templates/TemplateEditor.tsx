import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Save, FileDown, Loader2 } from 'lucide-react';

export default function TemplateEditor() {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Comece seu template aqui...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const handleSave = async () => {
    if (!editor || !title.trim()) {
      toast({
        title: 'Erro ao salvar',
        description: 'Por favor, preencha o título do template.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para salvar templates.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.from('templates').insert([
        {
          title: title.trim(),
          content: editor.getHTML(),
          is_favorite: false,
          is_private: false,
          created_by: user.id,
        },
      ]).select();

      if (error) throw error;

      toast({
        title: 'Template salvo com sucesso!',
        description: 'O template foi salvo e está disponível para uso.',
      });

      // Reset form after successful save
      setTitle('');
      editor.commands.setContent('<p>Comece seu template aqui...</p>');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Erro ao salvar template',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!editor) return;

    setIsExporting(true);

    try {
      const element = document.createElement('div');
      element.innerHTML = editor.getHTML();
      
      const opt = {
        margin: 1,
        filename: `${title || 'template'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();

      toast({
        title: 'PDF exportado com sucesso!',
        description: 'O arquivo foi baixado para o seu dispositivo.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro ao exportar PDF',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim()) {
      toast({
        title: 'Título necessário',
        description: 'Por favor, preencha o título do template antes de gerar com IA.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-template', {
        body: { title: title.trim() },
      });

      if (error) throw error;

      if (data?.content) {
        editor?.commands.setContent(data.content);
        toast({
          title: 'Conteúdo gerado com sucesso!',
          description: 'O template foi gerado pela IA. Você pode editá-lo conforme necessário.',
        });
      } else {
        throw new Error('Nenhum conteúdo foi gerado');
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast({
        title: 'Erro ao gerar com IA',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Editor de Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Título do Template
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Digite o título do template..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="border rounded-lg bg-white">
          <EditorContent editor={editor} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGenerateWithAI}
            disabled={isGenerating || !title.trim()}
            variant="default"
          >
            {isGenerating ? (
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

          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            variant="default"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>

          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="secondary"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Dica:</strong> Clique em "Gerar com IA" para criar um template automaticamente baseado no título.</p>
          <p>📝 Você pode editar o conteúdo gerado antes de salvar.</p>
          <p>🔒 Templates são salvos como públicos por padrão. Você pode editá-los posteriormente para torná-los privados.</p>
        </div>
      </CardContent>
    </Card>
  );
}
