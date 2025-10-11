import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText } from "lucide-react";

export default function DocumentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar documentos.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating document:", error);
        toast({
          title: "Erro ao criar documento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Documento criado!",
        description: "Redirecionando para visualização...",
      });

      // Redirect to the document view page
      navigate(`/admin/documents/view/${data.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Criar Novo Documento
          </CardTitle>
          <CardDescription>
            Crie um novo documento que poderá ser visualizado por você e por administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                placeholder="Digite o título do documento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Conteúdo
              </label>
              <Textarea
                id="content"
                placeholder="Digite o conteúdo do documento"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                rows={10}
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Documento"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
