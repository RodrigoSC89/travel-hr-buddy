import { describe, it, expect } from "vitest";
import type { Database } from "@/integrations/supabase/types";

describe("Document Versioning & Comments Types", () => {
  it("should have document_versions table type", () => {
    type DocumentVersion = Database["public"]["Tables"]["document_versions"]["Row"];
    
    // Type check: should have required fields
    const mockVersion: DocumentVersion = {
      id: "test-id",
      document_id: "doc-id",
      content: "test content",
      created_at: "2024-01-01T00:00:00Z",
      updated_by: "user-id",
    };
    
    expect(mockVersion.id).toBeDefined();
    expect(mockVersion.document_id).toBeDefined();
    expect(mockVersion.content).toBeDefined();
    expect(mockVersion.created_at).toBeDefined();
  });

  it("should have document_comments table type", () => {
    type DocumentComment = Database["public"]["Tables"]["document_comments"]["Row"];
    
    // Type check: should have required fields
    const mockComment: DocumentComment = {
      id: "test-id",
      document_id: "doc-id",
      user_id: "user-id",
      content: "test comment",
      created_at: "2024-01-01T00:00:00Z",
    };
    
    expect(mockComment.id).toBeDefined();
    expect(mockComment.document_id).toBeDefined();
    expect(mockComment.user_id).toBeDefined();
    expect(mockComment.content).toBeDefined();
    expect(mockComment.created_at).toBeDefined();
  });

  it("should support insert operations for document_versions", () => {
    type DocumentVersionInsert = Database["public"]["Tables"]["document_versions"]["Insert"];
    
    const insertData: DocumentVersionInsert = {
      document_id: "doc-id",
      content: "new version content",
      updated_by: "user-id",
    };
    
    expect(insertData.document_id).toBe("doc-id");
    expect(insertData.content).toBe("new version content");
  });

  it("should support insert operations for document_comments", () => {
    type DocumentCommentInsert = Database["public"]["Tables"]["document_comments"]["Insert"];
    
    const insertData: DocumentCommentInsert = {
      document_id: "doc-id",
      content: "new comment",
      user_id: "user-id",
    };
    
    expect(insertData.document_id).toBe("doc-id");
    expect(insertData.content).toBe("new comment");
  });

  it("should support update operations for document_comments", () => {
    type DocumentCommentUpdate = Database["public"]["Tables"]["document_comments"]["Update"];
    
    const updateData: DocumentCommentUpdate = {
      content: "updated comment",
    };
    
    expect(updateData.content).toBe("updated comment");
  });
});
