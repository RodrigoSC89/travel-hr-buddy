import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobCards from "@/components/mmi/JobCards";

describe("JobCards Component", () => {
  it("renders without crashing", () => {
    render(<JobCards />);
  });

  it("displays job cards with correct structure", async () => {
    render(<JobCards />);
    
    // Wait for the component to render with mock data
    const jobTitles = await screen.findAllByRole("heading", { level: 3 });
    expect(jobTitles.length).toBeGreaterThan(0);
  });

  it("shows job details including component and vessel", async () => {
    render(<JobCards />);
    
    // Check if component and vessel info is rendered
    const componentText = await screen.findByText(/Componente:/);
    expect(componentText).toBeInTheDocument();
    
    const vesselText = await screen.findByText(/Embarcação:/);
    expect(vesselText).toBeInTheDocument();
  });

  it("displays priority and status badges", async () => {
    render(<JobCards />);
    
    // Check for badges
    const priorityBadge = await screen.findByText(/Prioridade:/);
    expect(priorityBadge).toBeInTheDocument();
    
    const statusBadge = await screen.findByText(/Status:/);
    expect(statusBadge).toBeInTheDocument();
  });

  it("shows AI suggestion badge and content when available", async () => {
    render(<JobCards />);
    
    // Check for AI suggestion badge
    const aiSuggestion = await screen.findByText(/💡 Sugestão IA/);
    expect(aiSuggestion).toBeInTheDocument();
  });

  it("displays action buttons", async () => {
    render(<JobCards />);
    
    // Check for action buttons
    const detailsButtons = await screen.findAllByText("Ver detalhes");
    expect(detailsButtons.length).toBeGreaterThan(0);
    
    const executeButtons = await screen.findAllByText("Executar Job");
    expect(executeButtons.length).toBeGreaterThan(0);
  });
});
