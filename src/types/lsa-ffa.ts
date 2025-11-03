// LSA & FFA Inspection Types
// Life-Saving Appliances & Fire-Fighting Appliances

export type InspectionType = 'LSA' | 'FFA';

export type ChecklistItemStatus = 'pass' | 'fail' | 'na' | 'pending';

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'observation';

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: ChecklistItemStatus;
  notes?: string;
  evidence?: string[];
  lastChecked?: string;
}

export interface InspectionIssue {
  id: string;
  category: string;
  description: string;
  severity: IssueSeverity;
  location?: string;
  correctiveAction?: string;
  dueDate?: string;
  responsible?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface LSAFFAInspection {
  id: string;
  vessel_id: string;
  inspector: string;
  date: string;
  type: InspectionType;
  checklist: Record<string, ChecklistItem>;
  issues_found: InspectionIssue[];
  score: number;
  ai_notes?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  signature_data?: string;
  signature_validated?: boolean;
  signature_validated_at?: string;
}

export interface InspectionStats {
  totalInspections: number;
  lsaInspections: number;
  ffaInspections: number;
  averageScore: number;
  criticalIssues: number;
  recentInspections: LSAFFAInspection[];
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  riskAssessment: string;
  nextActions: string[];
  confidence: number;
}

// LSA Equipment Categories (SOLAS Chapter III)
export const LSA_CATEGORIES = [
  'Lifeboats',
  'Life Rafts',
  'Rescue Boats',
  'Life Jackets',
  'Immersion Suits',
  'Thermal Protective Aids',
  'Visual Signals',
  'Sound Signals',
  'Line-Throwing Appliances',
  'Emergency Position-Indicating Radio Beacons (EPIRB)',
  'Search and Rescue Transponders (SART)',
  'Lifeboat Equipment',
  'Davits and Launching Arrangements',
] as const;

// FFA Equipment Categories (SOLAS Chapter II-2)
export const FFA_CATEGORIES = [
  'Fire Extinguishers (Portable)',
  'Fire Extinguishers (Fixed)',
  'Fire Hoses and Nozzles',
  'Fire Pumps',
  'Fire Main System',
  'Sprinkler Systems',
  'Fire Detection Systems',
  'Fire Alarm Systems',
  'Emergency Fire Pumps',
  'Fixed Gas Extinguishing Systems',
  'Fixed Foam Systems',
  'Fire Doors and Dampers',
  'Firemen\'s Outfits',
  'Breathing Apparatus',
  'Emergency Escape Breathing Devices (EEBD)',
] as const;

export type LSACategory = typeof LSA_CATEGORIES[number];
export type FFACategory = typeof FFA_CATEGORIES[number];

// Report Export Options
export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'word';
  includeEvidence: boolean;
  includeAINotes: boolean;
  includeSignature: boolean;
  language: 'en' | 'pt' | 'es';
}
