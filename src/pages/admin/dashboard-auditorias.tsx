import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const carregarDados = async () => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    if (userId) params.append("user_id", userId);

    const res = await fetch(`/api/auditoria/resumo?${params.toString()}`);
    const data = await res.json();
    setDados(data);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Dashboard de Auditorias</h1>
        <p className="text-muted-foreground">
          Visualização de auditorias por embarcação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Início</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Fim</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Usuário (ID)</label>
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        onClick={carregarDados}
      >
        Filtrar
      </button>

      <Card>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="nome_navio" width={120} />
              <Tooltip />
              <Bar dataKey="total" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
