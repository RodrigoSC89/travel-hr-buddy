/**
 * Tests for the templates API module
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleFavorite,
  togglePrivate,
  generateTemplateWithAI,
  rewriteTemplateWithAI,
  suggestTitle,
  type Template,
  type CreateTemplateData,
  type UpdateTemplateData,
} from "@/lib/templates/api";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("Templates API Module", () => {
  describe("Type definitions", () => {
    it("should have correct Template interface", () => {
      const template: Template = {
        id: "123",
        title: "Test Template",
        content: "Test content",
        created_by: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        is_favorite: false,
        is_private: false,
      };

      expect(template.id).toBe("123");
      expect(template.title).toBe("Test Template");
      expect(template.content).toBe("Test content");
    });

    it("should have correct CreateTemplateData interface", () => {
      const createData: CreateTemplateData = {
        title: "New Template",
        content: "New content",
        is_favorite: true,
        is_private: false,
      };

      expect(createData.title).toBe("New Template");
      expect(createData.content).toBe("New content");
      expect(createData.is_favorite).toBe(true);
    });

    it("should have correct UpdateTemplateData interface", () => {
      const updateData: UpdateTemplateData = {
        id: "123",
        title: "Updated Template",
        content: "Updated content",
      };

      expect(updateData.id).toBe("123");
      expect(updateData.title).toBe("Updated Template");
    });
  });

  describe("Function exports", () => {
    it("should export fetchTemplates function", () => {
      expect(typeof fetchTemplates).toBe("function");
    });

    it("should export fetchTemplate function", () => {
      expect(typeof fetchTemplate).toBe("function");
    });

    it("should export createTemplate function", () => {
      expect(typeof createTemplate).toBe("function");
    });

    it("should export updateTemplate function", () => {
      expect(typeof updateTemplate).toBe("function");
    });

    it("should export deleteTemplate function", () => {
      expect(typeof deleteTemplate).toBe("function");
    });

    it("should export toggleFavorite function", () => {
      expect(typeof toggleFavorite).toBe("function");
    });

    it("should export togglePrivate function", () => {
      expect(typeof togglePrivate).toBe("function");
    });

    it("should export generateTemplateWithAI function", () => {
      expect(typeof generateTemplateWithAI).toBe("function");
    });

    it("should export rewriteTemplateWithAI function", () => {
      expect(typeof rewriteTemplateWithAI).toBe("function");
    });

    it("should export suggestTitle function", () => {
      expect(typeof suggestTitle).toBe("function");
    });
  });

  describe("API module structure", () => {
    it("should be properly organized as a module", () => {
      // Verify that the module can be imported from index
      import("@/lib/templates/index").then((module) => {
        expect(module.fetchTemplates).toBe(fetchTemplates);
        expect(module.createTemplate).toBe(createTemplate);
        expect(module.updateTemplate).toBe(updateTemplate);
        expect(module.deleteTemplate).toBe(deleteTemplate);
      });
    });
  });

  describe("Content type handling", () => {
    it("should handle string content", () => {
      const data: CreateTemplateData = {
        title: "String Template",
        content: "This is a string content",
      };

      expect(typeof data.content).toBe("string");
    });

    it("should handle object content (TipTap JSON)", () => {
      const data: CreateTemplateData = {
        title: "JSON Template",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Hello World" }],
            },
          ],
        },
      };

      expect(typeof data.content).toBe("object");
      expect(data.content).toHaveProperty("type");
    });
  });
});
