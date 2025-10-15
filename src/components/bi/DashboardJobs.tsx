import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Wrench, CheckCircle2, AlertCircle, Clock } from "lucide-react";

// Mock data - Jobs por componente
const jobsData = [
  { componente: "Gerador", concluídos: 6, em_andamento: 2, pendentes: 2, total: 10 },
  { componente: "Hidráulico", concluídos: 8, em_andamento: 3, pendentes: 1, total: 12 },
  { componente: "Propulsão", concluídos: 4, em_andamento: 3, pendentes: 2, total: 9 },
  { componente: "Climatização", concluídos: 5, em_andamento: 0, pendentes: 0, total: 5 },
  { componente: "Elétrico", concluídos: 7, em_andamento: 2, pendentes: 1, total: 10 },
];

const DashboardJobs = () => {
  const totalJobs = jobsData.reduce((sum, item) => sum + item.total, 0);
  const totalConcluidos = jobsData.reduce((sum, item) => sum + item.concluídos, 0);
  const totalEmAndamento = jobsData.reduce((sum, item) => sum + item.em_andamento, 0);
  const totalPendentes = jobsData.reduce((sum, item) => sum + item.pendentes, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Total de Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConcluidos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalConcluidos / totalJobs) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalEmAndamento}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalEmAndamento / totalJobs) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalPendentes / totalJobs) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Jobs por Componente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="componente" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => value}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar dataKey="concluídos" fill="#22c55e" name="Concluídos" />
                <Bar dataKey="em_andamento" fill="#3b82f6" name="Em Andamento" />
                <Bar dataKey="pendentes" fill="#f97316" name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardJobs;
