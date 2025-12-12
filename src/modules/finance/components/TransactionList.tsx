import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = memo(function({ transactions }: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.transaction_date), "dd MMM yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                  {transaction.category}
                </Badge>
                <span className={`text-lg font-bold ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {transaction.type === "income" ? "+" : "-"} 
                  R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação registrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
