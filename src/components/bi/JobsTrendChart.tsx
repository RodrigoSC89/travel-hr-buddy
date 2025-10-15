import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

/**
 * Chart component showing job trends by system
 */
export default function JobsTrendChart() {
  const data = [
    { sistema: "Gerador", ia_efetiva: 6, total: 10 },
    { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
    { sistema: "Propulsão", ia_efetiva: 4, total: 9 },
    { sistema: "Climatização", ia_efetiva: 5, total: 5 },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">📈 Tendência por Sistema</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="sistema" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#d1d5db" name="Total de Jobs" />
            <Bar dataKey="ia_efetiva" fill="#4ade80" name="IA foi eficaz" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
