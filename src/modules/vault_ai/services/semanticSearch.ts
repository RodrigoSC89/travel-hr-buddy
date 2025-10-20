/**
 * SemanticSearch Service
 * Contextual search with semantic matching (local vectorized base)
 */

import { logger } from "@/lib/logger";
import { VaultDocument, SearchResult } from "../types";

export class SemanticSearch {
  private documentos: VaultDocument[] = [];

  constructor(documentos: VaultDocument[]) {
    this.documentos = documentos;
  }

  /**
   * Simple string similarity calculation (Levenshtein-like)
   */
  private calcularSimilaridade(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Exact match
    if (s1 === s2) return 1.0;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Word overlap
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter((w) => words2.includes(w));
    if (commonWords.length > 0) {
      return commonWords.length / Math.max(words1.length, words2.length);
    }

    // Character overlap
    const chars1 = new Set(s1);
    const chars2 = new Set(s2);
    const commonChars = [...chars1].filter((c) => chars2.has(c));
    return commonChars.length / Math.max(chars1.size, chars2.size);
  }

  /**
   * Search for documents matching the term
   */
  buscar(termo: string, limite = 5, cutoff = 0.2): SearchResult[] {
    if (!termo || termo.trim() === "") {
      logger.warn("Termo de busca vazio");
      return [];
    }

    logger.info(`Busca semântica executada: ${termo}`);

    // Calculate scores for all documents
    const resultados: SearchResult[] = this.documentos
      .map((doc) => {
        const scoreNome = this.calcularSimilaridade(doc.nome, termo);
        const scoreCaminho = this.calcularSimilaridade(doc.caminho, termo);
        const score = Math.max(scoreNome, scoreCaminho * 0.7);

        return {
          documento: doc,
          score,
          destaque:
            scoreNome > scoreCaminho
              ? `Nome: ${doc.nome}`
              : `Caminho: ${doc.caminho}`,
        };
      })
      .filter((resultado) => resultado.score >= cutoff)
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);

    logger.info(`Busca retornou ${resultados.length} resultados`);
    return resultados;
  }

  /**
   * Search by document type
   */
  buscarPorTipo(tipo: string): VaultDocument[] {
    return this.documentos.filter(
      (doc) => doc.tipo?.toLowerCase() === tipo.toLowerCase()
    );
  }

  /**
   * Search by keywords in document name
   */
  buscarPorPalavrasChave(palavras: string[]): VaultDocument[] {
    const palavrasLower = palavras.map((p) => p.toLowerCase());
    return this.documentos.filter((doc) =>
      palavrasLower.some((palavra) => doc.nome.toLowerCase().includes(palavra))
    );
  }

  /**
   * Update document list
   */
  atualizarDocumentos(documentos: VaultDocument[]): void {
    this.documentos = documentos;
  }
}
