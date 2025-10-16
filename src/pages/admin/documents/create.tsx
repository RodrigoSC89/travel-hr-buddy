import { useState } from "react";
import TipTapEditor from "@/components/TipTapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ApplyTemplateModal from "@/components/ApplyTemplateModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title || !content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo do documento.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para salvar documentos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Insert document into the documents table
      const { data, error } = await supabase
        .from("documents")
        .insert({
          title,
          description,
          content,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info("Documento salvo:", { title, id: data?.id });
      
      toast({
        title: "Documento salvo!",
        description: "O documento foi criado com sucesso.",
      });

      // Navigate to the document list or view page
      navigate("/admin/documents");
    } catch (error) {
      logger.error("Error saving document:", error);
      toast({
        title: "Erro ao salvar documento",
        description: "Não foi possível salvar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">📄 Criar Documento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Título do Documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <ApplyTemplateModal onApply={(content) => setContent(content)} />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>💾 Salvar Documento</>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <TipTapEditor content={content} onUpdate={setContent} />
        </CardContent>
      </Card>
    </div>
  );
}
