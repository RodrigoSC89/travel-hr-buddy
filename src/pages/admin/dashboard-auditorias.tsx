import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AuditoriaResumo {
  nome_navio: string;
  total: number;
}

export default function DashboardAuditorias() {
  const [dados, setDados] = useState<AuditoriaResumo[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      if (userId) params.append("user_id", userId);

      const res = await fetch(`/api/auditoria/resumo?${params.toString()}`);
      const data = await res.json();
      setDados(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard de Auditorias</h1>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">
                Início
              </label>
              <Input
                id="start-date"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1">
                Fim
              </label>
              <Input
                id="end-date"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="user-id" className="block text-sm font-medium mb-1">
                Usuário (ID)
              </label>
              <Input
                id="user-id"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          <Button
            className="w-full md:w-auto"
            onClick={carregarDados}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Filtrar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">
            Auditorias por Navio
          </h2>
          {dados.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum dado disponível
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={dados}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome_navio" width={90} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
