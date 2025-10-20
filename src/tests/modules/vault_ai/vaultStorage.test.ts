/**
 * VaultStorage Service Tests
 * Comprehensive test suite for vault_ai storage functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getVaultIndex,
  saveVaultIndex,
  addDocument,
  getAllDocuments,
  getDocumentById,
  removeDocument,
  searchDocuments,
  clearVault,
  getVaultStats,
} from "@/modules/vault_ai/services/vaultStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("VaultStorage Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getVaultIndex", () => {
    it("should return initialized index when localStorage is empty", () => {
      const index = getVaultIndex();
      
      expect(index).toBeDefined();
      expect(index.version).toBe("1.0.0");
      expect(index.documents).toEqual([]);
      expect(index.lastUpdated).toBeDefined();
    });

    it("should return stored index from localStorage", () => {
      const mockIndex = {
        version: "1.0.0",
        documents: [
          {
            id: "123",
            nome: "Test Doc",
            caminho: "/test/path",
            dataIndexacao: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("nautilus_vault_index", JSON.stringify(mockIndex));

      const index = getVaultIndex();
      expect(index.documents).toHaveLength(1);
      expect(index.documents[0].nome).toBe("Test Doc");
    });

    it("should reinitialize on version mismatch", () => {
      const oldVersionIndex = {
        version: "0.9.0",
        documents: [{ id: "1", nome: "Old Doc", caminho: "/old", dataIndexacao: new Date().toISOString() }],
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("nautilus_vault_index", JSON.stringify(oldVersionIndex));

      const index = getVaultIndex();
      expect(index.documents).toEqual([]);
      expect(index.version).toBe("1.0.0");
    });
  });

  describe("saveVaultIndex", () => {
    it("should save index to localStorage", () => {
      const index = getVaultIndex();
      index.documents.push({
        id: "test-1",
        nome: "Manual",
        caminho: "/docs/manual.pdf",
        dataIndexacao: new Date().toISOString(),
      });

      const result = saveVaultIndex(index);
      expect(result).toBe(true);

      const stored = localStorage.getItem("nautilus_vault_index");
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.documents).toHaveLength(1);
    });
  });

  describe("addDocument", () => {
    it("should add a new document", () => {
      const doc = addDocument({
        nome: "FMEA Manual",
        caminho: "/docs/fmea.pdf",
        tipo: "PDF",
      });

      expect(doc).toBeDefined();
      expect(doc?.nome).toBe("FMEA Manual");
      expect(doc?.id).toBeDefined();
      expect(doc?.dataIndexacao).toBeDefined();
    });

    it("should not add duplicate documents", () => {
      addDocument({
        nome: "Test Doc",
        caminho: "/docs/test.pdf",
      });

      const duplicate = addDocument({
        nome: "Test Doc Duplicate",
        caminho: "/docs/test.pdf",
      });

      expect(duplicate).toBeNull();
      
      const docs = getAllDocuments();
      expect(docs).toHaveLength(1);
    });

    it("should generate unique IDs for documents", () => {
      const doc1 = addDocument({ nome: "Doc 1", caminho: "/doc1.pdf" });
      const doc2 = addDocument({ nome: "Doc 2", caminho: "/doc2.pdf" });

      expect(doc1?.id).not.toBe(doc2?.id);
    });
  });

  describe("getAllDocuments", () => {
    it("should return empty array when no documents", () => {
      const docs = getAllDocuments();
      expect(docs).toEqual([]);
    });

    it("should return all documents", () => {
      addDocument({ nome: "Doc 1", caminho: "/doc1.pdf" });
      addDocument({ nome: "Doc 2", caminho: "/doc2.pdf" });
      addDocument({ nome: "Doc 3", caminho: "/doc3.pdf" });

      const docs = getAllDocuments();
      expect(docs).toHaveLength(3);
    });
  });

  describe("getDocumentById", () => {
    it("should return document by ID", () => {
      const added = addDocument({ nome: "Test Doc", caminho: "/test.pdf" });
      
      const found = getDocumentById(added!.id);
      expect(found).toBeDefined();
      expect(found?.nome).toBe("Test Doc");
    });

    it("should return null for non-existent ID", () => {
      const found = getDocumentById("non-existent-id");
      expect(found).toBeNull();
    });
  });

  describe("removeDocument", () => {
    it("should remove document by ID", () => {
      const doc = addDocument({ nome: "To Remove", caminho: "/remove.pdf" });
      
      const result = removeDocument(doc!.id);
      expect(result).toBe(true);

      const docs = getAllDocuments();
      expect(docs).toHaveLength(0);
    });

    it("should return false for non-existent ID", () => {
      const result = removeDocument("non-existent-id");
      expect(result).toBe(false);
    });

    it("should only remove specified document", () => {
      const doc1 = addDocument({ nome: "Keep", caminho: "/keep.pdf" });
      const doc2 = addDocument({ nome: "Remove", caminho: "/remove.pdf" });

      removeDocument(doc2!.id);

      const docs = getAllDocuments();
      expect(docs).toHaveLength(1);
      expect(docs[0].id).toBe(doc1!.id);
    });
  });

  describe("searchDocuments", () => {
    beforeEach(() => {
      addDocument({ 
        nome: "FMEA Analysis Report", 
        caminho: "/docs/fmea/report.pdf",
        tags: ["fmea", "analysis", "safety"]
      });
      addDocument({ 
        nome: "ASOG Manual v3.2", 
        caminho: "/manuals/asog-v3.2.pdf",
        tags: ["asog", "operating", "guidelines"]
      });
      addDocument({ 
        nome: "IMCA Safety Guidelines", 
        caminho: "/docs/imca/safety.pdf",
        tags: ["imca", "safety", "maritime"]
      });
    });

    it("should find documents by name", () => {
      const results = searchDocuments("fmea");
      expect(results).toHaveLength(1);
      expect(results[0].nome).toContain("FMEA");
    });

    it("should find documents by path", () => {
      const results = searchDocuments("manuals");
      expect(results).toHaveLength(1);
      expect(results[0].caminho).toContain("manuals");
    });

    it("should find documents by tags", () => {
      const results = searchDocuments("safety");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should be case insensitive", () => {
      const results1 = searchDocuments("FMEA");
      const results2 = searchDocuments("fmea");
      expect(results1).toHaveLength(results2.length);
    });

    it("should return empty array when no matches", () => {
      const results = searchDocuments("nonexistent");
      expect(results).toEqual([]);
    });

    it("should handle partial matches", () => {
      const results = searchDocuments("guide");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("clearVault", () => {
    it("should clear all documents", () => {
      addDocument({ nome: "Doc 1", caminho: "/doc1.pdf" });
      addDocument({ nome: "Doc 2", caminho: "/doc2.pdf" });

      const result = clearVault();
      expect(result).toBe(true);

      const docs = getAllDocuments();
      expect(docs).toEqual([]);
    });

    it("should reinitialize index structure", () => {
      addDocument({ nome: "Doc", caminho: "/doc.pdf" });
      clearVault();

      const index = getVaultIndex();
      expect(index.version).toBe("1.0.0");
      expect(index.documents).toEqual([]);
    });
  });

  describe("getVaultStats", () => {
    it("should return correct stats for empty vault", () => {
      const stats = getVaultStats();
      
      expect(stats.totalDocuments).toBe(0);
      expect(stats.version).toBe("1.0.0");
      expect(stats.lastUpdated).toBeDefined();
    });

    it("should return correct document count", () => {
      addDocument({ nome: "Doc 1", caminho: "/doc1.pdf" });
      addDocument({ nome: "Doc 2", caminho: "/doc2.pdf" });
      addDocument({ nome: "Doc 3", caminho: "/doc3.pdf" });

      const stats = getVaultStats();
      expect(stats.totalDocuments).toBe(3);
    });
  });
});
