/**
 * Tests for VaultStorage service
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { VaultStorage } from "@/modules/vault_ai/services/vaultStorage";
import type { VaultDocument } from "@/modules/vault_ai/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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

describe("VaultStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("carregarIndice", () => {
    it("should return empty array when no data exists", () => {
      const result = VaultStorage.carregarIndice();
      expect(result).toEqual([]);
    });

    it("should load documents from localStorage", () => {
      const mockDocuments: VaultDocument[] = [
        {
          id: "1",
          nome: "Test Document",
          caminho: "/test/path",
          dataIndexacao: new Date().toISOString(),
        },
      ];

      localStorageMock.setItem(
        "vault_index_data",
        JSON.stringify({
          documentos: mockDocuments,
          versao: "1.0.0",
          ultimaAtualizacao: new Date().toISOString(),
        })
      );

      const result = VaultStorage.carregarIndice();
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe("Test Document");
    });

    it("should handle corrupted data gracefully", () => {
      localStorageMock.setItem("vault_index_data", "invalid json");
      const result = VaultStorage.carregarIndice();
      expect(result).toEqual([]);
    });
  });

  describe("salvarIndice", () => {
    it("should save documents to localStorage", () => {
      const mockDocuments: VaultDocument[] = [
        {
          id: "1",
          nome: "Test Document",
          caminho: "/test/path",
          dataIndexacao: new Date().toISOString(),
        },
      ];

      VaultStorage.salvarIndice(mockDocuments);

      const saved = localStorageMock.getItem("vault_index_data");
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.documentos).toHaveLength(1);
      expect(parsed.documentos[0].nome).toBe("Test Document");
      expect(parsed.versao).toBe("1.0.0");
    });
  });

  describe("adicionarDocumento", () => {
    it("should add a new document to the index", () => {
      const newDoc: VaultDocument = {
        id: "1",
        nome: "New Document",
        caminho: "/new/path",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(newDoc);

      const documents = VaultStorage.carregarIndice();
      expect(documents).toHaveLength(1);
      expect(documents[0].nome).toBe("New Document");
    });

    it("should add to existing documents", () => {
      const firstDoc: VaultDocument = {
        id: "1",
        nome: "First Document",
        caminho: "/first/path",
        dataIndexacao: new Date().toISOString(),
      };

      const secondDoc: VaultDocument = {
        id: "2",
        nome: "Second Document",
        caminho: "/second/path",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(firstDoc);
      VaultStorage.adicionarDocumento(secondDoc);

      const documents = VaultStorage.carregarIndice();
      expect(documents).toHaveLength(2);
    });
  });

  describe("removerDocumento", () => {
    it("should remove a document by ID", () => {
      const doc: VaultDocument = {
        id: "test-id",
        nome: "Test Document",
        caminho: "/test/path",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(doc);
      expect(VaultStorage.carregarIndice()).toHaveLength(1);

      VaultStorage.removerDocumento("test-id");
      expect(VaultStorage.carregarIndice()).toHaveLength(0);
    });

    it("should not affect other documents", () => {
      const doc1: VaultDocument = {
        id: "id-1",
        nome: "Document 1",
        caminho: "/path/1",
        dataIndexacao: new Date().toISOString(),
      };

      const doc2: VaultDocument = {
        id: "id-2",
        nome: "Document 2",
        caminho: "/path/2",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(doc1);
      VaultStorage.adicionarDocumento(doc2);

      VaultStorage.removerDocumento("id-1");

      const remaining = VaultStorage.carregarIndice();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe("id-2");
    });
  });

  describe("limparIndice", () => {
    it("should clear all documents", () => {
      const doc: VaultDocument = {
        id: "1",
        nome: "Test Document",
        caminho: "/test/path",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(doc);
      expect(VaultStorage.carregarIndice()).toHaveLength(1);

      VaultStorage.limparIndice();
      expect(VaultStorage.carregarIndice()).toHaveLength(0);
    });
  });

  describe("obterDocumento", () => {
    it("should return document by ID", () => {
      const doc: VaultDocument = {
        id: "test-id",
        nome: "Test Document",
        caminho: "/test/path",
        dataIndexacao: new Date().toISOString(),
      };

      VaultStorage.adicionarDocumento(doc);

      const result = VaultStorage.obterDocumento("test-id");
      expect(result).toBeTruthy();
      expect(result?.nome).toBe("Test Document");
    });

    it("should return null for non-existent ID", () => {
      const result = VaultStorage.obterDocumento("non-existent");
      expect(result).toBeNull();
    });
  });
});
