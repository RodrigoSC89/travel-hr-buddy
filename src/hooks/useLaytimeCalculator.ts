/**
 * Hook for Laytime/Demurrage Calculator
 * Provides reactive interface to the BIMCO-certified engine
 */

import { useState, useCallback } from "react";
import {
  calculateLaytime,
  calculateAllowedLaytime,
  generateFreightInvoice,
  type LaytimeCalculation,
  type LaytimeResult,
  type FreightInvoice,
} from "@/services/laytime-engine";
import { toast } from "sonner";

export function useLaytimeCalculator() {
  const [result, setResult] = useState<LaytimeResult | null>(null);
  const [invoice, setInvoice] = useState<FreightInvoice | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = useCallback((calc: LaytimeCalculation) => {
    setIsCalculating(true);
    try {
      const res = calculateLaytime(calc);
      setResult(res);

      if (res.status === "on_demurrage") {
        toast.warning(`Demurrage: $${res.demurrage_usd.toLocaleString()}`, {
          description: `${Math.abs(res.balance_hours / 24).toFixed(1)} dias excedidos`,
        });
      } else if (res.status === "on_despatch") {
        toast.success(`Despatch: $${res.despatch_usd.toLocaleString()}`, {
          description: `${(res.balance_hours / 24).toFixed(1)} dias economizados`,
        });
      }

      return res;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const generateInvoice = useCallback(
    (params: {
      freight_rate_per_mt: number;
      cargo_quantity_mt: number;
      address_commission_pct?: number;
      brokerage_pct?: number;
    }) => {
      if (!result) {
        toast.error("Calcule o laytime antes de gerar a invoice");
        return null;
      }
      const inv = generateFreightInvoice({
        ...params,
        laytime_result: result,
      });
      setInvoice(inv);
      return inv;
    },
    [result]
  );

  const calculateFromRate = useCallback(
    (cargoQty: number, ratePerDay: number) => {
      return calculateAllowedLaytime(cargoQty, ratePerDay);
    },
    []
  );

  return {
    result,
    invoice,
    isCalculating,
    calculate,
    generateInvoice,
    calculateFromRate,
  };
}
