import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  unit?: string;
  tax_rate?: number;
  category?: string;
}

interface CreateInvoicePayload {
  voyage_id?: string;
  vessel_id?: string;
  charterer_id?: string;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  items: InvoiceItem[];
  due_days?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { operation, payload, invoice_id } = await req.json();
    console.log(`[invoice-api] Operation: ${operation}, User: ${user.id}`);

    // Get user's organization - try organization_members first
    let { data: orgUser } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    
    if (!orgUser) {
      const { data: legacyOrg } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      orgUser = legacyOrg;
    }

    if (!orgUser) {
      throw new Error("User not associated with any organization");
    }

    const organizationId = orgUser.organization_id;

    switch (operation) {
      case "create_invoice": {
        const invoicePayload = payload as CreateInvoicePayload;

        if (!invoicePayload.items || invoicePayload.items.length === 0) {
          throw new Error("At least one item is required");
        }

        // Calculate totals
        let subtotal = 0;
        let taxAmount = 0;
        const processedItems: any[] = [];

        for (const item of invoicePayload.items) {
          const amount = item.quantity * item.unit_price;
          const itemTax = amount * ((item.tax_rate || 0) / 100);
          
          subtotal += amount;
          taxAmount += itemTax;

          processedItems.push({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit: item.unit || "unit",
            amount: Math.round(amount * 100) / 100,
            tax_rate: item.tax_rate || 0,
            tax_amount: Math.round(itemTax * 100) / 100,
            category: item.category,
          });
        }

        const totalAmount = subtotal + taxAmount;
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + (invoicePayload.due_days || 30));

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            organization_id: organizationId,
            voyage_id: invoicePayload.voyage_id,
            vessel_id: invoicePayload.vessel_id,
            charterer_id: invoicePayload.charterer_id,
            currency: invoicePayload.currency || "USD",
            subtotal: Math.round(subtotal * 100) / 100,
            tax_amount: Math.round(taxAmount * 100) / 100,
            total_amount: Math.round(totalAmount * 100) / 100,
            payment_terms: invoicePayload.payment_terms || "Net 30",
            notes: invoicePayload.notes,
            due_at: dueAt.toISOString(),
            created_by: user.id,
            status: "draft",
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Create invoice items
        const itemsToInsert = processedItems.map((item) => ({
          ...item,
          invoice_id: invoice.id,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        console.log(`[invoice-api] Invoice created: ${invoice.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            status: "draft",
            total_amount: totalAmount,
            message: "Invoice created successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "approve_invoice": {
        if (!invoice_id) {
          throw new Error("invoice_id is required");
        }

        // Check if user has approval permission (admin/manager)
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        const approverRoles = ["admin", "hr_manager", "manager", "department_manager"];
        if (!userRole || !approverRoles.includes(userRole.role)) {
          throw new Error("You don't have permission to approve invoices");
        }

        const { data: invoice } = await supabase
          .from("invoices")
          .select("status")
          .eq("id", invoice_id)
          .eq("organization_id", organizationId)
          .single();

        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (!["draft", "pending_approval"].includes(invoice.status)) {
          throw new Error(`Cannot approve invoice with status: ${invoice.status}`);
        }

        const { error: updateError } = await supabase
          .from("invoices")
          .update({
            status: "approved",
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", invoice_id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            invoice_id,
            status: "approved",
            message: "Invoice approved successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_invoice": {
        if (!invoice_id) {
          throw new Error("invoice_id is required");
        }

        const { data: invoice } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", invoice_id)
          .eq("organization_id", organizationId)
          .single();

        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (invoice.status !== "approved") {
          throw new Error("Invoice must be approved before sending");
        }

        // Update status and set issued date
        const { error: updateError } = await supabase
          .from("invoices")
          .update({
            status: "sent",
            issued_at: new Date().toISOString(),
          })
          .eq("id", invoice_id);

        if (updateError) throw updateError;

        // Create SOC alert for finance team
        await supabase.rpc("create_soc_alert", {
          p_organization_id: organizationId,
          p_alert_type: "financial",
          p_severity: "info",
          p_title: `Invoice ${invoice.invoice_number} Sent`,
          p_message: `Invoice for ${invoice.total_amount} ${invoice.currency} has been sent to charterer`,
          p_vessel_id: invoice.vessel_id,
          p_source_module: "invoice",
          p_source_reference_id: invoice_id,
        });

        console.log(`[invoice-api] Invoice sent: ${invoice_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            invoice_id,
            invoice_number: invoice.invoice_number,
            status: "sent",
            message: "Invoice sent successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark_paid": {
        if (!invoice_id) {
          throw new Error("invoice_id is required");
        }

        const { payment_reference, payment_date } = payload || {};

        const { data: invoice } = await supabase
          .from("invoices")
          .select("status")
          .eq("id", invoice_id)
          .eq("organization_id", organizationId)
          .single();

        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (!["sent", "overdue"].includes(invoice.status)) {
          throw new Error(`Cannot mark invoice with status ${invoice.status} as paid`);
        }

        const { error: updateError } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: payment_date || new Date().toISOString(),
            metadata: {
              payment_reference,
              marked_paid_by: user.id,
            },
          })
          .eq("id", invoice_id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            invoice_id,
            status: "paid",
            message: "Invoice marked as paid",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_invoices": {
        const { status, charterer_id, vessel_id, limit = 50 } = payload || {};

        let query = supabase
          .from("invoices")
          .select(`
            *,
            items:invoice_items(*)
          `)
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (status) query = query.eq("status", status);
        if (charterer_id) query = query.eq("charterer_id", charterer_id);
        if (vessel_id) query = query.eq("vessel_id", vessel_id);

        const { data: invoices, error: listError } = await query;

        if (listError) throw listError;

        return new Response(
          JSON.stringify({
            success: true,
            invoices,
            count: invoices?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_invoice": {
        if (!invoice_id) {
          throw new Error("invoice_id is required");
        }

        const { data: invoice, error: fetchError } = await supabase
          .from("invoices")
          .select(`
            *,
            items:invoice_items(*),
            vessel:vessels(id, name, imo_number),
            charterer:organizations!invoices_charterer_id_fkey(id, name)
          `)
          .eq("id", invoice_id)
          .eq("organization_id", organizationId)
          .single();

        if (fetchError || !invoice) {
          throw new Error("Invoice not found");
        }

        return new Response(
          JSON.stringify({
            success: true,
            invoice,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_from_voyage": {
        const { voyage_id } = payload;

        if (!voyage_id) {
          throw new Error("voyage_id is required");
        }

        // Get pricing rules for the organization
        const { data: pricingRules } = await supabase
          .from("pricing_rules")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("is_active", true);

        // Generate invoice items based on voyage data and pricing rules
        const items: InvoiceItem[] = [];

        // Example: Add charter rate
        const charterRule = pricingRules?.find((r: { rule_type: string }) => r.rule_type === "charter_rate");
        if (charterRule) {
          items.push({
            description: `Charter rate - Voyage ${voyage_id}`,
            quantity: 1,
            unit_price: Number(charterRule.base_rate),
            unit: charterRule.unit,
            category: "charter",
          });
        }

        // Example: Add port fees
        const portRule = pricingRules?.find((r: { rule_type: string }) => r.rule_type === "port_fee");
        if (portRule) {
          items.push({
            description: "Port fees",
            quantity: 2,
            unit_price: Number(portRule.base_rate),
            unit: "call",
            category: "port",
          });
        }

        if (items.length === 0) {
          // Default item if no rules
          items.push({
            description: `Voyage services - ${voyage_id}`,
            quantity: 1,
            unit_price: 0,
            unit: "voyage",
            category: "service",
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            generated_items: items,
            message: "Items generated from voyage. Call create_invoice to finalize.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[invoice-api] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
