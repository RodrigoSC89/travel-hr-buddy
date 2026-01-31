/**
 * HistoryExporter Component - Export chat history to JSON or PDF
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { type ChatSession } from "@/hooks/use-audit-chat-persistence";
import jsPDF from "jspdf";
import { logger } from '@/lib/logger';

interface HistoryExporterProps {
  sessions: ChatSession[];
  activeModule: 'peotram' | 'peodp';
}

export function HistoryExporter({ sessions, activeModule }: HistoryExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = () => {
    if (sessions.length === 0) {
      toast.error("Nenhuma conversa para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        module: activeModule,
        totalSessions: sessions.length,
        sessions: sessions.map(session => ({
          id: session.id,
          title: session.title,
          module: session.module,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messages: session.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-chat-${activeModule}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${sessions.length} conversas exportadas para JSON`);
    } catch (error) {
      logger.error('Export error:', error);
      toast.error("Erro ao exportar para JSON");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (sessions.length === 0) {
      toast.error("Nenhuma conversa para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(`Histórico de Conversas - ${activeModule.toUpperCase()}`, margin, yPosition);
      yPosition += 10;

      // Export info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Total de conversas: ${sessions.length}`, margin, yPosition);
      yPosition += 10;

      // Line separator
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Sort sessions by date
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      for (const session of sortedSessions) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }

        // Session header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        
        const titleLines = doc.splitTextToSize(session.title, contentWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 5 + 2;

        // Session metadata
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        const dateStr = new Date(session.createdAt).toLocaleDateString('pt-BR');
        doc.text(`${session.messages.length} mensagens • ${dateStr}`, margin, yPosition);
        yPosition += 8;

        // Messages
        for (const message of session.messages) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }

          const roleLabel = message.role === 'user' ? '👤 Usuário:' : '🤖 Assistente:';
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(message.role === 'user' ? 60 : 30);
          doc.text(roleLabel, margin, yPosition);
          yPosition += 5;

          doc.setFont("helvetica", "normal");
          doc.setTextColor(0);
          
          // Truncate very long messages for PDF readability
          let content = message.content;
          if (content.length > 1000) {
            content = content.substring(0, 1000) + '... [truncado]';
          }
          
          const messageLines = doc.splitTextToSize(content, contentWidth - 5);
          const maxLines = 20; // Limit lines per message
          const displayLines = messageLines.slice(0, maxLines);
          
          doc.text(displayLines, margin + 5, yPosition);
          yPosition += displayLines.length * 4 + 5;

          if (messageLines.length > maxLines) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('... conteúdo truncado', margin + 5, yPosition);
            yPosition += 5;
          }
        }

        // Session separator
        yPosition += 5;
        doc.setDrawColor(220);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }

      // Footer on last page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${totalPages} • Nautilus One - ${activeModule.toUpperCase()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`audit-chat-${activeModule}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`${sessions.length} conversas exportadas para PDF`);
    } catch (error) {
      logger.error('PDF export error:', error);
      toast.error("Erro ao exportar para PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || sessions.length === 0}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
