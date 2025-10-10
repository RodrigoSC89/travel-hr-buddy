// ✅ scripts/weekly-report-cron.js — Geração semanal do relatório PDF e envio por e-mail

import fetch from 'node-fetch';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import nodemailer from 'nodemailer';
import { JSDOM } from 'jsdom';

// Configs do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Configs de envio (SMTP, ou troque por SendGrid)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.yourdomain.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function gerarPDF(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const canvas = await html2canvas(dom.window.document.body);
  const pdf = new jsPDF();
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0);
  return pdf.output('arraybuffer');
}

async function enviarEmail(comAnexo) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'relatorios@yourdomain.com',
    to: process.env.EMAIL_TO || 'equipe@yourdomain.com',
    subject: '📊 Relatório Semanal de Cobertura CI',
    text: 'Segue anexo o relatório semanal de builds e cobertura de testes.',
    attachments: [
      {
        filename: 'ci-analytics.pdf',
        content: comAnexo,
      },
    ],
  });
}

async function gerarEEnviarRelatorio() {
  try {
    // Verifica se as variáveis de ambiente estão configuradas
    if (!SUPABASE_KEY) {
      console.error('❌ SUPABASE_KEY não está configurado');
      process.exit(1);
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL_USER e EMAIL_PASS devem estar configurados');
      process.exit(1);
    }

    console.log('🔄 Buscando dados de testes...');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/test_results?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
    }

    const dados = await res.json();
    console.log(`✅ Dados obtidos: ${dados.length} registros`);

    // Gera HTML do relatório
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f5f5f5;
            }
            h1 {
              color: #3b82f6;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
            }
            pre {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow-x: auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Relatório Semanal de Cobertura CI</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <pre>${JSON.stringify(dados, null, 2)}</pre>
          <div class="footer">
            <p>Relatório gerado automaticamente pelo Travel HR Buddy</p>
          </div>
        </body>
      </html>
    `;

    console.log('📄 Gerando PDF...');
    const pdf = await gerarPDF(html);
    
    console.log('📧 Enviando email...');
    await enviarEmail(pdf);
    
    console.log('✅ Relatório enviado com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao gerar e enviar relatório:', error);
    process.exit(1);
  }
}

// Roda o script (cron semanal sugerido)
gerarEEnviarRelatorio();
