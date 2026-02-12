/**
 * CII Monitor Dashboard - Tier-1 Component
 * Based on Danaos WAVES and IMO 2023+ requirements
 * Real-time Carbon Intensity Indicator monitoring with predictive alerts
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, Ship, TrendingUp, TrendingDown, AlertTriangle,
  Target, BarChart3, Fuel, Globe, Calendar, Brain
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";

// CII Rating thresholds (simplified)
const ciiRatings = {
  A: { min: 0, max: 0.65, color: "#22c55e", label: "Major Superior" },
  B: { min: 0.65, max: 0.85, color: "#84cc16", label: "Minor Superior" },
  C: { min: 0.85, max: 1.0, color: "#eab308", label: "Moderate" },
  D: { min: 1.0, max: 1.15, color: "#f97316", label: "Minor Inferior" },
  E: { min: 1.15, max: 2.0, color: "#ef4444", label: "Inferior" },
};

// Sample fleet CII data
const fleetCIIData = [
  { vessel: "MV Nautilus Star", type: "Bulk Carrier", currentCII: 0.78, rating: "B", trend: "improving", attainedCII: 4.2, requiredCII: 5.4 },
  { vessel: "MV Ocean Explorer", type: "Container", currentCII: 0.92, rating: "C", trend: "stable", attainedCII: 5.8, requiredCII: 6.3 },
  { vessel: "MV Pacific Trader", type: "Tanker", currentCII: 1.05, rating: "D", trend: "worsening", attainedCII: 6.2, requiredCII: 5.9 },
  { vessel: "MV Atlantic Carrier", type: "Bulk Carrier", currentCII: 0.62, rating: "A", trend: "improving", attainedCII: 3.8, requiredCII: 6.1 },
];

const ciiTrend = [
  { month: "Jan", attained: 5.2, required: 5.5, target: 4.8 },
  { month: "Feb", attained: 5.0, required: 5.5, target: 4.8 },
  { month: "Mar", attained: 4.8, required: 5.5, target: 4.8 },
  { month: "Apr", attained: 4.6, required: 5.5, target: 4.8 },
  { month: "May", attained: 4.5, required: 5.5, target: 4.8 },
  { month: "Jun", attained: 4.3, required: 5.5, target: 4.8 },
];

const recommendations = [
  { title: "Speed Optimization", impact: "-8% CII", description: "Reduce speed by 1.5 knots on laden voyages", priority: "high" },
  { title: "Hull Cleaning", impact: "-5% CII", description: "Schedule hull cleaning at Singapore", priority: "medium" },
  { title: "Weather Routing", impact: "-3% CII", description: "Use optimized weather routing for North Atlantic", priority: "medium" },
  { title: "Trim Optimization", impact: "-2% CII", description: "Maintain optimal trim during ballast voyages", priority: "low" },
];

export default function CIIMonitorDashboard() {
  const [selectedVessel, setSelectedVessel] = useState(fleetCIIData[0]);

  const getRatingColor = (rating: string) => {
    return ciiRatings[rating as keyof typeof ciiRatings]?.color || "#6b7280";
  };

  const fleetAvgCII = (fleetCIIData.reduce((sum, v) => sum + v.currentCII, 0) / fleetCIIData.length);
  const compliantVessels = fleetCIIData.filter(v => v.rating !== 'D' && v.rating !== 'E').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-success" />
            CII Monitor Dashboard
          </h2>
          <p className="text-muted-foreground">
            IMO 2023+ Carbon Intensity Indicator - Real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Globe className="h-3 w-3 mr-1" />
            IMO MEPC.352(78)
          </Badge>
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Fleet Avg CII</p>
            <p className="text-2xl font-bold">{fleetAvgCII.toFixed(2)}</p>
            <Badge className="mt-1 bg-success">Rating B</Badge>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Compliant Vessels</p>
            <p className="text-2xl font-bold">{compliantVessels}/{fleetCIIData.length}</p>
            <p className="text-xs text-success">A, B, C ratings</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">At Risk (D)</p>
            <p className="text-2xl font-bold text-warning">
              {fleetCIIData.filter(v => v.rating === 'D').length}
            </p>
            <p className="text-xs text-warning">Action required</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Non-Compliant (E)</p>
            <p className="text-2xl font-bold text-destructive">
              {fleetCIIData.filter(v => v.rating === 'E').length}
            </p>
            <p className="text-xs text-destructive">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* CII Rating Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CII Rating Scale - IMO Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {Object.entries(ciiRatings).map(([rating, data]) => (
              <div 
                key={rating}
                className="flex-1 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: data.color }}
              >
                {rating}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Superior</span>
            <span>Moderate</span>
            <span>Inferior</span>
          </div>
        </CardContent>
      </Card>

      {/* Fleet CII Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Fleet CII Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fleetCIIData.map((vessel) => (
              <div 
                key={vessel.vessel}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedVessel.vessel === vessel.vessel ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedVessel(vessel)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: getRatingColor(vessel.rating) }}
                  >
                    {vessel.rating}
                  </div>
                  <div>
                    <p className="font-medium">{vessel.vessel}</p>
                    <p className="text-xs text-muted-foreground">{vessel.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Attained CII</p>
                    <p className="font-bold">{vessel.attainedCII} gCO₂/t·nm</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Required CII</p>
                    <p className="font-bold">{vessel.requiredCII} gCO₂/t·nm</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {vessel.trend === 'improving' ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : vessel.trend === 'worsening' ? (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={`text-xs ${
                      vessel.trend === 'improving' ? 'text-success' :
                      vessel.trend === 'worsening' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {vessel.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CII Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            CII Trend - {selectedVessel.vessel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ciiTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis domain={[3, 7]} />
                <Tooltip />
                <ReferenceLine y={5.5} stroke="#f97316" strokeDasharray="5 5" label="Required" />
                <ReferenceLine y={4.8} stroke="#22c55e" strokeDasharray="5 5" label="Target" />
                <Area 
                  type="monotone" 
                  dataKey="attained" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3}
                  name="Attained CII"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-success">
            <Brain className="h-4 w-4" />
            AI Recommendations for CII Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.title} className="p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{rec.title}</span>
                  <Badge variant={
                    rec.priority === 'high' ? 'destructive' :
                    rec.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
