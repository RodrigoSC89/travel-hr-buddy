/**
 * Type definitions for Vault AI module
 */

export interface VaultDocument {
  id: string;
  nome: string;
  caminho: string;
  tipo?: string;
  tamanho?: number;
  dataIndexacao: string;
  tags?: string[];
}

export interface VaultIndex {
  version: string;
  documents: VaultDocument[];
  lastUpdated: string;
}

export interface SearchResult extends VaultDocument {
  relevance: number;
}

export interface LLMContext {
  tipo: string;
  descricao: string;
  keywords: string[];
}

export type MenuOption = "indexer" | "search" | "llm" | null;
