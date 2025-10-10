import { render, screen } from "@testing-library/react";
import ModuleDetail from "@/components/ModuleDetail";

describe("ModuleDetail", () => {
  it("renders title and description", () => {
    render(<ModuleDetail title="IA & Inovação" description="Testando o módulo" />);
    expect(screen.getByText("IA & Inovação")).toBeInTheDocument();
    expect(screen.getByText("Testando o módulo")).toBeInTheDocument();
  });
});
