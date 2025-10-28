import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, TrendingDown, Save } from "lucide-react";
import { toast } from "sonner";

interface PriceRangeConfigProps {
  onSave: (config: PriceRangeSettings) => void;
  initialConfig?: PriceRangeSettings;
}

export interface PriceRangeSettings {
  minPrice: number;
  maxPrice: number;
  targetDiscount: number;
  priceThreshold: number;
  origin?: string;
  destination?: string;
  category?: string;
}

export const PriceRangeConfig: React.FC<PriceRangeConfigProps> = ({
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<PriceRangeSettings>(
    initialConfig || {
      minPrice: 0,
      maxPrice: 1000,
      targetDiscount: 20,
      priceThreshold: 500,
      origin: "",
      destination: "",
      category: "flights",
    }
  );

  const handleSave = () => {
    if (config.minPrice >= config.maxPrice) {
      toast.error("Preço mínimo deve ser menor que o preço máximo");
      return;
    }
    onSave(config);
    toast.success("Configuração de faixa de preço salva com sucesso!");
  };

  const discountAmount = Math.round((config.priceThreshold * config.targetDiscount) / 100);
  const targetPrice = config.priceThreshold - discountAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Configuração de Faixa de Preço
        </CardTitle>
        <CardDescription>
          Defina os parâmetros para alertas de preços personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              placeholder="Ex: São Paulo (GRU)"
              value={config.origin}
              onChange={(e) => setConfig({ ...config, origin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Input
              id="destination"
              placeholder="Ex: Lisboa (LIS)"
              value={config.destination}
              onChange={(e) => setConfig({ ...config, destination: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={config.category}
            onValueChange={(value) => setConfig({ ...config, category: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flights">Voos</SelectItem>
              <SelectItem value="hotels">Hotéis</SelectItem>
              <SelectItem value="packages">Pacotes</SelectItem>
              <SelectItem value="car-rental">Aluguel de Carros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Faixa de Preço</Label>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {config.minPrice} - {config.maxPrice}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Preço Mínimo</Label>
              <Input
                id="minPrice"
                type="number"
                value={config.minPrice}
                onChange={(e) =>
                  setConfig({ ...config, minPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Preço Máximo</Label>
              <Input
                id="maxPrice"
                type="number"
                value={config.maxPrice}
                onChange={(e) =>
                  setConfig({ ...config, maxPrice: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* Price Threshold */}
        <div className="space-y-2">
          <Label htmlFor="priceThreshold">Preço de Referência</Label>
          <Input
            id="priceThreshold"
            type="number"
            value={config.priceThreshold}
            onChange={(e) =>
              setConfig({ ...config, priceThreshold: Number(e.target.value) })
            }
          />
          <p className="text-xs text-muted-foreground">
            Preço atual ou médio para cálculo do desconto alvo
          </p>
        </div>

        {/* Target Discount */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Desconto Alvo (%)</Label>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {config.targetDiscount}%
            </Badge>
          </div>
          <Slider
            value={[config.targetDiscount]}
            onValueChange={(values) =>
              setConfig({ ...config, targetDiscount: values[0] })
            }
            min={5}
            max={70}
            step={5}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>5%</span>
            <span className="text-center">35%</span>
            <span className="text-right">70%</span>
          </div>
        </div>

        {/* Price Calculation Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Preço de Referência:
                </span>
                <span className="font-medium">
                  R$ {config.priceThreshold.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Desconto Esperado ({config.targetDiscount}%):
                </span>
                <span className="font-medium text-red-500">
                  -R$ {discountAmount.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-semibold">Preço Alvo:</span>
                <span className="text-lg font-bold text-primary">
                  R$ {targetPrice.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configuração
        </Button>
      </CardContent>
    </Card>
  );
};
