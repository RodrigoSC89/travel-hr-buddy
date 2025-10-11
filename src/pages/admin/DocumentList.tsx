import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, Plus, Eye } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function DocumentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchDocuments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        const userIsAdmin = roleData?.role === "admin";
        setIsAdmin(userIsAdmin);

        // Fetch documents
        const { data, error } = await supabase
          .from("documents")
          .select("id, title, content, created_at, user_id")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching documents:", error);
          toast({
            title: "Erro ao carregar documentos",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setDocuments(data || []);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os documentos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchDocuments();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Documentos
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "Visualize todos os documentos do sistema" : "Visualize seus documentos"}
          </p>
        </div>
        <Button onClick={() => navigate("/admin/documents/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro documento.
            </p>
            <Button onClick={() => navigate("/admin/documents/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                  {user && doc.user_id === user.id && (
                    <Badge variant="secondary">Seu</Badge>
                  )}
                </div>
                <CardDescription>
                  Criado em {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {doc.content}
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/admin/documents/view/${doc.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
