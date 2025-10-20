/**
 * VaultStorage Service
 * LocalStorage-based document management for Vault AI
 */

import { logger } from "@/lib/logger";
import type { VaultDocument, VaultIndex } from "../types";

const STORAGE_KEY = "nautilus_vault_index";
const STORAGE_VERSION = "1.0.0";

/**
 * Initialize vault index structure
 */
function initializeIndex(): VaultIndex {
  return {
    version: STORAGE_VERSION,
    documents: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get vault index from localStorage
 */
export function getVaultIndex(): VaultIndex {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initializeIndex();
    }
    
    const index = JSON.parse(stored) as VaultIndex;
    
    // Validate version compatibility
    if (index.version !== STORAGE_VERSION) {
      logger.warn("Vault index version mismatch, reinitializing");
      return initializeIndex();
    }
    
    return index;
  } catch (error) {
    logger.error("Error loading vault index", error);
    return initializeIndex();
  }
}

/**
 * Save vault index to localStorage
 */
export function saveVaultIndex(index: VaultIndex): boolean {
  try {
    index.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
    logger.info("Vault index saved successfully");
    return true;
  } catch (error) {
    logger.error("Error saving vault index", error);
    return false;
  }
}

/**
 * Add a document to the vault
 */
export function addDocument(document: Omit<VaultDocument, "id" | "dataIndexacao">): VaultDocument | null {
  try {
    const index = getVaultIndex();
    
    // Check for duplicates
    const exists = index.documents.some(doc => doc.caminho === document.caminho);
    if (exists) {
      logger.warn("Document already exists in vault", { caminho: document.caminho });
      return null;
    }
    
    const newDoc: VaultDocument = {
      ...document,
      id: crypto.randomUUID(),
      dataIndexacao: new Date().toISOString(),
    };
    
    index.documents.push(newDoc);
    
    if (saveVaultIndex(index)) {
      logger.info("Document added to vault", { nome: newDoc.nome });
      return newDoc;
    }
    
    return null;
  } catch (error) {
    logger.error("Error adding document", error);
    return null;
  }
}

/**
 * Get all documents from vault
 */
export function getAllDocuments(): VaultDocument[] {
  const index = getVaultIndex();
  return index.documents;
}

/**
 * Get a document by ID
 */
export function getDocumentById(id: string): VaultDocument | null {
  const index = getVaultIndex();
  return index.documents.find(doc => doc.id === id) || null;
}

/**
 * Remove a document from vault
 */
export function removeDocument(id: string): boolean {
  try {
    const index = getVaultIndex();
    const initialLength = index.documents.length;
    
    index.documents = index.documents.filter(doc => doc.id !== id);
    
    if (index.documents.length < initialLength) {
      if (saveVaultIndex(index)) {
        logger.info("Document removed from vault", { id });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error("Error removing document", error);
    return false;
  }
}

/**
 * Search documents by term (fuzzy matching)
 */
export function searchDocuments(termo: string): VaultDocument[] {
  try {
    const index = getVaultIndex();
    const searchTerm = termo.toLowerCase();
    
    // Simple fuzzy search - check if term is in name, path, or tags
    const results = index.documents.filter(doc => {
      const inName = doc.nome.toLowerCase().includes(searchTerm);
      const inPath = doc.caminho.toLowerCase().includes(searchTerm);
      const inTags = doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
      
      return inName || inPath || inTags;
    });
    
    logger.info("Search executed", { termo, resultsCount: results.length });
    return results;
  } catch (error) {
    logger.error("Error searching documents", error);
    return [];
  }
}

/**
 * Clear all vault data
 */
export function clearVault(): boolean {
  try {
    const index = initializeIndex();
    if (saveVaultIndex(index)) {
      logger.info("Vault cleared successfully");
      return true;
    }
    return false;
  } catch (error) {
    logger.error("Error clearing vault", error);
    return false;
  }
}

/**
 * Get vault statistics
 */
export function getVaultStats() {
  const index = getVaultIndex();
  
  return {
    totalDocuments: index.documents.length,
    lastUpdated: index.lastUpdated,
    version: index.version,
  };
}
