/**
 * Laytime Quick Panel - Compact BIMCO laytime calculator for Ops Hub
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useLaytimeCalculator } from "@/hooks/useLaytimeCalculator";
import { Clock, ExternalLink, Calculator } from "lucide-react";
import type { LaytimeTerms } from "@/services/laytime-engine";

export default function LaytimeQuickPanel() {
  const navigate = useNavigate();
  const { result, calculate } = useLaytimeCalculator();
  const [form, setForm] = useState({
    allowedHours: 72,
    usedHours: 48,
    demurrageRate: 25000,
    terms: 'SHINC' as LaytimeTerms,
  });

  const handleQuickCalc = () => {
    const now = new Date();
    const start = new Date(now.getTime() - form.usedHours * 3600 * 1000);
    
    calculate({
      vessel_name: 'Quick Calc',
      port_name: 'Port',
      operation: 'loading',
      allowed_laytime_hours: form.allowedHours,
      terms: form.terms,
      demurrage_rate_per_day: form.demurrageRate,
      despatch_rate_per_day: form.demurrageRate / 2,
      despatch_basis: 'all_time_saved',
      nor_tendered: start.toISOString(),
      nor_accepted: start.toISOString(),
      laytime_starts: start.toISOString(),
      laytime_ends: now.toISOString(),
      excluded_periods: [],
      holidays: [],
      cargo_quantity_mt: 50000,
      cargo_type: 'Bulk',
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Laytime Calculator</CardTitle>
            <Badge variant="outline" className="text-[10px]">BIMCO</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/laytime-demurrage')} className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Completo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Laytime Permitido (h)</Label>
            <Input
              type="number"
              value={form.allowedHours}
              onChange={(e) => setForm(f => ({ ...f, allowedHours: Number(e.target.value) }))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Laytime Usado (h)</Label>
            <Input
              type="number"
              value={form.usedHours}
              onChange={(e) => setForm(f => ({ ...f, usedHours: Number(e.target.value) }))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Demurrage Rate (USD/dia)</Label>
            <Input
              type="number"
              value={form.demurrageRate}
              onChange={(e) => setForm(f => ({ ...f, demurrageRate: Number(e.target.value) }))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Terms</Label>
            <Select value={form.terms} onValueChange={(v) => setForm(f => ({ ...f, terms: v as LaytimeTerms }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHINC">SHINC</SelectItem>
                <SelectItem value="SHEX">SHEX</SelectItem>
                <SelectItem value="WWD">WWD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleQuickCalc} className="w-full gap-2" size="sm">
          <Calculator className="h-4 w-4" />
          Calcular
        </Button>

        {/* Result */}
        {result && (
          <div className={`p-3 rounded-lg border ${
            result.status === 'on_demurrage' 
              ? 'bg-destructive/5 border-destructive/20' 
              : 'bg-success/5 border-success/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={result.status === 'on_demurrage' ? 'destructive' : 'default'}>
                {result.status === 'on_demurrage' ? '⚠️ Demurrage' : result.status === 'on_despatch' ? '✅ Despatch' : '✅ Within Laytime'}
              </Badge>
              <span className="text-sm font-mono font-bold text-foreground">
                USD {Math.abs(result.net_amount_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Balanço: {result.balance_hours.toFixed(1)}h</span>
              <span>Usado: {result.net_used_hours.toFixed(1)}h / {result.allowed_hours.toFixed(1)}h</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
