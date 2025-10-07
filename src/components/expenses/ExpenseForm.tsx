import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseFormData } from '@/hooks/useExpenses';

const expenseSchema = z.object({
  amount: z.number().positive('O valor deve ser positivo'),
  category: z.string().min(1, 'Selecione uma categoria'),
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres').max(200),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().max(500).optional(),
});

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<ExpenseFormData>;
  isLoading?: boolean;
}

const categoryLabels: Record<string, string> = {
  travel: 'Viagem',
  accommodation: 'Hospedagem',
  meals: 'Alimentação',
  transport: 'Transporte',
  equipment: 'Equipamentos',
  other: 'Outros',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const category = watch('category');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
          Valor *
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            R$
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            className="pl-10 bg-card border-border text-foreground"
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-danger">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-semibold text-foreground">
          Categoria *
        </Label>
        <Select
          value={category}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger className="bg-card border-border text-foreground">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-popover-foreground hover:bg-muted">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-danger">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-foreground">
          Descrição *
        </Label>
        <Input
          id="description"
          placeholder="Ex: Jantar com cliente"
          className="bg-card border-border text-foreground"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-danger">{errors.description.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-semibold text-foreground">
          Data *
        </Label>
        <Input
          id="date"
          type="date"
          className="bg-card border-border text-foreground"
          {...register('date')}
        />
        {errors.date && (
          <p className="text-sm text-danger">{errors.date.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
          Observações
        </Label>
        <Textarea
          id="notes"
          placeholder="Informações adicionais (opcional)"
          rows={3}
          className="bg-card border-border text-foreground resize-none"
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-sm text-danger">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold transition-colors"
        >
          {isLoading ? 'Salvando...' : 'Salvar Despesa'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border-border text-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
