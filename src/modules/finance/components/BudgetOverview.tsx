import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetOverviewProps {
  period: 'month' | 'quarter' | 'year';
}

export function BudgetOverview({ period }: BudgetOverviewProps) {
  const budgets = [
    { category: 'Combustível', allocated: 50000, spent: 32000, color: 'bg-blue-500' },
    { category: 'Manutenção', allocated: 30000, spent: 28000, color: 'bg-orange-500' },
    { category: 'Salários', allocated: 120000, spent: 120000, color: 'bg-green-500' },
    { category: 'Operações', allocated: 40000, spent: 25000, color: 'bg-purple-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{budget.category}</h4>
                <span className="text-sm text-muted-foreground">
                  R$ {budget.spent.toLocaleString('pt-BR')} / R$ {budget.allocated.toLocaleString('pt-BR')}
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
              <p className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                {percentage.toFixed(1)}% utilizado
                {isOverBudget && ' - Acima do orçamento!'}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
