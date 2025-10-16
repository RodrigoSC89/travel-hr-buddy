import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DadosNavio {
  nome_navio: string;
  total: number;
}

interface TendenciaData {
  data: string;
  total: number;
}

export default function DashboardAuditorias() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [userId, setUserId] = useState("");
  const [dados, setDados] = useState<DadosNavio[]>([]);
  const [tendencia, setTendencia] = useState<TendenciaData[]>([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append("start", dataInicio);
      if (dataFim) params.append("end", dataFim);
      if (userId) params.append("user_id", userId);

      const response = await fetch(
        `/api/auditoria/resumo?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }

      const dadosPorNavio = await response.json();
      setDados(dadosPorNavio || []);
      
      // Load trend data from tendencia API
      const trendResponse = await fetch(
        `/api/auditoria/tendencia?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        setTendencia(trendData || []);
      }
      
      toast.success(`${dadosPorNavio.length} navios com auditorias encontrados`);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados das auditorias");
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async () => {
    if (!chartRef.current) return;

    try {
      toast.info("Gerando PDF...");
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`auditorias-dashboard-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">📊 Resumo de Auditorias</h1>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="userId">Usuário (ID)</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={carregarDados}
              disabled={loading}
            >
              {loading ? "Carregando..." : "Filtrar"}
            </Button>
            <Button
              className="bg-slate-800 text-white hover:bg-slate-900"
              onClick={exportarPDF}
              disabled={dados.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Auditorias por Navio */}
      {dados.length > 0 && (
        <Card ref={chartRef} className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Auditorias por Navio</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dados} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="nome_navio" width={120} />
                <Tooltip />
                <Bar dataKey="total" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Linha - Tendência por Data */}
      {tendencia.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tendência por Data</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={tendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {!loading && dados.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="p-6 text-center text-gray-500">
            <p>Clique em &quot;Filtrar&quot; para carregar os dados das auditorias</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
