/**
 * MARPOL Tracker - Shared types and constants
 */
import {
  Droplets, Fuel, FileText, Trash2, Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MARPOLAnnex {
  number: string;
  title: string;
  icon: LucideIcon;
  description: string;
  requirements: string[];
  specialAreas: string[];
  categories?: WasteCategory[];
}

export interface WasteCategory {
  code: string;
  name: string;
  discharge: string;
  color: string;
}

export interface WasteLog {
  id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  date: string;
  method: string;
  certificate: string;
  recordBook: string;
  coordinates: string;
  distanceFromShore: number;
}

export interface TankData {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  unit: string;
  percentage: number;
  status: "critical" | "warning" | "ok";
  lastUpdated: string;
}

export interface EmissionsData {
  sox: number;
  nox: number;
  co2: number;
  pm: number;
  fuelType: string;
  sulphurContent: number;
}

export interface MARPOLAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  time: string;
  type: string;
}

export interface MARPOLVessel {
  id: string;
  name: string;
  vessel_type: string | null;
  status: string;
  imo_number: string | null;
  certificates: number;
  expiringSoon: number;
  overallStatus: string;
}

export interface ComplianceScores {
  overall: number;
  annexI: number;
  annexII: number;
  annexIII: number;
  annexIV: number;
  annexV: number;
  annexVI: number;
  [key: string]: number;
}

export const MARPOL_ANNEXES: MARPOLAnnex[] = [
  {
    number: "I", title: "Prevenção de Poluição por Óleo", icon: Droplets,
    description: "Regulamentos sobre descarga de óleo, resíduos oleosos, operações de lastro e separação de água oleosa",
    requirements: ["Oil Record Book (ORB Part I & II)", "Separador de Água Oleosa (OWS) 15 ppm", "Certificado IOPP", "SOPEP (Shipboard Oil Pollution Emergency Plan)", "Tanque de Resíduos Oleosos", "Oil Content Monitor (OCM)"],
    specialAreas: ["Mediterrâneo", "Báltico", "Mar Negro", "Golfo Pérsico", "Antártica"],
  },
  {
    number: "II", title: "Substâncias Nocivas Líquidas (NLS)", icon: Fuel,
    description: "Controle de poluição por substâncias nocivas líquidas a granel (Categorias X, Y, Z, OS)",
    requirements: ["Cargo Record Book", "Procedimentos P&A (Prewash & Acceptance)", "Manual de Procedimentos e Arranjos", "Certificado NLS"],
    specialAreas: ["Báltico", "Antártica"],
  },
  {
    number: "III", title: "Substâncias Nocivas Embaladas", icon: FileText,
    description: "Prevenção de poluição por substâncias nocivas transportadas em embalagens, contêineres ou tanques portáteis",
    requirements: ["Documentação IMDG Code", "Certificado de Estiva e Segregação", "Treinamento da Equipe", "Plano de Emergência"],
    specialAreas: [],
  },
  {
    number: "IV", title: "Prevenção de Poluição por Esgoto", icon: Trash2,
    description: "Regulamentos sobre descarga de esgoto sanitário, incluindo sistemas de tratamento e retenção",
    requirements: ["Sistema de Tratamento Certificado (STP)", "Certificado ISPP", "Registros de Descarga", "Tanque de Retenção", "Conexão Padrão de Descarga"],
    specialAreas: ["Báltico (Special Area)"],
  },
  {
    number: "V", title: "Prevenção de Poluição por Lixo", icon: Trash2,
    description: "Gestão e descarte de resíduos sólidos - Categorias A-J conforme resolução MEPC.295(71)",
    requirements: ["Garbage Record Book (GRB)", "Plano de Gestão de Lixo (GMP)", "Placards Visíveis (≥12m)", "Treinamento da Equipe", "Compactador/Incinerador", "Procedimentos de Segregação"],
    specialAreas: ["Mediterrâneo", "Báltico", "Mar Negro", "Golfo Pérsico", "Mar do Norte", "Antártica", "Golfo do México", "Grande Barreira de Coral"],
    categories: [
      { code: "A", name: "Plásticos", discharge: "Proibido em qualquer área", color: "destructive" },
      { code: "B", name: "Resíduos Alimentares", discharge: ">12nm da costa (triturado >3nm)", color: "warning" },
      { code: "C", name: "Resíduos Domésticos", discharge: ">12nm da costa", color: "warning" },
      { code: "D", name: "Óleo de Cozinha", discharge: ">12nm da costa", color: "warning" },
      { code: "E", name: "Cinzas de Incinerador", discharge: ">12nm da costa", color: "secondary" },
      { code: "F", name: "Resíduos Operacionais", discharge: ">12nm da costa", color: "secondary" },
      { code: "G", name: "Carcaça Animal", discharge: ">100nm e máx. profundidade", color: "destructive" },
      { code: "H", name: "Agentes de Pesca", discharge: "Descarga permitida", color: "default" },
      { code: "I", name: "E-Waste", discharge: "Somente em porto", color: "destructive" },
      { code: "J", name: "Resíduos de Carga (HME)", discharge: ">12nm (não HME)", color: "warning" },
    ],
  },
  {
    number: "VI", title: "Prevenção de Poluição Atmosférica", icon: Wind,
    description: "Controle de emissões SOx, NOx, GHG, substâncias depletoras de ozônio e compostos orgânicos voláteis",
    requirements: ["Certificado IAPP", "Combustível ≤0.50% S (Global Cap 2020)", "Bunker Delivery Notes (BDN)", "SEEMP (Ship Energy Efficiency Management Plan)", "CII Rating Monitorado", "EEXI Calculado", "Registro de ODS"],
    specialAreas: ["ECA Báltico (0.10% S)", "ECA Mar do Norte (0.10% S)", "ECA América do Norte (0.10% S)", "ECA Caribe US (0.10% S)"],
  },
];

export const WASTE_CATEGORIES = MARPOL_ANNEXES[4].categories || [];

export const SPECIAL_ZONES = [
  { name: "Báltico (HELCOM)", annexes: ["I", "II", "IV", "V", "VI"], restrictions: "SOx ≤0.10%, descarga zero de esgoto, restrições severas de lixo", risk: "critical" as const },
  { name: "Mediterrâneo", annexes: ["I", "V"], restrictions: "Descarga de óleo proibida, restrições de lixo", risk: "high" as const },
  { name: "Mar do Norte", annexes: ["I", "V", "VI"], restrictions: "ECA - SOx ≤0.10%, restrições de descarga", risk: "high" as const },
  { name: "Antártica", annexes: ["I", "II", "IV", "V"], restrictions: "Descarga zero, proteção total do ecossistema", risk: "critical" as const },
  { name: "Golfo Pérsico (ROPME)", annexes: ["I", "V"], restrictions: "Área sensível - restrições elevadas", risk: "medium" as const },
  { name: "ECA América do Norte", annexes: ["VI"], restrictions: "SOx ≤0.10%, NOx Tier III", risk: "high" as const },
  { name: "ECA Caribe US", annexes: ["VI"], restrictions: "SOx ≤0.10%, NOx Tier III", risk: "medium" as const },
  { name: "Grande Barreira de Coral", annexes: ["V"], restrictions: "Proteção especial, descarga restrita", risk: "critical" as const },
];

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function await_toast() {
  // Lazy import to avoid circular deps
  return { toast: (..._args: unknown[]) => {} };
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    critical: "text-destructive", warning: "text-warning", ok: "text-success",
    compliant: "text-success", pending: "text-warning", at_risk: "text-destructive",
  };
  return map[status] || "text-muted-foreground";
}

export function getStatusBadgeConfig(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    compliant: { label: "Conforme", variant: "default" },
    pending: { label: "Pendente", variant: "secondary" },
    at_risk: { label: "Em Risco", variant: "destructive" },
    ok: { label: "OK", variant: "default" },
    warning: { label: "Atenção", variant: "secondary" },
    critical: { label: "Crítico", variant: "destructive" },
  };
  return config[status] || config.pending;
}
