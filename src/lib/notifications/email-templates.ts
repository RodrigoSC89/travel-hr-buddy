/**
 * Email Templates for Notifications
 * Professional HTML templates for various notification types
 */

export interface EmailTemplateData {
  recipientName: string;
  [key: string]: unknown;
}

/**
 * Base email template wrapper
 */
function baseTemplate(content: string, accentColor = "#0066cc"): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nauti One</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: ${accentColor};
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      background: #f8f9fa;
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: ${accentColor};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 16px 0;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .alert-box {
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .alert-warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
    }
    .alert-danger {
      background: #f8d7da;
      border: 1px solid #dc3545;
      color: #721c24;
    }
    .alert-info {
      background: #d1ecf1;
      border: 1px solid #17a2b8;
      color: #0c5460;
    }
    .alert-success {
      background: #d4edda;
      border: 1px solid #28a745;
      color: #155724;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .details-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
    }
    .details-table td:first-child {
      font-weight: 500;
      color: #666;
      width: 40%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-card">
      ${content}
      <div class="footer">
        <p>© ${new Date().getFullYear()} Nauti One - Maritime Management System</p>
        <p>Este é um email automático. Por favor, não responda.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Certificate expiry alert
 */
export function certificateExpiryTemplate(data: {
  recipientName: string;
  certificateType: string;
  certificateNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  actionUrl: string;
}): string {
  const isUrgent = data.daysUntilExpiry <= 7;
  const alertClass = isUrgent ? "alert-danger" : "alert-warning";
  const accentColor = isUrgent ? "#dc3545" : "#ffc107";
  
  return baseTemplate(`
    <div class="header" style="background: ${accentColor}">
      <h1>⚠️ Alerta de Certificado</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <div class="${alertClass} alert-box">
        <strong>Seu certificado expira em ${data.daysUntilExpiry} dias!</strong>
      </div>
      
      <table class="details-table">
        <tr>
          <td>Tipo de Certificado:</td>
          <td><strong>${data.certificateType}</strong></td>
        </tr>
        <tr>
          <td>Número:</td>
          <td>${data.certificateNumber}</td>
        </tr>
        <tr>
          <td>Data de Expiração:</td>
          <td><strong>${data.expiryDate}</strong></td>
        </tr>
      </table>
      
      <p>Por favor, providencie a renovação do seu certificado o mais breve possível para evitar problemas com a conformidade regulatória.</p>
      
      <p style="text-align: center;">
        <a href="${data.actionUrl}" class="btn">Ver Certificado</a>
      </p>
    </div>
  `, accentColor);
}

/**
 * Maintenance reminder
 */
export function maintenanceReminderTemplate(data: {
  recipientName: string;
  taskTitle: string;
  taskDescription: string;
  dueDate: string;
  vesselName: string;
  priority: string;
  actionUrl: string;
}): string {
  const priorityColors: Record<string, string> = {
    critical: "#dc3545",
    high: "#fd7e14",
    medium: "#ffc107",
    low: "#17a2b8"
  };
  const accentColor = priorityColors[data.priority] || "#0066cc";
  
  return baseTemplate(`
    <div class="header">
      <h1>🔧 Lembrete de Manutenção</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <p>Você tem uma tarefa de manutenção agendada:</p>
      
      <table class="details-table">
        <tr>
          <td>Tarefa:</td>
          <td><strong>${data.taskTitle}</strong></td>
        </tr>
        <tr>
          <td>Descrição:</td>
          <td>${data.taskDescription || "Sem descrição"}</td>
        </tr>
        <tr>
          <td>Embarcação:</td>
          <td>${data.vesselName}</td>
        </tr>
        <tr>
          <td>Data Limite:</td>
          <td><strong>${data.dueDate}</strong></td>
        </tr>
        <tr>
          <td>Prioridade:</td>
          <td><span style="color: ${accentColor}; font-weight: bold;">${data.priority.toUpperCase()}</span></td>
        </tr>
      </table>
      
      <p style="text-align: center;">
        <a href="${data.actionUrl}" class="btn">Ver Tarefa</a>
      </p>
    </div>
  `);
}

/**
 * Contract expiry notification
 */
export function contractExpiryTemplate(data: {
  recipientName: string;
  contractType: string;
  endDate: string;
  daysRemaining: number;
  vesselName?: string;
  actionUrl: string;
}): string {
  return baseTemplate(`
    <div class="header">
      <h1>📋 Contrato Próximo do Término</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <div class="alert-info alert-box">
        Seu contrato termina em <strong>${data.daysRemaining} dias</strong>.
      </div>
      
      <table class="details-table">
        <tr>
          <td>Tipo de Contrato:</td>
          <td><strong>${data.contractType}</strong></td>
        </tr>
        <tr>
          <td>Data de Término:</td>
          <td><strong>${data.endDate}</strong></td>
        </tr>
        ${data.vesselName ? `
        <tr>
          <td>Embarcação:</td>
          <td>${data.vesselName}</td>
        </tr>
        ` : ""}
      </table>
      
      <p>Entre em contato com o departamento de RH para discutir a renovação ou encerramento do seu contrato.</p>
      
      <p style="text-align: center;">
        <a href="${data.actionUrl}" class="btn">Ver Contrato</a>
      </p>
    </div>
  `);
}

/**
 * Training reminder
 */
export function trainingReminderTemplate(data: {
  recipientName: string;
  trainingType: string;
  dueDate: string;
  courseName?: string;
  actionUrl: string;
}): string {
  return baseTemplate(`
    <div class="header" style="background: #28a745">
      <h1>🎓 Lembrete de Treinamento</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <p>Você possui um treinamento obrigatório pendente:</p>
      
      <table class="details-table">
        <tr>
          <td>Tipo:</td>
          <td><strong>${data.trainingType}</strong></td>
        </tr>
        ${data.courseName ? `
        <tr>
          <td>Curso:</td>
          <td>${data.courseName}</td>
        </tr>
        ` : ""}
        <tr>
          <td>Data Limite:</td>
          <td><strong>${data.dueDate}</strong></td>
        </tr>
      </table>
      
      <p>Complete o treinamento dentro do prazo para manter sua conformidade.</p>
      
      <p style="text-align: center;">
        <a href="${data.actionUrl}" class="btn">Acessar Treinamento</a>
      </p>
    </div>
  `, "#28a745");
}

/**
 * Welcome email
 */
export function welcomeTemplate(data: {
  recipientName: string;
  organizationName: string;
  loginUrl: string;
}): string {
  return baseTemplate(`
    <div class="header">
      <h1>🚢 Bem-vindo ao Nauti One!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <div class="alert-success alert-box">
        Sua conta foi criada com sucesso na organização <strong>${data.organizationName}</strong>.
      </div>
      
      <p>O Nauti One é a plataforma completa de gestão marítima que vai ajudar você a:</p>
      
      <ul>
        <li>📋 Gerenciar certificados e documentos</li>
        <li>👥 Acompanhar tripulação e escalas</li>
        <li>🔧 Controlar manutenção preventiva</li>
        <li>📊 Monitorar conformidade regulatória</li>
        <li>🤖 Utilizar assistentes de IA especializados</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${data.loginUrl}" class="btn">Acessar Plataforma</a>
      </p>
      
      <p>Se precisar de ajuda, nossa equipe de suporte está disponível para auxiliá-lo.</p>
    </div>
  `);
}

/**
 * Generic notification template
 */
export function genericNotificationTemplate(data: {
  recipientName: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  actionUrl?: string;
  actionLabel?: string;
}): string {
  const typeConfig = {
    info: { color: "#17a2b8", icon: "ℹ️", alertClass: "alert-info" },
    warning: { color: "#ffc107", icon: "⚠️", alertClass: "alert-warning" },
    error: { color: "#dc3545", icon: "❌", alertClass: "alert-danger" },
    success: { color: "#28a745", icon: "✅", alertClass: "alert-success" }
  };
  
  const config = typeConfig[data.type] || typeConfig.info;
  
  return baseTemplate(`
    <div class="header" style="background: ${config.color}">
      <h1>${config.icon} ${data.title}</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      
      <div class="${config.alertClass} alert-box">
        ${data.message}
      </div>
      
      ${data.actionUrl ? `
      <p style="text-align: center;">
        <a href="${data.actionUrl}" class="btn">${data.actionLabel || "Ver Detalhes"}</a>
      </p>
      ` : ""}
    </div>
  `, config.color);
}

export default {
  certificateExpiryTemplate,
  maintenanceReminderTemplate,
  contractExpiryTemplate,
  trainingReminderTemplate,
  welcomeTemplate,
  genericNotificationTemplate
};
