import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentsPage from "@/pages/Documents";

// Mock ModulePageWrapper
vi.mock("@/components/ui/module-page-wrapper", () => ({
  ModulePageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock ModuleHeader
vi.mock("@/components/ui/module-header", () => ({
  ModuleHeader: () => <div>Centro de Documentos</div>,
}));

// Mock AdvancedDocumentCenter
vi.mock("@/components/documents/advanced-document-center", () => ({
  AdvancedDocumentCenter: () => <div>Advanced Document Center</div>,
}));

describe("DocumentsPage Component", () => {
  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <DocumentsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Centro de Documentos/i)).toBeInTheDocument();
  });

  it("should render AdvancedDocumentCenter component", () => {
    render(
      <MemoryRouter>
        <DocumentsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Advanced Document Center/i)).toBeInTheDocument();
  });
});
