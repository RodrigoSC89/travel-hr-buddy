import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Wrench,
  DollarSign,
  Ship,
  Users,
  Fuel,
  Calendar,
  Brain,
  Zap,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

interface Prediction {
  id: string;
  type: "maintenance" | "fuel" | "market" | "safety" | "crew";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  timeframe: string;
  value: string;
  trend: "up" | "down" | "stable";
  actionRequired: boolean;
}

interface MarketForecast {
  month: string;
  freightRates: number;
  fuelCost: number;
  predicted: number;
}

interface MaintenancePrediction {
  vessel: string;
  component: string;
  probability: number;
  timeToFailure: number;
  cost: number;
}

const PredictiveAnalyticsEnhanced: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("3m");
  const [enabledPredictions, setEnabledPredictions] = useState({
    maintenance: true,
    fuel: true,
    market: true,
    safety: true,
    crew: false,
  });

  const predictions: Prediction[] = [
    {
      id: "1",
      type: "maintenance",
      title: "Engine Overhaul Required",
      description: "Main engine on Vessel Alpha showing degradation patterns",
      confidence: 87,
      impact: "high",
      timeframe: "45-60 days",
      value: "$125,000",
      trend: "up",
      actionRequired: true,
    },
    {
      id: "2",
      type: "fuel",
      title: "Fuel Price Increase",
      description: "Bunker fuel costs expected to rise 15% next quarter",
      confidence: 72,
      impact: "medium",
      timeframe: "2-3 months",
      value: "+15%",
      trend: "up",
      actionRequired: false,
    },
    {
      id: "3",
      type: "market",
      title: "Freight Rate Opportunity",
      description: "Pacific routes showing strong demand indicators",
      confidence: 68,
      impact: "high",
      timeframe: "1-2 months",
      value: "+22%",
      trend: "up",
      actionRequired: true,
    },
    {
      id: "4",
      type: "safety",
      title: "Weather Risk Alert",
      description: "Storm system developing along primary route",
      confidence: 94,
      impact: "medium",
      timeframe: "7-10 days",
      value: "3-day delay",
      trend: "stable",
      actionRequired: true,
    },
  ];

  const marketData: MarketForecast[] = [
    { month: "Jan", freightRates: 2400, fuelCost: 580, predicted: 2580 },
    { month: "Feb", freightRates: 2200, fuelCost: 620, predicted: 2420 },
    { month: "Mar", freightRates: 2600, fuelCost: 590, predicted: 2780 },
    { month: "Apr", freightRates: 2800, fuelCost: 610, predicted: 2950 },
    { month: "May", freightRates: 3200, fuelCost: 640, predicted: 3350 },
    { month: "Jun", freightRates: 3100, fuelCost: 670, predicted: 3280 },
  ];

  const maintenancePredictions: MaintenancePrediction[] = [
    { vessel: "Alpha", component: "Main Engine", probability: 85, timeToFailure: 45, cost: 125000 },
    { vessel: "Beta", component: "Generator", probability: 62, timeToFailure: 90, cost: 35000 },
    { vessel: "Gamma", component: "Pumps", probability: 45, timeToFailure: 120, cost: 15000 },
    { vessel: "Delta", component: "Navigation", probability: 28, timeToFailure: 180, cost: 8000 },
  ];

  const getImpactColor = (impact: Prediction["impact"]) => {
    switch (impact) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-success text-success-foreground";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: Prediction["trend"]) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case "stable":
      return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: Prediction["type"]) => {
    switch (type) {
    case "maintenance":
      return <Wrench className="h-4 w-4" />;
    case "fuel":
      return <Fuel className="h-4 w-4" />;
    case "market":
      return <DollarSign className="h-4 w-4" />;
    case "safety":
      return <AlertTriangle className="h-4 w-4" />;
    case "crew":
      return <Users className="h-4 w-4" />;
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-nautical">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights for proactive maritime operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Retrain Models
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-maritime">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical">{predictions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {predictions.filter(p => p.actionRequired).length} require action
                </p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical">
                  {Math.round(
                    predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Across all models</p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical">$2.3M</div>
                <p className="text-xs text-muted-foreground">Through proactive actions</p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical">94.2%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Predictions
                </CardTitle>
                <CardDescription>High-priority insights requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictions
                  .filter(p => p.actionRequired)
                  .map(prediction => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getTypeIcon(prediction.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{prediction.title}</h4>
                          <p className="text-sm text-muted-foreground">{prediction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getImpactColor(prediction.impact)}
                              variant="secondary"
                            >
                              {prediction.impact} impact
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {prediction.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(prediction.trend)}
                          <span className="font-semibold">{prediction.value}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {prediction.timeframe}
                        </span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Market Forecast
                </CardTitle>
                <CardDescription>Freight rates and fuel cost predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="freightRates"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.3)"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stackId="2"
                      stroke="hsl(var(--ocean-blue))"
                      fill="hsl(var(--ocean-blue) / 0.3)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Predictions
              </CardTitle>
              <CardDescription>
                Predictive maintenance alerts based on equipment data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenancePredictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{prediction.vessel}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{prediction.component}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Failure Probability</div>
                          <Progress value={prediction.probability} className="w-24" />
                          <div className="text-xs">{prediction.probability}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Time to Failure</div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{prediction.timeToFailure} days</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Estimated Cost</div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-sm">${prediction.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Schedule Maintenance
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Freight Rate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="freightRates"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--ocean-blue))"
                      strokeDasharray="5 5"
                      strokeWidth="2"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Fuel Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="fuelCost" fill="hsl(var(--warning))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Risk Analysis
              </CardTitle>
              <CardDescription>Predictive safety insights and risk assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weather Risk</span>
                    <Badge className="bg-warning text-warning-foreground">Medium</Badge>
                  </div>
                  <Progress value={65} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Storm systems developing along Route A-7
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Equipment Risk</span>
                    <Badge className="bg-destructive text-destructive-foreground">High</Badge>
                  </div>
                  <Progress value={85} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Navigation system anomalies detected
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Crew Fatigue</span>
                    <Badge className="bg-success text-success-foreground">Low</Badge>
                  </div>
                  <Progress value={25} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Optimal rotation schedule maintained
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Prediction Settings</CardTitle>
              <CardDescription>
                Configure which predictions to generate and their parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(enabledPredictions).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="capitalize">{key} Predictions</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate {key}-related predictions and insights
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={checked =>
                        setEnabledPredictions(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsEnhanced;
