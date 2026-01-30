/**
 * Automated Alerts Engine
 * Monitors certificates, maintenance, contracts and creates notifications
 * Can be triggered via cron or manually
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AlertConfig {
  type: string;
  thresholds: number[]; // Days before expiry
  priority: "low" | "normal" | "high" | "urgent";
  category: string;
}

const alertConfigs: AlertConfig[] = [
  { type: "certificate", thresholds: [30, 15, 7, 1], priority: "high", category: "compliance" },
  { type: "contract", thresholds: [60, 30, 14, 7], priority: "normal", category: "crew" },
  { type: "maintenance", thresholds: [14, 7, 3, 1], priority: "high", category: "maintenance" },
  { type: "document", thresholds: [30, 7], priority: "normal", category: "compliance" },
  { type: "training", thresholds: [30, 14, 7], priority: "normal", category: "crew" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results = {
      certificates: 0,
      contracts: 0,
      maintenance: 0,
      documents: 0,
      training: 0,
      total_alerts: 0
    };

    console.log("Starting automated alerts check...");

    // 1. Check Expiring Certificates
    for (const threshold of [30, 15, 7, 1]) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + threshold);
      const dateStr = targetDate.toISOString().split("T")[0];
      
      const { data: expiringCerts, error: certError } = await supabase
        .from("maritime_certificates")
        .select(`
          id, 
          certificate_type, 
          certificate_number, 
          expiry_date,
          crew_member_id,
          crew_members!inner(id, full_name, auth_user_id, organization_id)
        `)
        .eq("status", "valid")
        .gte("expiry_date", new Date().toISOString().split("T")[0])
        .lte("expiry_date", dateStr);
      
      if (certError) {
        console.error("Certificate check error:", certError);
        continue;
      }

      for (const cert of expiringCerts || []) {
        const crewMember = cert.crew_members;
        if (!crewMember?.auth_user_id) continue;
        
        const daysUntilExpiry = Math.ceil(
          (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        // Check if notification already sent for this threshold
        const { data: existing } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", crewMember.auth_user_id)
          .eq("metadata->>reference_id", cert.id)
          .eq("metadata->>threshold_days", threshold.toString())
          .maybeSingle();
        
        if (existing) continue;
        
        const priority = daysUntilExpiry <= 7 ? "urgent" : daysUntilExpiry <= 15 ? "high" : "normal";
        
        // Create notification using correct schema
        await supabase.from("user_notifications").insert({
          user_id: crewMember.auth_user_id,
          organization_id: crewMember.organization_id,
          title: `Certificado ${cert.certificate_type} expira em ${daysUntilExpiry} dias`,
          message: `Seu certificado ${cert.certificate_number} expira em ${new Date(cert.expiry_date).toLocaleDateString("pt-BR")}. Providencie a renovação.`,
          category: "compliance",
          priority: priority,
          resource_type: "certificate",
          resource_id: cert.id,
          action_url: `/certificates/${cert.id}`,
          action_label: "Ver Certificado",
          metadata: { 
            threshold_days: threshold,
            expiry_date: cert.expiry_date
          }
        });
        
        results.certificates++;
        results.total_alerts++;
        
        // Also notify admins/HR for urgent cases
        if (priority === "urgent" && crewMember.organization_id) {
          const { data: admins } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("role", ["admin", "hr_manager"]);
          
          for (const admin of admins || []) {
            await supabase.from("user_notifications").insert({
              user_id: admin.user_id,
              organization_id: crewMember.organization_id,
              title: `Certificado de ${crewMember.full_name} expira em ${daysUntilExpiry} dias`,
              message: `O certificado ${cert.certificate_type} (${cert.certificate_number}) de ${crewMember.full_name} expira em breve.`,
              category: "crew",
              priority: "high",
              resource_type: "certificate",
              resource_id: cert.id,
              action_url: `/crew/${crewMember.id}/certificates`,
              action_label: "Ver Certificados",
              metadata: { 
                crew_member_id: crewMember.id
              }
            });
          }
        }
      }
    }

    // 2. Check Maintenance Due
    const maintenanceFuture = new Date();
    maintenanceFuture.setDate(maintenanceFuture.getDate() + 14);
    
    const { data: dueMaintenance, error: maintError } = await supabase
      .from("maintenance_tasks")
      .select("id, title, description, due_date, vessel_id, priority, assigned_to")
      .in("status", ["pending", "scheduled"])
      .lte("due_date", maintenanceFuture.toISOString())
      .gte("due_date", new Date().toISOString().split("T")[0]);
    
    if (!maintError) {
      for (const task of dueMaintenance || []) {
        const daysUntilDue = Math.ceil(
          (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        if (task.assigned_to) {
          const { data: existing } = await supabase
            .from("user_notifications")
            .select("id")
            .eq("user_id", task.assigned_to)
            .eq("metadata->>reference_id", task.id)
            .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();
          
          if (!existing) {
            await supabase.from("user_notifications").insert({
              user_id: task.assigned_to,
              title: `Manutenção: ${task.title}`,
              message: `Tarefa de manutenção vence em ${daysUntilDue} dias. ${task.description || ""}`.trim(),
              category: "maintenance",
              priority: daysUntilDue <= 3 ? "high" : "normal",
              resource_type: "maintenance_task",
              resource_id: task.id,
              action_url: `/maintenance/${task.id}`,
              action_label: "Ver Tarefa",
              metadata: { 
                vessel_id: task.vessel_id
              }
            });
            
            results.maintenance++;
            results.total_alerts++;
          }
        }
      }
    }

    // 3. Check Expiring Contracts
    const contractFuture = new Date();
    contractFuture.setDate(contractFuture.getDate() + 60);
    
    const { data: expiringContracts, error: contractError } = await supabase
      .from("crew_contracts")
      .select(`
        id,
        contract_type,
        end_date,
        crew_member_id,
        crew_members!inner(id, full_name, auth_user_id)
      `)
      .eq("status", "active")
      .lte("end_date", contractFuture.toISOString())
      .gte("end_date", new Date().toISOString().split("T")[0]);
    
    if (!contractError) {
      for (const contract of expiringContracts || []) {
        const crewMember = contract.crew_members;
        if (!crewMember?.auth_user_id) continue;
        
        const daysUntilEnd = Math.ceil(
          (new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        const { data: existing } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", crewMember.auth_user_id)
          .eq("metadata->>reference_id", contract.id)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();
        
        if (!existing) {
          await supabase.from("user_notifications").insert({
            user_id: crewMember.auth_user_id,
            title: `Contrato termina em ${daysUntilEnd} dias`,
            message: `Seu contrato ${contract.contract_type} termina em ${new Date(contract.end_date).toLocaleDateString("pt-BR")}.`,
            category: "crew",
            priority: daysUntilEnd <= 14 ? "high" : "normal",
            resource_type: "contract",
            resource_id: contract.id,
            action_url: `/contracts/${contract.id}`,
            action_label: "Ver Contrato",
            metadata: {}
          });
          
          results.contracts++;
          results.total_alerts++;
        }
      }
    }

    // 4. Check Training Requirements
    const { data: trainingDue, error: trainingError } = await supabase
      .from("training_requirements")
      .select(`
        id,
        training_type,
        due_date,
        crew_member_id,
        crew_members!inner(id, full_name, auth_user_id)
      `)
      .eq("status", "pending")
      .lte("due_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .gte("due_date", new Date().toISOString().split("T")[0]);
    
    if (!trainingError) {
      for (const training of trainingDue || []) {
        const crewMember = training.crew_members;
        if (!crewMember?.auth_user_id) continue;
        
        const daysUntilDue = Math.ceil(
          (new Date(training.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        const { data: existing } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", crewMember.auth_user_id)
          .eq("metadata->>reference_id", training.id)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();
        
        if (!existing) {
          await supabase.from("user_notifications").insert({
            user_id: crewMember.auth_user_id,
            title: `Treinamento ${training.training_type} obrigatório`,
            message: `Você precisa completar o treinamento ${training.training_type} até ${new Date(training.due_date).toLocaleDateString("pt-BR")}.`,
            category: "crew",
            priority: daysUntilDue <= 7 ? "high" : "normal",
            resource_type: "training",
            resource_id: training.id,
            action_url: `/training`,
            action_label: "Acessar Treinamento",
            metadata: {}
          });
          
          results.training++;
          results.total_alerts++;
        }
      }
    }

    console.log("Automated alerts completed:", results);

    // Trigger webhook for monitoring
    if (results.total_alerts > 0) {
      try {
        await supabase.functions.invoke("webhook-dispatcher", {
          body: {
            action: "dispatch",
            event_type: "alerts.generated",
            event_data: {
              ...results,
              generated_at: new Date().toISOString()
            }
          }
        });
      } catch (webhookError) {
        console.error("Webhook dispatch failed:", webhookError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Generated ${results.total_alerts} automated alerts`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Automated alerts error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
