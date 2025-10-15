/**
 * MMI PDF Report Service v1.1.0
 * Generates professional PDF reports with AI recommendations
 */

import html2pdf from 'html2pdf.js';
import { MMIJob } from '@/types/mmi';

interface ReportOptions {
  includeAIRecommendations?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * Generate HTML content for the PDF report
 */
const generateReportHTML = (jobs: MMIJob[], options: ReportOptions = {}): string => {
  const {
    includeAIRecommendations = true,
    title = 'Relatório MMI - Manutenção Inteligente',
    subtitle = 'Nautilus One v1.1.0'
  } = options;

  const today = new Date().toLocaleDateString('pt-BR');
  
  // Calculate statistics
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status.toLowerCase().includes('pendente')).length;
  const withAI = jobs.filter(j => j.suggestion_ia || j.ai_recommendation).length;
  const canPostpone = jobs.filter(j => j.can_postpone).length;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 20mm; }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card .number {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
        }
        .stat-card .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .job-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .job-card.critical {
          border-left-color: #ef4444;
        }
        .job-card.medium {
          border-left-color: #f59e0b;
        }
        .job-card.low {
          border-left-color: #10b981;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        .job-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }
        .job-date {
          font-size: 12px;
          color: #6b7280;
        }
        .job-details {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 10px;
        }
        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-priority { background: #fef3c7; color: #92400e; }
        .badge-status { background: #dbeafe; color: #1e40af; }
        .badge-ai { background: #dcfce7; color: #166534; }
        .badge-postpone { background: #e0e7ff; color: #3730a3; }
        .ai-section {
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin-top: 15px;
          border-radius: 4px;
        }
        .ai-section h4 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }
        .ai-section p {
          margin: 5px 0;
          font-size: 13px;
          color: #1e3a8a;
        }
        .similar-cases {
          margin-top: 10px;
          font-size: 12px;
        }
        .similar-case {
          padding: 5px 0;
          border-bottom: 1px dotted #cbd5e1;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>${subtitle}</p>
        <p>Gerado em: ${today}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="number">${totalJobs}</div>
          <div class="label">Total de Jobs</div>
        </div>
        <div class="stat-card">
          <div class="number">${pendingJobs}</div>
          <div class="label">Pendentes</div>
        </div>
        <div class="stat-card">
          <div class="number">${withAI}</div>
          <div class="label">Com Sugestão IA</div>
        </div>
        <div class="stat-card">
          <div class="number">${canPostpone}</div>
          <div class="label">Podem Postergar</div>
        </div>
      </div>

      ${jobs.map(job => {
        const priorityClass = job.priority.toLowerCase().includes('crít') ? 'critical' 
          : job.priority.toLowerCase().includes('alta') ? 'medium' 
          : 'low';
        
        return `
          <div class="job-card ${priorityClass}">
            <div class="job-header">
              <div class="job-title">${job.title}</div>
              <div class="job-date">Prazo: ${job.due_date}</div>
            </div>
            
            <div class="job-details">
              <strong>Componente:</strong> ${job.component.name}<br>
              <strong>Embarcação:</strong> ${job.component.asset.vessel}<br>
              <strong>Ativo:</strong> ${job.component.asset.name}
            </div>

            <div class="badges">
              <span class="badge badge-priority">Prioridade: ${job.priority}</span>
              <span class="badge badge-status">Status: ${job.status}</span>
              ${job.suggestion_ia ? '<span class="badge badge-ai">💡 Com IA</span>' : ''}
              ${job.can_postpone ? '<span class="badge badge-postpone">🕒 Pode Postergar</span>' : ''}
            </div>

            ${job.suggestion_ia ? `
              <div style="background: #f9fafb; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <strong style="font-size: 12px; color: #374151;">Sugestão IA v1.0:</strong><br>
                <span style="font-size: 13px; color: #4b5563;">${job.suggestion_ia}</span>
              </div>
            ` : ''}

            ${includeAIRecommendations && job.ai_recommendation ? `
              <div class="ai-section">
                <h4>🤖 Recomendação IA v1.1.0 - Aprendizado Histórico</h4>
                <p><strong>Ação Técnica:</strong> ${job.ai_recommendation.technical_action}</p>
                <p><strong>Componente:</strong> ${job.ai_recommendation.component}</p>
                <p><strong>Prazo Sugerido:</strong> ${job.ai_recommendation.deadline}</p>
                <p><strong>Requer OS:</strong> ${job.ai_recommendation.requires_work_order ? 'Sim' : 'Não'}</p>
                <p><strong>Raciocínio:</strong> ${job.ai_recommendation.reasoning}</p>
                
                ${job.ai_recommendation.similar_cases.length > 0 ? `
                  <div class="similar-cases">
                    <strong>Casos Similares (Top ${job.ai_recommendation.similar_cases.length}):</strong>
                    ${job.ai_recommendation.similar_cases.map(sc => `
                      <div class="similar-case">
                        ${sc.job_id} - ${(sc.similarity * 100).toFixed(0)}% similar: ${sc.action} → ${sc.outcome}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}

      <div class="footer">
        <p><strong>Nautilus One v1.1.0</strong> - Sistema de Manutenção Inteligente com IA</p>
        <p>Relatório gerado automaticamente • Confidencial</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Generate and download PDF report from jobs data
 */
export const generatePDFReport = async (
  jobs: MMIJob[],
  options: ReportOptions = {}
): Promise<void> => {
  try {
    const html = generateReportHTML(jobs, options);
    
    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const pdfOptions = {
      margin: 10,
      filename: `MMI_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(pdfOptions).from(container).save();
    
    // Cleanup
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Falha ao gerar relatório PDF');
  }
};
