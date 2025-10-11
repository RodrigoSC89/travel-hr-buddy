import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit, Save, X, MessageCircle, Trash2 } from "lucide-react";
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
              comments: (item.comments as Comment[]) || [],
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

  async function saveEditedItem(checklistId: string, itemId: string) {
    if (!editedTitle.trim()) return;

    const { error } = await supabase
      .from("checklist_items")
      .update({ title: editedTitle })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item title:", error);
      return;
    }

    setEditingItemId(null);
    setEditedTitle("");
    fetchChecklists();
  }

  async function addItem(checklistId: string) {
    const itemTitle = newItemTitle[checklistId];
    if (!itemTitle?.trim()) return;

    // Get the current max order_index for this checklist
    const { data: existingItems } = await supabase
      .from("checklist_items")
      .select("order_index")
      .eq("checklist_id", checklistId)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex = existingItems && existingItems.length > 0 
      ? (existingItems[0].order_index || 0) + 1 
      : 0;

    const { error } = await supabase
      .from("checklist_items")
      .insert({
        checklist_id: checklistId,
        title: itemTitle,
        completed: false,
        order_index: nextOrderIndex,
        comments: [],
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
    // First delete all items
    const { error: itemsError } = await supabase
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId);

    if (itemsError) {
      console.error("Error deleting checklist items:", itemsError);
      return;
    }

    // Then delete the checklist
    const { error: checklistError } = await supabase
      .from("operational_checklists")
      .delete()
      .eq("id", checklistId);

    if (checklistError) {
      console.error("Error deleting checklist:", checklistError);
      return;
    }

    fetchChecklists();
  }

  async function addComment(checklistId: string, itemId: string) {
    const comment = commentInput[itemId];
    if (!comment?.trim()) return;

    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const item = checklist.items.find((i) => i.id === itemId);
    if (!item) return;

    const newComment: Comment = {
      user: "admin",
      text: comment,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...(item.comments || []), newComment];

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
      <h1 className="text-2xl font-bold">✅ Checklists Inteligentes</h1>

      <div className="flex gap-4 items-center flex-wrap">
        <Input
          placeholder="Novo checklist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && title && createChecklist()}
        />
        <Button onClick={createChecklist} disabled={!title}>
          <PlusCircle className="w-4 h-4 mr-1" /> Criar
        </Button>

        <select
          className="border rounded px-3 py-2 bg-background"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "done" | "pending")}
        >
          <option value="all">Todos os itens</option>
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
                  variant="destructive"
                  onClick={() => deleteChecklist(checklist.id)}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(checklist.items)} />

            {/* Add new item section */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Adicionar novo item..."
                value={newItemTitle[checklist.id] || ""}
                onChange={(e) =>
                  setNewItemTitle({ ...newItemTitle, [checklist.id]: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  newItemTitle[checklist.id] &&
                  addItem(checklist.id)
                }
              />
              <Button
                onClick={() => addItem(checklist.id)}
                disabled={!newItemTitle[checklist.id]?.trim()}
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            {checklist.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item neste checklist
              </p>
            ) : (
              <ul className="space-y-4">
                {checklist.items
                  .filter((item) =>
                    filter === "done"
                      ? item.completed
                      : filter === "pending"
                      ? !item.completed
                      : true
                  )
                  .map((item) => (
                    <li
                      key={item.id}
                      className="border rounded p-3 bg-card"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                          onClick={() => toggleItem(checklist.id, item.id)}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            readOnly
                            className="cursor-pointer"
                          />
                          {editingItemId === item.id ? (
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                saveEditedItem(checklist.id, item.id)
                              }
                              className="flex-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className={
                                item.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }
                            >
                              {item.title}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {editingItemId === item.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => saveEditedItem(checklist.id, item.id)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingItemId(null);
                                  setEditedTitle("");
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditedTitle(item.title);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteItem(checklist.id, item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Comments section */}
                      <div className="mt-3 space-y-2">
                        {(item.comments || []).map((c, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-muted-foreground border-l-2 border-muted pl-3 py-1"
                          >
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong>{c.user}</strong>: {c.text}
                                <span className="text-xs ml-2">
                                  ({new Date(c.created_at).toLocaleDateString()}{" "}
                                  {new Date(c.created_at).toLocaleTimeString()})
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-2 items-center">
                          <Input
                            value={commentInput[item.id] || ""}
                            onChange={(e) =>
                              setCommentInput({
                                ...commentInput,
                                [item.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              commentInput[item.id] &&
                              addComment(checklist.id, item.id)
                            }
                            placeholder="Adicionar comentário..."
                            className="text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => addComment(checklist.id, item.id)}
                            disabled={!commentInput[item.id]?.trim()}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
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
