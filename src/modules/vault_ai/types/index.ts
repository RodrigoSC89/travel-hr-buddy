/**
 * Types for Vault AI Module
 * Nautilus One Technical Vault System
 */

export interface VaultDocument {
  id: string;
  nome: string;
  caminho: string;
  tipo?: string;
  tamanho?: number;
  dataIndexacao: string;
  conteudo?: string;
}

export interface SearchResult {
  documento: VaultDocument;
  relevancia: number;
}

export interface LLMContext {
  chave: string;
  conteudo: string;
  descricao: string;
}

export interface VaultIndexData {
  documentos: VaultDocument[];
  versao: string;
  ultimaAtualizacao: string;
}
