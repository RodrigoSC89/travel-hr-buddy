import { Card, CardContent } from "@/components/ui/card";

/**
 * Dashboard component showing overall job statistics
 */
export default function DashboardJobs() {
  const stats = [
    { label: "Total de Jobs", value: 36, color: "text-blue-600" },
    { label: "IA foi eficaz", value: 23, color: "text-green-600" },
    { label: "Taxa de Efetividade", value: "64%", color: "text-purple-600" },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">📊 Resumo de Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
