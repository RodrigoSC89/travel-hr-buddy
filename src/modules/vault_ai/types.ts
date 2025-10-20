/**
 * Types for Nautilus Vault Técnico IA
 * Document management and AI-powered search
 */

export interface DocumentIndex {
  id: string;
  nome: string;
  caminho: string;
  tipo: "PDF" | "DOCX" | "TXT" | "outros";
  dataIndexacao: string;
  tamanho?: number;
}

export interface SearchResult {
  documento: DocumentIndex;
  relevancia: number;
  contexto?: string;
}

export interface VaultContext {
  chave: string;
  conteudo: string;
  categoria: string;
}

export type VaultMenuItem = "1" | "2" | "3" | "0";
