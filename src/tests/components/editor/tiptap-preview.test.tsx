import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TipTapPreview from "@/components/editor/tiptap-preview";

// Mock TipTap dependencies with vi.hoisted
const { mockUseEditor } = vi.hoisted(() => {
  return {
    mockUseEditor: vi.fn(() => ({
      commands: {},
      state: {},
    })),
  };
});

vi.mock("@tiptap/react", () => ({
  useEditor: mockUseEditor,
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="editor-content">Editor Content</div>
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {},
}));

describe("TipTapPreview", () => {
  it("should render the component", () => {
    render(<TipTapPreview content="Test content" />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should apply default className", () => {
    const { container } = render(<TipTapPreview content="Test content" />);
    const editorContainer = container.querySelector(".border.rounded-lg.bg-white");
    expect(editorContainer).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<TipTapPreview content="Test content" className="custom-class" />);
    const editorContainer = container.querySelector(".custom-class");
    expect(editorContainer).toBeInTheDocument();
  });

  it("should be readonly by default", () => {
    render(<TipTapPreview content="Test content" />);
    
    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: false,
      })
    );
  });

  it("should be editable when readOnly is false", () => {
    render(<TipTapPreview content="Test content" readOnly={false} />);
    
    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: true,
      })
    );
  });

  it("should pass content to editor", () => {
    const testContent = "Hello, world!";
    
    render(<TipTapPreview content={testContent} />);
    
    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        content: testContent,
      })
    );
  });
});
