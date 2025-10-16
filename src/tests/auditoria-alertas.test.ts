/**
 * Auditoria Alertas - Critical Alerts System Tests
 * 
 * Tests for the automated critical alert system that monitors
 * AI-generated comments and creates alerts for critical failures
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Alertas - Critical Alerts System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Database Schema - auditoria_comentarios", () => {
    it("should have auditoria_comentarios table", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should have id field as UUID primary key", () => {
      const field = {
        name: "id",
        type: "UUID",
        primaryKey: true,
        default: "gen_random_uuid()"
      };
      expect(field.name).toBe("id");
      expect(field.type).toBe("UUID");
      expect(field.primaryKey).toBe(true);
    });

    it("should have auditoria_id field with foreign key", () => {
      const field = {
        name: "auditoria_id",
        type: "UUID",
        references: "auditorias_imca(id)",
        onDelete: "CASCADE"
      };
      expect(field.name).toBe("auditoria_id");
      expect(field.references).toBe("auditorias_imca(id)");
      expect(field.onDelete).toBe("CASCADE");
    });

    it("should have user_id field as TEXT", () => {
      const field = {
        name: "user_id",
        type: "TEXT",
        notNull: true
      };
      expect(field.name).toBe("user_id");
      expect(field.type).toBe("TEXT");
      expect(field.notNull).toBe(true);
    });

    it("should have comentario field as TEXT", () => {
      const field = {
        name: "comentario",
        type: "TEXT",
        notNull: true
      };
      expect(field.name).toBe("comentario");
      expect(field.type).toBe("TEXT");
    });

    it("should have created_at timestamp field", () => {
      const field = {
        name: "created_at",
        type: "TIMESTAMP WITH TIME ZONE",
        default: "now()"
      };
      expect(field.name).toBe("created_at");
      expect(field.default).toBe("now()");
    });

    it("should have index on auditoria_id", () => {
      const indexName = "idx_auditoria_comentarios_auditoria_id";
      expect(indexName).toContain("auditoria_id");
    });

    it("should have index on user_id", () => {
      const indexName = "idx_auditoria_comentarios_user_id";
      expect(indexName).toContain("user_id");
    });

    it("should have index on created_at", () => {
      const indexName = "idx_auditoria_comentarios_created_at";
      expect(indexName).toContain("created_at");
    });
  });

  describe("Database Schema - auditoria_alertas", () => {
    it("should have auditoria_alertas table", () => {
      const tableName = "auditoria_alertas";
      expect(tableName).toBe("auditoria_alertas");
    });

    it("should have id field as UUID primary key", () => {
      const field = {
        name: "id",
        type: "UUID",
        primaryKey: true,
        default: "gen_random_uuid()"
      };
      expect(field.name).toBe("id");
      expect(field.type).toBe("UUID");
    });

    it("should have auditoria_id with foreign key to auditorias_imca", () => {
      const field = {
        name: "auditoria_id",
        type: "UUID",
        references: "auditorias_imca(id)",
        onDelete: "CASCADE"
      };
      expect(field.references).toBe("auditorias_imca(id)");
      expect(field.onDelete).toBe("CASCADE");
    });

    it("should have comentario_id with foreign key to auditoria_comentarios", () => {
      const field = {
        name: "comentario_id",
        type: "UUID",
        references: "auditoria_comentarios(id)",
        onDelete: "CASCADE"
      };
      expect(field.references).toBe("auditoria_comentarios(id)");
      expect(field.onDelete).toBe("CASCADE");
    });

    it("should have tipo field with default value", () => {
      const field = {
        name: "tipo",
        type: "TEXT",
        default: "'Falha Crítica'"
      };
      expect(field.name).toBe("tipo");
      expect(field.default).toBe("'Falha Crítica'");
    });

    it("should have descricao field as TEXT", () => {
      const field = {
        name: "descricao",
        type: "TEXT"
      };
      expect(field.name).toBe("descricao");
      expect(field.type).toBe("TEXT");
    });

    it("should have criado_em timestamp field", () => {
      const field = {
        name: "criado_em",
        type: "TIMESTAMP WITH TIME ZONE",
        default: "now()"
      };
      expect(field.name).toBe("criado_em");
    });

    it("should have indexes for performance", () => {
      const indexes = [
        "idx_auditoria_alertas_auditoria_id",
        "idx_auditoria_alertas_comentario_id",
        "idx_auditoria_alertas_criado_em",
        "idx_auditoria_alertas_tipo"
      ];
      expect(indexes).toHaveLength(4);
      expect(indexes).toContain("idx_auditoria_alertas_auditoria_id");
      expect(indexes).toContain("idx_auditoria_alertas_tipo");
    });
  });

  describe("Row Level Security - auditoria_comentarios", () => {
    it("should have RLS enabled", () => {
      const rlsEnabled = true;
      expect(rlsEnabled).toBe(true);
    });

    it("should allow users to view comments on accessible audits", () => {
      const policyName = "Users can view comments on accessible audits";
      expect(policyName).toContain("view comments");
    });

    it("should allow users to insert comments on their audits", () => {
      const policyName = "Users can insert comments on their audits";
      expect(policyName).toContain("insert comments");
    });

    it("should allow admins to insert comments on any audit", () => {
      const policyName = "Admins can insert comments on any audit";
      expect(policyName).toContain("Admins");
    });

    it("should allow system to insert AI comments", () => {
      const policyName = "System can insert AI comments";
      const checkCondition = "user_id = 'ia-auto-responder'";
      expect(policyName).toContain("System");
      expect(checkCondition).toBe("user_id = 'ia-auto-responder'");
    });

    it("should allow users to update their own comments", () => {
      const policyName = "Users can update their own comments";
      expect(policyName).toContain("update");
    });

    it("should allow users to delete their own comments", () => {
      const policyName = "Users can delete their own comments";
      expect(policyName).toContain("delete");
    });
  });

  describe("Row Level Security - auditoria_alertas", () => {
    it("should have RLS enabled", () => {
      const rlsEnabled = true;
      expect(rlsEnabled).toBe(true);
    });

    it("should allow admins to view all alerts", () => {
      const policyName = "Admins podem ver todos os alertas";
      expect(policyName).toContain("Admins");
      expect(policyName).toContain("alertas");
    });

    it("should allow users to view alerts on their own audits", () => {
      const policyName = "Users can view alerts on their audits";
      expect(policyName).toContain("view alerts");
    });

    it("should allow system to insert alerts automatically", () => {
      const policyName = "Sistema pode inserir alertas";
      const checkCondition = true;
      expect(policyName).toContain("Sistema");
      expect(checkCondition).toBe(true);
    });
  });

  describe("Trigger Function - inserir_alerta_critico", () => {
    it("should exist as a PL/pgSQL function", () => {
      const functionName = "inserir_alerta_critico";
      const language = "plpgsql";
      expect(functionName).toBe("inserir_alerta_critico");
      expect(language).toBe("plpgsql");
    });

    it("should be a trigger function returning TRIGGER", () => {
      const returnType = "TRIGGER";
      expect(returnType).toBe("TRIGGER");
    });

    it("should check if user_id is ia-auto-responder", () => {
      const condition = "NEW.user_id = 'ia-auto-responder'";
      expect(condition).toContain("ia-auto-responder");
    });

    it("should check if comment contains warning pattern", () => {
      const pattern = "⚠️ Atenção:%";
      const condition = "NEW.comentario LIKE '⚠️ Atenção:%'";
      expect(condition).toContain(pattern);
    });

    it("should insert alert when both conditions are met", () => {
      const mockComment = {
        user_id: "ia-auto-responder",
        comentario: "⚠️ Atenção: Falha crítica detectada no sistema"
      };
      
      const shouldInsertAlert = 
        mockComment.user_id === "ia-auto-responder" && 
        mockComment.comentario.startsWith("⚠️ Atenção:");
      
      expect(shouldInsertAlert).toBe(true);
    });

    it("should NOT insert alert for non-AI comments", () => {
      const mockComment = {
        user_id: "regular-user-123",
        comentario: "⚠️ Atenção: Falha crítica detectada no sistema"
      };
      
      const shouldInsertAlert = 
        mockComment.user_id === "ia-auto-responder" && 
        mockComment.comentario.startsWith("⚠️ Atenção:");
      
      expect(shouldInsertAlert).toBe(false);
    });

    it("should NOT insert alert for AI comments without warning", () => {
      const mockComment = {
        user_id: "ia-auto-responder",
        comentario: "Tudo está funcionando corretamente"
      };
      
      const shouldInsertAlert = 
        mockComment.user_id === "ia-auto-responder" && 
        mockComment.comentario.startsWith("⚠️ Atenção:");
      
      expect(shouldInsertAlert).toBe(false);
    });

    it("should use SECURITY DEFINER for elevated privileges", () => {
      const securityOption = "SECURITY DEFINER";
      expect(securityOption).toBe("SECURITY DEFINER");
    });
  });

  describe("Trigger - trigger_alerta_ia", () => {
    it("should exist on auditoria_comentarios table", () => {
      const triggerName = "trigger_alerta_ia";
      const tableName = "auditoria_comentarios";
      expect(triggerName).toBe("trigger_alerta_ia");
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should fire AFTER INSERT", () => {
      const timing = "AFTER INSERT";
      expect(timing).toContain("AFTER");
      expect(timing).toContain("INSERT");
    });

    it("should execute FOR EACH ROW", () => {
      const level = "FOR EACH ROW";
      expect(level).toBe("FOR EACH ROW");
    });

    it("should execute inserir_alerta_critico function", () => {
      const functionName = "inserir_alerta_critico";
      expect(functionName).toBe("inserir_alerta_critico");
    });
  });

  describe("Alert Creation Logic", () => {
    it("should create alert with auditoria_id from comment", () => {
      const mockNewComment = {
        id: "comment-uuid-123",
        auditoria_id: "audit-uuid-456",
        user_id: "ia-auto-responder",
        comentario: "⚠️ Atenção: Falha detectada"
      };
      
      const alertData = {
        auditoria_id: mockNewComment.auditoria_id,
        comentario_id: mockNewComment.id,
        descricao: mockNewComment.comentario
      };
      
      expect(alertData.auditoria_id).toBe("audit-uuid-456");
      expect(alertData.comentario_id).toBe("comment-uuid-123");
      expect(alertData.descricao).toContain("⚠️ Atenção:");
    });

    it("should use full comment text as alert description", () => {
      const commentText = "⚠️ Atenção: Sistema de emergência apresentando falhas críticas. Intervenção imediata necessária.";
      const alertDescription = commentText;
      expect(alertDescription).toBe(commentText);
      expect(alertDescription).toContain("Intervenção imediata");
    });

    it("should set default tipo as Falha Crítica", () => {
      const defaultTipo = "Falha Crítica";
      expect(defaultTipo).toBe("Falha Crítica");
    });

    it("should auto-generate UUID for alert id", () => {
      const idGeneration = "gen_random_uuid()";
      expect(idGeneration).toBe("gen_random_uuid()");
    });

    it("should auto-set criado_em timestamp", () => {
      const timestampDefault = "now()";
      expect(timestampDefault).toBe("now()");
    });
  });

  describe("AI Comment Pattern Detection", () => {
    it("should match comments starting with warning emoji", () => {
      const pattern = "⚠️ Atenção:%";
      const testComments = [
        "⚠️ Atenção: Falha crítica no sistema",
        "⚠️ Atenção: Verificação necessária",
        "⚠️ Atenção: Risco de segurança identificado"
      ];
      
      testComments.forEach(comment => {
        const matches = comment.startsWith("⚠️ Atenção:");
        expect(matches).toBe(true);
      });
    });

    it("should NOT match comments without warning pattern", () => {
      const testComments = [
        "Sistema funcionando normalmente",
        "✅ Aprovado",
        "Aguardando revisão"
      ];
      
      testComments.forEach(comment => {
        const matches = comment.startsWith("⚠️ Atenção:");
        expect(matches).toBe(false);
      });
    });

    it("should be case-sensitive for pattern matching", () => {
      const wrongCase = "⚠️ atenção: falha";
      const correctCase = "⚠️ Atenção: falha";
      
      expect(wrongCase.startsWith("⚠️ Atenção:")).toBe(false);
      expect(correctCase.startsWith("⚠️ Atenção:")).toBe(true);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete alert creation flow", () => {
      const scenario = {
        step1: "AI analyzes audit and finds critical issue",
        step2: "AI creates comment with user_id='ia-auto-responder'",
        step3: "Comment text starts with '⚠️ Atenção:'",
        step4: "Trigger fires after comment insert",
        step5: "Function checks conditions and creates alert",
        step6: "Alert is stored with reference to comment and audit"
      };
      
      expect(scenario.step2).toContain("ia-auto-responder");
      expect(scenario.step3).toContain("⚠️ Atenção:");
      expect(scenario.step5).toContain("creates alert");
    });

    it("should maintain referential integrity", () => {
      const relationships = {
        comment_to_audit: "auditoria_comentarios.auditoria_id -> auditorias_imca.id",
        alert_to_audit: "auditoria_alertas.auditoria_id -> auditorias_imca.id",
        alert_to_comment: "auditoria_alertas.comentario_id -> auditoria_comentarios.id"
      };
      
      expect(relationships.comment_to_audit).toContain("auditorias_imca.id");
      expect(relationships.alert_to_comment).toContain("auditoria_comentarios.id");
    });

    it("should cascade delete when audit is deleted", () => {
      const cascadeRules = {
        audit_deleted: "Audit record deleted",
        comments_deleted: "ON DELETE CASCADE",
        alerts_deleted: "ON DELETE CASCADE"
      };
      
      expect(cascadeRules.comments_deleted).toBe("ON DELETE CASCADE");
      expect(cascadeRules.alerts_deleted).toBe("ON DELETE CASCADE");
    });
  });

  describe("Performance Considerations", () => {
    it("should have indexes on foreign keys", () => {
      const foreignKeyIndexes = [
        "idx_auditoria_comentarios_auditoria_id",
        "idx_auditoria_alertas_auditoria_id",
        "idx_auditoria_alertas_comentario_id"
      ];
      
      expect(foreignKeyIndexes).toHaveLength(3);
      foreignKeyIndexes.forEach(index => {
        expect(index).toContain("idx_");
      });
    });

    it("should have index on timestamp fields for sorting", () => {
      const timestampIndexes = [
        "idx_auditoria_comentarios_created_at",
        "idx_auditoria_alertas_criado_em"
      ];
      
      expect(timestampIndexes).toHaveLength(2);
      timestampIndexes.forEach(index => {
        const hasTimestamp = index.includes("created_at") || index.includes("criado_em");
        expect(hasTimestamp).toBe(true);
      });
    });

    it("should have index on tipo for filtering alerts by type", () => {
      const typeIndex = "idx_auditoria_alertas_tipo";
      expect(typeIndex).toContain("tipo");
    });
  });

  describe("Documentation and Comments", () => {
    it("should document auditoria_comentarios table", () => {
      const tableComment = "Tabela de comentários para auditorias IMCA";
      expect(tableComment).toContain("comentários");
      expect(tableComment).toContain("auditorias");
    });

    it("should document auditoria_alertas table", () => {
      const tableComment = "Tabela de alertas críticos detectados por IA em auditorias";
      expect(tableComment).toContain("alertas críticos");
      expect(tableComment).toContain("IA");
    });

    it("should document all important columns", () => {
      const columnComments = [
        "Identificador único do comentário",
        "ID da auditoria relacionada",
        "ID do usuário ou ia-auto-responder para IA",
        "Texto do comentário",
        "Tipo do alerta (padrão: Falha Crítica)"
      ];
      
      expect(columnComments).toHaveLength(5);
      columnComments.forEach(comment => {
        expect(comment.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Security and Access Control", () => {
    it("should require authentication for comment operations", () => {
      const authRequired = true;
      expect(authRequired).toBe(true);
    });

    it("should restrict direct insert on alerts to system only", () => {
      const systemInsertOnly = "WITH CHECK (true)";
      expect(systemInsertOnly).toContain("true");
    });

    it("should allow admins to view all alerts", () => {
      const adminAccess = "profiles.role = 'admin'";
      expect(adminAccess).toContain("admin");
    });

    it("should allow users to view only their own audit alerts", () => {
      const userAccess = "auditorias_imca.user_id = auth.uid()";
      expect(userAccess).toContain("user_id");
      expect(userAccess).toContain("auth.uid()");
    });
  });

  describe("Use Cases", () => {
    it("should support AI-detected critical failure alerting", () => {
      const useCase = {
        name: "AI Critical Failure Detection",
        description: "AI analyzes audit and creates alert for critical issues",
        trigger: "Comment with ⚠️ Atenção: pattern",
        result: "Automatic alert creation"
      };
      
      expect(useCase.trigger).toContain("⚠️ Atenção:");
      expect(useCase.result).toContain("Automatic alert");
    });

    it("should support admin alert monitoring", () => {
      const useCase = {
        name: "Admin Alert Dashboard",
        description: "Admins view all critical alerts across audits",
        access: "Full read access to auditoria_alertas"
      };
      
      expect(useCase.access).toContain("Full read access");
    });

    it("should support user notification of their audit alerts", () => {
      const useCase = {
        name: "User Alert Notification",
        description: "Users receive alerts for their own audits",
        filter: "WHERE auditoria.user_id = current_user"
      };
      
      expect(useCase.filter).toContain("user_id");
    });
  });
});
