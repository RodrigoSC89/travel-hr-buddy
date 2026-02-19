/**
 * Allotment Management Tab — Crew Payroll Enhancement
 * Connected to crew_payroll for real allotment data
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  DollarSign, Users, Send, Globe, TrendingUp, Plus,
  Search, ArrowUpRight, Wallet, BanknoteIcon, CheckCircle2,
  Loader2, Download
} from "lucide-react";

interface Allotment {
  id: string;
  crewMemberName: string;
  crewRank: string;
  amount: number;
  currency: string;
  frequency: string;
  status: "active" | "paused" | "completed";
  grossPay: number;
  allotmentPercent: number;
}

const CURRENCIES = [
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
  { code: "PHP", name: "Peso Filipino", symbol: "₱" },
  { code: "INR", name: "Rúpia Indiana", symbol: "₹" },
];

export function AllotmentManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("all");

  const { data: crewPayroll = [], isLoading } = useQuery({
    queryKey: ["crew-payroll-allotment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_payroll")
        .select("*")
        .order("crew_name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Map payroll records to allotment view
  const allotments: Allotment[] = useMemo(() => {
    return crewPayroll
      .filter((p: any) => p.gross_pay && p.gross_pay > 0)
      .map((p: any) => {
        const grossPay = p.gross_pay || 0;
        const allotmentPct = p.allotment_percent || 60;
        const amount = Math.round(grossPay * (allotmentPct / 100));
        const currency = p.currency || "USD";

        return {
          id: p.id,
          crewMemberName: p.crew_name || "N/A",
          crewRank: p.rank || "N/A",
          amount,
          currency,
          frequency: p.pay_frequency || "monthly",
          status: (p.status === "inactive" ? "paused" : "active") as Allotment["status"],
          grossPay,
          allotmentPercent: allotmentPct,
        };
      });
  }, [crewPayroll]);

  const filteredAllotments = useMemo(() => {
    let result = allotments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.crewMemberName.toLowerCase().includes(q));
    }
    if (filterCurrency !== "all") {
      result = result.filter(a => a.currency === filterCurrency);
    }
    return result;
  }, [allotments, searchQuery, filterCurrency]);

  const stats = useMemo(() => {
    const active = allotments.filter(a => a.status === "active");
    const totalMonthly = active.reduce((sum, a) => sum + a.amount, 0);
    const currencies = new Set(allotments.map(a => a.currency)).size;
    return { activeCount: active.length, totalMonthly, currencies, total: allotments.length };
  }, [allotments]);

  const getCurrencySymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

  const exportCSV = () => {
    const header = "Crew,Rank,Gross Pay,Allotment %,Amount,Currency,Status\n";
    const rows = allotments.map(a =>
      `"${a.crewMemberName}","${a.crewRank}",${a.grossPay},${a.allotmentPercent}%,${a.amount},${a.currency},${a.status}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a2 = document.createElement("a"); a2.href = url; a2.download = "allotments.csv"; a2.click();
    toast.success("CSV exportado!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando folha de pagamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Allotments Ativos", value: stats.activeCount, icon: CheckCircle2, color: "text-success" },
          { label: "Total Mensal", value: `${getCurrencySymbol("USD")}${stats.totalMonthly.toLocaleString()}`, icon: Send, color: "text-primary" },
          { label: "Moedas", value: stats.currencies, icon: Globe, color: "text-warning" },
          { label: "Total Registros", value: stats.total, icon: Users, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tripulante..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterCurrency} onValueChange={setFilterCurrency}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Moeda" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" /> CSV
        </Button>
      </div>

      {/* Empty State */}
      {allotments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum registro de folha de pagamento</p>
            <p className="text-sm mt-1">Cadastre dados na tabela <code>crew_payroll</code> para gerenciar allotments</p>
          </CardContent>
        </Card>
      )}

      {/* Allotments List */}
      <div className="space-y-2">
        {filteredAllotments.map(allotment => (
          <Card key={allotment.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BanknoteIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{allotment.crewMemberName}</h4>
                      <Badge variant="outline" className="text-[10px]">{allotment.crewRank}</Badge>
                      <Badge className={allotment.status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                        {allotment.status === "active" ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Wallet className="h-3 w-3" />Bruto: {getCurrencySymbol(allotment.currency)} {allotment.grossPay.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{allotment.allotmentPercent}% allotment</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {getCurrencySymbol(allotment.currency)} {allotment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{allotment.frequency === "monthly" ? "mês" : allotment.frequency === "biweekly" ? "quinzena" : "semana"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allotments.length > 0 && filteredAllotments.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum allotment encontrado para este filtro</p>
        </CardContent></Card>
      )}
    </div>
  );
}
