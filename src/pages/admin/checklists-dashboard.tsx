import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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

export default function ChecklistDashboard() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  useEffect(() => {
    fetchChecklists();
  }, []);

  async function fetchChecklists() {
    const { data: checklistsData, error: checklistsError } = await supabase
      .from("operational_checklists")
      .select("*")
      .order("created_at", { ascending: false });

    if (checklistsError) {
      logger.error("Error fetching checklists:", checklistsError);
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
          logger.error("Error fetching items:", itemsError);
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

  const totalTasks = checklists.flatMap((c) => c.items).length;
  const completedTasks = checklists.flatMap((c) => c.items).filter((i) => i.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const coverageTrend = checklists.map((c) => ({
    date: format(new Date(c.created_at), "dd/MM"),
    coverage:
      c.items.length === 0
        ? 0
        : Math.round((c.items.filter((i) => i.completed).length / c.items.length) * 100),
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/checklists">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">📊 Visão Geral dos Checklists</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">✅ Tarefas Concluídas</h2>
            <p className="text-2xl font-bold">{completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">🕒 Pendentes</h2>
            <p className="text-2xl font-bold">{pendingTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">📦 Total de Tarefas</h2>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">
            📈 Progresso Diário (Cobertura por Checklist)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={coverageTrend}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
