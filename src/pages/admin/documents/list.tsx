import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export default function DocumentListPage() {
  const [user, setUser] = useState<any>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      
      // Simple admin verification by email (can be improved)
      if (data?.user?.email?.endsWith("@empresa.com")) {
        setIsAdmin(true);
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        let query = supabase
          .from("documents")
          .select("id, title, created_at, user_id")
          .order("created_at", { ascending: false });
        
        // If not admin, filter by user_id
        if (!isAdmin) {
          query = query.eq("user_id", user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error loading documents:", error);
        } else {
          setDocs(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [user, isAdmin]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          📂 {isAdmin ? "Todos os Documentos" : "Meus Documentos"}
        </h1>
        {isAdmin && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Admin
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum documento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">📄 {doc.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Criado em {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
                </p>
                <Link to={`/admin/documents/view/${doc.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Visualizar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
