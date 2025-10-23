import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { TestTube2, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface GroupStats {
  name: string;
  icon: string;
  tests: number;
  passing: number;
  failing: number;
  coverage: number;
  avgDuration: number;
  lastRun: string;
}

const groupStats: GroupStats[] = [
  { name: "operations", icon: "⚙️", tests: 45, passing: 43, failing: 2, coverage: 72, avgDuration: 1.2, lastRun: "2 min ago" },
  { name: "control", icon: "🎮", tests: 39, passing: 39, failing: 0, coverage: 82, avgDuration: 0.9, lastRun: "5 min ago" },
  { name: "intelligence", icon: "🧠", tests: 52, passing: 50, failing: 2, coverage: 68, avgDuration: 2.1, lastRun: "1 min ago" },
  { name: "emergency", icon: "🚨", tests: 51, passing: 51, failing: 0, coverage: 78, avgDuration: 1.5, lastRun: "3 min ago" },
  { name: "planning", icon: "📋", tests: 47, passing: 45, failing: 2, coverage: 75, avgDuration: 1.8, lastRun: "4 min ago" },
  { name: "compliance", icon: "📜", tests: 60, passing: 60, failing: 0, coverage: 80, avgDuration: 1.3, lastRun: "2 min ago" },
  { name: "logistics", icon: "📦", tests: 28, passing: 27, failing: 1, coverage: 55, avgDuration: 0.8, lastRun: "6 min ago" },
  { name: "hr", icon: "👥", tests: 18, passing: 18, failing: 0, coverage: 62, avgDuration: 0.7, lastRun: "7 min ago" },
  { name: "connectivity", icon: "🔌", tests: 21, passing: 20, failing: 1, coverage: 58, avgDuration: 1.1, lastRun: "5 min ago" },
  { name: "workspace", icon: "💼", tests: 8, passing: 8, failing: 0, coverage: 60, avgDuration: 0.5, lastRun: "8 min ago" },
  { name: "assistants", icon: "🤖", tests: 6, passing: 6, failing: 0, coverage: 50, avgDuration: 0.6, lastRun: "10 min ago" },
  { name: "ui", icon: "🎨", tests: 25, passing: 25, failing: 0, coverage: 85, avgDuration: 1.0, lastRun: "3 min ago" },
];

const totalTests = groupStats.reduce((sum, g) => sum + g.tests, 0);
const totalPassing = groupStats.reduce((sum, g) => sum + g.passing, 0);
const totalFailing = groupStats.reduce((sum, g) => sum + g.failing, 0);
const avgCoverage = Math.round(groupStats.reduce((sum, g) => sum + g.coverage, 0) / groupStats.length);
const passRate = Math.round((totalPassing / totalTests) * 100);

const getCoverageColor = (coverage: number) => {
  if (coverage >= 80) return "text-green-500";
  if (coverage >= 60) return "text-yellow-500";
  return "text-red-500";
};

const getCoverageBg = (coverage: number) => {
  if (coverage >= 80) return "bg-green-500/10 border-green-500/20";
  if (coverage >= 60) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
};

export default function TestsDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={TestTube2}
        title="Testing Dashboard - PATCH 67.0"
        description="Framework de testes modular com cobertura em tempo real"
        gradient="blue"
        badges={[
          { icon: CheckCircle, label: `${totalPassing}/${totalTests} Passing` },
          { icon: TrendingUp, label: `${avgCoverage}% Coverage` },
          { icon: Clock, label: "CI: 2.1min" }
        ]}
      />

      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tests Passing</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-400">{totalPassing}</div>
            <div className="text-xs text-muted-foreground mt-1">{passRate}% pass rate</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tests Failing</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-400">{totalFailing}</div>
            <div className="text-xs text-muted-foreground mt-1">{Math.round((totalFailing/totalTests)*100)}% fail rate</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Coverage</span>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{avgCoverage}%</div>
            <div className="text-xs text-muted-foreground mt-1">Target: 75%</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Tests</span>
              <TestTube2 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{totalTests}</div>
            <div className="text-xs text-muted-foreground mt-1">12 groups</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Tests por Grupo</h3>
              <div className="space-y-4">
                {groupStats.map((group) => (
                  <Card key={group.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <h4 className="font-mono font-semibold capitalize">{group.name}</h4>
                          <p className="text-xs text-muted-foreground">{group.lastRun}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {group.passing}/{group.tests} passing
                          </div>
                          {group.failing > 0 && (
                            <div className="text-xs text-red-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {group.failing} failing
                            </div>
                          )}
                        </div>
                        {group.failing === 0 ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    </div>
                    <Progress value={(group.passing / group.tests) * 100} className="h-2" />
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Cobertura por Grupo</h3>
              <div className="space-y-4">
                {[...groupStats].sort((a, b) => b.coverage - a.coverage).map((group) => (
                  <div key={group.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{group.icon}</span>
                        <span className="font-mono capitalize">{group.name}</span>
                      </div>
                      <Badge className={getCoverageBg(group.coverage)}>
                        <span className={getCoverageColor(group.coverage)}>
                          {group.coverage}%
                        </span>
                      </Badge>
                    </div>
                    <Progress value={group.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Tempo de Execução</h3>
              <div className="space-y-4">
                {[...groupStats].sort((a, b) => b.avgDuration - a.avgDuration).map((group) => (
                  <div key={group.name} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{group.icon}</span>
                      <span className="font-mono capitalize">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{group.avgDuration.toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Framework de Testes</h3>
              <p className="text-sm text-muted-foreground">
                Sistema modular com utilities, mocks e fixtures compartilhados
              </p>
            </div>
            <Link to="/developer/modules">
              <Button variant="outline">Ver Status dos Módulos</Button>
            </Link>
          </div>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
