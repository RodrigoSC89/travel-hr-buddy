import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, BarChart3, Edit, Save, X, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Comment {
  user: string;
  text: string;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  comments?: Comment[];
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [newItemTitle, setNewItemTitle] = useState<{ [key: string]: string }>({});

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
              comments: item.comments || [],
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

  async function addItem(checklistId: string) {
    const itemTitle = newItemTitle[checklistId]?.trim();
    if (!itemTitle) return;

    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const maxOrderIndex = checklist.items.reduce(
      (max) => Math.max(max, 0),
      0
    );

    const { error } = await supabase
      .from("checklist_items")
      .insert({
        checklist_id: checklistId,
        title: itemTitle,
        order_index: maxOrderIndex + 1,
        completed: false,
      });

    if (error) {
      console.error("Error adding item:", error);
      return;
    }

    setNewItemTitle({ ...newItemTitle, [checklistId]: "" });
    fetchChecklists();
  }

  async function deleteItem(checklistId: string, itemId: string) {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting item:", error);
      return;
    }

    fetchChecklists();
  }

  async function deleteChecklist(checklistId: string) {
    const { error } = await supabase
      .from("operational_checklists")
      .delete()
      .eq("id", checklistId);

    if (error) {
      console.error("Error deleting checklist:", error);
      return;
    }

    fetchChecklists();
  }

  async function saveEditedItem(checklistId: string, itemId: string) {
    if (!editedTitle.trim()) return;

    const { error } = await supabase
      .from("checklist_items")
      .update({ title: editedTitle })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error);
      return;
    }

    setEditingItemId(null);
    setEditedTitle("");
    fetchChecklists();
  }

  async function addComment(checklistId: string, itemId: string) {
    const comment = commentInput[itemId]?.trim();
    if (!comment) return;

    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const item = checklist.items.find((i) => i.id === itemId);
    if (!item) return;

    const comments = item.comments || [];
    const updatedComments = [
      ...comments,
      {
        user: "admin",
        text: comment,
        created_at: new Date().toISOString(),
      },
    ];

    const { error } = await supabase
      .from("checklist_items")
      .update({ comments: updatedComments })
      .eq("id", itemId);

    if (error) {
      console.error("Error adding comment:", error);
      return;
    }

    setCommentInput({ ...commentInput, [itemId]: "" });
    fetchChecklists();
  }

  function getFilteredItems(items: ChecklistItem[]) {
    if (filter === "done") return items.filter((i) => i.completed);
    if (filter === "pending") return items.filter((i) => !i.completed);
    return items;
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
          placeholder="Novo checklist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title) {
              createChecklist();
            }
          }}
          className="flex-1 max-w-xs"
        />
        <Button onClick={createChecklist} disabled={!title}>
          <PlusCircle className="w-4 h-4 mr-1" /> Criar
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

      {checklists.map((checklist) => (
        <Card key={checklist.id} id={`checklist-${checklist.id}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">📝 {checklist.title}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportPDF(checklist.id)}
                  size="sm"
                >
                  📄 Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteChecklist(checklist.id)}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(checklist.items)} />

            {/* Add new item input */}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar novo item..."
                value={newItemTitle[checklist.id] || ""}
                onChange={(e) =>
                  setNewItemTitle({ ...newItemTitle, [checklist.id]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItemTitle[checklist.id]) {
                    addItem(checklist.id);
                  }
                }}
              />
              <Button
                onClick={() => addItem(checklist.id)}
                disabled={!newItemTitle[checklist.id]?.trim()}
                size="sm"
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>

            {getFilteredItems(checklist.items).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item neste checklist
              </p>
            ) : (
              <ul className="space-y-4">
                {getFilteredItems(checklist.items).map((item) => (
                  <li key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(checklist.id, item.id)}
                        className="cursor-pointer"
                      />
                      
                      {editingItemId === item.id ? (
                        <>
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editedTitle.trim()) {
                                saveEditedItem(checklist.id, item.id);
                              } else if (e.key === "Escape") {
                                setEditingItemId(null);
                                setEditedTitle("");
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            onClick={() => saveEditedItem(checklist.id, item.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingItemId(null);
                              setEditedTitle("");
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className={`flex-1 ${
                              item.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.title}
                          </span>
                          <Button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditedTitle(item.title);
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteItem(checklist.id, item.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Comments section */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="ml-8 space-y-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                        {item.comments.map((comment, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="text-muted-foreground">
                              <span className="font-medium">{comment.user}</span>
                              {" • "}
                              {new Date(comment.created_at).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p>{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment input */}
                    <div className="ml-8 flex gap-2">
                      <Input
                        placeholder="Adicionar comentário..."
                        value={commentInput[item.id] || ""}
                        onChange={(e) =>
                          setCommentInput({ ...commentInput, [item.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && commentInput[item.id]?.trim()) {
                            addComment(checklist.id, item.id);
                          }
                        }}
                        size={32}
                      />
                      <Button
                        onClick={() => addComment(checklist.id, item.id)}
                        disabled={!commentInput[item.id]?.trim()}
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
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
