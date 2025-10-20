/**
 * Vault Storage Service
 * Manages document index storage using localStorage
 */

import { VaultDocument, VaultIndexData } from "../types";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "vault_index_data";
const STORAGE_VERSION = "1.0.0";

export class VaultStorage {
  /**
   * Load vault index from storage
   */
  static carregarIndice(): VaultDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        logger.info("Vault: Nenhum índice encontrado, iniciando novo");
        return [];
      }

      const parsed: VaultIndexData = JSON.parse(data);
      logger.info(`Vault: ${parsed.documentos.length} documentos carregados`);
      return parsed.documentos;
    } catch (error) {
      logger.error("Vault: Erro ao carregar índice", error);
      return [];
    }
  }

  /**
   * Save vault index to storage
   */
  static salvarIndice(documentos: VaultDocument[]): void {
    try {
      const data: VaultIndexData = {
        documentos,
        versao: STORAGE_VERSION,
        ultimaAtualizacao: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      logger.info(`Vault: Índice salvo com ${documentos.length} documentos`);
    } catch (error) {
      logger.error("Vault: Erro ao salvar índice", error);
      throw error;
    }
  }

  /**
   * Add document to index
   */
  static adicionarDocumento(documento: VaultDocument): void {
    const documentos = this.carregarIndice();
    documentos.push(documento);
    this.salvarIndice(documentos);
    logger.info(`Vault: Documento '${documento.nome}' adicionado ao índice`);
  }

  /**
   * Remove document from index
   */
  static removerDocumento(id: string): void {
    const documentos = this.carregarIndice();
    const filtered = documentos.filter((doc) => doc.id !== id);
    this.salvarIndice(filtered);
    logger.info(`Vault: Documento removido do índice`);
  }

  /**
   * Clear all documents from index
   */
  static limparIndice(): void {
    localStorage.removeItem(STORAGE_KEY);
    logger.info("Vault: Índice limpo");
  }

  /**
   * Get document by ID
   */
  static obterDocumento(id: string): VaultDocument | null {
    const documentos = this.carregarIndice();
    return documentos.find((doc) => doc.id === id) || null;
  }
}
