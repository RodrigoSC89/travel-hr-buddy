/**
 * Payroll Page - Optimized with Framer Motion + React.memo
 */
import { useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Building2, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { usePayroll, PayrollCalculation } from '@/hooks/usePayroll';
import { generatePayslipPDF, PayslipData } from '@/lib/pdf/generatePayslipPDF';
import { exportPayrollToExcel, exportPayrollToCSV } from '@/lib/export/accountingExport';
import { PayrollTabs } from './payroll/PayrollTabs';
import { staggerContainer, kpiCard } from '@/lib/animations/motion-variants';

const KPICard = memo(({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => (
  <motion.div variants={kpiCard}>
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />{label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  </motion.div>
));
KPICard.displayName = 'KPICard';

export default function Payroll() {
  const { calculations, summary, isLoading, isCalculating, loadEmployees, calculatePayroll, savePayroll } = usePayroll();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [includeOvertime, setIncludeOvertime] = useState(true);
  const [includeNightShift, setIncludeNightShift] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollCalculation | null>(null);

  const formatCurrency = useCallback((value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), []);
  const formatMonth = useCallback((month: string) => {
    const [year, monthNum] = month.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(monthNum) - 1]}/${year}`;
  }, []);

  const handleCalculate = useCallback(async () => { await calculatePayroll(selectedMonth, { includeOvertime, includeNightShift }); }, [calculatePayroll, selectedMonth, includeOvertime, includeNightShift]);
  const handleSave = useCallback(async () => { await savePayroll(selectedMonth); }, [savePayroll, selectedMonth]);
  const handleExportExcel = useCallback(() => { if (calculations.length > 0 && summary) exportPayrollToExcel(calculations, summary, selectedMonth); }, [calculations, summary, selectedMonth]);
  const handleExportCSV = useCallback(() => { if (calculations.length > 0) exportPayrollToCSV(calculations, selectedMonth); }, [calculations, selectedMonth]);

  const handleGeneratePayslip = useCallback((calc: PayrollCalculation) => {
    const payslipData: PayslipData = {
      companyName: 'Nautilus Shipping Company', companyCNPJ: '00.000.000/0001-00', companyAddress: 'Av. Brasil, 1000 - Rio de Janeiro, RJ',
      employeeName: calc.employee_name, employeeCPF: '', employeePosition: '', employeeDepartment: '', admissionDate: '',
      referenceMonth: calc.reference_month, paymentDate: new Date().toLocaleDateString('pt-BR'),
      baseSalary: calc.base_salary, overtimeHours: calc.overtime_hours, overtimeValue: calc.overtime_value,
      nightShiftHours: calc.night_shift_hours, nightShiftValue: calc.night_shift_value,
      hazardPay: calc.hazard_pay, unhealthyPay: calc.unhealthy_pay, bonus: calc.bonus,
      commissions: calc.commissions, otherEarnings: calc.other_earnings, grossSalary: calc.gross_salary,
      inssValue: calc.inss_value, irrfValue: calc.irrf_value, transportVoucher: calc.transport_voucher,
      mealVoucher: calc.meal_voucher, otherDeductions: calc.other_deductions, totalDeductions: calc.total_deductions,
      netSalary: calc.net_salary, fgtsValue: calc.fgts_value, fgtsBase: calc.gross_salary,
    };
    generatePayslipPDF(payslipData);
  }, []);

  const kpis = useMemo(() => {
    if (!summary) return [];
    return [
      { icon: Users, label: 'Funcionários', value: summary.employeeCount, color: '' },
      { icon: DollarSign, label: 'Total Bruto', value: formatCurrency(summary.totalGross), color: '' },
      { icon: TrendingUp, label: 'Total Líquido', value: formatCurrency(summary.totalNet), color: 'text-success' },
      { icon: Building2, label: 'INSS + IRRF', value: formatCurrency(summary.totalINSS + summary.totalIRRF), color: 'text-warning' },
      { icon: FileSpreadsheet, label: 'FGTS', value: formatCurrency(summary.totalFGTS), color: 'text-primary' },
    ];
  }, [summary, formatCurrency]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container mx-auto py-6 space-y-6">
      <motion.div variants={kpiCard} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
          <p className="text-muted-foreground">Cálculo de salários, descontos e encargos</p>
        </div>
        <Button variant="outline" onClick={() => loadEmployees()}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
      </motion.div>

      {summary && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((item) => (
            <KPICard key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} />
          ))}
        </motion.div>
      )}

      <motion.div variants={kpiCard}>
        <PayrollTabs
          calculations={calculations}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          includeOvertime={includeOvertime}
          setIncludeOvertime={setIncludeOvertime}
          includeNightShift={includeNightShift}
          setIncludeNightShift={setIncludeNightShift}
          isCalculating={isCalculating}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          onCalculate={handleCalculate}
          onSave={handleSave}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          onGeneratePayslip={handleGeneratePayslip}
          formatCurrency={formatCurrency}
          formatMonth={formatMonth}
        />
      </motion.div>
    </motion.div>
  );
}
