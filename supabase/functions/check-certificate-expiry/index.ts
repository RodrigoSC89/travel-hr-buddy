import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CertificateAlert {
  certificate_id: string;
  employee_id: string;
  certificate_name: string;
  expiry_date: string;
  alert_type: "expiring_soon" | "expired";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting certificate expiry check...");

    // Get all certificates
    const { data: certificates, error: certificatesError } = await supabase
      .from("employee_certificates")
      .select("*");

    if (certificatesError) {
      console.error("Error fetching certificates:", certificatesError);
      throw certificatesError;
    }

    console.log(`Found ${certificates?.length || 0} certificates to check`);

    const alertsToCreate: CertificateAlert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const cert of certificates || []) {
      const expiryDate = new Date(cert.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let alertType: "expiring_soon" | "expired" | null = null;

      // Certificate expired
      if (daysDifference < 0) {
        alertType = "expired";
      }
      // Certificate expiring within 30 days
      else if (daysDifference <= 30) {
        alertType = "expiring_soon";
      }

      if (alertType) {
        // Check if alert already exists for today
        const { data: existingAlert, error: alertCheckError } = await supabase
          .from("certificate_alerts")
          .select("id")
          .eq("certificate_id", cert.id)
          .eq("alert_type", alertType)
          .eq("alert_date", today.toISOString().split("T")[0])
          .single();

        if (alertCheckError && alertCheckError.code !== "PGRST116") {
          console.error("Error checking existing alert:", alertCheckError);
          continue;
        }

        // Only create alert if it doesn't exist for today
        if (!existingAlert) {
          alertsToCreate.push({
            certificate_id: cert.id,
            employee_id: cert.employee_id,
            certificate_name: cert.certificate_name,
            expiry_date: cert.expiry_date,
            alert_type: alertType
          });
        }
      }
    }

    console.log(`Creating ${alertsToCreate.length} new alerts`);

    // Create alerts in batches
    if (alertsToCreate.length > 0) {
      const alertRecords = alertsToCreate.map(alert => ({
        certificate_id: alert.certificate_id,
        alert_type: alert.alert_type,
        alert_date: today.toISOString().split("T")[0]
      }));

      const { error: insertError } = await supabase
        .from("certificate_alerts")
        .insert(alertRecords);

      if (insertError) {
        console.error("Error creating alerts:", insertError);
        throw insertError;
      }
    }

    // Update certificate statuses
    console.log("Updating certificate statuses...");
    
    for (const cert of certificates || []) {
      const expiryDate = new Date(cert.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let newStatus: string = cert.status;

      if (daysDifference < 0) {
        newStatus = "expired";
      } else if (daysDifference <= 30) {
        newStatus = "expiring_soon";
      } else {
        newStatus = "active";
      }

      // Update status if it changed
      if (newStatus !== cert.status) {
        const { error: updateError } = await supabase
          .from("employee_certificates")
          .update({ status: newStatus })
          .eq("id", cert.id);

        if (updateError) {
          console.error(`Error updating certificate ${cert.id} status:`, updateError);
        } else {
          console.log(`Updated certificate ${cert.id} status to ${newStatus}`);
        }
      }
    }

    const summary = {
      certificates_checked: certificates?.length || 0,
      new_alerts_created: alertsToCreate.length,
      expired_certificates: alertsToCreate.filter(a => a.alert_type === "expired").length,
      expiring_soon_certificates: alertsToCreate.filter(a => a.alert_type === "expiring_soon").length,
      timestamp: new Date().toISOString()
    };

    console.log("Certificate expiry check completed:", summary);

    return new Response(JSON.stringify({
      success: true,
      summary
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    });

  } catch (error: any) {
    console.error("Error in check-certificate-expiry function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    });
  }
});