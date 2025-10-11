import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, BarChart3, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateChecklistItems } from "@/services/openai";
import { toast } from "sonner";

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
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all");
  const [generating, setGenerating] = useState(false);

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

  async function createChecklist(items: ChecklistItem[] = []) {
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
      toast.error("Erro ao criar checklist");
      return;
    }

    if (data && items.length > 0) {
      // Insert checklist items
      const itemsToInsert = items.map((item, index) => ({
        checklist_id: data.id,
        title: item.title,
        completed: item.completed,
        order_index: index,
      }));

      const { error: itemsError } = await supabase
        .from("checklist_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error creating items:", itemsError);
        toast.error("Erro ao criar itens do checklist");
      }
    }

    if (data) {
      setTitle("");
      fetchChecklists();
      toast.success("Checklist criado com sucesso!");
    }
  }

  async function generateChecklistWithAI() {
    if (!title) return;
    setGenerating(true);
    
    try {
      const result = await generateChecklistItems(title);
      
      if (!result.success || !result.items) {
        toast.error(result.error || "Erro ao gerar checklist com IA");
        setGenerating(false);
        return;
      }

      const generated: ChecklistItem[] = result.items.map((t: string) => ({
        id: crypto.randomUUID(),
        title: t,
        completed: false,
      }));

      await createChecklist(generated);
    } catch (err) {
      console.error("Erro IA:", err);
      toast.error("Erro ao gerar checklist com IA");
    }
    
    setGenerating(false);
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
        <Button onClick={() => createChecklist()} disabled={!title}>
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
          className="border rounded px-3 py-2 bg-background"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "done" | "pending")}
        >
          <option value="all">Todos</option>
          <option value="done">Concluídos</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {checklists
        .filter((checklist) => {
          if (filter === "all") return true;
          const progress = calculateProgress(checklist.items);
          if (filter === "done") return progress === 100;
          if (filter === "pending") return progress < 100;
          return true;
        })
        .map((checklist) => (
          <Card key={checklist.id} id={`checklist-${checklist.id}`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">📝 {checklist.title}</h2>
                <Button
                  variant="outline"
                  onClick={() => exportPDF(checklist.id)}
                >
                📄 Exportar PDF
                </Button>
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
