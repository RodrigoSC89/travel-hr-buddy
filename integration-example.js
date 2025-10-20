#!/usr/bin/env node
/**
 * Integration Example - Node.js to Python Auto-Report
 * 
 * This script demonstrates how to call the Python Auto-Report module
 * from a Node.js/TypeScript application.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

/**
 * Generate Auto-Report by calling Python module
 */
async function generateAutoReport() {
  console.log('🚀 Starting Auto-Report generation...\n');
  
  try {
    // Execute Python module
    const { stdout, stderr } = await execAsync(
      'python3 -c "from modules.auto_report import AutoReport; AutoReport().run()"',
      {
        cwd: __dirname,
        timeout: 30000 // 30 seconds timeout
      }
    );
    
    // Log Python output
    console.log('📋 Python Output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    // Check if files were generated
    const jsonPath = path.join(__dirname, 'nautilus_full_report.json');
    const pdfPath = path.join(__dirname, 'Nautilus_Tech_Report.pdf');
    
    const jsonExists = await fs.access(jsonPath).then(() => true).catch(() => false);
    const pdfExists = await fs.access(pdfPath).then(() => true).catch(() => false);
    
    if (jsonExists && pdfExists) {
      console.log('\n✅ Report generation successful!');
      console.log('📄 Files generated:');
      console.log(`   - ${jsonPath}`);
      console.log(`   - ${pdfPath}`);
      
      // Read and parse JSON report
      const reportData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
      
      console.log('\n📊 Report Summary:');
      console.log(`   Timestamp: ${reportData.timestamp}`);
      console.log(`   Signature: ${reportData.assinatura_ia}`);
      
      return reportData;
    } else {
      throw new Error('Report files were not generated');
    }
    
  } catch (error) {
    console.error('\n❌ Error generating report:', error.message);
    throw error;
  }
}

/**
 * Example: Schedule daily report generation
 */
function scheduleDailyReport() {
  console.log('📅 Scheduling daily report generation at 6:00 AM...');
  
  // This is a simple example. In production, use node-cron or similar
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(6, 0, 0, 0);
  
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilRun = scheduledTime - now;
  
  console.log(`⏰ Next run scheduled for: ${scheduledTime.toLocaleString()}`);
  console.log(`   (in ${Math.round(timeUntilRun / 1000 / 60)} minutes)\n`);
  
  // Example with node-cron (install with: npm install node-cron)
  /*
  const cron = require('node-cron');
  
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running scheduled report generation...');
    try {
      await generateAutoReport();
      console.log('✅ Scheduled report completed successfully\n');
    } catch (error) {
      console.error('❌ Scheduled report failed:', error.message);
    }
  });
  */
}

/**
 * Example: API endpoint for report generation
 */
function exampleAPIEndpoint() {
  // Example Express.js endpoint
  /*
  const express = require('express');
  const app = express();
  
  app.post('/api/reports/auto-generate', async (req, res) => {
    try {
      const reportData = await generateAutoReport();
      
      res.json({
        success: true,
        message: 'Report generated successfully',
        data: reportData,
        files: {
          json: 'nautilus_full_report.json',
          pdf: 'Nautilus_Tech_Report.pdf'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  app.listen(3000, () => {
    console.log('🚀 API server running on port 3000');
  });
  */
}

// Main execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  (async () => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚢 NAUTILUS ONE - AUTO-REPORT INTEGRATION EXAMPLE');
      console.log('═══════════════════════════════════════════════════════\n');
      
      // Generate report
      await generateAutoReport();
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ Integration example completed successfully!');
      console.log('═══════════════════════════════════════════════════════\n');
      
      // Show scheduling example
      scheduleDailyReport();
      
      console.log('💡 Tip: Check AUTO_REPORT_GUIDE.md for more examples\n');
      
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

// Export functions for use as a module
export {
  generateAutoReport,
  scheduleDailyReport
};
