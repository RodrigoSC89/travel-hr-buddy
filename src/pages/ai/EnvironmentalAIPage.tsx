/**
 * Environmental AI Page
 * AI-powered environmental monitoring and ESG compliance
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Droplets, 
  Wind, 
  Thermometer,
  TrendingDown,
  Brain,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function EnvironmentalAIPage() {
  return (
    <>
      <Helmet>
        <title>Environmental AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Leaf className="h-8 w-8 text-success" />
              Environmental AI
            </h1>
            <p className="text-muted-foreground">
              Monitoramento ambiental e ESG com IA preditiva
            </p>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2 bg-success">
            <Brain className="h-4 w-4 mr-2" />
            CII Rating: B
          </Badge>
        </div>

        {/* Environmental KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-success/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                  <p className="text-3xl font-bold">2,450</p>
                  <p className="text-xs text-success">↓ 12% vs meta</p>
                </div>
                <Wind className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SOx Emissions</p>
                  <p className="text-3xl font-bold">0.45%</p>
                  <p className="text-xs text-success">Dentro do limite</p>
                </div>
                <Droplets className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
                  <p className="text-3xl font-bold">94%</p>
                  <p className="text-xs text-success">+3% otimizado</p>
                </div>
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">EEXI Score</p>
                  <p className="text-3xl font-bold">A</p>
                  <p className="text-xs text-muted-foreground">Excelente</p>
                </div>
                <Thermometer className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CII Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Carbon Intensity Indicator (CII)</CardTitle>
            <CardDescription>Monitoramento em tempo real do índice de carbono</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>MV Nautilus Explorer</span>
                <span className="font-medium">Rating B - 78%</span>
              </div>
              <Progress value={78} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>MV Ocean Pioneer</span>
                <span className="font-medium">Rating A - 92%</span>
              </div>
              <Progress value={92} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>MV Atlantic Guardian</span>
                <span className="font-medium">Rating C - 65%</span>
              </div>
              <Progress value={65} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recomendações IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-success/5 border-success/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">Otimização de Velocidade</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduzir velocidade em 2 nós na rota Santos-Rotterdam pode economizar 15% de combustível.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-warning/5 border-warning/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-sm">Manutenção do Casco</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Limpeza do casco recomendada para MV Atlantic Guardian - potencial melhoria de 8% no CII.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas ESG 2026</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Redução CO₂</span>
                  <span>75% do target</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Zero Waste to Sea</span>
                  <span>98% atingido</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ballast Water Compliance</span>
                  <span>100% atingido</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
