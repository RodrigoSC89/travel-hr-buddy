#!/usr/bin/env node

/**
 * Low Coverage Alert Script
 * 
 * This script monitors test coverage by:
 * - Accessing the last 5 builds from Supabase
 * - Checking if any have coverage_percent < 80%
 * - Sending email alerts with details of commits and branches
 * 
 * Usage:
 * - Schedule via cron or GitHub Actions to run daily
 * - Customize LIMITE_COBERTURA according to your quality standards
 * - Configure email recipients (devops@..., qa@..., etc)
 * 
 * Run with: npm run alert:low-coverage
 */

import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const LIMITE_COBERTURA = parseInt(process.env.COVERAGE_THRESHOLD || '80', 10); // % minimum acceptable

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yourdomain.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify coverage for the last 5 builds
 */
async function verificarCobertura() {
  console.log('🔍 Checking test coverage...\n');
  console.log(`Configuration:`);
  console.log(`  - Coverage threshold: ${LIMITE_COBERTURA}%`);
  console.log(`  - Supabase URL: ${SUPABASE_URL}`);
  console.log(`  - Checking last 5 builds\n`);

  // Validate configuration
  if (!SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_KEY environment variable is not set');
    console.error('   Please set SUPABASE_KEY in your environment or .env file');
    process.exit(1);
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Error: EMAIL_USER and EMAIL_PASS environment variables are required');
    console.error('   Please configure email credentials for alerts');
    process.exit(1);
  }

  try {
    // Fetch last 5 test results from Supabase
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/test_results?order=created_at.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Supabase API error: ${res.status} ${res.statusText}`);
    }

    const resultados = await res.json();

    console.log(`✅ Successfully fetched ${resultados.length} test results\n`);

    // Filter results below coverage threshold
    const abaixoDoLimite = resultados.filter(
      (r) => r.coverage_percent !== null && r.coverage_percent < LIMITE_COBERTURA
    );

    if (abaixoDoLimite.length > 0) {
      // Build alert message
      const msg = abaixoDoLimite
        .map(
          (r) =>
            `🔴 ${r.branch || 'unknown'}: ${r.coverage_percent}% em ${r.commit_hash || 'unknown'}`
        )
        .join('\n');

      console.log('⚠️  Low coverage detected:');
      console.log(msg);
      console.log('\n📧 Sending email alert...');

      // Send email alert
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'alertas@yourdomain.com',
        to: process.env.EMAIL_TO || 'devops@yourdomain.com',
        subject: '⚠️ Alerta de Baixa Cobertura nos Builds',
        text: `Coberturas abaixo de ${LIMITE_COBERTURA}% detectadas:\n\n${msg}\n\nPor favor, revise os builds afetados e tome as ações necessárias.`,
        html: `
          <h2>⚠️ Alerta de Baixa Cobertura de Testes</h2>
          <p>Os seguintes builds apresentaram cobertura abaixo do limite de <strong>${LIMITE_COBERTURA}%</strong>:</p>
          <ul>
            ${abaixoDoLimite
              .map(
                (r) =>
                  `<li><strong>${r.branch || 'unknown'}</strong>: ${r.coverage_percent}% (commit: ${r.commit_hash || 'unknown'})</li>`
              )
              .join('')}
          </ul>
          <p>Por favor, revise os builds afetados e tome as ações necessárias para melhorar a cobertura de testes.</p>
        `,
      });

      console.log('✅ Alert email sent successfully\n');
      console.log('⚠️ Action required: Review the affected builds and improve test coverage');
      process.exit(1); // Exit with error code to indicate issue
    } else {
      console.log('✅ All recent builds meet the coverage threshold!');
      console.log(`   All ${resultados.length} builds have coverage >= ${LIMITE_COBERTURA}%\n`);
      console.log('🎉 No action required');
    }
  } catch (error) {
    console.error('❌ Error checking coverage:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('   Check your network connection and Supabase URL');
    } else if (error.code === 'EAUTH') {
      console.error('   Check your email authentication credentials');
    }
    
    process.exit(1);
  }
}

// Run verification
verificarCobertura();
