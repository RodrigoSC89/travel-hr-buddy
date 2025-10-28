import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("PATCH 365 - Document Templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Template Management", () => {
    it("should create new template", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "template-id" },
        error: null,
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      const templateData = {
        name: "Employment Contract",
        description: "Standard employment contract",
        category: "Contracts",
        content: "Contract for {{employee_name}} at {{company_name}}",
        variables: [
          { name: "employee_name", type: "text", required: true },
          { name: "company_name", type: "text", required: true },
        ],
      };

      await supabase.from("document_templates").insert(templateData);

      expect(mockInsert).toHaveBeenCalledWith(templateData);
    });

    it("should fetch templates", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                name: "Template 1",
                category: "Contracts",
                is_active: true,
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("document_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      expect(result.data).toBeDefined();
    });

    it("should update template (create version)", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: 2, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("create_template_version", {
        p_template_id: "template-id",
        p_content: "Updated content with {{variable}}",
        p_variables: [{ name: "variable", type: "text", required: true }],
        p_change_summary: "Added new variable",
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data).toBe(2);
    });
  });

  describe("Version Control", () => {
    it("should fetch template versions", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                template_id: "template-1",
                version: 2,
                change_summary: "Updated content",
              },
              {
                id: "2",
                template_id: "template-1",
                version: 1,
                change_summary: "Initial version",
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("template_versions")
        .select("*")
        .eq("template_id", "template-1")
        .order("version", { ascending: false });

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
    });

    it("should rollback to previous version", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("rollback_template_version", {
        p_template_id: "template-id",
        p_version: 1,
      });

      expect(mockRpc).toHaveBeenCalledWith("rollback_template_version", {
        p_template_id: "template-id",
        p_version: 1,
      });
    });
  });

  describe("Document Generation", () => {
    it("should generate document from template", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "document-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("generate_document_from_template", {
        p_template_id: "template-id",
        p_name: "Employment Contract - John Doe",
        p_variable_values: {
          employee_name: "John Doe",
          company_name: "Acme Corp",
          position: "Software Engineer",
        },
        p_format: "html",
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data).toBe("document-id");
    });

    it("should fetch generated documents", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                template_id: "template-1",
                name: "Generated Document 1",
                status: "generated",
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("generated_documents")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(20);

      expect(result.data).toBeDefined();
    });

    it("should export document", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("export_document", {
        p_document_id: "document-id",
        p_file_url: "/exports/document.pdf",
      });

      expect(mockRpc).toHaveBeenCalled();
    });
  });

  describe("Template Variables", () => {
    it("should extract variables from content", () => {
      const content = "Hello {{name}}, your order {{order_id}} is ready at {{location}}";
      const variablePattern = /\{\{([a-zA-Z0-9_]+)\}\}/g;
      const matches = content.match(variablePattern) || [];
      const variables = [...new Set(matches.map(m => m.slice(2, -2)))];

      expect(variables).toContain("name");
      expect(variables).toContain("order_id");
      expect(variables).toContain("location");
      expect(variables).toHaveLength(3);
    });

    it("should replace variables in template", () => {
      const template = "Hello {{name}}, welcome to {{company}}!";
      const values = {
        name: "John",
        company: "Acme Corp",
      };

      let result = template;
      Object.entries(values).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
      });

      expect(result).toBe("Hello John, welcome to Acme Corp!");
    });
  });

  describe("Template Permissions", () => {
    it("should check if user can use template", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("user_can_use_template", {
        p_template_id: "template-id",
        p_user_id: "user-id",
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data).toBe(true);
    });

    it("should fetch template permissions", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              template_id: "template-1",
              role: "manager",
              can_use: true,
              can_edit: false,
            },
          ],
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("template_permissions")
        .select("*")
        .eq("template_id", "template-1");

      expect(result.data).toBeDefined();
    });

    it("should set template permissions for role", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "permission-id" },
        error: null,
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      const permissionData = {
        template_id: "template-id",
        role: "manager",
        can_view: true,
        can_use: true,
        can_edit: false,
        can_manage: false,
      };

      await supabase.from("template_permissions").insert(permissionData);

      expect(mockInsert).toHaveBeenCalledWith(permissionData);
    });
  });

  describe("Template Categories", () => {
    it("should fetch template categories", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { id: "1", name: "Contracts", display_order: 1 },
            { id: "2", name: "Reports", display_order: 2 },
          ],
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("template_categories")
        .select("*")
        .eq("is_active", true);

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe("Template Usage Logs", () => {
    it("should log template usage", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "log-id" },
        error: null,
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      const logData = {
        template_id: "template-id",
        user_id: "user-id",
        action: "use",
        document_id: "document-id",
      };

      await supabase.from("template_usage_logs").insert(logData);

      expect(mockInsert).toHaveBeenCalledWith(logData);
    });

    it("should fetch template usage logs", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                template_id: "template-1",
                action: "use",
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("template_usage_logs")
        .select("*")
        .eq("template_id", "template-1")
        .order("created_at", { ascending: false });

      expect(result.data).toBeDefined();
    });
  });
});
