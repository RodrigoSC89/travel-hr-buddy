/**
 * NAUTI ONE — Finance Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/events/event-bus";

export const FinanceService = {
  async approveInvoice(invoiceId: string) {
    const { data, error } = await (supabase.from as Function)('invoices')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'finance.invoice.approved',
      payload: {
        invoice_id: data.id,
        supplier_id: data.supplier_id,
        amount: data.amount,
        currency: data.currency,
        voyage_id: data.voyage_id,
      },
      sourceEntityType: 'invoice',
      sourceEntityId: data.id,
    });

    return data;
  },

  async approvePO(poId: string) {
    const { data, error } = await (supabase.from as Function)('procurement_orders')
      .update({ status: 'approved' })
      .eq('id', poId)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'finance.po.approved',
      payload: {
        po_id: data.id,
        supplier_id: data.supplier_id,
        vessel_id: data.vessel_id,
        total_amount: data.estimated_total,
      },
      sourceEntityType: 'purchase_order',
      sourceEntityId: data.id,
    });

    return data;
  },

  async getVoyagePnL(voyageId: string) {
    const { data, error } = await (supabase.from as Function)('voyage_pnl')
      .select('*')
      .eq('voyage_id', voyageId)
      .single();
    if (error) throw error;
    return data;
  },
};
