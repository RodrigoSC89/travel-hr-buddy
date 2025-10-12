import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChecklistViewPage from "@/pages/admin/checklist-view";

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
    session: null,
    isLoading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockChecklistData = {
  id: "test-checklist-id",
  title: "Test Checklist",
  type: "outro",
  status: "rascunho",
  created_at: "2025-01-01T00:00:00Z",
  created_by: "test-user-id",
  source_type: "assistant",
};

const mockItemsData = [
  {
    id: "item-1",
    title: "Test Item 1",
    description: "Description 1",
    completed: false,
    completed_at: null,
    criticality: "media",
    order_index: 0,
  },
  {
    id: "item-2",
    title: "Test Item 2",
    description: "Description 2",
    completed: true,
    completed_at: "2025-01-01T10:00:00Z",
    criticality: "alta",
    order_index: 1,
  },
];

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "operational_checklists") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockChecklistData,
                error: null,
              })),
            })),
          })),
        };
      } else if (table === "checklist_items") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockItemsData,
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          data: [],
          error: null,
        })),
      };
    }),
  },
}));

describe("ChecklistViewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders checklist details correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/checklists/view/test-checklist-id"]}>
        <Routes>
          <Route path="/admin/checklists/view/:id" element={<ChecklistViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Checklist")).toBeInTheDocument();
    });

    expect(screen.getByText(/Tipo: outro/i)).toBeInTheDocument();
    expect(screen.getByText(/Origem: assistant/i)).toBeInTheDocument();
  });

  it("displays checklist items", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/checklists/view/test-checklist-id"]}>
        <Routes>
          <Route path="/admin/checklists/view/:id" element={<ChecklistViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Item 1")).toBeInTheDocument();
      expect(screen.getByText("Test Item 2")).toBeInTheDocument();
    });

    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("shows progress correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/checklists/view/test-checklist-id"]}>
        <Routes>
          <Route path="/admin/checklists/view/:id" element={<ChecklistViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // 1 of 2 items completed = 50%
      expect(screen.getByText(/Progresso: 1 de 2 itens/i)).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });
  });
});
