"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function DocumentListPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [docs, setDocs] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    supabase
      .from("ai_generated_documents")
      .select("id, title, created_at")
      .eq("generated_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDocs(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <p className="p-8">Carregando usuário...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📂 Meus Documentos</h1>

      {loading && (
        <p className="text-muted-foreground">Carregando documentos...</p>
      )}

      {!loading && docs.length === 0 && (
        <p className="text-muted-foreground">Nenhum documento encontrado.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-lg font-semibold">📄 {doc.title}</h2>
              <p className="text-sm text-muted-foreground">
                Criado em {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
              </p>
              <Link to={`/admin/documents/view/${doc.id}`}>
                <Button variant="outline" size="sm">
                  Visualizar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
