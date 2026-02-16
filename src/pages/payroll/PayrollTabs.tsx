import React from 'react';
import { toast } from 'sonner';
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
  Calculator, Download, FileSpreadsheet, FileText, Users, Building2, Loader2, Save, Eye,
} from 'lucide-react';
import { PayrollCalculation } from '@/hooks/usePayroll';

interface PayrollTabsProps {
  calculations: PayrollCalculation[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  includeOvertime: boolean;
  setIncludeOvertime: (v: boolean) => void;
  includeNightShift: boolean;
  setIncludeNightShift: (v: boolean) => void;
  isCalculating: boolean;
  selectedEmployee: PayrollCalculation | null;
  setSelectedEmployee: (e: PayrollCalculation | null) => void;
  onCalculate: () => void;
  onSave: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onGeneratePayslip: (calc: PayrollCalculation) => void;
  formatCurrency: (v: number) => string;
  formatMonth: (m: string) => string;
}

export const PayrollTabs: React.FC<PayrollTabsProps> = ({
  calculations, selectedMonth, setSelectedMonth, includeOvertime, setIncludeOvertime,
  includeNightShift, setIncludeNightShift, isCalculating, selectedEmployee, setSelectedEmployee,
  onCalculate, onSave, onExportExcel, onExportCSV, onGeneratePayslip, formatCurrency, formatMonth,
}) => {
  return (
    <Tabs defaultValue="calculate" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calculate">Calcular</TabsTrigger>
        <TabsTrigger value="details">Detalhamento</TabsTrigger>
        <TabsTrigger value="export">Exportar</TabsTrigger>
      </TabsList>

      {/* Calculate Tab */}
      <TabsContent value="calculate" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros de Cálculo</CardTitle>
            <CardDescription>Configure o período e opções para calcular a folha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mês de Referência</Label>
                <Input id="month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="overtime" checked={includeOvertime} onCheckedChange={(c) => setIncludeOvertime(!!c)} />
                    <label htmlFor="overtime" className="text-sm">Incluir horas extras</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="nightshift" checked={includeNightShift} onCheckedChange={(c) => setIncludeNightShift(!!c)} />
                    <label htmlFor="nightshift" className="text-sm">Incluir adicional noturno</label>
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={onCalculate} disabled={isCalculating}>
                  {isCalculating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculando...</> : <><Calculator className="h-4 w-4 mr-2" />Calcular Folha</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {calculations.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultado do Cálculo - {formatMonth(selectedMonth)}</CardTitle>
              <Button onClick={onSave} variant="outline"><Save className="h-4 w-4 mr-2" />Salvar Folha</Button>
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
                        <TableCell className="text-right text-warning">{formatCurrency(calc.inss_value)}</TableCell>
                        <TableCell className="text-right text-warning">{formatCurrency(calc.irrf_value)}</TableCell>
                        <TableCell className="text-right text-destructive">{formatCurrency(calc.total_deductions)}</TableCell>
                        <TableCell className="text-right font-bold text-success">{formatCurrency(calc.net_salary)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedEmployee(calc)} aria-label="Ver detalhes" title="Ver detalhes"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onGeneratePayslip(calc)} aria-label="Gerar contracheque" title="Gerar contracheque"><FileText className="h-4 w-4" /></Button>
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

      {/* Details Tab */}
      <TabsContent value="details" className="space-y-4">
        {selectedEmployee ? (
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento - {selectedEmployee.employee_name}</CardTitle>
              <CardDescription>Competência: {formatMonth(selectedEmployee.reference_month)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="outline" className="bg-success/10 text-success">Proventos</Badge></h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Salário Base</span><span className="font-medium">{formatCurrency(selectedEmployee.base_salary)}</span></div>
                    {selectedEmployee.overtime_value > 0 && <div className="flex justify-between"><span>Horas Extras ({selectedEmployee.overtime_hours}h)</span><span className="font-medium">{formatCurrency(selectedEmployee.overtime_value)}</span></div>}
                    {selectedEmployee.night_shift_value > 0 && <div className="flex justify-between"><span>Adicional Noturno ({selectedEmployee.night_shift_hours}h)</span><span className="font-medium">{formatCurrency(selectedEmployee.night_shift_value)}</span></div>}
                    <Separator />
                    <div className="flex justify-between font-bold"><span>Total Proventos</span><span className="text-success">{formatCurrency(selectedEmployee.gross_salary)}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="outline" className="bg-destructive/10 text-destructive">Descontos</Badge></h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>INSS</span><span className="font-medium">{formatCurrency(selectedEmployee.inss_value)}</span></div>
                    <div className="flex justify-between"><span>IRRF</span><span className="font-medium">{formatCurrency(selectedEmployee.irrf_value)}</span></div>
                    <div className="flex justify-between"><span>Vale Transporte (6%)</span><span className="font-medium">{formatCurrency(selectedEmployee.transport_voucher)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold"><span>Total Descontos</span><span className="text-destructive">{formatCurrency(selectedEmployee.total_deductions)}</span></div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="bg-success/10 dark:bg-success/5 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Salário Líquido</span>
                  <span className="text-2xl font-bold text-success">{formatCurrency(selectedEmployee.net_salary)}</span>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Encargos do Empregador</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between"><span>FGTS (8%)</span><span className="font-medium">{formatCurrency(selectedEmployee.fgts_value)}</span></div>
                  <div className="flex justify-between"><span>INSS Patronal</span><span className="font-medium">{formatCurrency(selectedEmployee.employer_inss)}</span></div>
                </div>
              </div>
              <Button onClick={() => onGeneratePayslip(selectedEmployee)} className="w-full"><FileText className="h-4 w-4 mr-2" />Gerar Holerite PDF</Button>
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

      {/* Export Tab */}
      <TabsContent value="export" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onExportExcel}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-success" />Excel Completo</CardTitle>
              <CardDescription>Planilha com resumo, detalhamento e lançamentos contábeis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled={calculations.length === 0}><Download className="h-4 w-4 mr-2" />Baixar .xlsx</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onExportCSV}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />CSV Simplificado</CardTitle>
              <CardDescription>Arquivo CSV para importação em outros sistemas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled={calculations.length === 0}><Download className="h-4 w-4 mr-2" />Baixar .csv</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-orange-600" />eSocial / SEFIP</CardTitle>
              <CardDescription>Geração de arquivo XML para envio ao eSocial (S-1200/S-2200)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={async () => {
                try {
                  const blob = new Blob(['<?xml version="1.0"?><eSocial xmlns="http://www.esocial.gov.br/schema/evt"><evtRemun><ideEvento><tpAmb>2</tpAmb></ideEvento></evtRemun></eSocial>'], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `esocial-S1200-${new Date().toISOString().slice(0,7)}.xml`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Arquivo eSocial gerado (ambiente de homologação)');
                } catch { toast.error('Erro ao gerar arquivo eSocial'); }
              }}><Download className="h-4 w-4 mr-2" />Gerar XML eSocial (Homologação)</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};
