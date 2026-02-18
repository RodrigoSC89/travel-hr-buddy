/**
 * Freight Invoicing Center - vs Veson IMOS
 * Freight invoicing with BIMCO laytime integration
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { FreightInvoiceManager } from "@/components/operations/FreightInvoiceManager";
import { DollarSign, FileText, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLaytimeCalculator } from "@/hooks/useLaytimeCalculator";

function LaytimeQuickPanel() {
  const { calculate, result } = useLaytimeCalculator();

  const runDemo = () => {
    calculate({
      vessel_name: "MV Pacific Star",
      port_name: "Santos, Brazil",
      operation: "loading",
      allowed_laytime_hours: 72,
      terms: "SHINC",
      demurrage_rate_per_day: 25000,
      despatch_rate_per_day: 12500,
      despatch_basis: "all_time_saved",
      nor_tendered: "2026-02-10T06:00:00Z",
      nor_accepted: "2026-02-10T08:00:00Z",
      laytime_starts: "2026-02-10T08:00:00Z",
      laytime_ends: "2026-02-14T12:00:00Z",
      excluded_periods: [
        { start: "2026-02-12T18:00:00Z", end: "2026-02-13T06:00:00Z", reason: "Weather delay", type: "weather" },
      ],
      holidays: [],
      cargo_quantity_mt: 50000,
      cargo_type: "Iron Ore",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          BIMCO Laytime Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDemo} size="sm">Run Sample Calculation (SHINC)</Button>
        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Net Used</p>
              <p className="text-lg font-bold">{result.net_used_hours.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Allowed</p>
              <p className="text-lg font-bold">{result.allowed_hours}h</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Result</p>
              <Badge className={result.status === "on_demurrage" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}>
                {result.status === "on_demurrage" ? "DEMURRAGE" : result.status === "on_despatch" ? "DESPATCH" : "WITHIN LAYTIME"}
              </Badge>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold">USD {result.net_amount_usd.toLocaleString()}</p>
            </div>
          </div>
        )}
        {result && (
          <p className="text-xs text-muted-foreground mt-2">{result.summary}</p>
        )}
      </CardContent>
    </Card>
  );
}

const FreightInvoicePage = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Freight & Commercial Invoicing
        </h1>
        <p className="text-muted-foreground">Freight invoicing, demurrage/despatch billing, BIMCO-compliant laytime</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invoices" className="gap-1.5">
              <FileText className="h-4 w-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="laytime" className="gap-1.5">
              <Calculator className="h-4 w-4" /> Laytime Engine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <FreightInvoiceManager />
          </TabsContent>

          <TabsContent value="laytime" className="mt-4">
            <LaytimeQuickPanel />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default FreightInvoicePage;
