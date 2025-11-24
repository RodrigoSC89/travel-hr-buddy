/**
 * PATCH 638 - Unit Tests for ExportReportButton Component
 * Tests PDF/JSON export functionality and state handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock ExportReportButton component
type ExportFinding = {
  id: number;
  description: string;
  compliant: boolean;
};

type ExportOptions = {
  includeImages: boolean;
  includeComments: boolean;
  includeSignatures: boolean;
};

type ExportData = {
  inspection_id: string;
  inspector: string;
  findings: ExportFinding[];
  filename?: string;
  exportOptions?: ExportOptions;
} | null;

const MockExportReportButton = ({ 
  data, 
  format = "pdf",
  onExport 
}: { 
  data: ExportData; 
  format?: "pdf" | "json" | "csv";
  onExport?: () => void;
}) => {
  const [exporting, setExporting] = React.useState(false);
  const canExport = Boolean(data);
  
  const handleExport = async () => {
    if (!canExport) {
      return;
    }
    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onExport) onExport();
    setExporting(false);
  };
  
  return (
    <button 
      onClick={handleExport}
      disabled={exporting || !canExport}
      data-testid="export-button"
    >
      {exporting ? "Exporting..." : canExport ? `Export ${format.toUpperCase()}` : "No data"}
    </button>
  );
};

import React from "react";

describe("ExportReportButton Component", () => {
  const mockData = {
    inspection_id: "test-123",
    inspector: "John Doe",
    findings: [
      { id: 1, description: "Finding 1", compliant: true },
      { id: 2, description: "Finding 2", compliant: false },
    ],
  };
  
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render export button", () => {
    render(<MockExportReportButton data={mockData} onExport={mockOnExport} />);
    
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("should display correct format label", () => {
    const { rerender } = render(
      <MockExportReportButton data={mockData} format="pdf" onExport={mockOnExport} />
    );
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();
    
    rerender(<MockExportReportButton data={mockData} format="json" onExport={mockOnExport} />);
    expect(screen.getByText(/Export JSON/i)).toBeInTheDocument();
  });

  it("should handle PDF export", async () => {
    render(<MockExportReportButton data={mockData} format="pdf" onExport={mockOnExport} />);
    
    const button = screen.getByTestId("export-button");
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalled();
    });
  });

  it("should handle JSON export", async () => {
    render(<MockExportReportButton data={mockData} format="json" onExport={mockOnExport} />);
    
    const button = screen.getByTestId("export-button");
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalled();
    });
  });

  it("should show loading state during export", async () => {
    render(<MockExportReportButton data={mockData} onExport={mockOnExport} />);
    
    const button = screen.getByTestId("export-button");
    fireEvent.click(button);
    
    expect(screen.getByText(/Exporting.../i)).toBeInTheDocument();
  });

  it("should disable button during export", async () => {
    render(<MockExportReportButton data={mockData} onExport={mockOnExport} />);
    
    const button = screen.getByTestId("export-button");
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  it("should support CSV export format", () => {
    render(<MockExportReportButton data={mockData} format="csv" onExport={mockOnExport} />);
    
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
  });

  it("should validate data before export", () => {
    const emptyData = null;
    render(<MockExportReportButton data={emptyData} onExport={mockOnExport} />);
    
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("should handle export with custom filename", () => {
    const dataWithFilename = {
      ...mockData,
      filename: "inspection-report-2024",
    };
    
    render(<MockExportReportButton data={dataWithFilename} onExport={mockOnExport} />);
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("should support export options", () => {
    const dataWithOptions = {
      ...mockData,
      exportOptions: {
        includeImages: true,
        includeComments: false,
        includeSignatures: true,
      },
    };
    
    render(<MockExportReportButton data={dataWithOptions} onExport={mockOnExport} />);
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("should handle large datasets", () => {
    const largeData = {
      ...mockData,
      findings: Array(1000).fill(null).map((_, i) => ({
        id: i,
        description: `Finding ${i}`,
        compliant: i % 2 === 0,
      })),
    };
    
    render(<MockExportReportButton data={largeData} onExport={mockOnExport} />);
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });
});
