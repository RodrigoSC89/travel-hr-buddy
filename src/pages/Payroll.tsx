/**
 * Página de Folha de Pagamento
 * Cálculo, visualização e exportação
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  DollarSign,
  TrendingUp,
  Building2,
  Loader2,
  RefreshCw,
  Save,
  Eye,
} from 'lucide-react';
import { usePayroll, PayrollCalculation } from '@/hooks/usePayroll';
import { generatePayslipPDF, PayslipData } from '@/lib/pdf/generatePayslipPDF';
import { exportPayrollToExcel, exportPayrollToCSV } from '@/lib/export/accountingExport';

export default function Payroll() {
  const { 
    calculations, 
    summary, 
    isLoading, 
    isCalculating,
    loadEmployees,
    calculatePayroll,
    savePayroll,
  } = usePayroll();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [includeOvertime, setIncludeOvertime] = useState(true);
  const [includeNightShift, setIncludeNightShift] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollCalculation | null>(null);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(monthNum) - 1]}/${year}`;
  };

  const handleCalculate = async () => {
    await calculatePayroll(selectedMonth, {
      includeOvertime,
      includeNightShift,
    });
  };

  const handleSave = async () => {
    await savePayroll(selectedMonth);
  };

  const handleExportExcel = () => {
    if (calculations.length > 0 && summary) {
      exportPayrollToExcel(calculations, summary, selectedMonth);
    }
  };

  const handleExportCSV = () => {
    if (calculations.length > 0) {
      exportPayrollToCSV(calculations, selectedMonth);
    }
  };

  const handleGeneratePayslip = (calc: PayrollCalculation) => {
    const payslipData: PayslipData = {
      companyName: 'Nautilus Shipping Company',
      companyCNPJ: '00.000.000/0001-00',
      companyAddress: 'Av. Brasil, 1000 - Rio de Janeiro, RJ',
      employeeName: calc.employee_name,
      employeeCPF: '',
      employeePosition: '',
      employeeDepartment: '',
      admissionDate: '',
      referenceMonth: calc.reference_month,
      paymentDate: new Date().toLocaleDateString('pt-BR'),
      baseSalary: calc.base_salary,
      overtimeHours: calc.overtime_hours,
      overtimeValue: calc.overtime_value,
      nightShiftHours: calc.night_shift_hours,
      nightShiftValue: calc.night_shift_value,
      hazardPay: calc.hazard_pay,
      unhealthyPay: calc.unhealthy_pay,
      bonus: calc.bonus,
      commissions: calc.commissions,
      otherEarnings: calc.other_earnings,
      grossSalary: calc.gross_salary,
      inssValue: calc.inss_value,
      irrfValue: calc.irrf_value,
      transportVoucher: calc.transport_voucher,
      mealVoucher: calc.meal_voucher,
      otherDeductions: calc.other_deductions,
      totalDeductions: calc.total_deductions,
      netSalary: calc.net_salary,
      fgtsValue: calc.fgts_value,
      fgtsBase: calc.gross_salary,
    };
    generatePayslipPDF(payslipData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
          <p className="text-muted-foreground">
            Cálculo de salários, descontos e encargos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadEmployees()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Resumo Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.employeeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Bruto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalNet)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                INSS + IRRF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalINSS + summary.totalIRRF)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                FGTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalFGTS)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="calculate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculate">Calcular</TabsTrigger>
          <TabsTrigger value="details">Detalhamento</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        {/* Aba Calcular */}
        <TabsContent value="calculate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros de Cálculo</CardTitle>
              <CardDescription>
                Configure o período e opções para calcular a folha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Mês de Referência</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opções</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overtime"
                        checked={includeOvertime}
                        onCheckedChange={(c) => setIncludeOvertime(!!c)}
                      />
                      <label htmlFor="overtime" className="text-sm">
                        Incluir horas extras
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nightshift"
                        checked={includeNightShift}
                        onCheckedChange={(c) => setIncludeNightShift(!!c)}
                      />
                      <label htmlFor="nightshift" className="text-sm">
                        Incluir adicional noturno
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleCalculate}
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Folha
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de resultados */}
          {calculations.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resultado do Cálculo - {formatMonth(selectedMonth)}</CardTitle>
                <Button onClick={handleSave} variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Folha
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead className="text-right">Salário Base</TableHead>
                        <TableHead className="text-right">Bruto</TableHead>
                        <TableHead className="text-right">INSS</TableHead>
                        <TableHead className="text-right">IRRF</TableHead>
                        <TableHead className="text-right">Descontos</TableHead>
                        <TableHead className="text-right">Líquido</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculations.map((calc) => (
                        <TableRow key={calc.employee_id}>
                          <TableCell className="font-medium">{calc.employee_name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(calc.base_salary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(calc.gross_salary)}</TableCell>
                          <TableCell className="text-right text-orange-600">{formatCurrency(calc.inss_value)}</TableCell>
                          <TableCell className="text-right text-orange-600">{formatCurrency(calc.irrf_value)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(calc.total_deductions)}</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {formatCurrency(calc.net_salary)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedEmployee(calc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleGeneratePayslip(calc)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Detalhamento */}
        <TabsContent value="details" className="space-y-4">
          {selectedEmployee ? (
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento - {selectedEmployee.employee_name}</CardTitle>
                <CardDescription>Competência: {formatMonth(selectedEmployee.reference_month)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Proventos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Proventos</Badge>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Salário Base</span>
                        <span className="font-medium">{formatCurrency(selectedEmployee.base_salary)}</span>
                      </div>
                      {selectedEmployee.overtime_value > 0 && (
                        <div className="flex justify-between">
                          <span>Horas Extras ({selectedEmployee.overtime_hours}h)</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.overtime_value)}</span>
                        </div>
                      )}
                      {selectedEmployee.night_shift_value > 0 && (
                        <div className="flex justify-between">
                          <span>Adicional Noturno ({selectedEmployee.night_shift_hours}h)</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.night_shift_value)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total Proventos</span>
                        <span className="text-green-600">{formatCurrency(selectedEmployee.gross_salary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descontos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700">Descontos</Badge>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>INSS</span>
                        <span className="font-medium">{formatCurrency(selectedEmployee.inss_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IRRF</span>
                        <span className="font-medium">{formatCurrency(selectedEmployee.irrf_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vale Transporte (6%)</span>
                        <span className="font-medium">{formatCurrency(selectedEmployee.transport_voucher)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total Descontos</span>
                        <span className="text-red-600">{formatCurrency(selectedEmployee.total_deductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Salário Líquido */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Salário Líquido</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedEmployee.net_salary)}
                    </span>
                  </div>
                </div>

                {/* Encargos */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Encargos do Empregador</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span>FGTS (8%)</span>
                      <span className="font-medium">{formatCurrency(selectedEmployee.fgts_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INSS Patronal</span>
                      <span className="font-medium">{formatCurrency(selectedEmployee.employer_inss)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleGeneratePayslip(selectedEmployee)} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Holerite PDF
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um funcionário na tabela de cálculo para ver o detalhamento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Exportar */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleExportExcel}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Excel Completo
                </CardTitle>
                <CardDescription>
                  Planilha com resumo, detalhamento e lançamentos contábeis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled={calculations.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar .xlsx
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleExportCSV}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  CSV Simplificado
                </CardTitle>
                <CardDescription>
                  Arquivo CSV para importação em outros sistemas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled={calculations.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar .csv
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  eSocial / SEFIP
                </CardTitle>
                <CardDescription>
                  Arquivo para envio ao eSocial (em desenvolvimento)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Em breve
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
