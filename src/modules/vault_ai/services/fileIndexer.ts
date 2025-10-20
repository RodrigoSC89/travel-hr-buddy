/**
 * FileIndexer Service
 * Responsible for cataloging and registering documents (PDF, DOCX, TXT)
 */

import { logger } from "@/lib/logger";
import { VaultDocument, VaultIndexData } from "../types";

const VAULT_INDEX_KEY = "vault_index_data";

export class FileIndexer {
  private index: VaultDocument[] = [];

  constructor() {
    this.carregarIndex();
  }

  /**
   * Load index from localStorage
   */
  private carregarIndex(): void {
    try {
      const dados = localStorage.getItem(VAULT_INDEX_KEY);
      if (dados) {
        const parsed: VaultIndexData = JSON.parse(dados);
        this.index = parsed.documentos || [];
        logger.info("Índice do Vault carregado com sucesso", {
          total: this.index.length,
        });
      }
    } catch (error) {
      logger.error("Erro ao carregar índice do Vault", error);
      this.index = [];
    }
  }

  /**
   * Save index to localStorage
   */
  private salvar(): void {
    try {
      const dados: VaultIndexData = {
        documentos: this.index,
        ultimaAtualizacao: new Date().toISOString(),
      };
      localStorage.setItem(VAULT_INDEX_KEY, JSON.stringify(dados));
      logger.info("Índice do Vault salvo com sucesso");
    } catch (error) {
      logger.error("Erro ao salvar índice do Vault", error);
    }
  }

  /**
   * Index a new document
   */
  indexar(caminho: string, nome?: string): boolean {
    if (!caminho || caminho.trim() === "") {
      logger.warn("Caminho do arquivo inválido");
      return false;
    }

    const nomeArquivo = nome || caminho.split("/").pop() || caminho;
    const extensao = nomeArquivo.split(".").pop()?.toLowerCase();

    // Validate file type
    const tiposValidos = ["pdf", "docx", "txt", "doc"];
    if (extensao && !tiposValidos.includes(extensao)) {
      logger.warn("Tipo de arquivo não suportado", { extensao });
      return false;
    }

    const documento: VaultDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nome: nomeArquivo,
      caminho,
      tipo: extensao,
      indexadoEm: new Date().toISOString(),
    };

    this.index.push(documento);
    this.salvar();
    logger.info(`Documento indexado: ${nomeArquivo}`, { id: documento.id });
    return true;
  }

  /**
   * List all indexed documents
   */
  listar(): VaultDocument[] {
    return [...this.index];
  }

  /**
   * Remove a document from index
   */
  remover(id: string): boolean {
    const indexAnterior = this.index.length;
    this.index = this.index.filter((doc) => doc.id !== id);
    if (this.index.length < indexAnterior) {
      this.salvar();
      logger.info("Documento removido do índice", { id });
      return true;
    }
    return false;
  }

  /**
   * Get total count of indexed documents
   */
  getTotal(): number {
    return this.index.length;
  }

  /**
   * Clear all indexed documents
   */
  limpar(): void {
    this.index = [];
    this.salvar();
    logger.info("Índice do Vault limpo");
  }
}
