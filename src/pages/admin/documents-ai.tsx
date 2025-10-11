"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function DocumentsAIPage() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  async function generateDocument() {
    if (!prompt) return;
    setLoading(true);
    setGenerated("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { prompt },
      });

      if (error) throw error;

      setGenerated(data?.content || "");
    } catch (err) {
      console.error("Error generating document:", err);
      setGenerated("❌ Erro ao gerar documento.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">📄 Documentos com IA</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Título do Documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            rows={4}
            placeholder="Descreva o que você quer gerar com a IA..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={generateDocument} disabled={loading || !prompt}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Gerar com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border border-green-600">
          <CardContent className="p-4 whitespace-pre-wrap">
            <h2 className="text-lg font-semibold mb-2">
              <FileText className="inline w-4 h-4 mr-2" /> {title || "Documento Gerado"}
            </h2>
            {generated}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
