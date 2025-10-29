import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, BarChart } from "lucide-react";

export default function Patch495InventoryControl() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PATCH 495 - Inventory Control</h1>
          <p className="text-muted-foreground">Controle inteligente de inventário</p>
        </div>
        <Badge variant="outline" className="bg-success/10">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Ativo
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Estoque em Tempo Real
            </CardTitle>
            <CardDescription>Monitoramento contínuo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Itens Cadastrados</span>
                <Badge variant="outline">1,284 ativos</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Nível Crítico</span>
                <span className="text-sm text-warning">8 itens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Valor Total</span>
                <span className="text-sm text-muted-foreground">R$ 2.4M</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Previsão de Demanda
            </CardTitle>
            <CardDescription>IA analisando padrões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pedidos Sugeridos</span>
                <Badge variant="outline">12 itens</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Economia Projetada</span>
                <span className="text-sm text-muted-foreground">R$ 45K/mês</span>
              </div>
              <Button className="w-full">
                Ver Análise Preditiva
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Ativação</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Sistema de rastreamento RFID integrado</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Alertas de estoque mínimo ativos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">IA preditiva treinada</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Integração com fornecedores ativa</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
