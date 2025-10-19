#!/usr/bin/env node

/**
 * Manual test script for MMI Forecast API endpoint
 * 
 * This script allows you to manually test the forecast endpoint
 * with sample data without needing to set up the full frontend.
 * 
 * Usage:
 *   node scripts/test-mmi-forecast.js
 * 
 * Requirements:
 *   - Server must be running (npm run dev)
 *   - OPENAI_API_KEY must be configured in .env
 */

const http = require('http');

const testPayload = {
  vessel_name: 'FPSO Alpha',
  system_name: 'Sistema hidráulico do guindaste',
  last_maintenance_dates: [
    '12/04/2025 - troca de óleo',
    '20/06/2025 - verificação de pressão'
  ],
  current_hourmeter: 870
};

console.log('🚀 Testing MMI Forecast API Endpoint\n');
console.log('📦 Test Payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\n📡 Sending request to http://localhost:5173/api/mmi/forecast\n');

const postData = JSON.stringify(testPayload);

const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/api/mmi/forecast',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}\n`);
  console.log('📊 Response Headers:');
  console.log(JSON.stringify(res.headers, null, 2));
  console.log('\n📝 Streaming Response:\n');
  console.log('─'.repeat(60));

  let responseText = '';

  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    responseText += chunk;
    
    // Parse SSE format
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          console.log('\n' + '─'.repeat(60));
          console.log('✅ Stream completed\n');
          return;
        }
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            process.stdout.write(parsed.content);
          }
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }
  });

  res.on('end', () => {
    console.log('\n' + '─'.repeat(60));
    console.log('✅ Request completed successfully\n');
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
  console.error('\n💡 Make sure:');
  console.error('   1. Server is running (npm run dev)');
  console.error('   2. OPENAI_API_KEY is configured in .env');
  console.error('   3. Port 5173 is accessible\n');
  process.exit(1);
});

req.write(postData);
req.end();
