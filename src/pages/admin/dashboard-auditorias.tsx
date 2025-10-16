import { useEffect, useRef, useState } from "react";
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
import html2pdf from "html2pdf.js";
import { logger } from "@/lib/logger";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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
  const chartRef = useRef(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      if (userId) params.append("user_id", userId);

      const res = await fetch(`/api/auditoria/resumo?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDados(data);
    } catch (error) {
      logger.error("Erro ao carregar dados de auditorias:", error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const exportarPDF = () => {
    if (!chartRef.current) return;
    const options = {
      margin: 10,
      filename: "dashboard-auditorias.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };
    html2pdf().from(chartRef.current).set(options).save();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Dashboard de Auditorias</h1>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Início
              </label>
              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Fim
              </label>
              <Input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Usuário (ID)
              </label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={carregarDados} className="w-full" disabled={loading}>
                {loading ? "Carregando..." : "Filtrar"}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={exportarPDF} variant="outline" disabled={dados.length === 0}>
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6" ref={chartRef}>
          <h2 className="text-xl font-semibold mb-4">
            Auditorias por Navio
          </h2>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : dados.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">
                Nenhum dado disponível para exibir
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dados} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="nome_navio" type="category" width={150} />
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
