"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

// Sample trend data showing job volume over time
const jobsTrendData = [
  { date: "2024-09-01", value: 45, count: 45, system: "Gerador" },
  { date: "2024-09-08", value: 52, count: 52, system: "Hidráulico" },
  { date: "2024-09-15", value: 48, count: 48, system: "Propulsão" },
  { date: "2024-09-22", value: 55, count: 55, system: "Climatização" },
  { date: "2024-09-29", value: 61, count: 61, system: "Elétrico" },
  { date: "2024-10-06", value: 58, count: 58, system: "Navegação" },
  { date: "2024-10-13", value: 64, count: 64, system: "Comunicação" },
];

// Summary data for the chart
const summaryData = [
  { sistema: "Gerador", jobs: 45, status: "Ativo" },
  { sistema: "Hidráulico", jobs: 52, status: "Ativo" },
  { sistema: "Propulsão", jobs: 48, status: "Ativo" },
  { sistema: "Climatização", jobs: 55, status: "Ativo" },
  { sistema: "Elétrico", jobs: 61, status: "Pendente" },
  { sistema: "Navegação", jobs: 58, status: "Ativo" },
  { sistema: "Comunicação", jobs: 64, status: "Pendente" },
];

export default function JobsBIForecast() {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 BI - Análise e Previsão de Jobs</h1>
        <p className="text-slate-600">Dashboard com análise histórica e previsões baseadas em IA</p>
      </div>

      {/* Current Jobs Summary */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">📈 Volume de Jobs por Sistema</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <XAxis dataKey="sistema" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" fill="#3b82f6" name="Total de Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Line Chart */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">📉 Tendência de Jobs (Últimas 7 Semanas)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={jobsTrendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Número de Jobs" 
                dot={{ fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Forecast Report - Main Feature */}
      <JobsForecastReport trend={jobsTrendData} />

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">383</div>
              <div className="text-sm text-slate-600 mt-2">Total de Jobs</div>
              <div className="text-xs text-green-600 mt-1">↑ 12% vs mês anterior</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">55</div>
              <div className="text-sm text-slate-600 mt-2">Média Semanal</div>
              <div className="text-xs text-green-600 mt-1">↑ 8% vs período anterior</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">7</div>
              <div className="text-sm text-slate-600 mt-2">Sistemas Ativos</div>
              <div className="text-xs text-slate-500 mt-1">Monitoramento contínuo</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre a Previsão IA</h3>
          <p className="text-sm text-blue-800">
            O componente JobsForecastReport utiliza inteligência artificial para analisar dados históricos 
            e gerar previsões para os próximos 2 meses, identificando padrões, tendências sazonais e 
            fornecendo recomendações preventivas baseadas nos dados reais de jobs do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
