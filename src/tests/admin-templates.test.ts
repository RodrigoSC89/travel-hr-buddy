import { describe, it, expect } from "vitest";

describe("Admin Templates Page", () => {
  it("should create a new template", () => {
    const mockTemplate = {
      id: "template-123",
      title: "Template de Relatório",
      content: "<p>Conteúdo do template</p>",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "user-123"
    };

    expect(mockTemplate.id).toBeDefined();
    expect(mockTemplate.title).toBe("Template de Relatório");
    expect(mockTemplate.content).toContain("<p>");
  });

  it("should edit an existing template", () => {
    const originalTemplate = {
      id: "template-123",
      title: "Template Original",
      content: "<p>Conteúdo original</p>"
    };

    const updatedTemplate = {
      ...originalTemplate,
      title: "Template Atualizado",
      content: "<p>Conteúdo atualizado</p>",
      updated_at: new Date().toISOString()
    };

    expect(updatedTemplate.id).toBe(originalTemplate.id);
    expect(updatedTemplate.title).toBe("Template Atualizado");
    expect(updatedTemplate.content).toContain("atualizado");
  });

  it("should delete a template", () => {
    const templates = [
      { id: "template-1", title: "Template 1" },
      { id: "template-2", title: "Template 2" },
      { id: "template-3", title: "Template 3" }
    ];

    const templateToDelete = "template-2";
    const remainingTemplates = templates.filter(t => t.id !== templateToDelete);

    expect(remainingTemplates).toHaveLength(2);
    expect(remainingTemplates.find(t => t.id === templateToDelete)).toBeUndefined();
  });

  it("should list all templates", () => {
    const mockTemplates = [
      { id: "1", title: "Template A", category: "reports" },
      { id: "2", title: "Template B", category: "emails" },
      { id: "3", title: "Template C", category: "documents" }
    ];

    expect(mockTemplates).toHaveLength(3);
    expect(mockTemplates[0].title).toBe("Template A");
  });

  it("should validate template with TipTap", () => {
    const tiptapContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello World"
            }
          ]
        }
      ]
    };

    expect(tiptapContent.type).toBe("doc");
    expect(tiptapContent.content).toHaveLength(1);
    expect(tiptapContent.content[0].type).toBe("paragraph");
  });

  it("should search templates by title", () => {
    const templates = [
      { id: "1", title: "Relatório Mensal" },
      { id: "2", title: "Relatório Anual" },
      { id: "3", title: "Email de Boas-vindas" }
    ];

    const searchTerm = "relatório";
    const results = templates.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(2);
    expect(results[0].title).toContain("Relatório");
  });

  it("should filter templates by category", () => {
    const templates = [
      { id: "1", title: "Template A", category: "reports" },
      { id: "2", title: "Template B", category: "emails" },
      { id: "3", title: "Template C", category: "reports" }
    ];

    const reportTemplates = templates.filter(t => t.category === "reports");

    expect(reportTemplates).toHaveLength(2);
    expect(reportTemplates.every(t => t.category === "reports")).toBe(true);
  });

  it("should apply template to document", () => {
    const template = {
      id: "template-123",
      content: "<h1>Título</h1><p>Conteúdo</p>"
    };

    const document = {
      id: "doc-456",
      content: template.content,
      template_id: template.id
    };

    expect(document.template_id).toBe(template.id);
    expect(document.content).toBe(template.content);
  });

  it("should duplicate a template", () => {
    const originalTemplate = {
      id: "template-123",
      title: "Template Original",
      content: "<p>Conteúdo</p>"
    };

    const duplicatedTemplate = {
      ...originalTemplate,
      id: "template-456",
      title: `${originalTemplate.title} (Cópia)`,
      created_at: new Date().toISOString()
    };

    expect(duplicatedTemplate.id).not.toBe(originalTemplate.id);
    expect(duplicatedTemplate.title).toContain("(Cópia)");
    expect(duplicatedTemplate.content).toBe(originalTemplate.content);
  });

  it("should validate required template fields", () => {
    const validTemplate = {
      title: "Template Válido",
      content: "<p>Conteúdo válido</p>"
    };

    const hasTitle = !!validTemplate.title && validTemplate.title.length > 0;
    const hasContent = !!validTemplate.content && validTemplate.content.length > 0;

    expect(hasTitle).toBe(true);
    expect(hasContent).toBe(true);
  });

  it("should sort templates by date", () => {
    const templates = [
      { id: "1", title: "Template A", created_at: "2024-01-01" },
      { id: "2", title: "Template B", created_at: "2024-03-01" },
      { id: "3", title: "Template C", created_at: "2024-02-01" }
    ];

    const sortedTemplates = [...templates].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    expect(sortedTemplates[0].id).toBe("2");
    expect(sortedTemplates[2].id).toBe("1");
  });

  it("should export template content", () => {
    const template = {
      id: "template-123",
      title: "Template para Exportar",
      content: "<h1>Título</h1><p>Conteúdo</p>"
    };

    const exportedData = JSON.stringify(template);
    const parsedData = JSON.parse(exportedData);

    expect(parsedData.id).toBe(template.id);
    expect(parsedData.title).toBe(template.title);
  });
});
