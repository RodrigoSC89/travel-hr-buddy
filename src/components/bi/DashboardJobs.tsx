import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardJobs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/bi/jobs-by-component');
        if (!res.ok) throw new Error('Erro ao buscar dados de BI');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);


  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Falhas por Componente + Tempo Médio</h2>
        <CardContent>
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Falhas por Componente + Tempo Médio</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" label={{ value: 'Qtd Jobs / Horas (Empilhado)', position: 'insideBottomRight', offset: -5 }} />
              <YAxis dataKey="component_id" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0f172a" name="Jobs Finalizados" />
              <Bar dataKey="avg_duration" fill="#2563eb" name="Tempo Médio (h)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
