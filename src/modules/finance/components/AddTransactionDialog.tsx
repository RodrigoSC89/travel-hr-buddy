/**
 * Add Transaction Dialog - Dialog para adicionar novas transações
 */

import { memo, memo, useState, useCallback, useMemo } from "react";;;
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, TrendingUp, TrendingDown } from "lucide-react";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = [
  { value: "operacoes", label: "Operações" },
  { value: "combustivel", label: "Combustível" },
  { value: "manutencao", label: "Manutenção" },
  { value: "pessoal", label: "Pessoal" },
  { value: "administrativo", label: "Administrativo" },
  { value: "impostos", label: "Impostos" },
  { value: "seguros", label: "Seguros" },
  { value: "outros", label: "Outros" },
];

export const AddTransactionDialog = memo(function({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      const finalAmount = formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount);

      const { error } = await supabase
        .from("financial_transactions")
        .insert({
          amount: finalAmount,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          transaction_date: formData.transaction_date,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Transação registrada",
        description: `${formData.type === "income" ? "Receita" : "Despesa"} de R$ ${Math.abs(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} registrada com sucesso.`,
      });

      setFormData({
        type: "expense",
        amount: "",
        description: "",
        category: "",
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: "Falha ao registrar transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa no sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.type === "income" ? "default" : "outline"}
              className={`flex-1 ${formData.type === "income" ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={handleSetFormData}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita
            </Button>
            <Button
              type="button"
              variant={formData.type === "expense" ? "default" : "outline"}
              className={`flex-1 ${formData.type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={handleSetFormData}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Despesa
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={handleChange})}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Pagamento de frete internacional"
              value={formData.description}
              onChange={handleChange})}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={handleChange})}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={formData.notes}
              onChange={handleChange})}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
