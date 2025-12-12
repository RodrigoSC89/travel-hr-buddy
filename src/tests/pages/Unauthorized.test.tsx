import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Unauthorized from "@/pages/Unauthorized";

describe("Unauthorized Component", () => {
  it("should render unauthorized message with emoji", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    expect(screen.getByText(/⛔ Acesso Negado/)).toBeInTheDocument();
  });

  it("should display permission denied message", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Você não tem permissão para visualizar esta página/)
    ).toBeInTheDocument();
  });

  it("should display token error message", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Token de acesso inválido ou ausente/)
    ).toBeInTheDocument();
  });

  it("should have white background and red text color classes", () => {
    const { container } = render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    const mainDiv = container.querySelector(".bg-white");
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass("text-red-600");
  });
});
