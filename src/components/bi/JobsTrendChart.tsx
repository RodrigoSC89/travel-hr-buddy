import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface JobsTrendChartProps {
  data: any[];
}

export default function JobsTrendChart({ data }: JobsTrendChartProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Tendência de Jobs</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#2563eb" name="Jobs" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
