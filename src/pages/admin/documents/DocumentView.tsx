"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Document {
  title: string;
  content: string;
  created_at: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("ai_generated_documents")
      .select("title, content, created_at")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setDoc(data);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
      </div>
    );

  if (!doc)
    return <div className="p-8 text-destructive">Documento não encontrado.</div>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">📄 {doc.title}</h1>
      <p className="text-sm text-muted-foreground">
        Criado em {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
      </p>

      <Card>
        <CardContent className="whitespace-pre-wrap p-4">
          {doc.content}
        </CardContent>
      </Card>
    </div>
  );
}
