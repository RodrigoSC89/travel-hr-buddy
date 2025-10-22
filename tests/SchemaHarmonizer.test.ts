/**
 * SchemaHarmonizer - Unit Tests
 * Validates schema normalization and data harmonization
 */

import { describe, it, expect } from "vitest";
import { harmonizeSchema } from "@/lib/ai/SchemaHarmonizer";

describe("SchemaHarmonizer - Unit Tests", () => {
  it("deve normalizar valores null para string vazia", () => {
    const data = [
      { id: 1, name: "Test", email: null },
      { id: 2, name: "Test2", email: null },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].email).toBe("");
    expect(result[1].email).toBe("");
  });

  it("deve normalizar valores undefined para string vazia", () => {
    const data = [
      { id: 1, name: "Test", description: undefined },
      { id: 2, name: "Test2", description: undefined },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].description).toBe("");
    expect(result[1].description).toBe("");
  });

  it("deve preservar valores válidos", () => {
    const data = [
      { id: 1, name: "Test", email: "test@example.com" },
      { id: 2, name: "Test2", email: "test2@example.com" },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("Test");
    expect(result[0].email).toBe("test@example.com");
    expect(result[1].id).toBe(2);
    expect(result[1].name).toBe("Test2");
    expect(result[1].email).toBe("test2@example.com");
  });

  it("deve harmonizar objetos aninhados", () => {
    const data = [
      {
        id: 1,
        user: {
          name: "John",
          email: null,
          phone: undefined,
        },
      },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].user.name).toBe("John");
    expect(result[0].user.email).toBe("");
    expect(result[0].user.phone).toBe("");
  });

  it("deve preservar arrays", () => {
    const data = [
      {
        id: 1,
        tags: ["tag1", "tag2", "tag3"],
      },
    ];

    const result = harmonizeSchema(data);

    expect(Array.isArray(result[0].tags)).toBe(true);
    expect(result[0].tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("deve processar array vazio", () => {
    const data: any[] = [];

    const result = harmonizeSchema(data);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("deve processar múltiplos registros", () => {
    const data = [
      { id: 1, name: "Item 1", value: null },
      { id: 2, name: "Item 2", value: undefined },
      { id: 3, name: "Item 3", value: "valid" },
    ];

    const result = harmonizeSchema(data);

    expect(result.length).toBe(3);
    expect(result[0].value).toBe("");
    expect(result[1].value).toBe("");
    expect(result[2].value).toBe("valid");
  });

  it("deve preservar números", () => {
    const data = [
      { id: 1, count: 0, total: 100, average: 0.5 },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].id).toBe(1);
    expect(result[0].count).toBe(0);
    expect(result[0].total).toBe(100);
    expect(result[0].average).toBe(0.5);
  });

  it("deve preservar valores booleanos", () => {
    const data = [
      { id: 1, active: true, deleted: false },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].active).toBe(true);
    expect(result[0].deleted).toBe(false);
  });

  it("deve processar dados complexos do Supabase", () => {
    const data = [
      {
        id: 1,
        created_at: "2025-01-01",
        user_name: "John Doe",
        email: null,
        metadata: {
          department: "HR",
          role: null,
          permissions: ["read", "write"],
        },
        status: "active",
      },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].id).toBe(1);
    expect(result[0].created_at).toBe("2025-01-01");
    expect(result[0].user_name).toBe("John Doe");
    expect(result[0].email).toBe("");
    expect(result[0].metadata.department).toBe("HR");
    expect(result[0].metadata.role).toBe("");
    expect(result[0].metadata.permissions).toEqual(["read", "write"]);
    expect(result[0].status).toBe("active");
  });

  it("valida que tipo genérico é preservado", () => {
    interface TestData {
      id: number;
      name: string;
      email: string | null;
    }

    const data: TestData[] = [
      { id: 1, name: "Test", email: null },
    ];

    const result = harmonizeSchema<TestData>(data);

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("Test");
    expect(result[0].email).toBe("");
  });

  it("deve lidar com objetos aninhados profundos", () => {
    const data = [
      {
        id: 1,
        level1: {
          level2: {
            level3: {
              value: null,
              name: "deep",
            },
          },
        },
      },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].level1.level2.level3.value).toBe("");
    expect(result[0].level1.level2.level3.name).toBe("deep");
  });

  it("deve processar strings vazias sem alteração", () => {
    const data = [
      { id: 1, name: "", description: "" },
    ];

    const result = harmonizeSchema(data);

    expect(result[0].name).toBe("");
    expect(result[0].description).toBe("");
  });
});
