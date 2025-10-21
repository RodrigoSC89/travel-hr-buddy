import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ApplyTemplateModalProps {
  onApply: (content: string) => void;
  tableName?: "templates" | "ai_document_templates";
}

export default function ApplyTemplateModal({ onApply, tableName = "templates" }: ApplyTemplateModalProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    }
  }

  function applyTemplate(content: string) {
    // Extract variables from content using {{variable}} pattern
    const variableRegex = /{{(.*?)}}/g;
    let processedContent = content;
    const matches = content.match(variableRegex);

    if (matches) {
      // Get unique variable names
      const uniqueVariables = [...new Set(matches.map((match) => match.slice(2, -2)))];

      // Prompt user for each variable
      for (const variable of uniqueVariables) {
        const value = prompt(`Preencha o campo: ${variable}`);
        if (value !== null) {
          // Replace all occurrences of this variable
          const variablePattern = new RegExp(`{{${variable}}}`, "g");
          processedContent = processedContent.replace(variablePattern, value);
        }
      }
    }

    onApply(processedContent);
    setOpen(false);
    toast({
      title: "Template aplicado com sucesso",
      description: "O template foi aplicado ao editor.",
    });
  }

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          📂 Aplicar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aplicar Template</DialogTitle>
          <DialogDescription>
            Selecione um template para aplicar ao documento. Variáveis serão preenchidas automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="🔍 Buscar template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {search ? "Nenhum template encontrado" : "Nenhum template disponível"}
              </p>
            ) : (
              filteredTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="ghost"
                  className="justify-start w-full text-left h-auto py-3"
                  onClick={() => applyTemplate(template.content)}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">{template.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(template.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
