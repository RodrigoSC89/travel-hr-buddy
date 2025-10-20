/**
 * Node.js Integration Example for Auto-Report Module
 * Sistema Nautilus One - Python Backend Integration
 * 
 * This example demonstrates how to call the Python Auto-Report module
 * from a Node.js/TypeScript application using child processes.
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';

/**
 * Generate Auto-Report by calling Python module
 * @returns {Promise<Object>} Report data with signature
 */
export async function generateAutoReport() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Calling Python Auto-Report module...');
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [
      '-c',
      'from modules.auto_report import AutoReport; AutoReport().run()'
    ]);
    
    let output = '';
    let errorOutput = '';
    
    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });
    
    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(data.toString());
    });
    
    // Handle process completion
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}\n${errorOutput}`));
        return;
      }
      
      try {
        // Read the generated JSON report
        const reportJson = await readFile('nautilus_full_report.json', 'utf-8');
        const reportData = JSON.parse(reportJson);
        
        console.log('✅ Auto-Report generated successfully');
        console.log(`📝 Signature: ${reportData.assinatura_ia}`);
        
        resolve(reportData);
      } catch (error) {
        reject(new Error(`Failed to read report: ${error.message}`));
      }
    });
    
    // Handle errors
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Example usage with async/await
 */
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔗 Node.js + Python Integration Example');
    console.log('   Sistema Nautilus One - Auto-Report Module');
    console.log('='.repeat(60) + '\n');
    
    const report = await generateAutoReport();
    
    console.log('\n📊 Report Summary:');
    console.log(`   Timestamp: ${report.timestamp}`);
    console.log(`   Signature: ${report.assinatura_ia}`);
    console.log(`   FMEA Data: ${report.fmea_summary !== 'Sem dados disponíveis' ? '✅ Available' : '❌ Not available'}`);
    console.log(`   ASOG Data: ${report.asog_status !== 'Sem dados disponíveis' ? '✅ Available' : '❌ Not available'}`);
    console.log(`   Forecast Data: ${report.forecast_summary !== 'Sem dados disponíveis' ? '✅ Available' : '❌ Not available'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Integration test completed successfully');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { generateAutoReport };
