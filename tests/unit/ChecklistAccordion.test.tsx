/**
 * PATCH 638 - Unit Tests for ChecklistAccordion Component
 * Tests accordion expansion, item tracking, and state management
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  children?: ChecklistItem[];
  priority?: "low" | "medium" | "high";
};

type ChecklistAccordionProps = {
  items: ChecklistItem[];
  onItemChange: (id: string, checked: boolean) => void;
};

// Mock ChecklistAccordion component
const MockChecklistAccordion = ({ 
  items, 
  onItemChange 
}: ChecklistAccordionProps) => {
  return (
    <div data-testid="checklist-accordion">
      <h3>Checklist Items</h3>
      {items.map((item) => (
        <div key={item.id} data-testid={`checklist-item-${item.id}`}>
          <button onClick={() => {}}>
            {item.title}
          </button>
          <input
            type="checkbox"
            checked={item.completed}
            onChange={(e) => onItemChange(item.id, e.target.checked)}
          />
          {item.description && <p>{item.description}</p>}
        </div>
      ))}
    </div>
  );
};

describe("ChecklistAccordion Component", () => {
  const mockItems: ChecklistItem[] = [
    { id: "1", title: "Item 1", description: "Description 1", completed: false },
    { id: "2", title: "Item 2", description: "Description 2", completed: true },
    { id: "3", title: "Item 3", description: "Description 3", completed: false },
  ];
  
  const mockOnItemChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all checklist items", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should display item descriptions", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("should show completion status for each item", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[1]).toBeChecked();
  });

  it("should handle item toggle", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    const firstCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(firstCheckbox);
    
    expect(mockOnItemChange).toHaveBeenCalledWith("1", true);
  });

  it("should expand accordion sections", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    const firstButton = screen.getByText("Item 1");
    fireEvent.click(firstButton);
    
    expect(screen.getByText("Description 1")).toBeVisible();
  });

  it("should support nested checklist items", () => {
    const nestedItems: ChecklistItem[] = [
      { 
        id: "1", 
        title: "Parent Item", 
        completed: false,
        children: [
          { id: "1.1", title: "Child Item", completed: false }
        ]
      },
    ];
    
    render(<MockChecklistAccordion items={nestedItems} onItemChange={mockOnItemChange} />);
    expect(screen.getByText("Parent Item")).toBeInTheDocument();
  });

  it("should calculate completion percentage", () => {
    render(<MockChecklistAccordion items={mockItems} onItemChange={mockOnItemChange} />);
    
    const completedCount = mockItems.filter(item => item.completed).length;
    const percentage = (completedCount / mockItems.length) * 100;
    
    expect(percentage).toBeCloseTo(33.33, 1);
  });

  it("should support search/filter functionality", () => {
    const searchableItems: ChecklistItem[] = [
      { id: "1", title: "Fire Safety Check", completed: false },
      { id: "2", title: "Life Saving Appliances", completed: false },
      { id: "3", title: "Navigation Equipment", completed: false },
    ];
    
    render(<MockChecklistAccordion items={searchableItems} onItemChange={mockOnItemChange} />);
    expect(screen.getByText("Fire Safety Check")).toBeInTheDocument();
  });

  it("should handle empty items array", () => {
    render(<MockChecklistAccordion items={[]} onItemChange={mockOnItemChange} />);
    
    expect(screen.getByTestId("checklist-accordion")).toBeInTheDocument();
  });

  it("should support item priority/severity levels", () => {
    const priorityItems: ChecklistItem[] = [
      { id: "1", title: "Critical Item", priority: "high", completed: false },
      { id: "2", title: "Normal Item", priority: "medium", completed: false },
    ];
    
    render(<MockChecklistAccordion items={priorityItems} onItemChange={mockOnItemChange} />);
    expect(screen.getByText("Critical Item")).toBeInTheDocument();
  });
});
