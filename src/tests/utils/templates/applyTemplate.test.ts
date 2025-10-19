import { describe, it, expect } from "vitest";
import {
  extractTemplateVariables,
  applyTemplateWithValues,
} from "@/utils/templates/applyTemplate";

describe("Template Variables Utility", () => {
  describe("extractTemplateVariables", () => {
    it("should extract single variable", () => {
      const content = "Hello {{name}}!";
      const vars = extractTemplateVariables(content);
      expect(vars).toEqual(["name"]);
    });

    it("should extract multiple variables", () => {
      const content = "Hello {{name}}, your order {{order_id}} is ready!";
      const vars = extractTemplateVariables(content);
      expect(vars).toEqual(["name", "order_id"]);
    });

    it("should return empty array when no variables", () => {
      const content = "Hello world!";
      const vars = extractTemplateVariables(content);
      expect(vars).toEqual([]);
    });

    it("should handle variables with spaces", () => {
      const content = "Hello {{ name }}, welcome to {{ company }}!";
      const vars = extractTemplateVariables(content);
      expect(vars).toEqual(["name", "company"]);
    });

    it("should handle duplicate variables", () => {
      const content = "{{name}} and {{name}} are friends.";
      const vars = extractTemplateVariables(content);
      expect(vars).toEqual(["name", "name"]);
    });
  });

  describe("applyTemplateWithValues", () => {
    it("should replace single variable", () => {
      const content = "Hello {{name}}!";
      const values = { name: "John" };
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Hello John!");
    });

    it("should replace multiple variables", () => {
      const content = "Hello {{name}}, your order {{order_id}} is ready!";
      const values = { name: "Maria", order_id: "#12345" };
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Hello Maria, your order #12345 is ready!");
    });

    it("should handle missing values", () => {
      const content = "Hello {{name}}, your order {{order_id}} is ready!";
      const values = { name: "John" };
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Hello John, your order {{order_id}} is ready!");
    });

    it("should handle empty values object", () => {
      const content = "Hello {{name}}!";
      const values = {};
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Hello {{name}}!");
    });

    it("should handle variables with spaces", () => {
      const content = "Hello {{ name }}!";
      const values = { name: "John" };
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Hello John!");
    });

    it("should replace all occurrences of a variable", () => {
      const content = "{{name}} loves {{name}}'s work.";
      const values = { name: "Alice" };
      const result = applyTemplateWithValues(content, values);
      expect(result).toBe("Alice loves Alice's work.");
    });

    it("should handle complex template", () => {
      const content = `Dear {{customer_name}},

Your order {{order_id}} has been shipped to {{address}}.

Thank you for choosing {{company_name}}!`;
      
      const values = {
        customer_name: "John Doe",
        order_id: "#12345",
        address: "123 Main St",
        company_name: "Acme Corp",
      };
      
      const result = applyTemplateWithValues(content, values);
      
      expect(result).toContain("Dear John Doe");
      expect(result).toContain("order #12345");
      expect(result).toContain("to 123 Main St");
      expect(result).toContain("Acme Corp!");
    });
  });
});
