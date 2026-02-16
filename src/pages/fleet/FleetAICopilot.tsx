import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Route, Fuel, Wrench, BarChart3, RefreshCw } from "lucide-react";
import type { EnrichedVessel } from "./types";

export const FleetAICopilot = ({ vessels, onToast }: { vessels: EnrichedVessel[]; onToast: (opts: { title: string; description?: string }) => void }) => {
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);

  const insights = [
    { type: "success", icon: CheckCircle, text: `${vessels.filter(v => v.status === "active" || v.status === "operational").length} embarcações operacionais` },
    { type: "warning", icon: AlertTriangle, text: "2 manutenções preventivas pendentes" },
    { type: "info", icon: TrendingUp, text: "Eficiência média: 94.2%" }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Fleet AI Copilot
        </CardTitle>
        <CardDescription>Assistente inteligente para operações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {insights.map((insight) => (
            <div key={insight.text} className={`flex items-start gap-2 p-2 rounded-lg ${
              insight.type === "success" ? "bg-success/10" :
              insight.type === "warning" ? "bg-warning/10" :
              "bg-info/10"
            }`}>
              <insight.icon className={`h-4 w-4 mt-0.5 ${
                insight.type === "success" ? "text-success" :
                insight.type === "warning" ? "text-warning" :
                "text-info"
              }`} />
              <span className="text-sm">{insight.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Ações Rápidas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start" onClick={() => {
              window.history.pushState({}, '', '/operations?tab=routes');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}>
              <Route className="h-3 w-3 mr-2" />
              Otimizar Rotas
            </Button>
            <Button variant="outline" size="sm" className="justify-start" onClick={() => {
              window.history.pushState({}, '', '/fuel-analytics');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}>
              <Fuel className="h-3 w-3 mr-2" />
              Análise Combustível
            </Button>
            <Button variant="outline" size="sm" className="justify-start" onClick={() => {
              window.history.pushState({}, '', '/maintenance?tab=predictive');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}>
              <Wrench className="h-3 w-3 mr-2" />
              Pred. Manutenção
            </Button>
            <Button variant="outline" size="sm" className="justify-start" onClick={() => {
              window.history.pushState({}, '', '/workbench?tab=reports');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}>
              <BarChart3 className="h-3 w-3 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte ao AI Copilot..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" disabled={!query.trim() || thinking}>
              {thinking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
