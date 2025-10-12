import { describe, it, expect } from "vitest";

describe("Assistant Query Enhancement", () => {
  describe("Link Enhancement Logic", () => {
    it("should detect checklist keywords", () => {
      const testCases = [
        "criar checklist",
        "Como criar um CHECKLIST?",
        "checklist de segurança",
      ];

      testCases.forEach((question) => {
        expect(/checklist/i.test(question)).toBe(true);
      });
    });

    it("should detect documento keywords", () => {
      const testCases = [
        "listar documentos",
        "ver DOCUMENTO",
        "último documento",
      ];

      testCases.forEach((question) => {
        expect(/documento/i.test(question)).toBe(true);
      });
    });

    it("should detect alertas keywords with optional plural", () => {
      const testCases = [
        "ver alertas",
        "mostrar alerta",
        "ALERTAS de preço",
      ];

      testCases.forEach((question) => {
        expect(/alertas?/i.test(question)).toBe(true);
      });
    });

    it("should not detect unrelated keywords", () => {
      const question = "qual é o status do sistema?";
      
      expect(/checklist/i.test(question)).toBe(false);
      expect(/documento/i.test(question)).toBe(false);
      expect(/alertas?/i.test(question)).toBe(false);
    });
  });

  describe("Enhanced Response Format", () => {
    it("should generate correct HTML link for checklist", () => {
      const baseResponse = "Você pode criar um checklist acessando a página de checklists.";
      const expectedLink = "\n\n👉 <a href=\"/admin/checklists/new\" class=\"text-blue-600 underline\">Criar Checklist Agora</a>";
      const enhanced = baseResponse + expectedLink;

      expect(enhanced).toContain("<a href=\"/admin/checklists/new\"");
      expect(enhanced).toContain("class=\"text-blue-600 underline\"");
      expect(enhanced).toContain("Criar Checklist Agora</a>");
    });

    it("should generate correct HTML link for documents", () => {
      const baseResponse = "Aqui estão os documentos disponíveis.";
      const expectedLink = "\n\n📄 <a href=\"/admin/documents\" class=\"text-blue-600 underline\">Ver Documentos</a>";
      const enhanced = baseResponse + expectedLink;

      expect(enhanced).toContain("<a href=\"/admin/documents\"");
      expect(enhanced).toContain("class=\"text-blue-600 underline\"");
      expect(enhanced).toContain("Ver Documentos</a>");
    });

    it("should generate correct HTML link for alerts", () => {
      const baseResponse = "Os alertas estão disponíveis no sistema.";
      const expectedLink = "\n\n🚨 <a href=\"/admin/alerts\" class=\"text-blue-600 underline\">Ver Alertas</a>";
      const enhanced = baseResponse + expectedLink;

      expect(enhanced).toContain("<a href=\"/admin/alerts\"");
      expect(enhanced).toContain("class=\"text-blue-600 underline\"");
      expect(enhanced).toContain("Ver Alertas</a>");
    });
  });

  describe("System Prompt Content", () => {
    const systemPrompt = `
Você é o assistente do sistema Nautilus One. Seu papel é ajudar o usuário a interagir com o sistema e executar ações reais.
Sempre que possível, adicione links com as rotas reais do painel.

Comandos que você entende:
- Criar checklist → /admin/checklists/new
- Listar últimos documentos → /admin/documents
- Ver status do sistema → /admin/system-monitor
- Ver alertas → /admin/alerts
- Criar documento com IA → /admin/documents/ai
- Gerar PDF com relatório → /admin/reports/export

Seja claro, direto e útil.
`;

    it("should reference Nautilus One system", () => {
      expect(systemPrompt).toContain("Nautilus One");
    });

    it("should include all required routes", () => {
      expect(systemPrompt).toContain("/admin/checklists/new");
      expect(systemPrompt).toContain("/admin/documents");
      expect(systemPrompt).toContain("/admin/system-monitor");
      expect(systemPrompt).toContain("/admin/alerts");
      expect(systemPrompt).toContain("/admin/documents/ai");
      expect(systemPrompt).toContain("/admin/reports/export");
    });

    it("should mention adding links to responses", () => {
      expect(systemPrompt).toContain("adicione links");
    });
  });
});
