/**
 * HR Payroll Dashboard Component
 * Gestão de folha de pagamento com validação IA
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, Calculator, AlertTriangle, CheckCircle2,
  FileText, Download, Send, Brain, TrendingUp, Users
} from 'lucide-react';

export function HRPayrollDashboard() {
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState('2026');

  const payrollSummary = {
    totalEmployees: 338,
    totalGross: 2450000,
    totalNet: 1820000,
    totalDeductions: 630000,
    employerCost: 3100000,
    status: 'calculated',
    anomalies: 3,
    processed: 335,
    pending: 3,
  };

  const anomalies = [
    { employee: 'João Santos', issue: 'Comissão +340% vs média', severity: 'high' },
    { employee: 'Maria Silva', issue: 'Banco de horas negativo (-80h)', severity: 'medium' },
    { employee: 'Carlos Costa', issue: 'Desconto VT > 6%', severity: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(2026, parseInt(m) - 1).toLocaleString('pt-BR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" />
            Calcular Folha
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Processar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{payrollSummary.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(payrollSummary.totalNet / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Salários Líquidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(payrollSummary.totalDeductions / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Descontos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calculator className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(payrollSummary.employerCost / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Custo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Status do Processamento - {month}/{year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Progresso</span>
              <span className="text-sm font-medium">
                {payrollSummary.processed}/{payrollSummary.totalEmployees} ({Math.round((payrollSummary.processed / payrollSummary.totalEmployees) * 100)}%)
              </span>
            </div>
            <Progress value={(payrollSummary.processed / payrollSummary.totalEmployees) * 100} />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-500">{payrollSummary.processed}</p>
                <p className="text-xs text-muted-foreground">Calculados</p>
              </div>
              <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-500">{payrollSummary.anomalies}</p>
                <p className="text-xs text-muted-foreground">Com Anomalias</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold">{payrollSummary.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Anomalies */}
      {anomalies.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Anomalias Detectadas pela IA
            </CardTitle>
            <CardDescription>Validação automática identificou inconsistências</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {anomalies.map((anomaly, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div>
                  <p className="font-medium">{anomaly.employee}</p>
                  <p className="text-sm text-muted-foreground">{anomaly.issue}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    anomaly.severity === 'high' ? 'destructive' : 
                    anomaly.severity === 'medium' ? 'default' : 'secondary'
                  }>
                    {anomaly.severity === 'high' ? 'Alto' : anomaly.severity === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                  <Button size="sm" variant="outline">Verificar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Gerar Holerites
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar SEFIP
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar eSocial
        </Button>
      </div>
    </div>
  );
}
