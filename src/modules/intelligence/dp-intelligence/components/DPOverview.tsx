import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Compass,
  Navigation,
  Gauge,
  Activity
} from "lucide-react";

export default function DPOverview() {
  const metrics = [
    { 
      name: "Bus A", 
      status: "OK", 
      value: 100,
      trend: "stable",
      icon: CheckCircle2,
      color: "text-emerald-500"
    },
    { 
      name: "Bus B", 
      status: "OK", 
      value: 100,
      trend: "stable",
      icon: CheckCircle2,
      color: "text-emerald-500"
    },
    { 
      name: "Gyro Drift", 
      status: "0.02°/min", 
      value: 98,
      trend: "down",
      icon: Compass,
      color: "text-blue-500"
    },
    { 
      name: "DP Confidence", 
      status: "98%", 
      value: 98,
      trend: "up",
      icon: Gauge,
      color: "text-purple-500"
    },
  ];

  const systemStatus = [
    { name: "DGPS Primary", status: "online", quality: 99 },
    { name: "DGPS Secondary", status: "online", quality: 97 },
    { name: "HPR System", status: "online", quality: 95 },
    { name: "Gyro 1", status: "online", quality: 100 },
    { name: "Gyro 2", status: "online", quality: 100 },
    { name: "Gyro 3", status: "online", quality: 99 },
    { name: "Wind Sensor", status: "online", quality: 98 },
    { name: "MRU", status: "online", quality: 100 },
  ];

  const thrusterStatus = [
    { name: "Bow Thruster 1", power: 85, status: "active" },
    { name: "Bow Thruster 2", power: 78, status: "active" },
    { name: "Stern Thruster 1", power: 92, status: "active" },
    { name: "Stern Thruster 2", power: 88, status: "active" },
    { name: "Main Propeller Port", power: 45, status: "active" },
    { name: "Main Propeller Stbd", power: 0, status: "standby" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Resumo Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.name} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{m.name}</span>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${m.color}`}>{m.status}</span>
                  {m.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                  {m.trend === "down" && <TrendingDown className="h-4 w-4 text-amber-500" />}
                </div>
                <Progress value={m.value} className="h-1 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference Systems Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-500" /> Reference Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.map((sys) => (
                <div key={sys.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sys.status === "online" ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-sm font-medium">{sys.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={sys.quality} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground w-8">{sys.quality}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" /> Thruster Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thrusterStatus.map((thr) => (
                <div key={thr.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{thr.name}</span>
                    <Badge 
                      className={thr.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}
                    >
                      {thr.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={thr.power} 
                      className={`w-20 h-2 ${thr.power > 80 ? "[&>div]:bg-amber-500" : ""}`} 
                    />
                    <span className="text-xs text-muted-foreground w-8">{thr.power}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
