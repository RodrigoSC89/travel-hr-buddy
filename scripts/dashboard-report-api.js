#!/usr/bin/env node

/**
 * Standalone Dashboard Report API Server
 * 
 * This script provides a standalone Express API server that can run
 * independently from the Vite application. It implements the same
 * functionality as the Next.js API route but uses Express.js.
 * 
 * Usage:
 *   node scripts/dashboard-report-api.js
 * 
 * Environment Variables Required:
 *   - RESEND_API_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   - BASE_URL
 *   - EMAIL_FROM (optional)
 *   - PORT (optional, defaults to 3001)
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate HTML email template
 */
function generateEmailHtml(dashboardUrl) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📊 Dashboard Mensal
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Painel Automatizado - ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0; font-size: 16px; color: #333333;">
                Olá,
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Segue em anexo o relatório mensal do painel de controle. O dashboard foi capturado automaticamente e inclui todas as métricas e visualizações atualizadas.
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                O PDF anexo contém:
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>Estatísticas em tempo real</li>
                <li>Visualizações de tendências</li>
                <li>Resumo de atividades recentes</li>
                <li>Gráficos e métricas principais</li>
              </ul>
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Ver Dashboard Online
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                Este é um relatório automático enviado pelo sistema Nautilus One.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
                © ${new Date().getFullYear()} Nautilus One. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Main API endpoint handler
 */
app.get('/api/send-dashboard-report', async (req, res) => {
  try {
    console.log('📊 Starting dashboard report generation...');

    // Check required environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const baseUrl = process.env.BASE_URL;

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    if (!baseUrl) {
      throw new Error('Missing BASE_URL environment variable');
    }

    // Fetch admin user email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (userError || !userData?.email) {
      throw new Error('Admin email not found.');
    }

    console.log(`✅ Admin email found: ${userData.email}`);

    // Generate PDF using Puppeteer
    console.log('🖨️  Launching Puppeteer to generate PDF...');
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    const dashboardUrl = `${baseUrl}/admin/dashboard?public=1`;
    console.log(`📍 Navigating to: ${dashboardUrl}`);
    
    await page.goto(dashboardUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    console.log('📄 Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    
    await browser.close();
    console.log('✅ PDF generated successfully');

    // Send email via Resend
    console.log('📧 Sending email via Resend...');
    
    const htmlContent = generateEmailHtml(dashboardUrl);
    const emailFrom = process.env.EMAIL_FROM || 'dashboard@empresa.com';
    const currentDate = new Date().toISOString().split('T')[0];

    const fetch = (await import('node-fetch')).default;
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: userData.email,
        subject: `📊 Dashboard Mensal - Painel Automatizado - ${new Date().toLocaleDateString('pt-BR')}`,
        html: htmlContent,
        attachments: [
          {
            filename: `dashboard-${currentDate}.pdf`,
            content: pdfBuffer.toString('base64'),
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('✅ Email sent successfully:', emailResult);

    res.json({ 
      success: true, 
      sent: true,
      emailId: emailResult.id,
      recipient: userData.email,
      message: 'Dashboard report sent successfully'
    });

  } catch (error) {
    console.error('[SEND_DASHBOARD_REPORT]', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        📊 Dashboard Report API Server                         ║
║        Nautilus One Travel HR Buddy                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📍 Endpoint: http://localhost:${PORT}/api/send-dashboard-report
💚 Health check: http://localhost:${PORT}/health

Environment Configuration:
✅ SUPABASE_URL: ${supabaseUrl ? 'configured' : '❌ missing'}
✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'configured' : '❌ missing'}
✅ RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'configured' : '❌ missing'}
✅ BASE_URL: ${process.env.BASE_URL ? 'configured' : '❌ missing'}

Ready to generate dashboard reports!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
