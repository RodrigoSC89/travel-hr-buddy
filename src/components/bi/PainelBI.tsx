"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

interface ConformidadeData {
  navio: string;
  mes: string;
  conforme: number;
  nao_conforme: number;
  observacao: number;
}

export function PainelBI() {
  const [dados, setDados] = useState<ConformidadeData[]>([]);
  const [filtroMes, setFiltroMes] = useState<string>("");

  useEffect(() => {
    fetch("/api/bi/conformidade")
      .then((res) => res.json())
      .then((data) => setDados(data));
  }, []);

  const dadosFiltrados = filtroMes ? dados.filter(d => d.mes === filtroMes) : dados;

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Painel de Conformidade - Auditoria Técnica IMCA</h2>
        <select
          className="border p-2 rounded"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
        >
          <option value="">Todos os meses</option>
          {[...new Set(dados.map((d) => d.mes))].map((mes) => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dadosFiltrados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="navio" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="conforme" fill="#10b981" name="Conforme" />
          <Bar dataKey="nao_conforme" fill="#ef4444" name="Não Conforme" />
          <Bar dataKey="observacao" fill="#facc15" name="Observações" />
        </BarChart>
      </ResponsiveContainer>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>
            Os dados representam o status de conformidade por embarcação com base nas auditorias técnicas aplicadas.
            Use o filtro para visualizar por mês ou gere relatórios gerenciais.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => window.print()} className="bg-zinc-700 text-white">🖨️ Imprimir</Button>
        <Button
          onClick={() =>
            fetch("/api/bi/export")
              .then((r) => r.blob())
              .then((b) => {
                const url = window.URL.createObjectURL(b);
                const a = document.createElement("a");
                a.href = url;
                a.download = "relatorio_conformidade.csv";
                a.click();
              })
          }
          className="bg-blue-600 text-white"
        >
          ⬇️ Exportar CSV
        </Button>
      </div>
    </div>
  );
}
