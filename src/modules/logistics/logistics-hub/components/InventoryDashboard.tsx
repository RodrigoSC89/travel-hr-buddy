import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const mockInventoryData = [
  { name: "Peças", quantity: 450, minimum: 200, status: "good" },
  { name: "Alimentos", quantity: 180, minimum: 250, status: "low" },
  { name: "Combustível", quantity: 5000, minimum: 3000, status: "good" },
  { name: "Equipamentos", quantity: 95, minimum: 100, status: "low" },
];

const chartData = [
  { month: "Jan", entrada: 240, saida: 180 },
  { month: "Fev", entrada: 300, saida: 210 },
  { month: "Mar", entrada: 280, saida: 260 },
  { month: "Abr", entrada: 350, saida: 290 },
];

export const InventoryDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6" />Dashboard de Inventário</h2><p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockInventoryData.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              {item.status === "low" ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <Package className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.quantity}</div>
              <div className="text-xs text-muted-foreground">Mínimo: {item.minimum}</div>
              <Badge variant={item.status === "low" ? "destructive" : "default"} className="mt-2">{item.status === "low" ? "Baixo Estoque" : "Normal"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Movimentações Mensais</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entrada" fill="#10b981" name="Entrada" />
              <Bar dataKey="saida" fill="#ef4444" name="Saída" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
