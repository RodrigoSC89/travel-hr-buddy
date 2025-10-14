import React, { useState, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import { Star, Lock, FileDown, Sparkles, Save, Loader2 } from "lucide-react";

export default function TemplateEditor() {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const contentRef = useRef(null);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Comece seu template aqui...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px]",
      },
    },
  });

  const handleSave = async () => {
    if (!editor || !title) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título do template",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar templates",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("templates").insert([
        {
          title,
          content: editor.getHTML(),
          is_favorite: isFavorite,
          is_private: isPrivate,
          created_by: user.id,
        },
      ]).select();

      if (error) {
        console.error("Error saving template:", error);
        toast({
          title: "Erro ao salvar template",
          description: error.message || "Ocorreu um erro ao salvar o template",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Template salvo com sucesso!",
          description: "Seu template foi salvo e pode ser reutilizado",
        });
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Erro ao salvar template",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!editor) return;
    
    try {
      const element = document.createElement("div");
      element.innerHTML = editor.getHTML();
      element.style.padding = "20px";
      
      const opt = {
        margin: 1,
        filename: `${title || "template"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };
      
      html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF exportado",
        description: "O template foi exportado como PDF",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao exportar o template",
        variant: "destructive",
      });
    }
  };

  const handleGenerateWithAI = async () => {
    if (!title) {
      toast({
        title: "Título necessário",
        description: "Por favor, preencha o título para gerar o template com IA",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para usar a IA",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("generate-template", {
        body: { title },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      if (result.content) {
        editor?.commands.setContent(result.content);
        toast({
          title: "Template gerado com IA",
          description: "O template foi gerado com sucesso",
        });
      }
    } catch (error) {
      console.error("Error generating template with AI:", error);
      toast({
        title: "Erro ao gerar template",
        description: "Ocorreu um erro ao gerar o template com IA",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Editor de Templates</h1>
        
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Título do template</Label>
          <Input
            id="title"
            type="text"
            placeholder="Título do template"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={isFavorite}
              onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
            />
            <Label
              htmlFor="favorite"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4" />
              Favorito
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label
              htmlFor="private"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Privado
            </Label>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="border rounded-lg p-4 bg-white min-h-[400px]">
        <EditorContent editor={editor} ref={contentRef} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleGenerateWithAI} disabled={isGenerating} variant="default">
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
        <Button onClick={handleSave} disabled={isSaving} variant="default">
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
        <Button onClick={handleExportPDF} variant="secondary">
          <FileDown className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
