/**
 * Vault Storage Service
 * LocalStorage-based persistence for document management
 */

import { VaultIndex, VaultDocument, VaultStatistics } from "../types";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "vault_index";
const CURRENT_VERSION = "1.0.0";

/**
 * Initialize or retrieve vault index from localStorage
 */
export function getVaultIndex(): VaultIndex {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const index: VaultIndex = JSON.parse(stored);
      // Migrate if needed
      if (index.version !== CURRENT_VERSION) {
        logger.info("Migrating vault index to version", { version: CURRENT_VERSION });
        index.version = CURRENT_VERSION;
        saveVaultIndex(index);
      }
      return index;
    }
  } catch (error) {
    logger.error("Error reading vault index", error);
  }

  // Return default index
  const defaultIndex: VaultIndex = {
    version: CURRENT_VERSION,
    documents: [],
    lastUpdated: new Date().toISOString(),
  };
  saveVaultIndex(defaultIndex);
  return defaultIndex;
}

/**
 * Save vault index to localStorage
 */
export function saveVaultIndex(index: VaultIndex): void {
  try {
    index.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
    logger.info("Vault index saved", { documentCount: index.documents.length });
  } catch (error) {
    logger.error("Error saving vault index", error);
    throw new Error("Failed to save vault index");
  }
}

/**
 * Add a new document to the vault
 */
export function addDocument(
  nome: string,
  caminho: string,
  tipo?: string,
  tags?: string[]
): VaultDocument {
  const index = getVaultIndex();

  // Check for duplicates
  const duplicate = index.documents.find((doc) => doc.caminho === caminho);
  if (duplicate) {
    throw new Error("Document already exists with this path");
  }

  const newDoc: VaultDocument = {
    id: crypto.randomUUID(),
    nome,
    caminho,
    tipo: tipo || detectFileType(caminho),
    tags: tags || [],
    dataIndexacao: new Date().toISOString(),
  };

  index.documents.push(newDoc);
  saveVaultIndex(index);
  logger.info("Document added to vault", { id: newDoc.id, nome: newDoc.nome });

  return newDoc;
}

/**
 * Remove a document from the vault by ID
 */
export function removeDocument(id: string): boolean {
  const index = getVaultIndex();
  const initialLength = index.documents.length;
  index.documents = index.documents.filter((doc) => doc.id !== id);

  if (index.documents.length < initialLength) {
    saveVaultIndex(index);
    logger.info("Document removed from vault", { id });
    return true;
  }

  return false;
}

/**
 * Get all documents from the vault
 */
export function getAllDocuments(): VaultDocument[] {
  return getVaultIndex().documents;
}

/**
 * Get a single document by ID
 */
export function getDocument(id: string): VaultDocument | undefined {
  const index = getVaultIndex();
  return index.documents.find((doc) => doc.id === id);
}

/**
 * Search documents by name, path, or tags
 */
export function searchDocuments(query: string): VaultDocument[] {
  const index = getVaultIndex();
  const lowerQuery = query.toLowerCase();

  return index.documents.filter((doc) => {
    const nameMatch = doc.nome.toLowerCase().includes(lowerQuery);
    const pathMatch = doc.caminho.toLowerCase().includes(lowerQuery);
    const tagsMatch = doc.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

    return nameMatch || pathMatch || tagsMatch;
  });
}

/**
 * Get vault statistics
 */
export function getStatistics(): VaultStatistics {
  const documents = getAllDocuments();

  // Group by type
  const documentsByType: Record<string, number> = {};
  documents.forEach((doc) => {
    const type = doc.tipo || "unknown";
    documentsByType[type] = (documentsByType[type] || 0) + 1;
  });

  // Find most recent and oldest
  const sorted = [...documents].sort(
    (a, b) => new Date(b.dataIndexacao).getTime() - new Date(a.dataIndexacao).getTime()
  );

  return {
    totalDocuments: documents.length,
    documentsByType,
    mostRecentDocument: sorted[0],
    oldestDocument: sorted[sorted.length - 1],
  };
}

/**
 * Clear all documents from the vault
 */
export function clearVault(): void {
  const index: VaultIndex = {
    version: CURRENT_VERSION,
    documents: [],
    lastUpdated: new Date().toISOString(),
  };
  saveVaultIndex(index);
  logger.info("Vault cleared");
}

/**
 * Auto-detect file type from extension
 */
function detectFileType(caminho: string): string {
  const extension = caminho.split(".").pop()?.toLowerCase();

  const typeMap: Record<string, string> = {
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    txt: "Text",
    md: "Markdown",
    xlsx: "Excel",
    xls: "Excel",
    ppt: "PowerPoint",
    pptx: "PowerPoint",
  };

  return typeMap[extension || ""] || "Unknown";
}
