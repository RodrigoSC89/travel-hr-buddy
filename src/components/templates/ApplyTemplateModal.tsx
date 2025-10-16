import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ApplyTemplateModalProps {
  onApply: (content: string) => void;
}

interface Template {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function ApplyTemplateModal({ onApply }: ApplyTemplateModalProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) fetchTemplates();
  }, [open]);

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTemplates(data);
  }

  function applyTemplate(content: string) {
    const final = content.replace(/{{(.*?)}}/g, (_, variable) => {
      return prompt(`Preencha o campo: ${variable}`) || "";
    });
    onApply(final);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">📂 Aplicar Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <Input
          placeholder="🔍 Buscar template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {templates
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
            .map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                className="justify-start w-full text-left"
                onClick={() => applyTemplate(template.content)}
              >
                {template.title}
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
