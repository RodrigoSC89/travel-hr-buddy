import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Unauthorized from "@/pages/Unauthorized";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Unauthorized Component", () => {
  it("should render unauthorized message", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    expect(screen.getByText("Acesso Negado")).toBeInTheDocument();
    expect(
      screen.getByText(/Você não tem permissão para acessar esta página/)
    ).toBeInTheDocument();
  });

  it("should display shield icon", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    // Check for icon by aria-label or data-testid if available
    const shieldIcon = document.querySelector("svg");
    expect(shieldIcon).toBeInTheDocument();
  });

  it("should navigate to home when button is clicked", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    const button = screen.getByText("Voltar para a página inicial");
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should display token error message", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/O token de acesso fornecido é inválido ou está ausente/)
    ).toBeInTheDocument();
  });
});
