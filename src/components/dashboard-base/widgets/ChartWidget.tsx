/**
 * Chart Widget
 * Componente reutilizável para exibir gráficos
 * FASE B.2 - Consolidação de Dashboards
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/types/dashboard-config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
  config: ChartConfig;
  className?: string;
}

const DEFAULT_COLORS = ["#0EA5E9", "#38BDF8", "#F97316", "#22C55E", "#8B5CF6"];

export const ChartWidget = ({ config, className }: ChartWidgetProps) => {
  const {
    type,
    title,
    description,
    data,
    dataKeys = [],
    xAxisKey,
    yAxisKey,
    colors = DEFAULT_COLORS,
    height = 300,
    showGrid = true,
    showLegend = true,
    showTooltip = true
  } = config;

  const renderChart = () => {
    const commonProps = {
      data,
      height,
    };

    switch (type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            {yAxisKey && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            {yAxisKey && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            {yAxisKey && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
    case "donut":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0] || "value"}
              nameKey={xAxisKey || "name"}
              cx="50%"
              cy="50%"
              innerRadius={type === "donut" ? "60%" : 0}
              outerRadius="80%"
              label
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return <div className="text-center text-muted-foreground">Chart type not supported</div>;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};
