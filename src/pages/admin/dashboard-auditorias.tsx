import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AuditoriaResumo {
  nome_navio: string;
  total: number;
}

export default function DashboardAuditorias() {
  const [data, setData] = useState<AuditoriaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userId, setUserId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      if (userId) params.append("user_id", userId);

      const response = await fetch(`/api/auditoria/resumo?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar resumo de auditorias:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Auditorias</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Data Início
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data inicial"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                Data Fim
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data final"
              />
            </div>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-2">
                ID do Usuário
              </label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID do usuário (opcional)"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={fetchData} disabled={loading}>
              {loading ? "Carregando..." : "Filtrar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auditorias por Navio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando dados...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>Nenhum dado encontrado</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome_navio" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
