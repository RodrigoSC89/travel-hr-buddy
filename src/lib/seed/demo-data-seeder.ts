/**
 * NAUTI ONE — Demo Data Seeder
 * Populates the system with realistic maritime operational data
 * for pilot deployments and demonstrations.
 * 
 * Safe: Only INSERTS data, never updates or deletes existing records.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SeedProgress {
  step: string;
  current: number;
  total: number;
  status: "pending" | "running" | "done" | "error";
  error?: string;
}

export interface SeedResult {
  success: boolean;
  created: Record<string, number>;
  errors: string[];
  durationMs: number;
}

const SEED_STEPS = [
  "vessels",
  "crew_members",
  "voyages",
  "documents",
  "maintenance",
  "certifications",
  "compliance",
] as const;

// ─── Demo Vessels ───────────────────────────────────
const DEMO_VESSELS = [
  { name: "Nauti Explorer", vessel_type: "AHTS", imo_number: "9876543", flag_state: "Brazil", status: "active", gross_tonnage: 4500, year_built: 2018, classification_society: "DNV" },
  { name: "Nauti Pioneer", vessel_type: "PSV", imo_number: "9876544", flag_state: "Panama", status: "active", gross_tonnage: 5200, year_built: 2020, classification_society: "Bureau Veritas" },
  { name: "Nauti Guardian", vessel_type: "OSRV", imo_number: "9876545", flag_state: "Marshall Islands", status: "active", gross_tonnage: 3800, year_built: 2019, classification_society: "Lloyd's Register" },
];

// ─── Demo Crew ──────────────────────────────────────
const DEMO_CREW = [
  { full_name: "Carlos Eduardo Santos", rank: "Master", nationality: "Brazilian", position: "Master" },
  { full_name: "Ricardo Oliveira", rank: "Chief Officer", nationality: "Brazilian", position: "Chief Officer" },
  { full_name: "Fernando Almeida", rank: "2nd Officer", nationality: "Brazilian", position: "2nd Officer" },
  { full_name: "João Paulo Lima", rank: "3rd Officer", nationality: "Brazilian", position: "3rd Officer" },
  { full_name: "Marcos Antônio Silva", rank: "Chief Engineer", nationality: "Brazilian", position: "Chief Engineer" },
  { full_name: "André Rodrigues", rank: "2nd Engineer", nationality: "Brazilian", position: "2nd Engineer" },
  { full_name: "Paulo César Costa", rank: "Bosun", nationality: "Brazilian", position: "Bosun" },
  { full_name: "Rafael Pereira", rank: "AB Seaman", nationality: "Brazilian", position: "AB Seaman" },
  { full_name: "José Manuel Garcia", rank: "Motorman", nationality: "Brazilian", position: "Motorman" },
  { full_name: "Miguel Santos Ferreira", rank: "Cook", nationality: "Brazilian", position: "Cook" },
  { full_name: "James Wilson", rank: "Master", nationality: "British", position: "Master" },
  { full_name: "Erik Johansson", rank: "Chief Engineer", nationality: "Norwegian", position: "Chief Engineer" },
  { full_name: "Renzo Hernandez", rank: "2nd Officer", nationality: "Filipino", position: "2nd Officer" },
  { full_name: "Davi Moreira", rank: "AB Seaman", nationality: "Brazilian", position: "AB Seaman" },
  { full_name: "Lucas Mendes", rank: "3rd Engineer", nationality: "Brazilian", position: "3rd Engineer" },
];

// ─── Demo Voyages ───────────────────────────────────
function generateDemoVoyages(vesselIds: string[]) {
  const ports = ["Santos", "Rio de Janeiro", "Macaé", "Vitória", "Paranaguá", "Rotterdam", "Houston", "Singapore"];
  const voyages = [];
  const now = new Date();

  for (let i = 0; i < vesselIds.length; i++) {
    for (let v = 0; v < 3; v++) {
      const depDate = new Date(now.getTime() - (90 - v * 30) * 86400000);
      const arrDate = new Date(depDate.getTime() + (7 + v * 3) * 86400000);
      voyages.push({
        vessel_id: vesselIds[i],
        voyage_number: `VYG-${2026}-${String(i * 10 + v + 1).padStart(3, "0")}`,
        departure_port: ports[v % ports.length],
        arrival_port: ports[(v + 1) % ports.length],
        departure_date: depDate.toISOString(),
        arrival_date: arrDate.toISOString(),
        status: v === 0 ? "completed" : v === 1 ? "in_progress" : "planned",
        cargo_type: ["Deck Cargo", "Bulk Fuel", "Equipment"][v % 3],
        distance_nm: 250 + v * 100,
      });
    }
  }
  return voyages;
}

// ─── Demo Maintenance Tasks ─────────────────────────
function generateDemoMaintenance(vesselIds: string[]) {
  const tasks = [
    { title: "Main Engine 500h Service", priority: "high", category: "Engine", estimated_hours: 8 },
    { title: "Lifeboat Annual Inspection", priority: "critical", category: "Safety", estimated_hours: 4 },
    { title: "Fire Extinguisher Monthly Check", priority: "medium", category: "Safety", estimated_hours: 2 },
    { title: "Hull Thickness Measurement", priority: "high", category: "Hull", estimated_hours: 12 },
    { title: "Generator #2 Overhaul", priority: "high", category: "Engine", estimated_hours: 24 },
    { title: "Navigation Equipment Calibration", priority: "medium", category: "Navigation", estimated_hours: 6 },
    { title: "Ballast Water Treatment Check", priority: "medium", category: "Environmental", estimated_hours: 3 },
    { title: "Crane Wire Rope Inspection", priority: "critical", category: "Deck", estimated_hours: 4 },
  ];

  return vesselIds.flatMap((vesselId, vi) =>
    tasks.slice(0, 5 + vi).map((t, ti) => ({
      vessel_id: vesselId,
      title: t.title,
      priority: t.priority,
      status: ti < 2 ? "completed" : ti < 4 ? "in_progress" : "pending",
      due_date: new Date(Date.now() + (ti * 7 - 14) * 86400000).toISOString().split("T")[0],
      estimated_hours: t.estimated_hours,
      category: t.category,
    }))
  );
}

// ─── Demo Certifications ────────────────────────────
function generateDemoCertifications(crewMemberIds: string[]) {
  const certs = [
    { certification_name: "STCW Basic Safety", certification_type: "STCW", validity_months: 60 },
    { certification_name: "Advanced Fire Fighting", certification_type: "STCW", validity_months: 60 },
    { certification_name: "Medical First Aid", certification_type: "STCW", validity_months: 60 },
    { certification_name: "GMDSS Operator", certification_type: "GMDSS", validity_months: 60 },
    { certification_name: "DP Operator Certificate", certification_type: "DP", validity_months: 0 },
    { certification_name: "BOSIET/HUET", certification_type: "Safety", validity_months: 48 },
  ];

  return crewMemberIds.slice(0, 8).flatMap((crewId, ci) =>
    certs.slice(0, 3 + (ci % 3)).map((cert) => {
      const issued = new Date(Date.now() - Math.random() * 365 * 2 * 86400000);
      const expiry = cert.validity_months > 0
        ? new Date(issued.getTime() + cert.validity_months * 30 * 86400000)
        : null;
      return {
        crew_member_id: crewId,
        certification_name: cert.certification_name,
        certification_type: cert.certification_type,
        issue_date: issued.toISOString().split("T")[0],
        expiry_date: expiry?.toISOString().split("T")[0] || null,
        status: expiry && expiry < new Date() ? "expired" : "active",
        issuing_authority: ["CIAGA", "Petrobras", "OPITO", "DNV", "Bureau Veritas"][ci % 5],
      };
    })
  );
}

// ─── Main Seeder ────────────────────────────────────
export async function seedDemoData(
  organizationId: string,
  onProgress?: (progress: SeedProgress) => void
): Promise<SeedResult> {
  const start = Date.now();
  const created: Record<string, number> = {};
  const errors: string[] = [];
  const total = SEED_STEPS.length;

  const report = (step: string, current: number, status: SeedProgress["status"], error?: string) => {
    onProgress?.({ step, current, total, status, error });
  };

  try {
    // 1. Vessels
    report("vessels", 1, "running");
    const vesselInserts = DEMO_VESSELS.map(v => ({ ...v, organization_id: organizationId }));
    const { data: vessels, error: vesselErr } = await supabase
      .from("vessels")
      .insert(vesselInserts)
      .select("id");
    if (vesselErr) { errors.push(`Vessels: ${vesselErr.message}`); report("vessels", 1, "error", vesselErr.message); }
    else { created.vessels = vessels.length; report("vessels", 1, "done"); }
    const vesselIds = vessels?.map(v => v.id) || [];

    // 2. Crew Members
    report("crew_members", 2, "running");
    const crewInserts = DEMO_CREW.map((c, idx) => ({
      ...c,
      organization_id: organizationId,
      vessel_id: vesselIds[idx % vesselIds.length] || null,
      status: "on_board" as const,
      employee_id: `DEMO-${Date.now()}-${idx}`,
    }));
    const { data: crew, error: crewErr } = await supabase
      .from("crew_members")
      .insert(crewInserts)
      .select("id");
    if (crewErr) { errors.push(`Crew: ${crewErr.message}`); report("crew_members", 2, "error", crewErr.message); }
    else { created.crew_members = crew.length; report("crew_members", 2, "done"); }
    const crewIds = crew?.map(c => c.id) || [];

    // 3. Voyages
    report("voyages", 3, "running");
    if (vesselIds.length > 0) {
      const voyageInserts = generateDemoVoyages(vesselIds);
      const { data: voyages, error: voyageErr } = await supabase
        .from("voyages")
        .insert(voyageInserts)
        .select("id");
      if (voyageErr) { errors.push(`Voyages: ${voyageErr.message}`); report("voyages", 3, "error", voyageErr.message); }
      else { created.voyages = voyages?.length || 0; report("voyages", 3, "done"); }
    } else {
      report("voyages", 3, "done");
    }

    // 4. Documents (using ai_documents as generic document store)
    report("documents", 4, "running");
    const docInserts = [
      { file_name: "Safety_Management_Manual_v3.pdf", file_type: "application/pdf", storage_path: "demo/safety-manual.pdf", category: "SMS", title: "Safety Management Manual", organization_id: organizationId, ocr_status: "completed" },
      { file_name: "Crew_List_Feb2026.xlsx", file_type: "application/xlsx", storage_path: "demo/crew-list.xlsx", category: "Crew", title: "Crew List - February 2026", organization_id: organizationId, ocr_status: "pending" },
      { file_name: "ISM_Audit_Report_2025.pdf", file_type: "application/pdf", storage_path: "demo/ism-audit.pdf", category: "Audit", title: "ISM Audit Report 2025", organization_id: organizationId, ocr_status: "completed" },
      { file_name: "SOPEP_Plan.pdf", file_type: "application/pdf", storage_path: "demo/sopep.pdf", category: "Environmental", title: "SOPEP Plan", organization_id: organizationId, ocr_status: "completed" },
      { file_name: "Port_State_Control_Santos.pdf", file_type: "application/pdf", storage_path: "demo/psc-santos.pdf", category: "Inspection", title: "PSC Inspection Report - Santos", organization_id: organizationId, ocr_status: "completed" },
    ];
    const { data: docs, error: docErr } = await supabase
      .from("ai_documents")
      .insert(docInserts)
      .select("id");
    if (docErr) { errors.push(`Documents: ${docErr.message}`); report("documents", 4, "error", docErr.message); }
    else { created.documents = docs?.length || 0; report("documents", 4, "done"); }

    // 5. Maintenance Tasks
    report("maintenance", 5, "running");
    if (vesselIds.length > 0) {
      const maintInserts = generateDemoMaintenance(vesselIds);
      const { data: maint, error: maintErr } = await supabase
        .from("maintenance_tasks")
        .insert(maintInserts)
        .select("id");
      if (maintErr) { errors.push(`Maintenance: ${maintErr.message}`); report("maintenance", 5, "error", maintErr.message); }
      else { created.maintenance_tasks = maint?.length || 0; report("maintenance", 5, "done"); }
    } else {
      report("maintenance", 5, "done");
    }

    // 6. Certifications
    report("certifications", 6, "running");
    if (crewIds.length > 0) {
      const certInserts = generateDemoCertifications(crewIds);
      const { data: certs, error: certErr } = await supabase
        .from("crew_certifications")
        .insert(certInserts)
        .select("id");
      if (certErr) { errors.push(`Certifications: ${certErr.message}`); report("certifications", 6, "error", certErr.message); }
      else { created.certifications = certs?.length || 0; report("certifications", 6, "done"); }
    } else {
      report("certifications", 6, "done");
    }

    // 7. Compliance (Action Items)
    report("compliance", 7, "running");
    const actionInserts = [
      { title: "Renovar certificado ISPS", status: "open", priority: "high", source_module: "compliance", organization_id: organizationId, vessel_id: vesselIds[0] || null, due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] },
      { title: "Atualizar plano de contingência SOPEP", status: "open", priority: "medium", source_module: "environmental", organization_id: organizationId, vessel_id: vesselIds[1] || null, due_date: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0] },
      { title: "Realizar drill de abandono", status: "in_progress", priority: "high", source_module: "safety", organization_id: organizationId, vessel_id: vesselIds[0] || null, due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] },
      { title: "Calibrar equipamento de navegação", status: "open", priority: "medium", source_module: "maintenance", organization_id: organizationId, vessel_id: vesselIds[2] || null, due_date: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0] },
    ];
    const { data: actions, error: actionErr } = await supabase
      .from("action_items")
      .insert(actionInserts)
      .select("id");
    if (actionErr) { errors.push(`Compliance: ${actionErr.message}`); report("compliance", 7, "error", actionErr.message); }
    else { created.action_items = actions?.length || 0; report("compliance", 7, "done"); }

  } catch (err) {
    logger.error("[DemoSeeder] Fatal error:", err);
    errors.push(`Fatal: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  return {
    success: errors.length === 0,
    created,
    errors,
    durationMs: Date.now() - start,
  };
}
