"use client";

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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuditoriaResumo {
  nome_navio: string;
  total: number;
}

export default function DashboardAuditorias() {
  const navigate = useNavigate();
  const [dados, setDados] = useState<AuditoriaResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userId, setUserId] = useState("");

  const carregarDados = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      if (userId) params.append("user_id", userId);

      const res = await fetch(`/api/auditoria/resumo?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setDados(data);
      } else {
        console.error("Erro ao carregar dados:", data.error);
      }
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
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin")}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Dashboard de Auditorias</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Início</label>
              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fim</label>
              <Input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Usuário (ID)
              </label>
              <Input
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
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">
            Auditorias por Embarcação
          </h2>
          {dados.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nome_navio"
                    width={120}
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill="#0ea5e9"
                    radius={[0, 4, 4, 0]}
                    label={{ position: "right" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {loading
                ? "Carregando dados..."
                : "Nenhum dado disponível. Ajuste os filtros e tente novamente."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
