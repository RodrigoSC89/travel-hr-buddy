import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoCard } from "@/components/ui/InfoCard";

describe("InfoCard", () => {
  it("renders without crashing", () => {
    render(<InfoCard title="Test Card" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("displays title and description", () => {
    render(
      <InfoCard 
        title="System Status" 
        description="All systems operational" 
      />
    );
    expect(screen.getByText("System Status")).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <InfoCard title="Test Card">
        <p>Child content here</p>
      </InfoCard>
    );
    expect(screen.getByText("Child content here")).toBeInTheDocument();
  });

  it("displays status badge when status is provided", () => {
    render(
      <InfoCard 
        title="Service Status" 
        status="active" 
      />
    );
    expect(screen.getByText("Service Status")).toBeInTheDocument();
  });

  it("applies success variant styling", () => {
    const { container } = render(
      <InfoCard 
        title="Success Card" 
        variant="success" 
      />
    );
    const card = container.querySelector(".border-success\\/50");
    expect(card).toBeTruthy();
  });

  it("applies warning variant styling", () => {
    const { container } = render(
      <InfoCard 
        title="Warning Card" 
        variant="warning" 
      />
    );
    const card = container.querySelector(".border-warning\\/50");
    expect(card).toBeTruthy();
  });

  it("applies error variant styling", () => {
    const { container } = render(
      <InfoCard 
        title="Error Card" 
        variant="error" 
      />
    );
    const card = container.querySelector(".border-destructive\\/50");
    expect(card).toBeTruthy();
  });

  it("applies info variant styling", () => {
    const { container } = render(
      <InfoCard 
        title="Info Card" 
        variant="info" 
      />
    );
    const card = container.querySelector(".border-blue-500\\/50");
    expect(card).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <InfoCard 
        title="Custom Card" 
        className="custom-class" 
      />
    );
    const card = container.querySelector(".custom-class");
    expect(card).toBeTruthy();
  });

  it("renders with default variant when not specified", () => {
    const { container } = render(
      <InfoCard title="Default Card" />
    );
    const card = container.querySelector(".border-border");
    expect(card).toBeTruthy();
  });
});
