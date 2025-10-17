import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TrendDataPoint {
  month: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface SGSOTrendChartProps {
  data?: TrendDataPoint[];
}

// Sample data for demonstration
const defaultTrendData: TrendDataPoint[] = [
  { month: "Jan", critical: 2, high: 5, medium: 8, low: 12 },
  { month: "Fev", critical: 1, high: 4, medium: 10, low: 15 },
  { month: "Mar", critical: 3, high: 6, medium: 7, low: 10 },
  { month: "Abr", critical: 1, high: 3, medium: 9, low: 14 },
  { month: "Mai", critical: 2, high: 5, medium: 11, low: 16 },
  { month: "Jun", critical: 1, high: 4, medium: 8, low: 13 },
];

export const SGSOTrendChart: React.FC<SGSOTrendChartProps> = ({ data = defaultTrendData }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="Crítico"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="#ea580c" 
            strokeWidth={2}
            name="Alto"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            stroke="#eab308" 
            strokeWidth={2}
            name="Médio"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Baixo"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SGSOTrendChart;
