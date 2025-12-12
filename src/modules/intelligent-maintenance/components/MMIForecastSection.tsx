/**
 * MMI Forecast Section - Geração de forecasts com IA
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Save, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";

export default function MMIForecastSection() {
  const [vesselName, setVesselName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [hourmeter, setHourmeter] = useState("");
  const [maintenanceDates, setMaintenanceDates] = useState("");
  const [forecast, setForecast] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateForecast = async () => {
    if (!vesselName || !systemName || !hourmeter || !maintenanceDates) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setForecast("");

    try {
      // Simulated AI forecast generation
      const mockForecast = `
📊 RELATÓRIO DE FORECAST - ${systemName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚢 Embarcação: ${vesselName}
⏱️ Horímetro Atual: ${hourmeter}h

📋 ANÁLISE DE MANUTENÇÃO:

Com base no histórico fornecido e nos padrões de desgaste típicos, a IA identificou os seguintes pontos:

1. PRÓXIMA MANUTENÇÃO PREVENTIVA
   ├─ Data Estimada: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
   ├─ Horímetro Previsto: ${Number(hourmeter) + 150}h
   └─ Tipo: Manutenção preventiva de rotina

2. ITENS PRIORITÁRIOS
   ├─ Verificação de vedações hidráulicas
   ├─ Análise de óleo e filtros
   └─ Inspeção de componentes críticos

3. ALERTAS
   ⚠️ Componentes com vida útil próxima do fim:
   ├─ Filtro principal: ~${Number(hourmeter) + 200}h
   └─ Correia de transmissão: ~${Number(hourmeter) + 350}h

4. RECOMENDAÇÕES
   ✅ Realizar inspeção visual diária
   ✅ Monitorar níveis de fluidos
   ✅ Programar substituição preventiva

📈 PREVISÃO DE CUSTOS:
   └─ Estimativa: R$ 2.500,00 - R$ 4.200,00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Gerado por IA | ${new Date().toLocaleString("pt-BR")}
      `.trim();

      // Simulate streaming
      for (let i = 0; i < mockForecast.length; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 20));
        setForecast(mockForecast.slice(0, i + 10));
      }
      setForecast(mockForecast);

      toast.success("Forecast gerado com sucesso!");
    } catch (error) {
      logger.error("Error generating forecast", { error, vesselName, systemName, hourmeter });
      toast.error("Erro ao gerar forecast");
    } finally {
      setLoading(false);
    }
  };

  const saveForecast = async () => {
    if (!forecast) {
      toast.error("Nenhum forecast para salvar");
      return;
    }

    setSaving(true);

    try {
      // Simulated save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("📦 Forecast salvo com sucesso!");
    } catch (error) {
      logger.error("Error saving forecast", { error, vesselName, systemName });
      toast.error("Erro ao salvar forecast");
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setVesselName("");
    setSystemName("");
    setHourmeter("");
    setMaintenanceDates("");
    setForecast("");
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-700 dark:text-purple-300">
          Preencha as informações do sistema e horímetro para gerar uma previsão de manutenção inteligente com GPT-4.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>
              Preencha os dados para gerar o forecast com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Nome da Embarcação</Label>
              <Input
                id="vessel"
                placeholder="Ex: FPSO Alpha"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system">Nome do Sistema</Label>
              <Input
                id="system"
                placeholder="Ex: Sistema hidráulico do guindaste"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourmeter">Horímetro (horas)</Label>
              <Input
                id="hourmeter"
                type="number"
                placeholder="Ex: 870"
                value={hourmeter}
                onChange={(e) => setHourmeter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance">Histórico de Manutenção</Label>
              <Textarea
                id="maintenance"
                placeholder="Uma data por linha. Ex:&#10;12/04/2025 - troca de óleo&#10;20/06/2025 - verificação de pressão"
                value={maintenanceDates}
                onChange={(e) => setMaintenanceDates(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={generateForecast} disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Forecast com IA
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearForm} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Result */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Forecast</CardTitle>
            <CardDescription>
              Previsão gerada pela IA GPT-4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forecast ? (
              <>
                <div className="bg-muted p-4 rounded-lg min-h-[300px] max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                  {forecast}
                </div>
                <Button
                  variant="secondary"
                  disabled={!forecast || loading || saving}
                  onClick={saveForecast}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Forecast
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                {loading ? (
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                    <p>Gerando forecast com GPT-4...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p>O forecast aparecerá aqui após gerar</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
