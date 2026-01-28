/**
 * Apply Template Demo - PATCH 879
 * Type-safe templates table with JSONB content
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ApplyTemplate from "./apply-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

// Aligned with actual templates schema
interface TemplateRow {
  id: string;
  title: string | null;
  content: Json;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_favorite: boolean | null;
  is_private: boolean | null;
}

// Local template interface for UI
interface LocalTemplate {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_private: boolean;
}

// Helper to safely extract string content from JSONB
function getTemplateContent(content: Json | null): string {
  if (content === null) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && !Array.isArray(content)) {
    const obj = content as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.content === "string") return obj.content;
    return JSON.stringify(content);
  }
  return String(content);
}

/**
 * Demo page showing how to use the ApplyTemplate component
 */
export default function ApplyTemplateDemo() {
  const [templates, setTemplates] = useState<LocalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LocalTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map to local template array with safe defaults
      const mappedTemplates: LocalTemplate[] = (data || []).map((row: TemplateRow) => ({
        id: row.id,
        title: row.title || "Sem título",
        content: getTemplateContent(row.content),
        created_by: row.created_by || "",
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
        is_favorite: row.is_favorite ?? false,
        is_private: row.is_private ?? false,
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      logger.error("Error loading templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar a lista de templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📋 Aplicar Template</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um template para aplicar e preencher variáveis
        </p>
      </div>

      {!selectedTemplate ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum template disponível. Crie templates na página de Templates.
                </p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {template.content.substring(0, 150)}...
                  </p>
                  <Button 
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full"
                  >
                    Aplicar Template
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
          >
            ← Voltar para lista de templates
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>{selectedTemplate.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplyTemplate template={{
                id: selectedTemplate.id,
                title: selectedTemplate.title,
                content: selectedTemplate.content,
                created_by: selectedTemplate.created_by,
                created_at: selectedTemplate.created_at,
                updated_at: selectedTemplate.updated_at,
                is_favorite: selectedTemplate.is_favorite,
                is_private: selectedTemplate.is_private,
              }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
