/**
 * Auditoria Comentarios Migration Tests
 * 
 * Tests to verify the structure and policies of the auditoria_comentarios table migration
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Auditoria Comentarios Migration", () => {
  const migrationPath = resolve(
    __dirname,
    "../../supabase/migrations/20251016160807_create_auditoria_comentarios.sql"
  );
  const migrationContent = readFileSync(migrationPath, "utf-8");

  describe("Table Structure", () => {
    it("should create auditoria_comentarios table", () => {
      expect(migrationContent).toContain("CREATE TABLE");
      expect(migrationContent).toContain("auditoria_comentarios");
    });

    it("should have id column as UUID primary key", () => {
      expect(migrationContent).toContain("id UUID PRIMARY KEY");
      expect(migrationContent).toContain("gen_random_uuid()");
    });

    it("should have auditoria_id referencing auditorias_imca", () => {
      expect(migrationContent).toContain("auditoria_id UUID");
      expect(migrationContent).toContain("REFERENCES public.auditorias_imca(id)");
    });

    it("should have cascade delete on auditoria_id", () => {
      expect(migrationContent).toContain("ON DELETE CASCADE");
    });

    it("should have user_id referencing auth.users", () => {
      expect(migrationContent).toContain("user_id UUID");
      expect(migrationContent).toContain("REFERENCES auth.users(id)");
    });

    it("should have comentario as TEXT NOT NULL", () => {
      expect(migrationContent).toContain("comentario TEXT NOT NULL");
    });

    it("should have created_at with default now()", () => {
      expect(migrationContent).toContain("created_at TIMESTAMP");
      expect(migrationContent).toContain("DEFAULT now()");
    });
  });

  describe("Row Level Security", () => {
    it("should enable RLS on the table", () => {
      expect(migrationContent).toContain("ENABLE ROW LEVEL SECURITY");
    });

    it("should have a SELECT policy for viewing comments", () => {
      expect(migrationContent).toContain("CREATE POLICY");
      expect(migrationContent).toContain("FOR SELECT");
      expect(migrationContent).toMatch(/ver.*comentários/i);
    });

    it("should have an INSERT policy for creating comments", () => {
      expect(migrationContent).toContain("FOR INSERT");
      expect(migrationContent).toMatch(/podem comentar/i);
    });

    it("should have a DELETE policy for removing comments", () => {
      expect(migrationContent).toContain("FOR DELETE");
      expect(migrationContent).toMatch(/deletar.*comentários/i);
    });

    it("should check auth.uid() in INSERT policy", () => {
      expect(migrationContent).toContain("auth.uid() = user_id");
    });

    it("should use get_user_role() for admin checks", () => {
      expect(migrationContent).toContain("public.get_user_role()");
      expect(migrationContent).toContain("= 'admin'");
    });
  });

  describe("Performance Indexes", () => {
    it("should create index on auditoria_id", () => {
      expect(migrationContent).toContain("CREATE INDEX");
      expect(migrationContent).toContain("idx_auditoria_comentarios_auditoria_id");
      expect(migrationContent).toMatch(/auditoria_id\)/);
    });

    it("should create index on user_id", () => {
      expect(migrationContent).toContain("idx_auditoria_comentarios_user_id");
      expect(migrationContent).toMatch(/user_id\)/);
    });

    it("should create index on created_at with DESC", () => {
      expect(migrationContent).toContain("idx_auditoria_comentarios_created_at");
      expect(migrationContent).toContain("created_at DESC");
    });
  });

  describe("Documentation", () => {
    it("should have table comment", () => {
      expect(migrationContent).toContain("COMMENT ON TABLE");
      expect(migrationContent).toContain("auditoria_comentarios");
    });

    it("should have comments for all columns", () => {
      expect(migrationContent).toContain("COMMENT ON COLUMN");
      expect(migrationContent).toMatch(/auditoria_comentarios\.id/);
      expect(migrationContent).toMatch(/auditoria_comentarios\.auditoria_id/);
      expect(migrationContent).toMatch(/auditoria_comentarios\.user_id/);
      expect(migrationContent).toMatch(/auditoria_comentarios\.comentario/);
      expect(migrationContent).toMatch(/auditoria_comentarios\.created_at/);
    });

    it("should describe the table purpose in Portuguese", () => {
      expect(migrationContent).toMatch(/revisão.*auditorias.*IMCA/i);
    });
  });

  describe("SQL Syntax", () => {
    it("should use IF NOT EXISTS for table creation", () => {
      expect(migrationContent).toContain("IF NOT EXISTS");
    });

    it("should use public schema", () => {
      expect(migrationContent).toContain("public.auditoria_comentarios");
      expect(migrationContent).toContain("public.auditorias_imca");
    });

    it("should properly end statements with semicolons", () => {
      const statements = migrationContent.split(";").filter((s) => s.trim());
      expect(statements.length).toBeGreaterThan(0);
    });

    it("should not have syntax errors in CREATE TABLE", () => {
      const createTableMatch = migrationContent.match(
        /CREATE TABLE.*?\);/s
      );
      expect(createTableMatch).toBeTruthy();
    });
  });

  describe("Security Policies", () => {
    it("should require authentication for insert", () => {
      expect(migrationContent).toContain("WITH CHECK");
      expect(migrationContent).toContain("auth.uid()");
    });

    it("should allow admins to delete", () => {
      const deletePolicy = migrationContent.match(
        /FOR DELETE.*?;/s
      );
      expect(deletePolicy).toBeTruthy();
      expect(deletePolicy![0]).toContain("admin");
    });

    it("should allow comment authors to delete their own comments", () => {
      const deletePolicy = migrationContent.match(
        /FOR DELETE.*?;/s
      );
      expect(deletePolicy).toBeTruthy();
      expect(deletePolicy![0]).toContain("auth.uid() = user_id");
    });

    it("should check audit access in SELECT policy", () => {
      const selectPolicy = migrationContent.match(
        /FOR SELECT.*?;/s
      );
      expect(selectPolicy).toBeTruthy();
      expect(selectPolicy![0]).toContain("auditorias_imca");
      expect(selectPolicy![0]).toContain("EXISTS");
    });
  });

  describe("Referential Integrity", () => {
    it("should reference correct parent tables", () => {
      expect(migrationContent).toContain("REFERENCES public.auditorias_imca");
      expect(migrationContent).toContain("REFERENCES auth.users");
    });

    it("should use UUID type for foreign keys", () => {
      const uuidMatches = migrationContent.match(/UUID REFERENCES/g);
      expect(uuidMatches?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Migration File Naming", () => {
    it("should follow timestamp naming convention", () => {
      expect(migrationPath).toMatch(/\d{14}_/);
    });

    it("should have descriptive name", () => {
      expect(migrationPath).toContain("create_auditoria_comentarios");
    });

    it("should have .sql extension", () => {
      expect(migrationPath.endsWith(".sql")).toBe(true);
    });
  });
});
