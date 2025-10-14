// Componente de editor com botão para reescrever seleção com IA
"use client";
import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Loader2 } from "lucide-react";

export default function TemplateEditorWithRewrite() {
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Selecione um trecho para reescrever com IA.</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const handleRewrite = async () => {
    if (!editor) return;
    
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    if (!selectedText || selectedText.length < 3) {
      toast({
        title: "Seleção inválida",
        description: "Selecione um trecho maior para reescrever.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-selection", {
        body: { input: selectedText },
      });

      if (error) throw error;

      const rewritten = data?.result || "[Erro na reescrita]";

      // Replace selected text with rewritten version
      editor.commands.insertContentAt(
        { from: editor.state.selection.from, to: editor.state.selection.to },
        rewritten
      );

      toast({
        title: "Texto reescrito com sucesso",
        description: "A seleção foi reformulada com IA.",
      });
    } catch (err) {
      console.error("Error rewriting selection:", err);
      toast({
        title: "Erro ao reescrever",
        description: "Não foi possível reescrever o texto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <EditorContent 
        editor={editor} 
        className="border p-4 bg-white rounded min-h-[200px]" 
      />
      <Button 
        onClick={handleRewrite} 
        disabled={loading} 
        variant="secondary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Reescrevendo...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reescrever seleção com IA
          </>
        )}
      </Button>
    </div>
  );
}
