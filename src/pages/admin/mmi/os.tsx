import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type OS = {
  id: string;
  job_id: string;
  forecast_id: string;
  descricao: string;
  status: "pendente" | "executado" | "atrasado";
  created_at: string;
};

export default function OSPage() {
  const [osList, setOSList] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOS = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mmi_os")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error(error);
        return;
      }
      
      setOSList(data || []);
    } catch (error) {
      console.error("Error fetching OS:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: OS["status"]) => {
    try {
      const { error } = await supabase
        .from("mmi_os")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) {
        alert("Erro ao atualizar status");
        return;
      }
      
      fetchOS();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erro ao atualizar status");
    }
  };

  useEffect(() => {
    fetchOS();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">🔧 Ordens de Serviço (MMI)</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">🔧 Ordens de Serviço (MMI)</h1>

      <table className="w-full border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Descrição</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Criado em</th>
            <th className="p-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {osList.map((os) => (
            <tr key={os.id} className="border-t">
              <td className="p-2">{os.descricao}</td>
              <td className="p-2">
                <Badge
                  variant={
                    os.status === "executado"
                      ? "default"
                      : os.status === "atrasado"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {os.status}
                </Badge>
              </td>
              <td className="p-2">{format(new Date(os.created_at), "dd/MM/yyyy")}</td>
              <td className="p-2 text-right space-x-2">
                {["pendente", "executado", "atrasado"].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(os.id, status as OS["status"])}
                  >
                    {status}
                  </Button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
