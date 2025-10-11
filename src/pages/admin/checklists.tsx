import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit, Save, X, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
  responsible?: string;
  comments?: { user: string; text: string; created_at: string }[];
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  created_at: string;
  user: string;
}

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [newItemTitle, setNewItemTitle] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchChecklists();
  }, []);

  async function fetchChecklists() {
    const { data, error } = await supabase.from("checklists").select("*");
    if (!error && data) setChecklists(data);
  }

  async function createChecklist() {
    const { error } = await supabase.from("checklists").insert({
      title,
      items: [],
      user: "admin",
    });
    if (!error) {
      setTitle("");
      fetchChecklists();
    }
  }

  async function toggleItem(checklistId: string, itemId: string) {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;
    const updatedItems = checklist.items.map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i
    );
    await supabase.from("checklists").update({ items: updatedItems }).eq("id", checklistId);
    fetchChecklists();
  }

  async function saveEditedItem(checklistId: string, itemId: string) {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;
    const updatedItems = checklist.items.map((i) =>
      i.id === itemId ? { ...i, title: editedTitle } : i
    );
    await supabase.from("checklists").update({ items: updatedItems }).eq("id", checklistId);
    setEditingItemId(null);
    setEditedTitle("");
    fetchChecklists();
  }

  async function addComment(checklistId: string, itemId: string) {
    const comment = commentInput[itemId];
    if (!comment) return;
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;
    const updatedItems = checklist.items.map((i) => {
      if (i.id === itemId) {
        const comments = i.comments || [];
        return {
          ...i,
          comments: [
            ...comments,
            {
              user: "admin",
              text: comment,
              created_at: new Date().toISOString(),
            },
          ],
        };
      }
      return i;
    });
    await supabase.from("checklists").update({ items: updatedItems }).eq("id", checklistId);
    setCommentInput({ ...commentInput, [itemId]: "" });
    fetchChecklists();
  }

  async function addItem(checklistId: string) {
    const itemTitle = newItemTitle[checklistId];
    if (!itemTitle) return;
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title: itemTitle,
      checked: false,
      comments: [],
    };
    const updatedItems = [...checklist.items, newItem];
    await supabase.from("checklists").update({ items: updatedItems }).eq("id", checklistId);
    setNewItemTitle({ ...newItemTitle, [checklistId]: "" });
    fetchChecklists();
  }

  async function deleteItem(checklistId: string, itemId: string) {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;
    const updatedItems = checklist.items.filter((i) => i.id !== itemId);
    await supabase.from("checklists").update({ items: updatedItems }).eq("id", checklistId);
    fetchChecklists();
  }

  async function deleteChecklist(checklistId: string) {
    await supabase.from("checklists").delete().eq("id", checklistId);
    fetchChecklists();
  }

  function calculateProgress(items: ChecklistItem[]) {
    const total = items.length;
    const checked = items.filter((i) => i.checked).length;
    return total === 0 ? 0 : Math.round((checked / total) * 100);
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
      <h1 className="text-2xl font-bold">✅ Checklists Inteligentes</h1>

      <div className="flex gap-4 items-center flex-wrap">
        <Input placeholder="Novo checklist" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={createChecklist} disabled={!title}>
          <PlusCircle className="w-4 h-4 mr-1" /> Criar
        </Button>

        <select
          className="border rounded px-3 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "done" | "pending")}
        >
          <option value="all">Todos</option>
          <option value="done">Concluídos</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {checklists.map((checklist) => (
        <Card key={checklist.id} id={`checklist-${checklist.id}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">📝 {checklist.title}</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportPDF(checklist.id)}>
                  📄 Exportar PDF
                </Button>
                <Button variant="destructive" onClick={() => deleteChecklist(checklist.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(checklist.items)} />

            {/* Add new item section */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Novo item..."
                value={newItemTitle[checklist.id] || ""}
                onChange={(e) => setNewItemTitle({ ...newItemTitle, [checklist.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addItem(checklist.id)}
              />
              <Button onClick={() => addItem(checklist.id)} disabled={!newItemTitle[checklist.id]}>
                <PlusCircle className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            <ul className="space-y-4">
              {checklist.items
                .filter((item) =>
                  filter === "done" ? item.checked : filter === "pending" ? !item.checked : true
                )
                .map((item) => (
                  <li
                    key={item.id}
                    className="border rounded p-3 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2" onClick={() => toggleItem(checklist.id, item.id)}>
                        <input type="checkbox" checked={item.checked} readOnly />
                        {editingItemId === item.id ? (
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEditedItem(checklist.id, item.id)}
                            className="w-64"
                          />
                        ) : (
                          <span className={item.checked ? "line-through text-muted" : ""}>{item.title}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingItemId === item.id ? (
                          <>
                            <Button size="icon" onClick={() => saveEditedItem(checklist.id, item.id)}><Save className="w-4 h-4" /></Button>
                            <Button size="icon" onClick={() => setEditingItemId(null)}><X className="w-4 h-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" onClick={() => { setEditingItemId(item.id); setEditedTitle(item.title); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => deleteItem(checklist.id, item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(item.comments || []).map((c, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground border-l-2 pl-2">
                          💬 <strong>{c.user}</strong>: {c.text} <span className="text-xs">({new Date(c.created_at).toLocaleDateString()})</span>
                        </div>
                      ))}

                      <div className="flex gap-2 items-center">
                        <Input
                          value={commentInput[item.id] || ""}
                          onChange={(e) => setCommentInput({ ...commentInput, [item.id]: e.target.value })}
                          placeholder="Adicionar comentário..."
                        />
                        <Button size="icon" onClick={() => addComment(checklist.id, item.id)}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
