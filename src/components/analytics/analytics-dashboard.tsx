import React from 'react';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plane,
  Building,
  Users,
  CalendarDays,
  MapPin,
  Target
} from 'lucide-react';

const monthlyData = [
  { month: 'Jan', viagens: 45, economia: 12000, gastos: 85000 },
  { month: 'Fev', viagens: 52, economia: 15000, gastos: 78000 },
  { month: 'Mar', viagens: 48, economia: 18000, gastos: 82000 },
  { month: 'Abr', viagens: 61, economia: 22000, gastos: 75000 },
  { month: 'Mai', viagens: 55, economia: 25000, gastos: 70000 },
  { month: 'Jun', viagens: 67, economia: 28000, gastos: 68000 }
];

const destinationData = [
  { name: 'São Paulo', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Rio de Janeiro', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Brasília', value: 20, color: 'hsl(var(--accent))' },
  { name: 'Internacional', value: 20, color: 'hsl(var(--warning))' }
];

const departmentSpending = [
  { department: 'Vendas', nacional: 45000, internacional: 25000 },
  { department: 'Executivo', nacional: 30000, internacional: 40000 },
  { department: 'Operações', nacional: 35000, internacional: 15000 },
  { department: 'TI', nacional: 20000, internacional: 10000 },
  { department: 'RH', nacional: 15000, internacional: 8000 }
];

export const AnalyticsDashboard = () => {
  const stats = [
    {
      title: "Economia Total Anual",
      value: "R$ 284k",
      icon: TrendingUp,
      change: { value: 18, type: 'increase' as const },
      variant: 'success' as const
    },
    {
      title: "Viagens Realizadas",
      value: "328",
      icon: Plane,
      change: { value: 12, type: 'increase' as const },
      variant: 'ocean' as const
    },
    {
      title: "Média de Economia por Viagem",
      value: "R$ 866",
      icon: Target,
      change: { value: 8, type: 'increase' as const },
      variant: 'default' as const
    },
    {
      title: "ROI do Sistema",
      value: "24.5%",
      icon: DollarSign,
      change: { value: 3, type: 'increase' as const },
      variant: 'warning' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
          Analytics & Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">
          Análise detalhada de performance e economia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendências Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="economia"
                stackId="1"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success) / 0.3)"
                name="Economia (R$)"
              />
              <Area
                type="monotone"
                dataKey="viagens"
                stackId="2"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.3)"
                name="Viagens"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Destination Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Destinos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={destinationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {destinationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Spending */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Gastos por Departamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar
                dataKey="nacional"
                fill="hsl(var(--primary))"
                name="Nacional (R$)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="internacional"
                fill="hsl(var(--secondary))"
                name="Internacional (R$)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 gradient-ocean">
          <div className="flex items-center justify-between text-white">
            <div>
              <h4 className="font-semibold">Melhor Mês</h4>
              <p className="text-2xl font-bold">Junho</p>
              <p className="text-sm opacity-90">R$ 28k economia</p>
            </div>
            <TrendingUp size={32} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/20 to-success/5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Meta Anual</h4>
              <p className="text-2xl font-bold text-success">84%</p>
              <p className="text-sm text-muted-foreground">R$ 336k de R$ 400k</p>
            </div>
            <Target className="text-success" size={32} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warning/20 to-warning/5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Próxima Revisão</h4>
              <p className="text-2xl font-bold text-warning">15 dias</p>
              <p className="text-sm text-muted-foreground">Análise trimestral</p>
            </div>
            <CalendarDays className="text-warning" size={32} />
          </div>
        </Card>
      </div>
    </div>
  );
};