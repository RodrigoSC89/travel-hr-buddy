/**
 * Voyage Command Center - Analytics Tab
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Fuel, BarChart3 } from "lucide-react";
import type { VoyageRoute } from "./types";

interface Props {
  voyages: VoyageRoute[];
  totalFuel: number;
}

export function VoyageAnalyticsTab({ voyages, totalFuel }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Consumo de Combustível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Planejado</span>
            <span className="font-bold">{totalFuel.toLocaleString()} ton</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Média por Viagem</span>
            <span className="font-bold">
              {voyages.length > 0 ? Math.round(totalFuel / voyages.length).toLocaleString() : 0} ton
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Economia IA (12%)</span>
            <span className="font-bold text-green-500">
              {Math.round(totalFuel * 0.12).toLocaleString()} ton
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Valor Economizado</span>
            <span className="font-bold text-green-500">
              R$ {(Math.round(totalFuel * 0.12) * 2800).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Taxa de Pontualidade</span>
            <Badge className="bg-green-500/10 text-green-500">94%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Viagens Sem Incidentes</span>
            <Badge className="bg-green-500/10 text-green-500">98%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Desvios por Clima</span>
            <Badge className="bg-amber-500/10 text-amber-500">3 este mês</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Otimizações IA Aplicadas</span>
            <Badge className="bg-primary/10 text-primary">12 este mês</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Viagens por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Ativas", status: "active", bg: "bg-green-500/10", color: "text-green-500" },
              { label: "Planejadas", status: "planned", bg: "bg-blue-500/10", color: "text-blue-500" },
              { label: "Concluídas", status: "completed", bg: "bg-muted", color: "text-muted-foreground" },
              { label: "Canceladas", status: "cancelled", bg: "bg-red-500/10", color: "text-red-500" },
            ].map(item => (
              <div key={item.status} className={`text-center p-4 rounded-lg ${item.bg}`}>
                <div className={`text-3xl font-bold ${item.color}`}>
                  {voyages.filter(v => v.status === item.status).length}
                </div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
