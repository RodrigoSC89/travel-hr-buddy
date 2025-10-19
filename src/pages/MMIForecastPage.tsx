import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MMIForecastPage() {
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
      const response = await fetch("/api/mmi/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vessel_name: vesselName,
          system_name: systemName,
          last_maintenance_dates: maintenanceDates.split("\n").filter((line) => line.trim()),
          current_hourmeter: Number(hourmeter),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar forecast");
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Resposta inválida do servidor");
      }

      let forecastText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                forecastText += parsed.content;
                setForecast(forecastText);
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      toast.success("Forecast gerado com sucesso!");
    } catch (error) {
      console.error("Error generating forecast:", error);
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
      const res = await fetch("/api/mmi/save-forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vessel_name: vesselName,
          system_name: systemName,
          hourmeter: Number(hourmeter),
          last_maintenance: maintenanceDates.split("\n").filter((line) => line.trim()),
          forecast_text: forecast,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("📦 Forecast salvo com sucesso!");
      } else {
        toast.error(data.error || "Erro ao salvar forecast");
      }
    } catch (error) {
      console.error("Error saving forecast:", error);
      toast.error("Erro ao salvar forecast");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            MMI Forecast Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere previsões de manutenção com IA GPT-4
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Preencha as informações do sistema e horímetro para gerar uma previsão de manutenção inteligente.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Preencha os dados para gerar o forecast
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

            <Button onClick={generateForecast} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Forecast...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Forecast com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Forecast Result */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Forecast</CardTitle>
            <CardDescription>
              Previsão gerada pela IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forecast ? (
              <>
                <div className="bg-muted p-4 rounded-lg min-h-[300px] whitespace-pre-wrap">
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
                      💾 Salvar Forecast
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                {loading ? (
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p>Gerando forecast com GPT-4...</p>
                  </div>
                ) : (
                  <p>O forecast aparecerá aqui após gerar</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
