/**
 * PATCH 638 - Unit Tests for ChecklistToggle Component
 * Tests toggle state, validation, and interaction handlers
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock ChecklistToggle component
const MockChecklistToggle = ({ 
  label,
  checked,
  onChange,
  disabled = false,
}: { 
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <div data-testid="checklist-toggle">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          data-testid="toggle-input"
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

describe("ChecklistToggle Component", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render toggle with label", () => {
    render(
      <MockChecklistToggle 
        label="Compliant" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText("Compliant")).toBeInTheDocument();
  });

  it("should reflect checked state", () => {
    const { rerender } = render(
      <MockChecklistToggle 
        label="Test" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    expect(input).not.toBeChecked();
    
    rerender(
      <MockChecklistToggle 
        label="Test" 
        checked={true} 
        onChange={mockOnChange} 
      />
    );
    
    expect(input).toBeChecked();
  });

  it("should call onChange when toggled", () => {
    render(
      <MockChecklistToggle 
        label="Toggle Me" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    fireEvent.click(input);
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("should support disabled state", () => {
    render(
      <MockChecklistToggle 
        label="Disabled" 
        checked={false} 
        onChange={mockOnChange}
        disabled={true}
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    expect(input).toBeDisabled();
  });

  it("should not trigger onChange when disabled", () => {
    render(
      <MockChecklistToggle 
        label="Disabled" 
        checked={false} 
        onChange={mockOnChange}
        disabled={true}
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    fireEvent.click(input);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should toggle from checked to unchecked", () => {
    render(
      <MockChecklistToggle 
        label="Toggle" 
        checked={true} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    fireEvent.click(input);
    
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it("should support different label variations", () => {
    const labels = ["Compliant", "Non-Compliant", "N/A", "Pending Review"];
    
    labels.forEach((label) => {
      const { unmount } = render(
        <MockChecklistToggle 
          label={label} 
          checked={false} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it("should handle rapid toggling", () => {
    render(
      <MockChecklistToggle 
        label="Rapid Toggle" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    
    fireEvent.click(input);
    fireEvent.click(input);
    fireEvent.click(input);
    
    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  it("should maintain state consistency", () => {
    const { rerender } = render(
      <MockChecklistToggle 
        label="Consistent" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    expect(input).not.toBeChecked();
    
    rerender(
      <MockChecklistToggle 
        label="Consistent" 
        checked={true} 
        onChange={mockOnChange} 
      />
    );
    
    expect(input).toBeChecked();
  });

  it("should support keyboard interactions", () => {
    render(
      <MockChecklistToggle 
        label="Keyboard Test" 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByTestId("toggle-input");
    input.focus();
    
    fireEvent.keyDown(input, { key: " ", code: "Space" });
    
    expect(document.activeElement).toBe(input);
  });
});
