import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SGSOPlan {
  id: string;
  title: string;
  description: string;
  status: string;
  version: number;
  vessel_id?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SGSOAction {
  id: string;
  plan_id: string;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  responsible_user_id?: string;
  due_date?: string;
  completed_date?: string;
  completion_notes?: string;
}

export const generateSgsoReportPDF = async (
  plan: SGSOPlan,
  actions: SGSOAction[],
  vesselName?: string,
  responsibleUsers?: Record<string, string>
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SGSO - Safety Management System Report", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Plan Information
  doc.setFontSize(16);
  doc.text("Plan Information", 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const planInfo = [
    ["Plan Title:", plan.title],
    ["Status:", plan.status.toUpperCase()],
    ["Version:", `v${plan.version}`],
    ["Vessel:", vesselName || "N/A"],
    ["Start Date:", plan.start_date ? new Date(plan.start_date).toLocaleDateString() : "N/A"],
    ["End Date:", plan.end_date ? new Date(plan.end_date).toLocaleDateString() : "N/A"],
    ["Created:", new Date(plan.created_at).toLocaleDateString()],
    ["Last Updated:", new Date(plan.updated_at).toLocaleDateString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: planInfo,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: "auto" },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Description
  if (plan.description) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Description:", 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(plan.description, pageWidth - 28);
    doc.text(splitDescription, 14, yPosition);
    yPosition += splitDescription.length * 5 + 10;
  }

  // Actions Summary
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Actions Summary", 14, yPosition);
  yPosition += 10;

  const actionsByStatus = actions.reduce((acc, action) => {
    acc[action.status] = (acc[action.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionsByPriority = actions.reduce((acc, action) => {
    acc[action.priority] = (acc[action.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryData = [
    ["Total Actions:", actions.length.toString()],
    ["Pending:", (actionsByStatus["pending"] || 0).toString()],
    ["In Progress:", (actionsByStatus["in_progress"] || 0).toString()],
    ["Completed:", (actionsByStatus["completed"] || 0).toString()],
    ["Critical Priority:", (actionsByPriority["critical"] || 0).toString()],
    ["High Priority:", (actionsByPriority["high"] || 0).toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Actions Detail Table
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Corrective Actions Detail", 14, yPosition);
  yPosition += 10;

  const actionsTableData = actions.map((action) => [
    action.title,
    action.action_type,
    action.priority,
    action.status,
    action.due_date ? new Date(action.due_date).toLocaleDateString() : "N/A",
    action.responsible_user_id && responsibleUsers
      ? responsibleUsers[action.responsible_user_id] || "Unassigned"
      : "Unassigned",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Action", "Type", "Priority", "Status", "Due Date", "Responsible"]],
    body: actionsTableData,
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Actions with descriptions (on new pages if needed)
  if (actions.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Actions Detail", 14, yPosition);
    yPosition += 10;

    actions.forEach((action, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${action.title}`, 14, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const actionDetails = [
        `Type: ${action.action_type}`,
        `Priority: ${action.priority}`,
        `Status: ${action.status}`,
        `Due Date: ${action.due_date ? new Date(action.due_date).toLocaleDateString() : "N/A"}`,
      ];

      actionDetails.forEach((detail) => {
        doc.text(detail, 20, yPosition);
        yPosition += 5;
      });

      if (action.description) {
        yPosition += 2;
        doc.setFont("helvetica", "italic");
        doc.text("Description:", 20, yPosition);
        yPosition += 5;
        const splitDesc = doc.splitTextToSize(action.description, pageWidth - 35);
        doc.setFont("helvetica", "normal");
        doc.text(splitDesc, 20, yPosition);
        yPosition += splitDesc.length * 5;
      }

      if (action.completion_notes) {
        yPosition += 2;
        doc.setFont("helvetica", "italic");
        doc.text("Completion Notes:", 20, yPosition);
        yPosition += 5;
        const splitNotes = doc.splitTextToSize(action.completion_notes, pageWidth - 35);
        doc.setFont("helvetica", "normal");
        doc.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 5;
      }

      yPosition += 10;
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc.output("blob");
};
