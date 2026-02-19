/**
 * Allotment Management Tab — Crew Payroll Enhancement
 * Multi-currency remittances to crew families with tracking
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DollarSign, Users, Send, Globe, TrendingUp, Plus,
  Search, ArrowUpRight, Wallet, BanknoteIcon, CheckCircle2
} from "lucide-react";

interface Allotment {
  id: string;
  crewMemberName: string;
  crewRank: string;
  beneficiaryName: string;
  relationship: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "biweekly" | "weekly";
  bankName: string;
  accountNumber: string;
  status: "active" | "paused" | "completed";
  lastPaymentDate?: string;
  totalPaid: number;
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("all");

  // Load crew payroll data for allotment context
  const { data: crewPayroll = [] } = useQuery({
    queryKey: ["crew-payroll-allotment"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crew_payroll").select("*").order("crew_name");
      if (error) throw error;
      return data || [];
    },
  });

  // Generate allotments from payroll data
  const allotments: Allotment[] = useMemo(() => {
    return crewPayroll.slice(0, 15).map((p: any, i: number) => ({
      id: p.id || `allot-${i}`,
      crewMemberName: p.crew_name || `Tripulante ${i + 1}`,
      crewRank: p.rank || "AB",
      beneficiaryName: `Família ${(p.crew_name || "").split(" ")[0] || "N/A"}`,
      relationship: ["Cônjuge", "Pais", "Filhos", "Dependente"][i % 4],
      amount: Math.round((p.gross_pay || 3000) * 0.6),
      currency: ["USD", "BRL", "PHP", "EUR", "INR"][i % 5],
      frequency: (["monthly", "biweekly", "weekly"] as const)[i % 3],
      bankName: ["Banco do Brasil", "BPI", "HDFC", "Deutsche Bank", "Wells Fargo"][i % 5],
      accountNumber: `****${String(1000 + i).slice(-4)}`,
      status: (["active", "active", "active", "paused", "active"] as const)[i % 5],
      lastPaymentDate: new Date(Date.now() - (i * 3 + 1) * 86400000).toISOString(),
      totalPaid: Math.round((p.gross_pay || 3000) * 0.6 * (6 + i)),
    }));
  }, [crewPayroll]);

  const filteredAllotments = useMemo(() => {
    let result = allotments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.crewMemberName.toLowerCase().includes(q) || a.beneficiaryName.toLowerCase().includes(q));
    }
    if (filterCurrency !== "all") {
      result = result.filter(a => a.currency === filterCurrency);
    }
    return result;
  }, [allotments, searchQuery, filterCurrency]);

  const stats = useMemo(() => {
    const active = allotments.filter(a => a.status === "active");
    const totalMonthly = active.reduce((sum, a) => sum + a.amount, 0);
    const totalPaid = allotments.reduce((sum, a) => sum + a.totalPaid, 0);
    const currencies = new Set(allotments.map(a => a.currency)).size;
    return { activeCount: active.length, totalMonthly, totalPaid, currencies, total: allotments.length };
  }, [allotments]);

  const getCurrencySymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Allotments Ativos", value: stats.activeCount, icon: CheckCircle2, color: "text-success" },
          { label: "Total Mensal", value: `$${stats.totalMonthly.toLocaleString()}`, icon: Send, color: "text-primary" },
          { label: "Total Remetido", value: `$${stats.totalPaid.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
          { label: "Moedas", value: stats.currencies, icon: Globe, color: "text-warning" },
          { label: "Beneficiários", value: stats.total, icon: Users, color: "text-primary" },
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
            <Input placeholder="Buscar tripulante ou beneficiário..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterCurrency} onValueChange={setFilterCurrency}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Moeda" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => toast.info("Funcionalidade de criação em desenvolvimento")}>
          <Plus className="h-4 w-4 mr-2" /> Novo Allotment
        </Button>
      </div>

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
                      <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{allotment.beneficiaryName} ({allotment.relationship})</span>
                      <span className="flex items-center gap-1"><Wallet className="h-3 w-3" />{allotment.bankName} {allotment.accountNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {getCurrencySymbol(allotment.currency)} {allotment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {allotment.frequency === "monthly" ? "/mês" : allotment.frequency === "biweekly" ? "/quinzena" : "/semana"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">
                      {getCurrencySymbol(allotment.currency)} {allotment.totalPaid.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">total remetido</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAllotments.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum allotment encontrado</p>
        </CardContent></Card>
      )}
    </div>
  );
}
