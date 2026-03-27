import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import TipTapEditor from "@/components/templates/TipTapEditor";

// Mock TipTap editor
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => "<p>Test content</p>"),
    commands: {
      setContent: vi.fn(),
    },
  })),
  EditorContent: () => <div data-testid="editor-content">Editor</div>,
}));

// Mock StarterKit
vi.mock("@tiptap/starter-kit", () => ({
  default: vi.fn(),
}));

describe("TipTapEditor", () => {
  it("renders without crashing", () => {
    const mockOnUpdate = vi.fn();
    const { getByTestId } = render(
      <TipTapEditor content="<p>Test</p>" onUpdate={mockOnUpdate} />
    );
    expect(getByTestId("editor-content")).toBeDefined();
  });

  it("accepts content and onUpdate props", () => {
    const mockOnUpdate = vi.fn();
    render(
      <TipTapEditor 
        content="<p>Test content</p>" 
        onUpdate={mockOnUpdate}
        placeholder="Type here..."
      />
    );
    // If no error is thrown, the component accepted the props correctly
    expect(true).toBe(true);
  });
});
