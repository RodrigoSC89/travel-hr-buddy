import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TipTapEditor from "@/components/editor/TipTapEditor";
import "@testing-library/jest-dom";

// Mock TipTap dependencies
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => "<p>Test content</p>"),
    commands: {
      setContent: vi.fn(),
    },
  })),
  EditorContent: ({ editor }: { editor: any }) => <div data-testid="editor-content">Editor Content</div>,
}));

describe("TipTapEditor", () => {
  it("renders the editor component", () => {
    const mockOnChange = vi.fn();
    render(<TipTapEditor content="<p>Initial content</p>" onChange={mockOnChange} />);
    
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("handles content prop as string", () => {
    const mockOnChange = vi.fn();
    const content = "<p>Test content</p>";
    
    render(<TipTapEditor content={content} onChange={mockOnChange} />);
    
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("handles content prop as object", () => {
    const mockOnChange = vi.fn();
    const content = { type: "doc", content: [] };
    
    render(<TipTapEditor content={content} onChange={mockOnChange} />);
    
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });
});
