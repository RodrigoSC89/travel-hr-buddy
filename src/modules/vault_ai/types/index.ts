/**
 * Types for Vault AI Module
 * Data structures for document management and AI-powered search
 */

export interface VaultDocument {
  id: string;
  nome: string;
  caminho: string;
  tipo?: string;
  tamanho?: number;
  indexadoEm: string;
  conteudo?: string;
}

export interface SearchResult {
  documento: VaultDocument;
  score: number;
  destaque?: string;
}

export interface LLMContext {
  chave: string;
  conteudo: string;
}

export interface VaultIndexData {
  documentos: VaultDocument[];
  ultimaAtualizacao: string;
}
