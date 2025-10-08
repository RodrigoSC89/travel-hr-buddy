import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, TrendingUp, Users, DollarSign, AlertCircle, Download, Filter, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const AdvancedReportsSystem = () => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState('financial');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Dados simulados para relatórios
  const financialData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Fev', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Abr', revenue: 61000, expenses: 40000, profit: 21000 },
    { month: 'Mai', revenue: 55000, expenses: 38000, profit: 17000 },
    { month: 'Jun', revenue: 67000, expenses: 42000, profit: 25000 }
  ];

  const performanceData = [
    { category: 'Vendas', target: 100, actual: 85, variance: -15 },
    { category: 'Marketing', target: 100, actual: 92, variance: -8 },
    { category: 'Operações', target: 100, actual: 110, variance: 10 },
    { category: 'Suporte', target: 100, actual: 88, variance: -12 }
  ];

  const departmentData = [
    { name: 'TI', budget: 150000, spent: 135000, employees: 25 },
    { name: 'Vendas', budget: 200000, spent: 185000, employees: 35 },
    { name: 'Marketing', budget: 120000, spent: 110000, employees: 15 },
    { name: 'RH', budget: 80000, spent: 75000, employees: 10 },
    { name: 'Operações', budget: 180000, spent: 170000, employees: 40 }
  ];

  const reportTypes = [
    { id: 'financial', name: 'Relatório Financeiro', icon: DollarSign, description: 'Receitas, despesas e análise de lucratividade' },
    { id: 'performance', name: 'Performance Organizacional', icon: TrendingUp, description: 'KPIs e métricas de desempenho por departamento' },
    { id: 'hr', name: 'Recursos Humanos', icon: Users, description: 'Análise de pessoal, produtividade e custos' },
    { id: 'operational', name: 'Operacional', icon: FileText, description: 'Processos, eficiência e qualidade operacional' }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Relatório Gerado",
        description: "O relatório foi gerado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao Gerar Relatório",
        description: "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: string) => {
    setIsExporting(true);
    try {
      // Simulate export process with data preparation
      const reportData = {
        type: selectedReport,
        period: selectedPeriod,
        timestamp: new Date().toISOString(),
        data: selectedReport === 'financial' ? financialData : 
              selectedReport === 'performance' ? performanceData : 
              departmentData
      };

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Exportação Concluída",
        description: `Relatório exportado em formato ${format.toUpperCase()} com sucesso!`,
      });

      // In a real implementation, this would trigger a file download
      console.log('Export data:', reportData);
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao exportar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Relatórios Avançados</h1>
          <p className="text-muted-foreground">Análises detalhadas e insights estratégicos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => generateReport()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => generateReport()}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Exportar Relatório</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportReport('pdf')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportReport('excel')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportReport('csv')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Tabs value={selectedReport} onValueChange={setSelectedReport}>
            <TabsList className="grid w-full grid-cols-4">
              {reportTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  {type.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                        <p className="text-2xl font-bold text-green-600">R$ 328.000</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+12% vs mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Despesas</p>
                        <p className="text-2xl font-bold text-red-600">R$ 220.000</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+5% vs mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                        <p className="text-2xl font-bold text-blue-600">R$ 108.000</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+18% vs mês anterior</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução Financeira</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                      <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Departamento</CardTitle>
                  <CardDescription>Comparação entre metas e resultados alcançados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="target" fill="#e5e7eb" name="Meta" />
                      <Bar dataKey="actual" fill="#3b82f6" name="Realizado" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceData.map((dept, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{dept.category}</h4>
                        <Badge variant={dept.variance >= 0 ? 'default' : 'destructive'}>
                          {dept.variance >= 0 ? '+' : ''}{dept.variance}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Meta:</span>
                          <span>{dept.target}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Realizado:</span>
                          <span>{dept.actual}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hr" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise por Departamento</CardTitle>
                  <CardDescription>Orçamento vs gastos e headcount</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Departamento</th>
                          <th className="text-right p-2">Orçamento</th>
                          <th className="text-right p-2">Gasto</th>
                          <th className="text-right p-2">Funcionários</th>
                          <th className="text-right p-2">Custo/Funcionário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentData.map((dept, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{dept.name}</td>
                            <td className="p-2 text-right">R$ {dept.budget.toLocaleString()}</td>
                            <td className="p-2 text-right">R$ {dept.spent.toLocaleString()}</td>
                            <td className="p-2 text-right">{dept.employees}</td>
                            <td className="p-2 text-right">R$ {Math.round(dept.spent / dept.employees).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operational" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Eficiência Operacional</p>
                      <p className="text-3xl font-bold text-green-600">94%</p>
                      <Badge variant="default" className="mt-2">+3% vs anterior</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tempo Médio Processo</p>
                      <p className="text-3xl font-bold text-blue-600">2.3h</p>
                      <Badge variant="secondary" className="mt-2">-0.2h vs anterior</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                      <p className="text-3xl font-bold text-red-600">1.2%</p>
                      <Badge variant="destructive" className="mt-2">+0.1% vs anterior</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Satisfação Cliente</p>
                      <p className="text-3xl font-bold text-purple-600">4.8</p>
                      <Badge variant="default" className="mt-2">+0.1 vs anterior</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">Gerando relatório...</p>
                <p className="text-sm text-muted-foreground">Isso pode levar alguns momentos</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedReportsSystem;