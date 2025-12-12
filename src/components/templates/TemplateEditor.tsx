import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  Save, 
  FileDown, 
  Loader2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Code,
  Plus,
  FileCode
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function TemplateEditor() {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [placeholderName, setPlaceholderName] = useState("");
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Comece seu template aqui...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  const handleSave = async () => {
    if (!editor || !title.trim()) {
      toast({
        title: "Erro ao salvar",
        description: "Por favor, preencha o título do template.",
        variant: "destructive",
      };
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar templates.",
          variant: "destructive",
        };
        return;
      }

      const { data, error } = await supabase.from("templates").insert([
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
        title: "Template salvo com sucesso!",
        description: "O template foi salvo e está disponível para uso.",
      });

      // Reset form after successful save
      setTitle("");
      editor.commands.setContent("<p>Comece seu template aqui...</p>");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Erro ao salvar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!editor) return;

    setIsExporting(true);

    try {
      const element = document.createElement("div");
      element.innerHTML = editor.getHTML();
      
      const opt = {
        margin: 1,
        filename: `${title || "template"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in" as const, format: "letter" as const, orientation: "portrait" as const }
      };

      html2pdf().from(element).set(opt).save();

      toast({
        title: "PDF exportado com sucesso!",
        description: "O arquivo foi baixado para o seu dispositivo.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHTML = () => {
    if (!editor) return;

    try {
      const htmlContent = editor.getHTML();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "template"}.html`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "HTML exportado com sucesso!",
        description: "O arquivo foi baixado para o seu dispositivo.",
      };
    } catch (error) {
      console.error("Error exporting HTML:", error);
      toast({
        title: "Erro ao exportar HTML",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const insertPlaceholder = () => {
    if (!editor || !placeholderName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, preencha o nome do placeholder.",
        variant: "destructive",
      };
      return;
    }

    editor.chain().focus().insertContent(`{{${placeholderName.trim()}}}`).run();
    setPlaceholderName("");
    setShowPlaceholderDialog(false);

    toast({
      title: "Placeholder inserido!",
      description: `A variável {{${placeholderName.trim()}}} foi adicionada ao template.`,
    };
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, preencha o título do template antes de gerar com IA.",
        variant: "destructive",
      };
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { title: title.trim() },
      };

      if (error) throw error;

      if (data?.content) {
        editor?.commands.setContent(data.content);
        toast({
          title: "Conteúdo gerado com sucesso!",
          description: "O template foi gerado pela IA. Você pode editá-lo conforme necessário.",
        });
      } else {
        throw new Error("Nenhum conteúdo foi gerado");
      }
    } catch (error) {
      console.error("Error generating with AI:", error);
      toast({
        title: "Erro ao gerar com IA",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
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
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive("bold") ? "bg-muted" : ""}
                disabled={!editor}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive("italic") ? "bg-muted" : ""}
                disabled={!editor}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
                disabled={!editor}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
                disabled={!editor}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive("bulletList") ? "bg-muted" : ""}
                disabled={!editor}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={editor?.isActive("orderedList") ? "bg-muted" : ""}
                disabled={!editor}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={editor?.isActive("codeBlock") ? "bg-muted" : ""}
                disabled={!editor}
              >
                <Code className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-1 h-8" />
              <Dialog open={showPlaceholderDialog} onOpenChange={setShowPlaceholderDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!editor}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Placeholder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inserir Placeholder</DialogTitle>
                    <DialogDescription>
                      Adicione uma variável dinâmica ao template. Use nomes descritivos como "nome", "data", "empresa".
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="placeholder">Nome do Placeholder</Label>
                      <Input
                        id="placeholder"
                        placeholder="Ex: nome, data, empresa..."
                        value={placeholderName}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            insertPlaceholder();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleSetShowPlaceholderDialog}>
                      Cancelar
                    </Button>
                    <Button onClick={insertPlaceholder}>
                      Inserir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg bg-white">
              <EditorContent editor={editor} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-lg bg-white p-4 min-h-[400px]">
              <div 
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
              />
            </div>
          </TabsContent>
        </Tabs>

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
                Exportando PDF...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>

          <Button
            onClick={handleExportHTML}
            variant="secondary"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Exportar HTML
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Dica:</strong> Use a aba "Preview" para visualizar o template antes de salvar.</p>
          <p>🎨 <strong>Formatação:</strong> Use a barra de ferramentas para formatar o texto com negrito, itálico, listas, etc.</p>
          <p>📝 <strong>Placeholders:</strong> Clique em "+ Placeholder" para inserir variáveis dinâmicas como {"{{nome}}"}, {"{{data}}"}, etc.</p>
          <p>💾 <strong>Exportação:</strong> Exporte o template como PDF ou HTML para uso externo.</p>
        </div>
      </CardContent>
    </Card>
  );
}
