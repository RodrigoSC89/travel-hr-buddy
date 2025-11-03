/**
 * PATCH 605 - Emissions Forecast Chart Component
 * Visual representation of emissions forecast data
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { EmissionLog, EmissionsForecast } from "../types";

interface EmissionsForecastChartProps {
  historicalData: EmissionLog[];
  forecast?: EmissionsForecast;
  showConfidence?: boolean;
}

export function EmissionsForecastChart({ 
  historicalData, 
  forecast,
  showConfidence = true 
}: EmissionsForecastChartProps) {
  // Prepare historical data for chart
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData = new Map<string, { co2: number; sox: number; nox: number; count: number }>();
    
    historicalData.forEach(emission => {
      const monthKey = emission.measurementDate.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { co2: 0, sox: 0, nox: 0, count: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (emission.emissionType === "co2") data.co2 += emission.amount;
      if (emission.emissionType === "sox") data.sox += emission.amount;
      if (emission.emissionType === "nox") data.nox += emission.amount;
      data.count++;
    });

    // Convert to array and sort
    const historical = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        period: month,
        co2: data.co2,
        sox: data.sox,
        nox: data.nox,
        type: "historical" as const
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12); // Last 12 months

    // Add forecast if available
    if (forecast) {
      const forecastMonth = new Date();
      forecastMonth.setMonth(forecastMonth.getMonth() + 1);
      const forecastPeriod = forecastMonth.toISOString().slice(0, 7);

      historical.push({
        period: forecastPeriod,
        co2: forecast.predictedEmissions.co2,
        sox: forecast.predictedEmissions.sox,
        nox: forecast.predictedEmissions.nox,
        type: "forecast" as const
      });
    }

    return historical;
  }, [historicalData, forecast]);

  // Calculate trends
  const trends = useMemo(() => {
    if (chartData.length < 2) return null;

    const recent = chartData[chartData.length - 2]; // Last actual data point
    const older = chartData[0];

    const co2Change = ((recent.co2 - older.co2) / older.co2) * 100;
    const soxChange = ((recent.sox - older.sox) / older.sox) * 100;
    const noxChange = ((recent.nox - older.nox) / older.nox) * 100;

    return {
      co2: { value: co2Change, improving: co2Change < 0 },
      sox: { value: soxChange, improving: soxChange < 0 },
      nox: { value: noxChange, improving: noxChange < 0 }
    };
  }, [chartData]);

  const getTrendIcon = (improving: boolean) => {
    if (improving) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <TrendingUp className="w-4 h-4 text-red-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trends && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CO₂ Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.abs(trends.co2.value).toFixed(1)}%
                  </span>
                  {getTrendIcon(trends.co2.improving)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.co2.improving ? "Decreasing" : "Increasing"} over period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SOx Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.abs(trends.sox.value).toFixed(1)}%
                  </span>
                  {getTrendIcon(trends.sox.improving)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.sox.improving ? "Decreasing" : "Increasing"} over period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">NOx Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.abs(trends.nox.value).toFixed(1)}%
                  </span>
                  {getTrendIcon(trends.nox.improving)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {trends.nox.improving ? "Decreasing" : "Increasing"} over period
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emissions Forecast</CardTitle>
              <CardDescription>
                Historical emissions and AI-powered predictions
              </CardDescription>
            </div>
            {forecast && showConfidence && (
              <Badge variant="outline" className="gap-1">
                <span className={getConfidenceColor(forecast.confidence)}>
                  {(forecast.confidence * 100).toFixed(0)}% Confidence
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: "Emissions (tonnes)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.period}</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm">
                            <span className="font-medium">CO₂:</span> {data.co2.toFixed(2)} tonnes
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">SOx:</span> {data.sox.toFixed(2)} tonnes
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">NOx:</span> {data.nox.toFixed(2)} tonnes
                          </p>
                        </div>
                        {data.type === "forecast" && (
                          <Badge variant="secondary" className="mt-2">
                            Forecasted
                          </Badge>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="co2" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="CO₂"
                dot={{ r: 4 }}
                strokeDasharray={(data: any) => data.type === "forecast" ? "5 5" : "0"}
              />
              <Line 
                type="monotone" 
                dataKey="sox" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="SOx"
                dot={{ r: 4 }}
                strokeDasharray={(data: any) => data.type === "forecast" ? "5 5" : "0"}
              />
              <Line 
                type="monotone" 
                dataKey="nox" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="NOx"
                dot={{ r: 4 }}
                strokeDasharray={(data: any) => data.type === "forecast" ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Forecast Details */}
          {forecast && (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-2">Key Factors</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {forecast.factors.map((factor, idx) => (
                      <li key={idx}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {forecast.recommendations.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {forecast.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
