import { memo, memo, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Save, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export const PriceRangeConfig = memo(function() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState<Date>();
  const [discountTarget, setDiscountTarget] = useState([15]);
  const [notificationFrequency, setNotificationFrequency] = useState("immediate");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [maxPrice, setMaxPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const calculatedDiscount = discountTarget[0];
  const originalPrice = maxPrice ? parseFloat(maxPrice) : 0;
  const targetPrice = originalPrice * (1 - calculatedDiscount / 100);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive"
      });
      return;
    }

    if (!origin || !destination || !maxPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha origem, destino e preço máximo",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const route = `${origin} - ${destination}`;
      const { error } = await supabase
        .from("price_alerts")
        .insert({
          route,
          travel_date: travelDate?.toISOString().split("T")[0],
          target_price: targetPrice,
          max_price: parseFloat(maxPrice),
          discount_target: calculatedDiscount,
          notification_email: emailEnabled,
          notification_push: pushEnabled,
          notification_frequency: notificationFrequency,
          active: true
        } as unknown);

      if (error) throw error;

      toast({
        title: "Alerta criado!",
        description: `Você será notificado quando o preço de ${route} cair ${calculatedDiscount}%`,
      });

      // Reset form
      setOrigin("");
      setDestination("");
      setTravelDate(undefined);
      setMaxPrice("");
      setDiscountTarget([15]);
    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar o alerta de preço",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Configurar Alerta de Preço
        </CardTitle>
        <CardDescription>
          Configure alertas inteligentes para monitorar quedas de preço em rotas específicas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              placeholder="Ex: São Paulo"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Input
              id="destination"
              placeholder="Ex: Rio de Janeiro"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data da Viagem (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {travelDate ? format(travelDate, "PPP") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={setTravelDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Preço Atual/Máximo (R$)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Ex: 500.00"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Meta de Desconto: {calculatedDiscount}%</Label>
              <span className="text-sm text-muted-foreground">
                Preço alvo: R$ {targetPrice.toFixed(2)}
              </span>
            </div>
            <Slider
              value={discountTarget}
              onValueChange={setDiscountTarget}
              min={5}
              max={70}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5% de desconto</span>
              <span>70% de desconto</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frequência de Notificação</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediata</SelectItem>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Canais de Notificação</Label>
            <div className="flex gap-4 items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Push</span>
              </label>
            </div>
          </div>
        </div>

        {originalPrice > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">R$ {originalPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Preço Atual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">-{calculatedDiscount}%</div>
                  <div className="text-xs text-muted-foreground">Desconto</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">R$ {targetPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Preço Alvo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Criar Alerta de Preço"}
        </Button>
      </CardContent>
    </Card>
  );
}
