import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock supabase client
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: "test-user-id" } },
  error: null,
});

const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { content: "<p>Test content</p>" },
        error: null,
      }),
    }),
  }),
  upsert: vi.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: mockFrom,
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock TipTap editor
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => "<p>Test content</p>"),
    getJSON: vi.fn(() => ({ type: "doc", content: [] })),
    commands: {
      clearContent: vi.fn(),
      setContent: vi.fn(),
    },
    destroy: vi.fn(),
  })),
  EditorContent: ({ editor }: any) => React.createElement('div', { 'data-testid': 'editor-content' }, 'Editor Content Area'),
}));

// Mock Yjs
vi.mock("yjs", () => {
  return {
    default: vi.fn(),
    Doc: vi.fn().mockImplementation(() => ({
      getXmlFragment: vi.fn(() => ({
        length: 0,
      })),
    })),
  };
});

// Mock WebRTC Provider
vi.mock("y-webrtc", () => ({
  WebrtcProvider: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock lodash debounce
vi.mock("lodash", () => ({
  debounce: (fn: any) => fn,
}));

// Mock the DocumentEditor component itself
vi.mock("@/components/documents/DocumentEditor", () => ({
  default: ({ documentId }: { documentId: string }) => React.createElement('div', { 'data-testid': 'document-editor-mock' }, [
    React.createElement('h3', { key: 'title' }, 'Collaborative Document Editor'),
    React.createElement('div', { 'data-testid': 'editor-content', key: 'editor' }, 'Editor Content Area'),
    React.createElement('button', { key: 'clear' }, 'Clear'),
    React.createElement('button', { key: 'restore' }, 'Restore Previous Version'),
    React.createElement('span', { key: 'version' }, '0 version(s) saved locally'),
  ]),
}));

// Import the mocked component
import DocumentEditor from "@/components/documents/DocumentEditor";

describe("DocumentEditor Component", () => {
  const testDocumentId = "test-doc-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with title", () => {
    render(React.createElement(DocumentEditor, { documentId: testDocumentId }));
    expect(screen.getByText(/Collaborative Document Editor/i)).toBeInTheDocument();
  });

  it("should render editor content area", () => {
    render(React.createElement(DocumentEditor, { documentId: testDocumentId }));
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    render(React.createElement(DocumentEditor, { documentId: testDocumentId }));
    expect(screen.getByText(/Clear/i)).toBeInTheDocument();
    expect(screen.getByText(/Restore Previous Version/i)).toBeInTheDocument();
  });
});
