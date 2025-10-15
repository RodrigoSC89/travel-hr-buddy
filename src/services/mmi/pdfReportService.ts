/**
 * PDF Report Generation Service for MMI
 * Uses html2pdf.js to generate PDF reports with AI insights
 */

import html2pdf from 'html2pdf.js';
import { Job } from './jobsApi';
import { AIRecommendation, getAIRecommendation } from './copilotService';

export interface PDFReportOptions {
  title?: string;
  includeAIRecommendations?: boolean;
  includeCharts?: boolean;
}

/**
 * Generate PDF report for MMI jobs
 */
export async function generateJobsPDFReport(
  jobs: Job[],
  options: PDFReportOptions = {}
): Promise<void> {
  const {
    title = 'Relatório de Manutenção Inteligente - MMI',
    includeAIRecommendations = true,
  } = options;

  try {
    // Get AI recommendations for jobs if needed
    const jobsWithAI: Array<Job & { aiRecommendation?: AIRecommendation }> = [];
    
    if (includeAIRecommendations) {
      for (const job of jobs) {
        try {
          const recommendation = await getAIRecommendation(job);
          jobsWithAI.push({ ...job, aiRecommendation: recommendation });
        } catch (error) {
          console.error(`Error getting AI recommendation for job ${job.id}:`, error);
          jobsWithAI.push(job);
        }
      }
    } else {
      jobsWithAI.push(...jobs);
    }

    // Generate HTML content
    const htmlContent = generateHTMLReport(jobsWithAI, title);

    // Configure html2pdf options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `mmi-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate and download PDF
    await html2pdf().set(opt).from(htmlContent).save();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Falha ao gerar relatório PDF');
  }
}

/**
 * Generate HTML content for the report
 */
function generateHTMLReport(
  jobs: Array<Job & { aiRecommendation?: AIRecommendation }>,
  title: string
): string {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Calculate statistics
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'Pendente').length,
    inProgress: jobs.filter(j => j.status === 'Em andamento').length,
    critical: jobs.filter(j => j.priority === 'Crítica').length,
    withAI: jobs.filter(j => j.suggestion_ia || j.aiRecommendation).length,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #1e40af;
      margin: 0;
      font-size: 24px;
    }
    .header .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-top: 5px;
    }
    .header .date {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 5px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      padding: 15px;
      background: #f1f5f9;
      border-radius: 8px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    .job-card {
      border: 1px solid #e2e8f0;
      border-left: 4px solid #eab308;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .job-card.critical {
      border-left-color: #dc2626;
      background-color: #fef2f2;
    }
    .job-card.high {
      border-left-color: #ea580c;
    }
    .job-card.medium {
      border-left-color: #eab308;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }
    .job-title {
      font-weight: bold;
      color: #1e293b;
      font-size: 16px;
      flex: 1;
    }
    .job-id {
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
    }
    .job-details {
      font-size: 13px;
      color: #475569;
      margin: 8px 0;
    }
    .job-details strong {
      color: #1e293b;
    }
    .badges {
      display: flex;
      gap: 8px;
      margin: 10px 0;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-status {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-priority {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-priority.critical {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-ai {
      background: #dcfce7;
      color: #166534;
    }
    .ai-recommendation {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      padding: 12px;
      margin-top: 10px;
    }
    .ai-recommendation-title {
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .ai-recommendation-content {
      font-size: 12px;
      color: #1e293b;
      line-height: 1.5;
    }
    .ai-recommendation-field {
      margin: 6px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">Nautilus One - Módulo de Manutenção Inteligente v1.1.0</div>
    <div class="date">Gerado em: ${currentDate}</div>
  </div>

  <div class="stats">
    <div class="stat-item">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total de Jobs</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.pending}</div>
      <div class="stat-label">Pendentes</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.inProgress}</div>
      <div class="stat-label">Em Andamento</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.critical}</div>
      <div class="stat-label">Críticos</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.withAI}</div>
      <div class="stat-label">Com IA</div>
    </div>
  </div>

  ${jobs.map(job => generateJobCard(job)).join('\n')}

  <div class="footer">
    <p>Relatório gerado automaticamente pelo sistema Nautilus One - MMI v1.1.0</p>
    <p>Manutenção Inteligente com IA Adaptativa e Aprendizado Contínuo</p>
    <p>© ${new Date().getFullYear()} Nautilus One - Todos os direitos reservados</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for a single job card
 */
function generateJobCard(job: Job & { aiRecommendation?: AIRecommendation }): string {
  const priorityClass = job.priority === 'Crítica' ? 'critical' : 
                       job.priority === 'Alta' ? 'high' : 'medium';
  
  return `
  <div class="job-card ${priorityClass}">
    <div class="job-header">
      <div class="job-title">${job.title}</div>
      <div class="job-id">${job.id}</div>
    </div>
    
    <div class="job-details">
      <strong>Componente:</strong> ${job.component.name}<br>
      <strong>Equipamento:</strong> ${job.component.asset.name}<br>
      <strong>Embarcação:</strong> ${job.component.asset.vessel}<br>
      <strong>Prazo:</strong> ${new Date(job.due_date).toLocaleDateString('pt-BR')}
    </div>
    
    <div class="badges">
      <span class="badge badge-status">${job.status}</span>
      <span class="badge badge-priority ${priorityClass}">${job.priority}</span>
      ${job.suggestion_ia || job.aiRecommendation ? '<span class="badge badge-ai">💡 IA Ativada</span>' : ''}
      ${job.can_postpone ? '<span class="badge" style="background: #dcfce7; color: #166534;">🕒 Postergável</span>' : ''}
    </div>
    
    ${job.suggestion_ia ? `
    <div class="ai-recommendation">
      <div class="ai-recommendation-title">💡 Sugestão IA</div>
      <div class="ai-recommendation-content">${job.suggestion_ia}</div>
    </div>
    ` : ''}
    
    ${job.aiRecommendation ? `
    <div class="ai-recommendation">
      <div class="ai-recommendation-title">🧠 Recomendação IA Detalhada (v1.1.0)</div>
      <div class="ai-recommendation-content">
        <div class="ai-recommendation-field">
          <strong>Ação Técnica:</strong> ${job.aiRecommendation.technical_action}
        </div>
        <div class="ai-recommendation-field">
          <strong>Componente:</strong> ${job.aiRecommendation.component}
        </div>
        <div class="ai-recommendation-field">
          <strong>Prazo Recomendado:</strong> ${new Date(job.aiRecommendation.deadline).toLocaleDateString('pt-BR')}
        </div>
        <div class="ai-recommendation-field">
          <strong>Requer OS:</strong> ${job.aiRecommendation.requires_work_order ? 'Sim ✓' : 'Não ✗'}
        </div>
        <div class="ai-recommendation-field">
          <strong>Justificativa:</strong> ${job.aiRecommendation.reasoning}
        </div>
        ${job.aiRecommendation.similar_cases && job.aiRecommendation.similar_cases.length > 0 ? `
        <div class="ai-recommendation-field">
          <strong>Casos Similares no Histórico:</strong> ${job.aiRecommendation.similar_cases.length} encontrado(s)
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
  </div>
  `;
}
