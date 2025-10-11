import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import IntelligentDocumentsPage from "@/pages/IntelligentDocuments";

// Mock ModulePageWrapper
vi.mock("@/components/ui/module-page-wrapper", () => ({
  ModulePageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock IntelligentDocumentManager
vi.mock("@/components/documents/intelligent-document-manager", () => ({
  default: () => <div>Intelligent Document Manager</div>,
}));

describe("IntelligentDocumentsPage Component", () => {
  it("should render IntelligentDocumentManager component", () => {
    render(
      <MemoryRouter>
        <IntelligentDocumentsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Intelligent Document Manager/i)).toBeInTheDocument();
  });
});
