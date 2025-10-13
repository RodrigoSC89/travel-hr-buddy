import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock DocumentEditor component
vi.mock("@/components/documents/DocumentEditor", () => ({
  default: ({ documentId }: { documentId: string }) => React.createElement('div', { 'data-testid': 'document-editor' }, `DocumentEditor with ID: ${documentId}`),
}));

// Import after mocking
import DocumentEditorDemo from "@/pages/admin/documents/DocumentEditorDemo";

describe("DocumentEditorDemo Page", () => {
  it("should render page title", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByText(/Collaborative Document Editor Demo/i)).toBeInTheDocument();
  });

  it("should render instructions alert", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByText(/How to Test Collaboration/i)).toBeInTheDocument();
  });

  it("should render document ID input", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByLabelText(/Document ID/i)).toBeInTheDocument();
  });

  it("should render generate new button", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByText(/Generate New/i)).toBeInTheDocument();
  });

  it("should render features section", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Collaboration:/i)).toBeInTheDocument();
  });

  it("should render technical details section", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByText(/Technical Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Architecture/i)).toBeInTheDocument();
  });

  it("should render DocumentEditor component", () => {
    render(React.createElement(DocumentEditorDemo));
    expect(screen.getByTestId("document-editor")).toBeInTheDocument();
  });
});
