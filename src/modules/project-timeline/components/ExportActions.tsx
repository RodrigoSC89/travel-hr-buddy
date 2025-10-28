/**
 * Project Timeline Export Component
 * PATCH 389 - PDF and ICS export functionality
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileDown, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface Task {
  id: string;
  task_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  progress: number;
  description?: string;
}

interface ExportActionsProps {
  tasks: Task[];
}

export const ExportActions: React.FC<ExportActionsProps> = ({ tasks }) => {
  const { toast } = useToast();

  const exportToPDF = () => {
    if (tasks.length === 0) {
      toast({
        title: 'No tasks to export',
        description: 'Create some tasks first',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Project Timeline - Gantt Chart', 14, 15);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 22);

    // Prepare table data
    const tableData = tasks.map(task => [
      task.project_name,
      task.task_name,
      format(new Date(task.start_date), 'PP'),
      format(new Date(task.end_date), 'PP'),
      task.status,
      task.priority,
      `${task.progress}%`
    ]);

    // Add table
    autoTable(doc, {
      head: [['Project', 'Task', 'Start Date', 'End Date', 'Status', 'Priority', 'Progress']],
      body: tableData,
      startY: 28,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    // Add summary statistics
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(10);
    doc.text('Summary:', 14, finalY + 10);
    doc.text(`Total Tasks: ${tasks.length}`, 14, finalY + 16);
    doc.text(`Completed: ${completedTasks}`, 14, finalY + 22);
    doc.text(`In Progress: ${inProgressTasks}`, 14, finalY + 28);
    doc.text(`Pending: ${pendingTasks}`, 14, finalY + 34);

    // Save the PDF
    doc.save(`project-timeline-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    toast({
      title: 'PDF exported successfully',
      description: 'Your project timeline has been downloaded',
    });
  };

  const exportToICS = () => {
    if (tasks.length === 0) {
      toast({
        title: 'No tasks to export',
        description: 'Create some tasks first',
        variant: 'destructive',
      });
      return;
    }

    // Create ICS file content
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Travel HR Buddy//Project Timeline//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Project Timeline',
      'X-WR-TIMEZONE:UTC',
    ].join('\r\n');

    // Add each task as an event
    tasks.forEach(task => {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);

      // Format dates as YYYYMMDD
      const formatICSDate = (date: Date) => {
        return format(date, 'yyyyMMdd');
      };

      const event = [
        'BEGIN:VEVENT',
        `UID:${task.id}@travel-hr-buddy.com`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART;VALUE=DATE:${formatICSDate(startDate)}`,
        `DTEND;VALUE=DATE:${formatICSDate(endDate)}`,
        `SUMMARY:${task.task_name}`,
        `DESCRIPTION:Project: ${task.project_name}\\nStatus: ${task.status}\\nProgress: ${task.progress}%\\nPriority: ${task.priority}`,
        `LOCATION:${task.project_name}`,
        `STATUS:${task.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        `PRIORITY:${task.priority === 'critical' ? '1' : task.priority === 'high' ? '3' : '5'}`,
        'END:VEVENT',
      ].join('\r\n');

      icsContent += '\r\n' + event;
    });

    icsContent += '\r\nEND:VCALENDAR';

    // Create and download the file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-timeline-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Calendar exported successfully',
      description: 'Import the .ics file to your calendar application',
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportToPDF}>
        <FileDown className="mr-2 h-4 w-4" />
        Export to PDF
      </Button>
      <Button variant="outline" onClick={exportToICS}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        Export to Calendar
      </Button>
    </div>
  );
};
