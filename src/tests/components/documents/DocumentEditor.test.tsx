import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentEditor from "@/components/documents/DocumentEditor";

// Mock @tiptap/react
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => null),
  EditorContent: vi.fn(({ className }) => <div data-testid="editor-content" className={className} />),
}));

// Mock @supabase/auth-helpers-nextjs
vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { id: "test-user-id", email: "test@example.com" } 
          } 
        } 
      })),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

// Mock y-webrtc
vi.mock("y-webrtc", () => ({
  WebrtcProvider: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}));

// Mock yjs
vi.mock("yjs", () => ({
  Doc: vi.fn(() => ({})),
}));

// Mock lodash
vi.mock("lodash", () => ({
  debounce: vi.fn((fn) => fn),
}));

describe("DocumentEditor Component", () => {
  const mockDocumentId = "test-doc-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the editor with title", () => {
    render(<DocumentEditor documentId={mockDocumentId} />);
    expect(screen.getByText("📝 Editor Colaborativo")).toBeInTheDocument();
  });

  it("should render the editor content area", () => {
    render(<DocumentEditor documentId={mockDocumentId} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    render(<DocumentEditor documentId={mockDocumentId} />);
    expect(screen.getByText("🧹 Limpar")).toBeInTheDocument();
    expect(screen.getByText("♻️ Restaurar Última Versão")).toBeInTheDocument();
  });
});
