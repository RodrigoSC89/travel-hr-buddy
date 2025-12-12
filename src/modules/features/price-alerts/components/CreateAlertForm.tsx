import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { priceAlertsService, CreatePriceAlertInput, PriceAlert } from "@/services/price-alerts-service";
import { toast } from "sonner";

interface CreateAlertFormProps {
  onSuccess: () => void;
  editingAlert?: PriceAlert | null;
  onCancelEdit?: () => void;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({ 
  onSuccess, 
  editingAlert,
  onCancelEdit 
}) => {
  const [formData, setFormData] = useState<CreatePriceAlertInput>({
    product_name: editingAlert?.product_name || "",
    target_price: editingAlert?.target_price || 0,
    current_price: editingAlert?.current_price || undefined,
    product_url: editingAlert?.product_url || "",
    route: editingAlert?.route || "",
    notification_email: editingAlert?.notification_email ?? true,
    notification_push: editingAlert?.notification_push ?? true,
};
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_name || !formData.target_price || !formData.product_url) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      if (editingAlert) {
        await priceAlertsService.updateAlert(editingAlert.id, formData);
        toast.success("Alerta atualizado com sucesso!");
      } else {
        await priceAlertsService.createAlert(formData);
        toast.success("Alerta criado com sucesso!");
      }
      
      // Reset form
      setFormData({
        product_name: "",
        target_price: 0,
        current_price: undefined,
        product_url: "",
        route: "",
        notification_email: true,
        notification_push: true,
      });
      
      onSuccess();
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error("Error creating/updating alert:", error);
      toast.error(editingAlert ? "Erro ao atualizar alerta" : "Erro ao criar alerta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingAlert ? "Editar Alerta" : "Criar Novo Alerta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_name">Nome do Produto/Rota *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={handleChange})}
              placeholder="Ex: Passagem São Paulo - Rio de Janeiro"
              required
            />
          </div>

          <div>
            <Label htmlFor="product_url">URL do Produto *</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={handleChange})}
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <Label htmlFor="route">Rota (Opcional)</Label>
            <Input
              id="route"
              value={formData.route || ""}
              onChange={handleChange})}
              placeholder="Ex: GRU-SDU"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_price">Preço Alvo * ($)</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                value={formData.target_price}
                onChange={handleChange})}
                required
              />
            </div>

            <div>
              <Label htmlFor="current_price">Preço Atual ($)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price || ""}
                onChange={handleChange})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notificações</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email</span>
              <Switch
                checked={formData.notification_email}
                onCheckedChange={(checked) => setFormData({ ...formData, notification_email: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push</span>
              <Switch
                checked={formData.notification_push}
                onCheckedChange={(checked) => setFormData({ ...formData, notification_push: checked })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : editingAlert ? "Atualizar Alerta" : "Criar Alerta"}
            </Button>
            {editingAlert && onCancelEdit && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
