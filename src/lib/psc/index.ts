/**
 * PSC Module Index - PATCH 850
 * Central export for PSC inspection utilities
 */

export {
  createInspection,
  getVesselInspections,
  addDeficiency,
  getDeficiencies,
  updateDeficiencyStatus,
  calculateRiskScore,
  getRequiredDocuments,
  generatePDFPackage,
  generateZIPPackage,
  exportInspectionsCSV,
  type PSCInspection,
  type PSCDeficiency,
} from "./package-generator";
