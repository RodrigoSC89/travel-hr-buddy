import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TipTapEditor from "@/components/editor/TipTapEditor";
import "@testing-library/jest-dom";

// Mock TipTap dependencies
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn((config) => {
    return {
      getHTML: vi.fn(() => "<p>Test content</p>"),
      getJSON: vi.fn(() => ({ type: "doc", content: [] })),
      commands: {
        setContent: vi.fn(),
      },
    };
  }),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor</div>,
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {},
}));

describe("TipTapEditor", () => {
  it("should render the editor", () => {
    render(<TipTapEditor content="<p>Test</p>" />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should accept string content", () => {
    const { container } = render(<TipTapEditor content="<p>String content</p>" />);
    expect(container).toBeInTheDocument();
  });

  it("should accept object content", () => {
    const content = { type: "doc", content: [] };
    const { container } = render(<TipTapEditor content={content} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle onChange callback", () => {
    const onChange = vi.fn();
    render(<TipTapEditor content="<p>Test</p>" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled(); // Only called on user edit
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TipTapEditor content="<p>Test</p>" className="custom-class" />
    );
    const editorWrapper = container.querySelector(".border");
    expect(editorWrapper).toHaveClass("custom-class");
  });

  it("should support editable prop", () => {
    const { container } = render(
      <TipTapEditor content="<p>Test</p>" editable={false} />
    );
    expect(container).toBeInTheDocument();
  });
});
