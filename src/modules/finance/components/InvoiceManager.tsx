import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";

export function InvoiceManager() {
  const invoices = [
    { id: '1', number: 'INV-2024-001', date: '2024-01-15', amount: 45000, status: 'paid' },
    { id: '2', number: 'INV-2024-002', date: '2024-01-20', amount: 32000, status: 'pending' },
    { id: '3', number: 'INV-2024-003', date: '2024-01-25', amount: 28000, status: 'overdue' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paga';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencida';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciamento de Faturas</CardTitle>
        <Button size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Nova Fatura
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div 
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invoice.number}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
                <span className="text-lg font-bold">
                  R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
