/**
 * Voyage P&L Dashboard - Tier-1 Component
 * Based on Veson IMOS Platform best practices
 * Real-time voyage profitability analysis: Pre-fixture vs Post-fixture
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, TrendingUp, TrendingDown, Ship, Fuel, 
  Anchor, Clock, Calculator, AlertTriangle, CheckCircle,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Target
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell
} from "recharts";

// Sample voyage data (would come from Supabase in production)
const voyageData = {
  id: "VOY-2026-0142",
  vessel: "MV Nautilus Star",
  route: "Rotterdam → Singapore → Shanghai",
  status: "in_progress",
  startDate: "2026-01-15",
  eta: "2026-02-28",
  
  // Financial comparison
  estimated: {
    revenue: 2850000,
    bunkerCost: 680000,
    portCosts: 245000,
    canalFees: 185000,
    agentFees: 45000,
    insurance: 32000,
    otherCosts: 28000,
    totalCosts: 1215000,
    netProfit: 1635000,
    tce: 42500,
  },
  actual: {
    revenue: 2850000,
    bunkerCost: 725000,
    portCosts: 268000,
    canalFees: 185000,
    agentFees: 52000,
    insurance: 32000,
    otherCosts: 35000,
    totalCosts: 1297000,
    netProfit: 1553000,
    tce: 40350,
  }
};

const costBreakdown = [
  { name: "Bunker", estimated: 680000, actual: 725000, color: "#ef4444" },
  { name: "Port Costs", estimated: 245000, actual: 268000, color: "#f97316" },
  { name: "Canal Fees", estimated: 185000, actual: 185000, color: "#eab308" },
  { name: "Agent Fees", estimated: 45000, actual: 52000, color: "#22c55e" },
  { name: "Insurance", estimated: 32000, actual: 32000, color: "#3b82f6" },
  { name: "Other", estimated: 28000, actual: 35000, color: "#8b5cf6" },
];

const tceHistory = [
  { month: "Sep", tce: 38500 },
  { month: "Oct", tce: 41200 },
  { month: "Nov", tce: 39800 },
  { month: "Dec", tce: 43500 },
  { month: "Jan", tce: 42500 },
  { month: "Feb", tce: 40350 },
];

const fleetVoyages = [
  { vessel: "MV Nautilus Star", voyage: "VOY-0142", tce: 40350, status: "in_progress", variance: -5.1 },
  { vessel: "MV Ocean Explorer", voyage: "VOY-0138", tce: 45200, status: "completed", variance: +3.2 },
  { vessel: "MV Pacific Trader", voyage: "VOY-0145", tce: 38900, status: "in_progress", variance: -2.8 },
  { vessel: "MV Atlantic Carrier", voyage: "VOY-0141", tce: 52100, status: "completed", variance: +8.5 },
];

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export default function VoyagePnLDashboard() {
  const [selectedVoyage] = useState(voyageData);
  
  const variance = selectedVoyage.actual.netProfit - selectedVoyage.estimated.netProfit;
  const variancePercent = ((variance / selectedVoyage.estimated.netProfit) * 100).toFixed(1);
  const isPositive = variance >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-success" />
            Voyage P&L Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time profitability analysis - Veson IMOS Standard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <Ship className="h-3 w-3 mr-1" />
            {selectedVoyage.vessel}
          </Badge>
          <Badge className="bg-amber-500">
            {selectedVoyage.id}
          </Badge>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Profit (Est.)</p>
                <p className="text-xl font-bold text-success">{formatCurrency(selectedVoyage.estimated.netProfit)}</p>
              </div>
              <Target className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${isPositive ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Profit (Actual)</p>
                <p className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(selectedVoyage.actual.netProfit)}
                </p>
              </div>
              {isPositive ? (
                <TrendingUp className="h-8 w-8 text-success opacity-60" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive opacity-60" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${isPositive ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Variance</p>
                <p className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(variance)}
                </p>
                <p className={`text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{variancePercent}%
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">TCE (Est.)</p>
                <p className="text-xl font-bold">{formatCurrency(selectedVoyage.estimated.tce)}/day</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${selectedVoyage.actual.tce >= selectedVoyage.estimated.tce ? 'border-l-success' : 'border-l-warning'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">TCE (Actual)</p>
                <p className="text-xl font-bold">{formatCurrency(selectedVoyage.actual.tce)}/day</p>
              </div>
              <BarChart3 className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cost Comparison: Estimated vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="estimated" fill="hsl(var(--primary))" name="Estimated" />
                  <Bar dataKey="actual" fill="hsl(var(--destructive))" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Actual Cost Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={costBreakdown}
                    dataKey="actual"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TCE Trend & Fleet Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TCE Trend Line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              TCE Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tceHistory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="tce" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Voyages Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Fleet Voyages Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fleetVoyages.map((voyage) => (
                <div key={voyage.voyage} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{voyage.vessel}</p>
                      <p className="text-xs text-muted-foreground">{voyage.voyage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(voyage.tce)}/day</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${voyage.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {voyage.variance >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {voyage.variance >= 0 ? '+' : ''}{voyage.variance}%
                      </p>
                    </div>
                    <Badge variant={voyage.status === 'completed' ? 'default' : 'secondary'}>
                      {voyage.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recommendations */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-4 w-4 text-destructive" />
                <span className="font-medium text-sm">Bunker Overspend</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bunker costs exceeded estimate by $45,000 (6.6%). Consider reviewing bunkering strategy at Singapore.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Anchor className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Port Cost Variance</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Port costs $23,000 above estimate. Demurrage charges at Rotterdam contributed to variance.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Revenue On Target</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Freight revenue meeting expectations. No adjustments required for cargo rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
