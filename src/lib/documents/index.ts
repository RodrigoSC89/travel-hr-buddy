/**
 * Documents Module Index - PATCH 850
 * Central export for document workflow utilities
 */

export {
  createDocument,
  getDocuments,
  updateDocumentStatus,
  createNewVersion,
  submitForApproval,
  processApproval,
  distributeDocument,
  acknowledgeDocument,
  getApprovalHistory,
  getDistributionRecords,
  calculateChecksum,
  type DocumentCategory,
  type ApprovalStatus,
  type Document,
  type ApprovalStep,
  type DistributionRecord,
} from "./workflow-service";
