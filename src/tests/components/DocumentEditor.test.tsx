import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { useAuth } from "@/contexts/AuthContext";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })),
  },
}));
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock TipTap and related libraries
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => "<p>Test content</p>"),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleHeading: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleCodeBlock: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    isActive: vi.fn(() => false),
  })),
  EditorContent: vi.fn(() => null),
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {
    configure: vi.fn(),
  },
}));

vi.mock("@tiptap/extension-collaboration", () => ({
  default: {
    configure: vi.fn(),
  },
}));

vi.mock("@tiptap/extension-collaboration-cursor", () => ({
  default: {
    configure: vi.fn(),
  },
}));

vi.mock("yjs", () => ({
  Doc: vi.fn().mockImplementation(() => ({
    getXmlFragment: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("y-webrtc", () => ({
  WebrtcProvider: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("lodash", () => ({
  debounce: vi.fn((fn) => fn),
}));

describe("DocumentEditor", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it("renders the collaborative document editor", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Collaborative Document Editor/)).toBeInTheDocument();
  });

  it("shows user presence count", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    // Should show at least the current user
    expect(screen.getByText(/user/)).toBeInTheDocument();
  });

  it("displays save button", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByRole("button", { name: /Save Now/i })).toBeInTheDocument();
  });

  it("shows auto-save information", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Auto-save: Every 3 seconds/)).toBeInTheDocument();
  });

  it("displays version counter", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Versions saved:/)).toBeInTheDocument();
  });

  it("shows formatting toolbar buttons", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    // Check for formatting buttons (Bold, Italic, H1, H2, List, Code)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(5); // At least toolbar buttons + save button
  });

  it("renders with required documentId prop", () => {
    const documentId = "550e8400-e29b-41d4-a716-446655440000";
    render(<DocumentEditor documentId={documentId} />);
    
    expect(screen.getByText(/Collaborative Document Editor/)).toBeInTheDocument();
  });

  it("initializes with zero versions", () => {
    render(<DocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Versions saved: 0/)).toBeInTheDocument();
  });
});
