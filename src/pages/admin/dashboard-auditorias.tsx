import { useEffect, useRef, useState } from "react";
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
import html2pdf from "html2pdf.js";

interface AuditoriaResumo {
  nome_navio: string
  total: number
}

export default function DashboardAuditorias() {
  const [dados, setDados] = useState<AuditoriaResumo[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userId, setUserId] = useState("");
  const chartRef = useRef(null);

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

  const exportarPDF = () => {
    if (!chartRef.current) return;
    html2pdf().from(chartRef.current).save("dashboard-auditorias.pdf");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard de Auditorias</h1>

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

      <div className="flex gap-4 mt-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={carregarDados}
        >
          Filtrar
        </button>
        <button
          className="bg-slate-800 text-white px-4 py-2 rounded"
          onClick={exportarPDF}
        >
          Exportar PDF
        </button>
      </div>

      <Card ref={chartRef} className="shadow-md">
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
