import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, BarChart3, Sparkles, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  created_at: string;
  created_by: string;
}

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all");

  useEffect(() => {
    fetchChecklists();
  }, []);

  async function fetchChecklists() {
    const { data: checklistsData, error: checklistsError } = await supabase
      .from("operational_checklists")
      .select("*")
      .order("created_at", { ascending: false });

    if (checklistsError) {
      console.error("Error fetching checklists:", checklistsError);
      return;
    }

    if (!checklistsData) {
      setChecklists([]);
      return;
    }

    // Fetch items for each checklist
    const checklistsWithItems = await Promise.all(
      checklistsData.map(async (checklist) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from("checklist_items")
          .select("*")
          .eq("checklist_id", checklist.id)
          .order("order_index", { ascending: true });

        if (itemsError) {
          console.error("Error fetching items:", itemsError);
          return {
            id: checklist.id,
            title: checklist.title,
            items: [],
            created_at: checklist.created_at,
            created_by: checklist.created_by,
          };
        }

        return {
          id: checklist.id,
          title: checklist.title,
          items:
            itemsData?.map((item) => ({
              id: item.id,
              title: item.title,
              completed: item.completed,
            })) || [],
          created_at: checklist.created_at,
          created_by: checklist.created_by,
        };
      })
    );

    setChecklists(checklistsWithItems);
  }

  async function createChecklist() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || "admin";

    const { data, error } = await supabase
      .from("operational_checklists")
      .insert({
        title,
        type: "outro",
        created_by: userId,
        status: "rascunho",
        source_type: "manual",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      return;
    }

    if (data) {
      setTitle("");
      fetchChecklists();
    }
  }

  async function generateChecklistWithAI() {
    if (!title) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "admin";

      // Call the AI API to generate checklist items
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-checklist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ prompt: title }),
        }
      );
      
      const { items } = await res.json();

      // Create the checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("operational_checklists")
        .insert({
          title,
          type: "outro",
          created_by: userId,
          status: "rascunho",
          source_type: "manual",
        })
        .select()
        .single();

      if (checklistError || !checklistData) {
        console.error("Error creating checklist:", checklistError);
        return;
      }

      // Create checklist items
      const itemsToInsert = items.map((itemTitle: string, index: number) => ({
        checklist_id: checklistData.id,
        title: itemTitle,
        completed: false,
        order_index: index,
      }));

      const { error: itemsError } = await supabase
        .from("checklist_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error creating items:", itemsError);
      }

      setTitle("");
      fetchChecklists();
    } catch (err) {
      console.error("Erro IA:", err);
    }
    setGenerating(false);
  }

  async function summarizeChecklist(c: Checklist) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-checklist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            title: c.title,
            items: c.items,
            comments: c.items.flatMap((i: any) => i.comments || []),
          }),
        }
      );
      
      const { summary: summaryText } = await res.json();
      setSummary(summaryText);
    } catch (err) {
      console.error("Error summarizing checklist:", err);
    }
  }

  async function toggleItem(checklistId: string, itemId: string) {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const item = checklist.items.find((i) => i.id === itemId);
    if (!item) return;

    const { error } = await supabase
      .from("checklist_items")
      .update({ completed: !item.completed })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error);
      return;
    }

    fetchChecklists();
  }

  function calculateProgress(items: ChecklistItem[]) {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  // Filter checklists based on selected filter
  const filteredChecklists = checklists.filter((checklist) => {
    if (filter === "all") return true;
    const progress = calculateProgress(checklist.items);
    if (filter === "done") return progress === 100;
    if (filter === "pending") return progress < 100;
    return true;
  });

  async function exportPDF(id: string) {
    const el = document.getElementById(`checklist-${id}`);
    if (!el) return;
    const canvas = await html2canvas(el);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("checklist.pdf");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">✅ Checklists Inteligentes</h1>
        <Link to="/admin/checklists/dashboard">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <Input
          placeholder="Descreva seu checklist..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[250px]"
        />
        <Button onClick={createChecklist} disabled={!title}>
          <PlusCircle className="w-4 h-4 mr-1" /> Criar Manual
        </Button>
        <Button 
          onClick={generateChecklistWithAI} 
          disabled={!title || generating} 
          variant="secondary"
        >
          <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
          {generating ? "Gerando com IA..." : "Gerar com IA"}
        </Button>
        <select
          className="border rounded px-3 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">Todos</option>
          <option value="done">Concluídos</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {summary && (
        <Card className="bg-muted">
          <CardContent className="p-4 text-sm whitespace-pre-wrap">
            <strong>🧠 Resumo com IA:</strong>
            <p>{summary}</p>
          </CardContent>
        </Card>
      )}

      {filteredChecklists.map((checklist) => (
        <Card key={checklist.id} id={`checklist-${checklist.id}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">📋 {checklist.title}</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => summarizeChecklist(checklist)}
                >
                  <FileText className="w-4 h-4 mr-1" /> Resumir com IA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportPDF(checklist.id)}
                >
                  📄 Exportar PDF
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(checklist.items)} />

            {checklist.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item neste checklist
              </p>
            ) : (
              <ul className="space-y-2">
                {checklist.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded"
                    onClick={() => toggleItem(checklist.id, item.id)}
                  >
                    <input type="checkbox" checked={item.completed} readOnly />
                    <span
                      className={
                        item.completed ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {item.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
