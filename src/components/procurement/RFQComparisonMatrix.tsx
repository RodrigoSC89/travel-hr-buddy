/**
 * RFQ Comparison Matrix - Side-by-side quotation comparison with auto-scoring
 * Supera ShipServ
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Scale, Trophy, TrendingDown, Clock, Star, Shield,
  CheckCircle, Package, DollarSign, Award, BarChart3,
  FileText, ArrowRight
} from "lucide-react";

interface BidEntry {
  id: string;
  supplier_name: string;
  total_amount: number;
  delivery_days: number;
  payment_terms: string;
  warranty_months: number;
  quality_score: number; // 0-100
  compliance_score: number; // 0-100
  items_quoted: number;
  items_requested: number;
  notes: string;
}

// Scoring weights
const WEIGHTS = {
  price: 0.35,
  delivery: 0.20,
  quality: 0.20,
  compliance: 0.15,
  coverage: 0.10,
};

function calculateScore(bid: BidEntry, allBids: BidEntry[]): number {
  const minPrice = Math.min(...allBids.map(b => b.total_amount));
  const maxPrice = Math.max(...allBids.map(b => b.total_amount));
  const priceRange = maxPrice - minPrice || 1;
  const priceScore = 100 * (1 - (bid.total_amount - minPrice) / priceRange);

  const minDelivery = Math.min(...allBids.map(b => b.delivery_days));
  const maxDelivery = Math.max(...allBids.map(b => b.delivery_days));
  const deliveryRange = maxDelivery - minDelivery || 1;
  const deliveryScore = 100 * (1 - (bid.delivery_days - minDelivery) / deliveryRange);

  const coverage = bid.items_requested > 0 ? (bid.items_quoted / bid.items_requested) * 100 : 0;

  return Math.round(
    priceScore * WEIGHTS.price +
    deliveryScore * WEIGHTS.delivery +
    bid.quality_score * WEIGHTS.quality +
    bid.compliance_score * WEIGHTS.compliance +
    coverage * WEIGHTS.coverage
  );
}

export function RFQComparisonMatrix() {
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  const { data: rfqs = [] } = useQuery({
    queryKey: ["rfqs-comparison"],
    queryFn: async () => {
      const { data } = await supabase
        .from("purchase_requisitions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["bids-comparison", selectedRFQ],
    queryFn: async () => {
      if (!selectedRFQ) return [];
      const { data } = await supabase
        .from("bid_submissions")
        .select("*, suppliers(company_name, rating, lead_time_days, certifications)")
        .eq("requisition_id", selectedRFQ);
      return (data || []).map((b: Record<string, unknown>): BidEntry => {
        const sup = b.suppliers as Record<string, unknown> | null;
        return {
          id: String(b.id),
          supplier_name: String(sup?.company_name || "Unknown"),
          total_amount: Number(b.total_amount || b.unit_price || 0),
          delivery_days: Number(sup?.lead_time_days || 14),
          payment_terms: String(b.payment_terms || "Net 30"),
          warranty_months: Number(b.warranty_months || 12),
          quality_score: Number(sup?.rating || 3) * 20,
          compliance_score: ((sup?.certifications as string[])?.length || 0) > 0 ? 80 : 50,
          items_quoted: Number(b.items_quoted || 1),
          items_requested: Number(b.items_requested || 1),
          notes: String(b.notes || ""),
        };
      });
    },
    enabled: !!selectedRFQ,
  });

  const scoredBids = useMemo(() => {
    if (bids.length === 0) return [];
    return bids
      .map(b => ({ ...b, score: calculateScore(b, bids) }))
      .sort((a, b) => b.score - a.score);
  }, [bids]);

  const winner = scoredBids[0];

  // Demo data if no real bids
  const demoBids: (BidEntry & { score: number })[] = useMemo(() => {
    const demo: BidEntry[] = [
      { id: "1", supplier_name: "MarineParts Global", total_amount: 45200, delivery_days: 12, payment_terms: "Net 30", warranty_months: 24, quality_score: 92, compliance_score: 95, items_quoted: 15, items_requested: 15, notes: "Entrega parcial possível" },
      { id: "2", supplier_name: "ShipSupply Int'l", total_amount: 42800, delivery_days: 18, payment_terms: "Net 45", warranty_months: 12, quality_score: 78, compliance_score: 85, items_quoted: 14, items_requested: 15, notes: "Frete incluso" },
      { id: "3", supplier_name: "NautiTech Solutions", total_amount: 48500, delivery_days: 8, payment_terms: "Net 30", warranty_months: 36, quality_score: 95, compliance_score: 90, items_quoted: 15, items_requested: 15, notes: "Garantia estendida inclusa" },
    ];
    return demo.map(b => ({ ...b, score: calculateScore(b, demo) })).sort((a, b) => b.score - a.score);
  }, []);

  const displayBids = scoredBids.length > 0 ? scoredBids : demoBids;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> RFQ Comparison Matrix
          </h3>
          <p className="text-sm text-muted-foreground">Side-by-side quotation analysis with weighted auto-scoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Weights: Price {WEIGHTS.price * 100}% | Delivery {WEIGHTS.delivery * 100}% | Quality {WEIGHTS.quality * 100}%
          </Badge>
        </div>
      </div>

      {/* Winner banner */}
      {displayBids.length > 1 && (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="py-4 flex items-center gap-4">
            <Trophy className="h-8 w-8 text-success" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Recomendação AI: {displayBids[0].supplier_name}</p>
              <p className="text-xs text-muted-foreground">
                Score: {displayBids[0].score}/100 • Melhor relação custo-benefício • 
                {displayBids[0].total_amount < displayBids[1].total_amount ? ` ${((1 - displayBids[0].total_amount / displayBids[1].total_amount) * 100).toFixed(1)}% mais barato` : ` Maior qualidade`}
              </p>
            </div>
            <Button size="sm" className="bg-success hover:bg-success/90">
              <Award className="h-4 w-4 mr-1" /> Award
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      <ScrollArea className="w-full">
        <div className="min-w-[800px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Criteria</th>
                {displayBids.map((bid, i) => (
                  <th key={bid.id} className={`text-center py-3 px-4 font-medium ${i === 0 ? "bg-success/5" : ""}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span>{bid.supplier_name}</span>
                      {i === 0 && <Badge className="bg-success/20 text-success text-[10px]"><Trophy className="h-3 w-3 mr-0.5" /> Best</Badge>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Overall Score */}
              <tr className="border-b bg-primary/5 font-semibold">
                <td className="py-3 px-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Overall Score</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-lg font-bold ${bid.score >= 80 ? "text-success" : bid.score >= 60 ? "text-warning" : "text-destructive"}`}>
                        {bid.score}/100
                      </span>
                      <Progress value={bid.score} className="h-1.5 w-20" />
                    </div>
                  </td>
                ))}
              </tr>
              {/* Price */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> Total Price</td>
                {displayBids.map((bid, i) => {
                  const isLowest = bid.total_amount === Math.min(...displayBids.map(b => b.total_amount));
                  return (
                    <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                      <span className={`font-mono font-medium ${isLowest ? "text-success" : ""}`}>
                        ${bid.total_amount.toLocaleString()}
                      </span>
                      {isLowest && <Badge variant="outline" className="ml-1 text-[10px] text-success">Lowest</Badge>}
                    </td>
                  );
                })}
              </tr>
              {/* Delivery */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Delivery Time</td>
                {displayBids.map((bid, i) => {
                  const isFastest = bid.delivery_days === Math.min(...displayBids.map(b => b.delivery_days));
                  return (
                    <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                      <span className={isFastest ? "text-success font-medium" : ""}>{bid.delivery_days} days</span>
                      {isFastest && <Badge variant="outline" className="ml-1 text-[10px] text-success">Fastest</Badge>}
                    </td>
                  );
                })}
              </tr>
              {/* Quality */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" /> Quality Score</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                    <div className="flex items-center justify-center gap-1">
                      <span className={bid.quality_score >= 90 ? "text-success" : bid.quality_score >= 70 ? "text-warning" : "text-destructive"}>
                        {bid.quality_score}%
                      </span>
                      <Progress value={bid.quality_score} className="h-1.5 w-16" />
                    </div>
                  </td>
                ))}
              </tr>
              {/* Compliance */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> Compliance</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                    <span className={bid.compliance_score >= 90 ? "text-success" : "text-warning"}>{bid.compliance_score}%</span>
                  </td>
                ))}
              </tr>
              {/* Warranty */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> Warranty</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                    {bid.warranty_months} months
                    {bid.warranty_months >= 24 && <Badge variant="outline" className="ml-1 text-[10px] text-success">Extended</Badge>}
                  </td>
                ))}
              </tr>
              {/* Coverage */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /> Item Coverage</td>
                {displayBids.map((bid, i) => {
                  const pct = bid.items_requested > 0 ? (bid.items_quoted / bid.items_requested * 100) : 0;
                  return (
                    <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>
                      <span className={pct === 100 ? "text-success" : "text-warning"}>
                        {bid.items_quoted}/{bid.items_requested} ({pct.toFixed(0)}%)
                      </span>
                    </td>
                  );
                })}
              </tr>
              {/* Payment Terms */}
              <tr className="border-b">
                <td className="py-3 px-4 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Payment Terms</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center ${i === 0 ? "bg-success/5" : ""}`}>{bid.payment_terms}</td>
                ))}
              </tr>
              {/* Notes */}
              <tr>
                <td className="py-3 px-4 text-muted-foreground">Notes</td>
                {displayBids.map((bid, i) => (
                  <td key={bid.id} className={`py-3 px-4 text-center text-xs text-muted-foreground ${i === 0 ? "bg-success/5" : ""}`}>{bid.notes || "—"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
