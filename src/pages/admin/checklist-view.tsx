import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, Calendar, User, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  criticality: string;
  order_index: number;
}

interface Checklist {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  created_by: string;
  source_type: string;
}

export default function ChecklistViewPage() {
  const { id } = useParams<{ id: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchChecklistData();
    }
  }, [id]);

  async function fetchChecklistData() {
    try {
      setLoading(true);

      // Fetch checklist details
      const { data: checklistData, error: checklistError } = await supabase
        .from("operational_checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        toast({
          title: "Erro",
          description: "Erro ao carregar checklist",
          variant: "destructive",
        });
        return;
      }

      setChecklist(checklistData);

      // Fetch checklist items
      const { data: itemsData, error: itemsError } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("checklist_id", id)
        .order("order_index", { ascending: true });

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar itens do checklist",
          variant: "destructive",
        });
        return;
      }

      setItems(itemsData || []);
    } catch (error) {
      console.error("Error in fetchChecklistData:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(itemId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("checklist_items")
      .update({
        completed: !currentStatus,
        completed_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
            ...item,
            completed: !currentStatus,
            completed_at: !currentStatus ? new Date().toISOString() : null,
          }
          : item
      )
    );

    toast({
      title: "Sucesso",
      description: "Item atualizado com sucesso",
    });
  }

  function calculateProgress() {
    if (items.length === 0) return 0;
    const completedCount = items.filter((item) => item.completed).length;
    return Math.round((completedCount / items.length) * 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Checklist não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O checklist que você está procurando não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Link to="/admin/checklists">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Checklists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();
  const completedItems = items.filter((item) => item.completed).length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link to="/admin/checklists">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{checklist.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Tipo: {checklist.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Criado em: {new Date(checklist.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Origem: {checklist.source_type}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {checklist.status === "rascunho" && "📝 Rascunho"}
                  {checklist.status === "em_andamento" && "⚡ Em andamento"}
                  {checklist.status === "concluido" && "✅ Concluído"}
                  {checklist.status === "auditado" && "🔍 Auditado"}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Progresso: {completedItems} de {items.length} itens
                </span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Itens do Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item neste checklist ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    item.completed
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id, item.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          item.criticality === "critica"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : item.criticality === "alta"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                              : item.criticality === "media"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {item.criticality === "critica" && "🔴 Crítica"}
                        {item.criticality === "alta" && "🟠 Alta"}
                        {item.criticality === "media" && "🟡 Média"}
                        {item.criticality === "baixa" && "🔵 Baixa"}
                      </span>
                      {item.completed_at && (
                        <span className="text-muted-foreground">
                          Concluído em: {new Date(item.completed_at).toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
