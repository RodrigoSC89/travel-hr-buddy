/**
 * ComentariosAuditoria Component Tests
 * 
 * Tests for the ComentariosAuditoria component that allows viewing and adding
 * comments to audits
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ComentariosAuditoria } from "@/components/auditoria/ComentariosAuditoria";

// Mock fetch
global.fetch = vi.fn();

describe("ComentariosAuditoria Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => [],
      ok: true,
    });
  });

  describe("Component Rendering", () => {
    it("should render the component with title", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);
      
      await waitFor(() => {
        expect(screen.getByText("💬 Comentários da Auditoria")).toBeInTheDocument();
      });
    });

    it("should render textarea for new comment", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);
      
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
        expect(textarea).toBeInTheDocument();
      });
    });

    it("should render send button", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);
      
      await waitFor(() => {
        const button = screen.getByText("Enviar");
        expect(button).toBeInTheDocument();
      });
    });

    it("should have scrollable area for comments", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);
      
      await waitFor(() => {
        const scrollArea = document.querySelector('.max-h-64');
        expect(scrollArea).toBeTruthy();
      });
    });
  });

  describe("Loading Comments", () => {
    it("should fetch comments on mount", async () => {
      const mockComments = [
        {
          id: "1",
          comentario: "Test comment 1",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockComments,
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/123/comentarios");
      });
    });

    it("should display fetched comments", async () => {
      const mockComments = [
        {
          id: "1",
          comentario: "Test comment 1",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z",
        },
        {
          id: "2",
          comentario: "Test comment 2",
          user_id: "user-2",
          created_at: "2025-10-16T13:00:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockComments,
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        expect(screen.getByText("Test comment 1")).toBeInTheDocument();
        expect(screen.getByText("Test comment 2")).toBeInTheDocument();
      });
    });

    it("should display user_id for each comment", async () => {
      const mockComments = [
        {
          id: "1",
          comentario: "Test comment",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockComments,
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        expect(screen.getByText(/user-1/)).toBeInTheDocument();
      });
    });

    it("should format created_at timestamp", async () => {
      const mockComments = [
        {
          id: "1",
          comentario: "Test comment",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockComments,
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const dateElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElement).toBeInTheDocument();
      });
    });
  });

  describe("Adding Comments", () => {
    it("should enable button when comment is not empty", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
        const button = screen.getByText("Enviar");

        fireEvent.change(textarea, { target: { value: "New comment" } });

        expect(button).not.toBeDisabled();
      });
    });

    it("should disable button when comment is empty", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const button = screen.getByText("Enviar");
        expect(button).toBeDisabled();
      });
    });

    it("should disable button when comment is only whitespace", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
        const button = screen.getByText("Enviar");

        fireEvent.change(textarea, { target: { value: "   " } });

        expect(button).toBeDisabled();
      });
    });

    it("should send POST request when adding comment", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => [],
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
        fireEvent.change(textarea, { target: { value: "New comment" } });
      });

      const button = screen.getByText("Enviar");

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ id: "3", comentario: "New comment" }),
        ok: true,
      });

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => [],
        ok: true,
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/auditoria/123/comentarios",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comentario: "New comment" }),
          })
        );
      });
    });

    it("should clear textarea after sending comment", async () => {
      (global.fetch as any).mockResolvedValue({
        json: async () => [],
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...") as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "New comment" } });
        expect(textarea.value).toBe("New comment");
      });

      const button = screen.getByText("Enviar");
      fireEvent.click(button);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...") as HTMLTextAreaElement;
        expect(textarea.value).toBe("");
      });
    });

    it("should reload comments after sending", async () => {
      const initialComments = [
        {
          id: "1",
          comentario: "Initial comment",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z",
        },
      ];

      const updatedComments = [
        ...initialComments,
        {
          id: "2",
          comentario: "New comment",
          user_id: "user-2",
          created_at: "2025-10-16T13:00:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => initialComments,
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        expect(screen.getByText("Initial comment")).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
      fireEvent.change(textarea, { target: { value: "New comment" } });

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ id: "2", comentario: "New comment" }),
        ok: true,
      });

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => updatedComments,
        ok: true,
      });

      const button = screen.getByText("Enviar");
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial load + POST + Reload
      });
    });

    it("should disable button while sending comment", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => [],
        ok: true,
      });

      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Adicionar um comentário...");
        fireEvent.change(textarea, { target: { value: "New comment" } });
      });

      let resolvePost: any;
      const postPromise = new Promise((resolve) => {
        resolvePost = resolve;
      });

      (global.fetch as any).mockImplementationOnce(() => postPromise);

      const button = screen.getByText("Enviar");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      resolvePost({ json: async () => ({}), ok: true });
    });
  });

  describe("Component Props", () => {
    it("should use auditoriaId in API calls", async () => {
      const auditoriaId = "test-audit-123";
      
      render(<ComentariosAuditoria auditoriaId={auditoriaId} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/auditoria/${auditoriaId}/comentarios`);
      });
    });

    it("should work with different auditoriaId values", async () => {
      const { unmount } = render(<ComentariosAuditoria auditoriaId="audit-1" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/audit-1/comentarios");
      });

      unmount();
      vi.clearAllMocks();
      
      render(<ComentariosAuditoria auditoriaId="audit-2" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/audit-2/comentarios");
      });
    });
  });

  describe("UI Styling", () => {
    it("should have space-y-4 class on container", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const container = document.querySelector(".space-y-4");
        expect(container).toBeTruthy();
      });
    });

    it("should have max-h-64 class on scroll area", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const scrollArea = document.querySelector(".max-h-64");
        expect(scrollArea).toBeTruthy();
      });
    });

    it("should have border and rounded styling on scroll area", async () => {
      render(<ComentariosAuditoria auditoriaId="123" />);

      await waitFor(() => {
        const scrollArea = document.querySelector(".border.rounded-md");
        expect(scrollArea).toBeTruthy();
      });
    });
  });
});
