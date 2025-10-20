/**
 * Vault AI Module - Type Definitions
 * TypeScript interfaces for the Nautilus Vault Técnico IA system
 */

/**
 * Document metadata stored in the vault
 */
export interface VaultDocument {
  id: string;
  nome: string;
  caminho: string;
  tipo?: string;
  tags?: string[];
  dataIndexacao: string;
}

/**
 * Vault index structure with versioning
 */
export interface VaultIndex {
  version: string;
  documents: VaultDocument[];
  lastUpdated: string;
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult extends VaultDocument {
  relevance: number;
}

/**
 * Statistics about the vault
 */
export interface VaultStatistics {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  mostRecentDocument?: VaultDocument;
  oldestDocument?: VaultDocument;
}

/**
 * Technical context types for LLM interpretation
 */
export enum TechnicalContext {
  ASOG = "ASOG",
  FMEA = "FMEA",
  IMCA = "IMCA",
  SGSO = "SGSO",
  MTS = "MTS",
  GENERAL = "GENERAL",
}

/**
 * Chat message in LLM interface
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  context?: TechnicalContext;
}

/**
 * Chat history structure
 */
export interface ChatHistory {
  messages: ChatMessage[];
  sessionId: string;
  startedAt: string;
}
