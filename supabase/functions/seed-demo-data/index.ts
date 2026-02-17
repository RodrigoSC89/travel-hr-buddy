/**
 * Seed Demo Data Edge Function
 * Inserts realistic sample data for commercial demonstrations
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, number> = {};

    // 1) Demo Organization
    const slug = `oceanus-maritime-${Date.now()}`;
    const { data: org } = await sb.from("organizations").insert({
      name: "Oceanus Maritime Group",
      slug,
    }).select("id").single();

    const orgId = org?.id;
    results.organizations = 1;

    // 2) Demo Vessels
    const vessels = [
      { name: "Skandi Salvador", vessel_type: "AHTS", imo_number: "9456789", flag_state: "Brazil", status: "at_sea", gross_tonnage: 4200 },
      { name: "Normand Pioneer", vessel_type: "PSV", imo_number: "9567890", flag_state: "Norway", status: "in_port", gross_tonnage: 5100 },
      { name: "Far Sapphire", vessel_type: "PLSV", imo_number: "9678901", flag_state: "Marshall Islands", status: "active", gross_tonnage: 8500 },
      { name: "Bourbon Subsea", vessel_type: "OSRV", imo_number: "9789012", flag_state: "Panama", status: "at_sea", gross_tonnage: 3200 },
      { name: "Deep Explorer", vessel_type: "Drill Ship", imo_number: "9890123", flag_state: "Liberia", status: "active", gross_tonnage: 32000 },
    ].map((v: Record<string, unknown>) => ({ ...v, organization_id: orgId }));

    const { data: insertedVessels } = await sb.from("vessels").insert(vessels).select("id, name");
    results.vessels = insertedVessels?.length ?? 0;

    const vesselIds = (insertedVessels ?? []).map((v: { id: string }) => v.id);

    // 3) Demo Crew Members
    const crewData = [
      { full_name: "Carlos Alberto Santos", rank: "Master", nationality: "Brazilian", status: "on_board" },
      { full_name: "Maria Fernanda Costa", rank: "Chief Officer", nationality: "Brazilian", status: "on_board" },
      { full_name: "Erik Johansson", rank: "Chief Engineer", nationality: "Swedish", status: "on_board" },
      { full_name: "Pedro Henrique Lima", rank: "2nd Officer", nationality: "Brazilian", status: "on_board" },
      { full_name: "Ana Paula Ribeiro", rank: "3rd Officer", nationality: "Brazilian", status: "on_leave" },
      { full_name: "James McAllister", rank: "2nd Engineer", nationality: "British", status: "on_board" },
      { full_name: "Ricardo Oliveira", rank: "Bosun", nationality: "Brazilian", status: "on_board" },
      { full_name: "Thomas Andersen", rank: "AB Seaman", nationality: "Norwegian", status: "on_board" },
      { full_name: "José Carlos Ferreira", rank: "Motorman", nationality: "Brazilian", status: "on_board" },
      { full_name: "Liu Wei", rank: "Cook", nationality: "Chinese", status: "on_board" },
      { full_name: "Antonio da Silva", rank: "OS Seaman", nationality: "Brazilian", status: "on_board" },
      { full_name: "Marcos Vinícius", rank: "3rd Engineer", nationality: "Brazilian", status: "on_leave" },
    ];

    const crewInserts = crewData.map((c: typeof crewData[0], i: number) => ({
      ...c,
      vessel_id: vesselIds[i % vesselIds.length],
      organization_id: orgId,
      employee_id: `DEMO-${Date.now()}-${i}`,
      position: c.rank,
      email: `${c.full_name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@oceanusmaritime.com`,
    }));

    const { data: insertedCrew } = await sb.from("crew_members").insert(crewInserts).select("id");
    results.crew_members = insertedCrew?.length ?? 0;

    // 4) Demo Maintenance Tasks
    const maintTasks = [
      { title: "Revisão do Sistema de Propulsão Principal", component_name: "Main Engine", priority: "high", status: "pending", due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] },
      { title: "Inspeção do Sistema de Lastro", component_name: "Ballast System", priority: "medium", status: "in_progress", due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] },
      { title: "Calibração de Instrumentos de Navegação", component_name: "Navigation", priority: "medium", status: "pending", due_date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0] },
      { title: "Teste de Equipamentos de Salvamento", component_name: "LSA", priority: "high", status: "completed", due_date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0] },
      { title: "Manutenção Preventiva dos Geradores", component_name: "Generators", priority: "medium", status: "pending", due_date: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0] },
    ].map((t, i: number) => ({ ...t, vessel_id: vesselIds[i % vesselIds.length], organization_id: orgId }));

    await sb.from("maintenance_tasks").insert(maintTasks);
    results.maintenance_tasks = maintTasks.length;

    // 5) Demo Certifications
    const crewIds = (insertedCrew ?? []).map((c: { id: string }) => c.id);
    const certTypes = ["STCW", "MLC Certificate", "Passport", "Seaman Book", "GMDSS", "Medical Certificate", "DP Certificate"];
    const certs = crewIds.slice(0, 8).flatMap((crewId: string, i: number) => [
      {
        crew_member_id: crewId,
        certification_name: certTypes[i % certTypes.length],
        issue_date: new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0],
        expiry_date: new Date(Date.now() + (30 + i * 60) * 86400000).toISOString().split("T")[0],
        status: "active",
        issuing_authority: "DPC - Diretoria de Portos e Costas",
      },
    ]);

    await sb.from("crew_certifications").insert(certs);
    results.certifications = certs.length;

    // 6) Demo Voyage Plans
    const voyages = [
      { voyage_number: "VOY-2026-001", origin_port: "Santos, BR", destination_port: "Campos Basin, BR", status: "in_progress", vessel_id: vesselIds[0] },
      { voyage_number: "VOY-2026-002", origin_port: "Rio de Janeiro, BR", destination_port: "Macaé, BR", status: "planned", vessel_id: vesselIds[1] },
      { voyage_number: "VOY-2026-003", origin_port: "Vitória, BR", destination_port: "Pre-salt Area, BR", status: "completed", vessel_id: vesselIds[2] },
    ].map((v) => ({ ...v, organization_id: orgId }));

    await sb.from("voyage_plans").insert(voyages);
    results.voyage_plans = voyages.length;

    return new Response(
      JSON.stringify({ success: true, results, organization_id: orgId, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
