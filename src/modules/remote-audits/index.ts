/**
 * PATCH 606 - Remote Audits Module Index
 * Remote audit system with LLM-powered evidence validation
 */

export { RemoteChecklistForm } from "./components/RemoteChecklistForm";
export { OCRExtractor } from "./services/OCRExtractor";
export { LLMEvidenceValidator } from "./services/LLMEvidenceValidator";
export { EvidenceUploadService } from "./services/EvidenceUploadService";
export type {
  RemoteAudit,
  RemoteAuditChecklistItem,
  RemoteAuditEvidence,
  AuditReport,
  AuditStatus,
  ChecklistResponse,
  EvidenceVerificationStatus,
  AIChecklistValidation,
  AIEvidenceAnalysis,
  OCRResult
} from "./types";
