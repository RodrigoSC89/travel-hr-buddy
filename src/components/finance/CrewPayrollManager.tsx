import { memo, memo, useState, useCallback } from "react";;;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, Users, Calendar, Download, Plus, Search,
  Clock, TrendingUp, FileText, CheckCircle2, AlertCircle,
  CreditCard, Banknote, Wallet
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CrewPayroll {
  id: string;
  crew_member_id: string;
  vessel_id: string;
  payroll_period_start: string;
  payroll_period_end: string;
  base_salary: number;
  currency: string;
  days_onboard: number;
  overtime_hours: number;
  overtime_amount: number;
  bonuses: unknown[];
  deductions: unknown[];
  allowances: unknown[];
  gross_pay: number;
  net_pay: number;
  tax_amount: number;
  pension_contribution: number;
  payment_status: string;
  payment_date: string | null;
}

interface CrewMember {
  id: string;
  full_name: string;
  rank: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Pendente", icon: Clock },
  processed: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Processado", icon: CreditCard },
  paid: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Pago", icon: CheckCircle2 },
  cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelado", icon: AlertCircle },
};

export const CrewPayrollManager = memo(function() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("current");

  const { data: payrolls = [], isLoading: payrollsLoading } = useQuery({
    queryKey: ["crew-payrolls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_payroll")
        .select("*")
        .order("payroll_period_start", { ascending: false });
      if (error) throw error;
      return data as CrewPayroll[];
    },
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-payroll-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank")
        .eq("status", "active");
      if (error) throw error;
      return data as CrewMember[];
    },
  });

  const getCrewName = (id: string) => {
    const crew = crewMembers.find(c => c.id === id);
    return crew?.full_name || "N/A";
  };

  const getCrewRank = (id: string) => {
    const crew = crewMembers.find(c => c.id === id);
    return crew?.rank || "";
  };

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(p => {
    const crewName = getCrewName(p.crew_member_id).toLowerCase();
    const matchesSearch = crewName.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  };

  // Stats
  const stats = {
    totalPayroll: payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0),
    pending: payrolls.filter(p => p.payment_status === "pending").length,
    paid: payrolls.filter(p => p.payment_status === "paid").length,
    avgSalary: payrolls.length > 0 
      ? payrolls.reduce((sum, p) => sum + (p.base_salary || 0), 0) / payrolls.length 
      : 0,
    totalOvertime: payrolls.reduce((sum, p) => sum + (p.overtime_amount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Gestão de Folha de Pagamento
          </h2>
          <p className="text-muted-foreground mt-1">
            Salários, horas extras, deduções e pagamentos da tripulação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Período
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/20 to-primary/5 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Folha</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.totalPayroll)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-xl font-bold text-emerald-400">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média Salário</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.avgSalary)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Banknote className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Extras</p>
                <p className="text-xl font-bold text-orange-400">
                  {formatCurrency(stats.totalOvertime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar tripulante..." 
            className="pl-10 bg-muted/30"
            value={searchQuery}
            onChange={handleChange}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] bg-muted/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[150px] bg-muted/30">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Período Atual</SelectItem>
            <SelectItem value="previous">Período Anterior</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payroll Table */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Registros de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrollsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum registro de pagamento</p>
              <Button variant="link" className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Criar Período de Pagamento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-muted-foreground font-medium">Tripulante</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Período</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Salário Base</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Horas Extras</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Deduções</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Líquido</th>
                    <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll) => {
                    const config = statusConfig[payroll.payment_status];
                    const StatusIcon = config?.icon || Clock;
                    const deductions = (payroll.tax_amount || 0) + (payroll.pension_contribution || 0);

                    return (
                      <tr key={payroll.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {getCrewName(payroll.crew_member_id)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {getCrewRank(payroll.crew_member_id)}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {format(new Date(payroll.payroll_period_start), "dd/MM")} - {" "}
                          {format(new Date(payroll.payroll_period_end), "dd/MM/yyyy")}
                          <br />
                          <span className="text-xs">{payroll.days_onboard} dias a bordo</span>
                        </td>
                        <td className="p-3 text-right text-foreground">
                          {formatCurrency(payroll.base_salary, payroll.currency)}
                        </td>
                        <td className="p-3 text-right text-amber-400">
                          {payroll.overtime_hours > 0 && (
                            <>
                              {payroll.overtime_hours}h
                              <br />
                              <span className="text-xs">
                                {formatCurrency(payroll.overtime_amount, payroll.currency)}
                              </span>
                            </>
                          )}
                          {payroll.overtime_hours === 0 && "-"}
                        </td>
                        <td className="p-3 text-right text-destructive">
                          {deductions > 0 ? `-${formatCurrency(deductions, payroll.currency)}` : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          {formatCurrency(payroll.net_pay, payroll.currency)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={cn("border", config?.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config?.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={5} className="p-3 text-right font-medium text-foreground">
                      Total Líquido:
                    </td>
                    <td className="p-3 text-right font-bold text-lg text-foreground">
                      {formatCurrency(filteredPayrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
