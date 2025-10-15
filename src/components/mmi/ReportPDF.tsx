import html2pdf from 'html2pdf.js';

/**
 * Interface for Maintenance Job data structure
 */
export interface MaintenanceJob {
  id: string;
  title: string;
  component_id: string;
  status: string;
  due_date?: string;
  priority?: string;
  ai_suggestion?: string;
}

/**
 * Generates and downloads a maintenance report PDF
 * @param jobs - Array of maintenance jobs to include in the report
 */
export function generateMaintenanceReport(jobs: MaintenanceJob[]): void {
  const now = new Date().toLocaleDateString('pt-BR');
  const timestamp = new Date().toLocaleString('pt-BR');
  
  // Helper function to get status badge styling
  const getStatusStyle = (status: string): string => {
    const statusMap: Record<string, string> = {
      'scheduled': 'background: #dbeafe; color: #1e40af;',
      'in_progress': 'background: #fef3c7; color: #92400e;',
      'completed': 'background: #dcfce7; color: #166534;',
      'overdue': 'background: #fecaca; color: #991b1b;',
      'cancelled': 'background: #f1f5f9; color: #475569;'
    };
    return statusMap[status] || 'background: #f1f5f9; color: #475569;';
  };

  // Helper function to get priority badge styling
  const getPriorityStyle = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      'critical': 'background: #fecaca; color: #991b1b;',
      'high': 'background: #fed7aa; color: #9a3412;',
      'medium': 'background: #fef3c7; color: #92400e;',
      'low': 'background: #dcfce7; color: #166534;',
      'normal': 'background: #dbeafe; color: #1e40af;'
    };
    return priorityMap[priority?.toLowerCase() || 'normal'] || 'background: #dbeafe; color: #1e40af;';
  };

  // Helper function to format status text
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'scheduled': 'Agendado',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído',
      'overdue': 'Atrasado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[status] || status;
  };

  // Helper function to format priority text
  const getPriorityLabel = (priority: string): string => {
    const priorityLabels: Record<string, string> = {
      'critical': 'Crítica',
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa',
      'normal': 'Normal'
    };
    return priorityLabels[priority?.toLowerCase() || 'normal'] || priority || 'Normal';
  };

  const content = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Inteligente de Manutenção - ${now}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header-subtitle {
            color: #64748b;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .report-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .info-value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
        }
        
        .jobs-section {
            margin-top: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .job-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
        }
        
        .job-header {
            display: flex;
            align-items: start;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .job-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }
        
        .job-icon {
            color: #2563eb;
            margin-right: 8px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
        }
        
        .job-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 15px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        
        .detail-label {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            margin-bottom: 4px;
        }
        
        .detail-value {
            color: #1e293b;
            font-size: 14px;
        }
        
        .ai-suggestion {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 12px 15px;
            margin-top: 15px;
            border-radius: 0 6px 6px 0;
        }
        
        .ai-suggestion-label {
            font-weight: 700;
            color: #2563eb;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
        }
        
        .ai-suggestion-text {
            color: #1e293b;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
        }
        
        .no-jobs {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 16px;
        }
        
        @media print {
            body { 
                padding: 0; 
            }
            .job-card {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚙️ Relatório Inteligente de Manutenção</h1>
        <p class="header-subtitle">Sistema MMI (Manutenção com IA)</p>
    </div>

    <div class="report-info">
        <div class="info-item">
            <span class="info-label">Data de Geração</span>
            <span class="info-value">${timestamp}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Total de Jobs</span>
            <span class="info-value">${jobs.length}</span>
        </div>
    </div>

    <div class="jobs-section">
        <h2 class="section-title">📋 Jobs de Manutenção</h2>
        ${jobs.length === 0 ? `
        <div class="no-jobs">
            <p>Nenhum job de manutenção disponível no momento.</p>
        </div>
        ` : jobs.map((j, index) => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">
                        <span class="job-icon">🔧</span>${j.title}
                    </h3>
                </div>
                <div>
                    <span class="badge" style="${getStatusStyle(j.status)}">
                        ${getStatusLabel(j.status)}
                    </span>
                    <span class="badge" style="${getPriorityStyle(j.priority || 'normal')}">
                        ${getPriorityLabel(j.priority || 'normal')}
                    </span>
                </div>
            </div>
            
            <div class="job-details">
                <div class="detail-item">
                    <span class="detail-label">Componente</span>
                    <span class="detail-value">${j.component_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Prazo</span>
                    <span class="detail-value">${j.due_date ? new Date(j.due_date).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                </div>
            </div>
            
            ${j.ai_suggestion ? `
            <div class="ai-suggestion">
                <div class="ai-suggestion-label">
                    💡 Sugestão da IA
                </div>
                <div class="ai-suggestion-text">
                    ${j.ai_suggestion}
                </div>
            </div>
            ` : ''}
        </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema MMI</p>
        <p>Travel HR Buddy - Gestão Inteligente de Manutenção</p>
    </div>
</body>
</html>
  `;

  // Configure PDF options for better quality
  const opt = {
    margin: 10,
    filename: `Relatorio-MMI-${now.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(content).set(opt).save();
}
