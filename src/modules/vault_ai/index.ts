/**
 * Vault AI Module
 * Export all public components and services
 */

export { default as VaultCore } from "./components/VaultCore";
export { default as FileIndexer } from "./components/FileIndexer";
export { default as SemanticSearch } from "./components/SemanticSearch";
export { default as LLMInterface } from "./components/LLMInterface";

export { VaultStorage } from "./services/vaultStorage";

export type {
  VaultDocument,
  SearchResult,
  LLMContext,
  VaultIndexData,
} from "./types";
