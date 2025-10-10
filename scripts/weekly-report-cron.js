#!/usr/bin/env node

/**
 * ✅ scripts/weekly-report-cron.js — Geração semanal do relatório PDF e envio por e-mail
 * 
 * Este script faz o seguinte:
 * 🔄 Geração e envio semanal do PDF
 * - Acessa os dados de testes no Supabase
 * - Gera um relatório PDF automático com jsPDF
 * - Envia por email usando nodemailer (padrão SMTP)
 * 
 * 📦 Configuração necessária:
 * .env com:
 *   EMAIL_USER=seu@email.com
 *   EMAIL_PASS=sua_senha
 *   SUPABASE_KEY=chave_secreta
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   EMAIL_HOST=smtp.yourdomain.com (opcional, padrão: smtp.gmail.com)
 *   EMAIL_PORT=587 (opcional)
 *   EMAIL_FROM=relatorios@yourdomain.com (opcional)
 *   EMAIL_TO=equipe@yourdomain.com (opcional)
 * 
 * Agendador (cron job, GitHub Actions, Vercel Cron)
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nodemailer = require("nodemailer");
const jsPDF = require("jspdf").jsPDF;
const { JSDOM } = require("jsdom");
const html2canvas = require("html2canvas");

// Carregar variáveis de ambiente
import { config } from "dotenv";
config();

// Configs do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Configs de envio (SMTP)
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || "relatorios@yourdomain.com";
const EMAIL_TO = process.env.EMAIL_TO || "equipe@yourdomain.com";

// Criar transportador de email
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * Gera PDF a partir de conteúdo HTML
 * @param {string} htmlContent - Conteúdo HTML para converter em PDF
 * @returns {Promise<Buffer>} - Buffer do PDF gerado
 */
async function gerarPDF(htmlContent) {
  try {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Criar canvas do HTML
    const canvas = await html2canvas(document.body, {
      windowWidth: 1200,
      windowHeight: 800,
    });
    
    // Criar PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    return Buffer.from(pdf.output("arraybuffer"));
  } catch (error) {
    console.error("❌ Erro ao gerar PDF:", error);
    throw error;
  }
}

/**
 * Envia email com anexo PDF
 * @param {Buffer} pdfBuffer - Buffer do PDF anexado
 * @param {Object} dados - Dados do relatório para incluir no corpo do email
 */
async function enviarEmail(pdfBuffer, dados) {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: "📊 Relatório Semanal de Cobertura CI - Nautilus One",
      text: `Segue anexo o relatório semanal de builds e cobertura de testes.\n\nResumo:\n- Total de testes registrados: ${dados.length}\n- Status: ${dados.filter(d => d.status === "success").length} sucessos, ${dados.filter(d => d.status === "failure").length} falhas\n\nAcesse o dashboard para mais detalhes.`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .summary { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .summary-item { display: inline-block; margin: 10px 20px 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Relatório Semanal de CI/CD</h1>
              <p>Nautilus One - Travel HR Buddy</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Segue anexo o relatório semanal de builds e cobertura de testes.</p>
              
              <div class="summary">
                <h3>📈 Resumo Executivo</h3>
                <div class="summary-item">
                  <strong>Total de Testes:</strong> ${dados.length}
                </div>
                <div class="summary-item">
                  <strong>✅ Sucessos:</strong> ${dados.filter(d => d.status === "success").length}
                </div>
                <div class="summary-item">
                  <strong>❌ Falhas:</strong> ${dados.filter(d => d.status === "failure").length}
                </div>
              </div>
              
              <p>Para mais detalhes, consulte o PDF anexo ou acesse o dashboard do sistema.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `ci-analytics-${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Relatório enviado com sucesso para:", EMAIL_TO);
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw error;
  }
}

/**
 * Formata dados para HTML de relatório
 * @param {Array} dados - Array de resultados de testes
 * @returns {string} - HTML formatado
 */
function formatarHTMLRelatorio(dados) {
  const tabelaLinhas = dados.map(item => `
    <tr>
      <td>${item.commit_hash ? item.commit_hash.substring(0, 7) : "N/A"}</td>
      <td>${item.branch || "N/A"}</td>
      <td style="color: ${item.status === "success" ? "green" : "red"}">
        ${item.status === "success" ? "✅" : "❌"} ${item.status || "N/A"}
      </td>
      <td>${item.coverage_percent !== null ? item.coverage_percent + "%" : "N/A"}</td>
      <td>${item.triggered_by || "N/A"}</td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "N/A"}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
          }
          .subtitle {
            margin-top: 10px;
            font-size: 14px;
            opacity: 0.9;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
          }
          .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex: 1;
            margin: 0 10px;
          }
          .summary-card h3 {
            margin: 0;
            font-size: 32px;
            color: #667eea;
          }
          .summary-card p {
            margin: 5px 0 0 0;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
          }
          tr:hover {
            background: #f9f9f9;
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
          <h1>📊 Relatório Semanal de CI/CD</h1>
          <div class="subtitle">Nautilus One - Travel HR Buddy</div>
          <div class="subtitle">Período: ${new Date().toLocaleDateString("pt-BR")}</div>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>${dados.length}</h3>
            <p>Total de Testes</p>
          </div>
          <div class="summary-card">
            <h3>${dados.filter(d => d.status === "success").length}</h3>
            <p>✅ Sucessos</p>
          </div>
          <div class="summary-card">
            <h3>${dados.filter(d => d.status === "failure").length}</h3>
            <p>❌ Falhas</p>
          </div>
          <div class="summary-card">
            <h3>${dados.length > 0 ? Math.round(dados.reduce((acc, d) => acc + (d.coverage_percent || 0), 0) / dados.length) : 0}%</h3>
            <p>Cobertura Média</p>
          </div>
        </div>
        
        <h2 style="margin: 30px 0 10px 0; color: #333;">📋 Histórico de Builds</h2>
        <table>
          <thead>
            <tr>
              <th>Commit</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Cobertura</th>
              <th>Executado por</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            ${tabelaLinhas || "<tr><td colspan=\"6\" style=\"text-align: center;\">Nenhum dado disponível</td></tr>"}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Relatório gerado automaticamente em ${new Date().toLocaleString("pt-BR")}</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Função principal: gerar e enviar relatório
 */
async function gerarEEnviarRelatorio() {
  console.log("🚀 Iniciando geração de relatório semanal...\n");

  // Validar configurações
  if (!SUPABASE_KEY) {
    console.error("❌ ERRO: SUPABASE_KEY não configurado no .env");
    process.exit(1);
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERRO: EMAIL_USER ou EMAIL_PASS não configurados no .env");
    process.exit(1);
  }

  try {
    console.log("📡 Conectando ao Supabase...");
    
    // Buscar dados de test_results
    const res = await fetch(`${SUPABASE_URL}/rest/v1/test_results?select=*&order=created_at.desc&limit=100`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
    }

    const dados = await res.json();
    console.log(`✅ ${dados.length} registros recuperados do Supabase`);

    if (dados.length === 0) {
      console.log("⚠️  Nenhum dado disponível para relatório. Abortando...");
      return;
    }

    console.log("📄 Gerando HTML do relatório...");
    const html = formatarHTMLRelatorio(dados);

    console.log("🎨 Convertendo HTML para PDF...");
    const pdf = await gerarPDF(html);
    console.log(`✅ PDF gerado com sucesso (${(pdf.length / 1024).toFixed(2)} KB)`);

    console.log("📧 Enviando email...");
    await enviarEmail(pdf, dados);

    console.log("\n✅ Relatório enviado com sucesso!");
    console.log("�� Resumo:");
    console.log(`   - Total de registros: ${dados.length}`);
    console.log(`   - Sucessos: ${dados.filter(d => d.status === "success").length}`);
    console.log(`   - Falhas: ${dados.filter(d => d.status === "failure").length}`);
    console.log(`   - Enviado para: ${EMAIL_TO}`);
  } catch (error) {
    console.error("\n❌ Erro ao gerar e enviar relatório:", error);
    process.exit(1);
  }
}

// Roda o script (cron semanal sugerido)
gerarEEnviarRelatorio();
