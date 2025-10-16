import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

interface Template {
  id: string;
  title: string;
  content: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editing, setEditing] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data } = await supabase.from("templates").select("*");
    setTemplates(data || []);
  }

  async function handleSave() {
    const payload = {
      title,
      content: editorContent,
    };

    if (editing) {
      await supabase.from("templates").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("templates").insert(payload);
    }

    resetForm();
    fetchTemplates();
  }

  function resetForm() {
    setTitle("");
    setEditorContent("");
    setEditing(null);
  }

  async function handleDelete(id: string) {
    await supabase.from("templates").delete().eq("id", id);
    fetchTemplates();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📂 Templates com IA</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="🔍 Buscar templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Título do template"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Button onClick={handleSave}>{editing ? "💾 Atualizar" : "➕ Criar"}</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <TipTapEditor content={editorContent} onUpdate={setEditorContent} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates
          .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
          .map((template) => (
            <Card key={template.id} className="border shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="font-medium">{template.title}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setEditing(template);
                    setTitle(template.title);
                    setEditorContent(template.content);
                  }}>
                    ✏️ Editar
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(template.id)}>
                    🗑️ Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
