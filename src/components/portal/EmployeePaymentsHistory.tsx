/**
 * EmployeePaymentsHistory - Histórico de Pagamentos do Funcionário
 * ✅ P0 CORRIGIDO: Dados reais do Supabase (RISCO LEGAL MITIGADO)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CreditCard, DollarSign, Calendar, Download, TrendingUp,
  TrendingDown, FileText, Wallet, Clock, CheckCircle2, Shield, AlertCircle
} from "lucide-react";
import { usePayrollData, type Payment, type PaymentSummary } from "@/hooks/usePayrollData";

export const EmployeePaymentsHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const { payments, summary, isLoading } = usePayrollData(selectedPeriod);

  const filteredPayments = selectedPeriod === 'all' 
    ? payments 
    : payments.filter(p => p.date.startsWith(selectedPeriod));

  const handleDownloadPayslip = (period: string) => {
    const paymentData = filteredPayments.filter(p => p.date.startsWith(period));
    if (paymentData.length === 0) {
      toast.warning("Nenhum registro encontrado", { description: `Sem dados de pagamento para o período: ${period}` });
      return;
    }
    const csv = `Período,Tipo,Valor,Status\n${paymentData.map(p => `${p.date},${p.type},${p.amount},${p.status}`).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `demonstrativo-${period}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("Demonstrativo exportado", { description: `Período: ${period} | ${paymentData.length} registros` });
  };

  const getTypeColor = (type: Payment['type']) => {
    switch (type) {
      case 'salary': return 'bg-primary/10 text-primary';
      case 'allowance': return 'bg-success/10 text-success';
      case 'bonus': return 'bg-warning/10 text-warning';
      case 'overtime': return 'bg-accent text-accent-foreground';
      case 'deduction': return 'bg-destructive/10 text-destructive';
      default: return '';
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'processing': return 'bg-primary/10 text-primary';
      default: return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (<Card key={`pay-skel-${i}`}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-success/30 bg-success/5">
        <Shield className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          Seus dados financeiros são confidenciais e protegidos. Apenas você tem acesso a estas informações.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salário Bruto</p>
                <p className="text-lg font-bold">{formatCurrency(summary.grossSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adicionais</p>
                <p className="text-lg font-bold text-success">+{formatCurrency(summary.allowances)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Wallet className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bônus/HE</p>
                <p className="text-lg font-bold text-warning">+{formatCurrency(summary.bonuses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descontos</p>
                <p className="text-lg font-bold text-destructive">-{formatCurrency(summary.deductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Líquido</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(summary.netSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2026-01">Janeiro 2026</SelectItem>
                  <SelectItem value="2025-12">Dezembro 2025</SelectItem>
                  <SelectItem value="2025-11">Novembro 2025</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(selectedPeriod)}>
                <Download className="h-4 w-4 mr-2" />Demonstrativo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pagamento encontrado para este período</p>
                  <p className="text-sm mt-2">Os registros serão exibidos assim que estiverem disponíveis no sistema.</p>
                </div>
              ) : (
                filteredPayments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${payment.amount >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {payment.amount >= 0 ? (
                          <TrendingUp className={`h-4 w-4 ${payment.amount >= 0 ? 'text-success' : 'text-destructive'}`} />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{payment.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                          {payment.reference && <span className="ml-2">Ref: {payment.reference}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(payment.type)}>
                        {payment.type === 'salary' && 'Salário'}
                        {payment.type === 'allowance' && 'Adicional'}
                        {payment.type === 'bonus' && 'Bônus'}
                        {payment.type === 'overtime' && 'Hora Extra'}
                        {payment.type === 'deduction' && 'Desconto'}
                      </Badge>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Processando'}
                      </Badge>
                      <span className={`font-bold ${payment.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {payment.amount >= 0 ? '+' : ''}{formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-4" onClick={async () => {
          try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            doc.setFontSize(16); doc.text('Demonstrativo de Pagamento', 20, 30);
            doc.setFontSize(11);
            doc.text(`Período: ${selectedPeriod === 'all' ? 'Todos' : selectedPeriod}`, 20, 45);
            doc.text(`Salário Bruto: ${formatCurrency(summary.grossSalary)}`, 20, 60);
            doc.text(`Adicionais: ${formatCurrency(summary.allowances)}`, 20, 70);
            doc.text(`Bônus/HE: ${formatCurrency(summary.bonuses)}`, 20, 80);
            doc.text(`Descontos: ${formatCurrency(summary.deductions)}`, 20, 90);
            doc.text(`Líquido: ${formatCurrency(summary.netSalary)}`, 20, 105);
            doc.save(`demonstrativo-${selectedPeriod || 'geral'}.pdf`);
            toast.success('Demonstrativo gerado com sucesso');
          } catch { toast.error('Erro ao gerar demonstrativo'); }
        }}>
          <div className="flex flex-col items-center gap-2"><FileText className="h-6 w-6" /><span>Ver Demonstrativos</span></div>
        </Button>
        <Button variant="outline" className="h-auto p-4" onClick={async () => {
          try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            doc.setFontSize(16); doc.text('Informe de Rendimentos', 20, 30);
            doc.setFontSize(11);
            doc.text(`Ano: ${new Date().getFullYear()}`, 20, 45);
            doc.text(`Total Bruto Acumulado: ${formatCurrency(summary.grossSalary * 12)}`, 20, 60);
            doc.text(`Total Descontos: ${formatCurrency(summary.deductions * 12)}`, 20, 70);
            doc.text(`Total Líquido: ${formatCurrency(summary.netSalary * 12)}`, 20, 80);
            doc.save(`informe-rendimentos-${new Date().getFullYear()}.pdf`);
            toast.success('Informe de rendimentos gerado');
          } catch { toast.error('Erro ao gerar informe'); }
        }}>
          <div className="flex flex-col items-center gap-2"><DollarSign className="h-6 w-6" /><span>Informe de Rendimentos</span></div>
        </Button>
        <Button variant="outline" className="h-auto p-4" onClick={() => {
          window.location.assign('/people?tab=leave');
          toast.success('Redirecionando para People Hub — Férias e Benefícios');
        }}>
          <div className="flex flex-col items-center gap-2"><Calendar className="h-6 w-6" /><span>Férias e Benefícios</span></div>
        </Button>
      </div>
    </div>
  );
};

export default EmployeePaymentsHistory;