/**
 * AI Auditing Assistant - Type Definitions
 * PATCH 636
 * Assistente de voz + LLM para apoio a auditores em tempo real
 */

export type VoiceCommandType =
  | "list_non_conformities"
  | "mark_compliant"
  | "mark_non_compliant"
  | "add_note"
  | "next_section"
  | "previous_section"
  | "get_explanation"
  | "suggest_questions"
  | "summarize_audit"
  | "export_report";

export type AuditSection = 
  | "safety_policy"
  | "company_responsibility"
  | "designated_person"
  | "master_responsibility"
  | "resources_personnel"
  | "ship_operations"
  | "emergency_preparedness"
  | "incident_reporting"
  | "maintenance"
  | "documentation"
  | "company_verification"
  | "certification";

export interface VoiceCommand {
  id: string;
  command_type: VoiceCommandType;
  raw_text: string;
  parsed_intent: string;
  parameters: Record<string, any>;
  confidence_score: number;
  executed: boolean;
  executed_at?: string;
  result?: string;
  timestamp: string;
}

export interface AuditSession {
  id: string;
  audit_id: string;
  vessel_name: string;
  auditor_name: string;
  session_start: string;
  session_end?: string;
  current_section: AuditSection;
  voice_commands_count: number;
  items_checked: number;
  findings_added: number;
  voice_enabled: boolean;
  llm_enabled: boolean;
  status: "active" | "paused" | "completed";
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  message: string;
  audio_url?: string;
  timestamp: string;
  metadata?: {
    section?: AuditSection;
    confidence?: number;
    action_taken?: string;
  };
}

export interface SuggestedQuestion {
  id: string;
  section: AuditSection;
  question: string;
  context: string;
  imo_reference: string;
  priority: "high" | "medium" | "low";
  asked: boolean;
  asked_at?: string;
}

export interface ChecklistMarking {
  item_id: string;
  section: AuditSection;
  marked_by: "voice" | "touch" | "auto";
  compliance_status: "compliant" | "observation" | "non_conformity" | "major_non_conformity";
  voice_transcript?: string;
  notes?: string;
  marked_at: string;
}

export interface AuditScore {
  overall_score: number;
  section_scores: Record<AuditSection, number>;
  compliant_count: number;
  observation_count: number;
  non_conformity_count: number;
  major_non_conformity_count: number;
  completion_percentage: number;
  risk_level: "low" | "medium" | "high" | "critical";
}

export interface VoiceSettings {
  enabled: boolean;
  language: "en-US" | "pt-BR" | "es-ES" | "fr-FR";
  continuous_mode: boolean;
  auto_submit: boolean;
  feedback_voice: boolean;
  wake_word?: string;
  confidence_threshold: number;
}

export interface LLMContext {
  vessel_info: {
    vessel_name: string;
    vessel_type: string;
    vessel_age: number;
    flag_state: string;
  };
  audit_history: {
    last_audit_date?: string;
    last_audit_score?: number;
    common_findings: string[];
  };
  current_progress: {
    sections_completed: number;
    items_checked: number;
    time_elapsed_minutes: number;
  };
}

export interface AssistantResponse {
  message: string;
  suggestions: string[];
  related_items: string[];
  confidence: number;
  audio_url?: string;
}
