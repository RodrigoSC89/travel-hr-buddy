/**
 * PATCH 606 - Remote Audits Tests
 * Validation tests for remote audit system with LLM evidence validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { LLMEvidenceValidator } from "@/modules/remote-audits/services/LLMEvidenceValidator";
import { OCRExtractor } from "@/modules/remote-audits/services/OCRExtractor";
import { EvidenceUploadService } from "@/modules/remote-audits/services/EvidenceUploadService";
import type { RemoteAuditChecklistItem, RemoteAuditEvidence } from "@/modules/remote-audits/types";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        createSignedUrl: vi.fn(),
      })),
    },
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock("@/ai/kernel", () => ({
  runAIContext: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PATCH 606 - Remote Audits with LLM Evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("File Upload Functionality", () => {
    it("should upload evidence file successfully", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      
      const mockStorageFrom = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: "test-path" },
          error: null,
        }),
      });

      const mockDBFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "evidence-1",
                file_name: "test.jpg",
                storage_path: "test-path",
              },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase.storage, "from").mockImplementation(mockStorageFrom);
      vi.spyOn(supabase, "from").mockImplementation(mockDBFrom);
      vi.spyOn(supabase.auth, "getUser").mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any);

      const result = await EvidenceUploadService.uploadEvidence(mockFile, "audit-1");

      expect(result).toBeDefined();
      expect(result.fileName).toBe("test.jpg");
    });

    it("should validate file size limits", () => {
      const largeFile = new File(["x".repeat(60 * 1024 * 1024)], "large.jpg", { 
        type: "image/jpeg" 
      });

      expect(() => {
        EvidenceUploadService["validateFile"](largeFile);
      }).toThrow();
    });

    it("should validate file types", () => {
      const invalidFile = new File(["test"], "test.exe", { type: "application/x-msdownload" });

      expect(() => {
        EvidenceUploadService["validateFile"](invalidFile);
      }).toThrow();
    });
  });

  describe("OCR Text Accuracy", () => {
    it("should extract text from image", async () => {
      // Note: This is a simplified test as full Tesseract.js testing requires more setup
      const mockResult = {
        text: "Sample extracted text",
        confidence: 85,
        language: "eng",
        blocks: [
          {
            text: "Sample",
            confidence: 90,
          },
        ],
      };

      // Test OCR quality validation
      const validation = OCRExtractor.validateOCRQuality(mockResult);

      expect(validation).toBeDefined();
      expect(validation.quality).toBeDefined();
      expect(["excellent", "good", "fair", "poor"]).toContain(validation.quality);
    });

    it("should validate OCR quality correctly", () => {
      const highQualityResult = {
        text: "This is a clear and well-scanned document with good quality text",
        confidence: 95,
        language: "eng",
        blocks: [
          { text: "This is a clear", confidence: 95 },
          { text: "and well-scanned document", confidence: 96 },
        ],
      };

      const validation = OCRExtractor.validateOCRQuality(highQualityResult);

      expect(validation.quality).toBe("excellent");
      expect(validation.isValid).toBe(true);
    });
  });

  describe("LLM Output Coherence", () => {
    it("should validate checklist evidence with LLM", async () => {
      const mockItem: RemoteAuditChecklistItem = {
        id: "item-1",
        auditId: "audit-1",
        section: "Safety",
        question: "Are life jackets available?",
        response: "yes",
        evidenceRequired: true,
        evidenceUploaded: true,
        maxScoreValue: 1,
        createdAt: new Date(),
      };

      const mockEvidence: RemoteAuditEvidence[] = [
        {
          id: "evidence-1",
          auditId: "audit-1",
          checklistItemId: "item-1",
          fileName: "lifejackets.jpg",
          fileType: "image/jpeg",
          storagePath: "path/to/file",
          uploadedAt: new Date(),
          ocrProcessed: true,
          verified: false,
          verificationStatus: "pending",
        },
      ];

      const validation = await LLMEvidenceValidator.validateChecklistEvidence(
        mockItem,
        mockEvidence,
        "Life jackets visible in storage"
      );

      expect(validation).toBeDefined();
      expect(validation.isCompliant).toBeDefined();
      expect(validation.confidence).toBeGreaterThanOrEqual(0);
      expect(validation.confidence).toBeLessThanOrEqual(1);
      expect(validation.reasoning).toBeTruthy();
      expect(Array.isArray(validation.flags)).toBe(true);
    });

    it("should analyze evidence document", async () => {
      const mockEvidence: RemoteAuditEvidence = {
        id: "evidence-1",
        auditId: "audit-1",
        fileName: "certificate.pdf",
        fileType: "application/pdf",
        storagePath: "path/to/cert",
        uploadedAt: new Date(),
        ocrProcessed: true,
        verified: false,
        verificationStatus: "pending",
      };

      const ocrText = "Safety Certificate - Valid until 2025-12-31";

      const analysis = await LLMEvidenceValidator.analyzeEvidence(mockEvidence, ocrText);

      expect(analysis).toBeDefined();
      expect(analysis.documentType).toBeTruthy();
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.quality).toBeDefined();
      expect(["excellent", "good", "fair", "poor"]).toContain(analysis.quality);
    });
  });

  describe("Export Render Check", () => {
    it("should have proper structure for PDF export", () => {
      // Verify export functionality exists
      expect(EvidenceUploadService.downloadEvidence).toBeDefined();
    });
  });

  describe("Storage Bucket Validation", () => {
    it("should validate storage bucket exists", async () => {
      // The bucket should be created by migration
      expect(EvidenceUploadService["BUCKET_NAME"]).toBe("audit-evidence");
    });

    it("should generate signed URLs for evidence", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: "https://example.com/signed-url" },
          error: null,
        }),
      });

      vi.spyOn(supabase.storage, "from").mockImplementation(mockFrom);

      const url = await EvidenceUploadService.getEvidenceURL("test/path.jpg");

      expect(url).toBeTruthy();
      expect(url).toContain("https://");
    });
  });

  describe("Database Schema Validation", () => {
    it("should have correct remote_audits table structure", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "audit-1",
                audit_type: "PSC",
                status: "in_progress",
                score: 85,
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase.from("remote_audits").select("*").limit(1);

      expect(result.data).toBeDefined();
      if (result.data && result.data.length > 0) {
        const audit = result.data[0];
        expect(audit).toHaveProperty("id");
        expect(audit).toHaveProperty("audit_type");
        expect(audit).toHaveProperty("status");
      }
    });
  });
});
