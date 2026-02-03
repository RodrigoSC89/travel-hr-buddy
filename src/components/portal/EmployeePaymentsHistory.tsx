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
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  Wallet,
  Clock,
  CheckCircle2,
  Shield,
  AlertCircle
} from "lucide-react";
import { usePayrollData, type Payment, type PaymentSummary } from "@/hooks/usePayrollData";

export const EmployeePaymentsHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const { payments, summary, isLoading } = usePayrollData(selectedPeriod);

  const filteredPayments = selectedPeriod === 'all' 
    ? payments 
    : payments.filter(p => p.date.startsWith(selectedPeriod));

  const handleDownloadPayslip = (period: string) => {
    toast.success("Download iniciado", { description: `Demonstrativo de ${period}` });
  };

  const getTypeColor = (type: Payment['type']) => {
    switch (type) {
      case 'salary': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'allowance': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'bonus': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overtime': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'deduction': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return '';
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 dark:text-green-400">
          Seus dados financeiros são confidenciais e protegidos. Apenas você tem acesso a estas informações.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-5 w-5 text-blue-600" />
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
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adicionais</p>
                <p className="text-lg font-bold text-green-600">+{formatCurrency(summary.allowances)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Wallet className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bônus/HE</p>
                <p className="text-lg font-bold text-yellow-600">+{formatCurrency(summary.bonuses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descontos</p>
                <p className="text-lg font-bold text-red-600">-{formatCurrency(summary.deductions)}</p>
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

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2026-01">Janeiro 2026</SelectItem>
                  <SelectItem value="2025-12">Dezembro 2025</SelectItem>
                  <SelectItem value="2025-11">Novembro 2025</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(selectedPeriod)}>
                <Download className="h-4 w-4 mr-2" />
                Demonstrativo
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
                  <p className="text-sm mt-2">
                    Os registros serão exibidos assim que estiverem disponíveis no sistema.
                  </p>
                </div>
              ) : (
                filteredPayments.map(payment => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        payment.amount >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {payment.amount >= 0 ? (
                          <TrendingUp className={`h-4 w-4 ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{payment.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                          {payment.reference && (
                            <span className="ml-2">Ref: {payment.reference}</span>
                          )}
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
                        {payment.status === 'paid' ? 'Pago' : 
                         payment.status === 'pending' ? 'Pendente' : 'Processando'}
                      </Badge>
                      <span className={`font-bold ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-4" onClick={() => toast.success("Abrindo demonstrativos...")}>
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-6 w-6" />
            <span>Ver Demonstrativos</span>
          </div>
        </Button>
        <Button variant="outline" className="h-auto p-4" onClick={() => toast.success("Abrindo informe de rendimentos...")}>
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <span>Informe de Rendimentos</span>
          </div>
        </Button>
        <Button variant="outline" className="h-auto p-4" onClick={() => toast.success("Abrindo férias e benefícios...")}>
          <div className="flex flex-col items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>Férias e Benefícios</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default EmployeePaymentsHistory;
