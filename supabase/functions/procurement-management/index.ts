import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'create_requisition': {
        const { 
          vessel_id,
          title,
          items, // [{ description, quantity, unit, estimated_cost }]
          priority,
          required_by_date,
          department
        } = params;

        if (!title || !items || items.length === 0) {
          return errorResponse('title and items are required', 400);
        }

        const totalEstimate = items.reduce((sum: number, item: any) => 
          sum + ((item.quantity || 0) * (item.estimated_cost || 0)), 0);

        const { data: requisition, error } = await supabase
          .from('procurement_requisitions')
          .insert({
            vessel_id,
            title,
            items,
            priority: priority || 'medium',
            required_by_date,
            department,
            estimated_total: totalEstimate,
            status: 'pending_approval',
            requested_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, requisition });
      }

      case 'approve_requisition': {
        const { requisition_id, approved, comments } = params;

        if (!requisition_id) {
          return errorResponse('requisition_id is required', 400);
        }

        const { data: requisition, error } = await supabase
          .from('procurement_requisitions')
          .update({
            status: approved ? 'approved' : 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            approval_comments: comments
          })
          .eq('id', requisition_id)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, requisition });
      }

      case 'create_purchase_order': {
        const { 
          requisition_id,
          supplier_name,
          supplier_contact,
          items,
          total_amount,
          currency,
          delivery_terms,
          payment_terms
        } = params;

        if (!supplier_name || !items || items.length === 0) {
          return errorResponse('supplier_name and items are required', 400);
        }

        const { data: po, error } = await supabase
          .from('purchase_orders')
          .insert({
            requisition_id,
            supplier_name,
            supplier_contact,
            items,
            total_amount: total_amount || items.reduce((sum: number, i: any) => sum + (i.total || 0), 0),
            currency: currency || 'USD',
            delivery_terms,
            payment_terms,
            status: 'issued',
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Update requisition status
        if (requisition_id) {
          await supabase
            .from('procurement_requisitions')
            .update({ status: 'ordered', purchase_order_id: po.id })
            .eq('id', requisition_id);
        }

        return jsonResponse({ success: true, purchase_order: po });
      }

      case 'receive_goods': {
        const { purchase_order_id, items_received, receiver_notes, delivery_date } = params;

        if (!purchase_order_id) {
          return errorResponse('purchase_order_id is required', 400);
        }

        const { data: receipt, error } = await supabase
          .from('goods_receipts')
          .insert({
            purchase_order_id,
            items_received,
            receiver_notes,
            delivery_date: delivery_date || new Date().toISOString(),
            received_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Update PO status
        await supabase
          .from('purchase_orders')
          .update({ status: 'received', received_at: new Date().toISOString() })
          .eq('id', purchase_order_id);

        return jsonResponse({ success: true, receipt });
      }

      case 'list_requisitions': {
        const { vessel_id, status, department } = params;

        let query = supabase.from('procurement_requisitions').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (status) query = query.eq('status', status);
        if (department) query = query.eq('department', department);

        const { data: requisitions, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        return jsonResponse({ success: true, requisitions });
      }

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'procurement-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
