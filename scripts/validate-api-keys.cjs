#!/usr/bin/env node

/**
 * API Key Validation CLI Script
 * 
 * This script validates all API keys configured in the system.
 * Run with: npm run validate:api-keys
 * 
 * Note: This is a Node.js script that will need to be adapted for the browser environment.
 * For browser-based validation, use the API Tester page in the admin section.
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🔑 API Key Validation Utility                       ║
║           Nautilus One Travel HR Buddy                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log('📋 Checking environment configuration...\n');

// Load environment variables from .env file if it exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ Found .env file');
} else {
  console.log('⚠️  No .env file found - checking .env.example');
}

// Define all API keys to check
const API_KEYS = [
  {
    name: 'OpenAI',
    keys: ['VITE_OPENAI_API_KEY'],
    endpoint: 'https://api.openai.com/v1/models',
    required: false,
    description: 'AI chat and analysis features'
  },
  {
    name: 'Mapbox',
    keys: ['VITE_MAPBOX_ACCESS_TOKEN', 'VITE_MAPBOX_TOKEN'],
    endpoint: 'https://api.mapbox.com/geocoding/v5/',
    required: true,
    description: 'Interactive maps and geolocation'
  },
  {
    name: 'Amadeus',
    keys: ['VITE_AMADEUS_API_KEY', 'VITE_AMADEUS_API_SECRET'],
    endpoint: 'https://test.api.amadeus.com/v1/security/oauth2/token',
    required: false,
    description: 'Travel and flight data'
  },
  {
    name: 'Supabase',
    keys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
    endpoint: null,
    required: true,
    description: 'Database and authentication'
  },
  {
    name: 'Weather API',
    keys: ['VITE_OPENWEATHER_API_KEY', 'VITE_WINDY_API_KEY'],
    endpoint: 'https://api.openweathermap.org/data/2.5/weather',
    required: false,
    description: 'Weather forecasts and marine conditions'
  },
  {
    name: 'Skyscanner',
    keys: ['VITE_SKYSCANNER_API_KEY', 'VITE_RAPIDAPI_KEY'],
    endpoint: 'https://skyscanner-api.p.rapidapi.com/',
    required: false,
    description: 'Flight search and booking'
  },
  {
    name: 'Booking.com',
    keys: ['VITE_BOOKING_API_KEY', 'VITE_RAPIDAPI_KEY'],
    endpoint: 'https://booking-com.p.rapidapi.com/',
    required: false,
    description: 'Hotel search and reservation'
  },
  {
    name: 'MarineTraffic',
    keys: ['VITE_MARINETRAFFIC_API_KEY'],
    endpoint: 'https://services.marinetraffic.com/api/',
    required: false,
    description: 'Vessel tracking and maritime data'
  },
  {
    name: 'ElevenLabs',
    keys: ['VITE_ELEVENLABS_API_KEY'],
    endpoint: 'https://api.elevenlabs.io/',
    required: false,
    description: 'Text-to-speech and voice services'
  }
];

// Read and parse .env file
function parseEnvFile(filePath) {
  const envVars = {};
  
  if (!fs.existsSync(filePath)) {
    return envVars;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      continue;
    }
    
    // Parse key=value
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      envVars[key] = value;
    }
  }
  
  return envVars;
}

// Check if a key is configured and appears valid
function checkKeyStatus(envVars, keys) {
  const configured = [];
  const missing = [];
  
  for (const key of keys) {
    const value = envVars[key];
    
    if (value && value !== '' && !value.includes('...') && !value.includes('seu-') && !value.includes('your-')) {
      configured.push({ key, value: maskKey(value) });
    } else {
      missing.push(key);
    }
  }
  
  return { configured, missing, hasAny: configured.length > 0 };
}

// Mask API key for display (show first/last chars)
function maskKey(key) {
  if (!key || key.length < 8) {
    return '***';
  }
  
  const start = key.substring(0, 4);
  const end = key.substring(key.length - 4);
  return `${start}...${end}`;
}

// Main validation function
function validateAPIKeys() {
  const envVars = parseEnvFile(envPath);
  const results = [];
  
  console.log('═'.repeat(70));
  console.log('API KEY CONFIGURATION STATUS');
  console.log('═'.repeat(70));
  console.log('');
  
  for (const api of API_KEYS) {
    const status = checkKeyStatus(envVars, api.keys);
    const requiredLabel = api.required ? '🔴 REQUIRED' : '🟡 OPTIONAL';
    
    console.log(`\n${api.name} - ${requiredLabel}`);
    console.log(`  Description: ${api.description}`);
    console.log(`  Keys: ${api.keys.join(', ')}`);
    
    if (status.hasAny) {
      console.log(`  Status: ✅ CONFIGURED`);
      for (const conf of status.configured) {
        console.log(`    • ${conf.key}: ${conf.value}`);
      }
      if (status.missing.length > 0) {
        console.log(`    ⚠️  Alternative keys not set: ${status.missing.join(', ')}`);
      }
    } else {
      console.log(`  Status: ❌ NOT CONFIGURED`);
      console.log(`    Missing: ${status.missing.join(', ')}`);
      if (api.required) {
        console.log(`    ⚠️  WARNING: This is a required API for core functionality`);
      }
    }
    
    if (api.endpoint) {
      console.log(`  Endpoint: ${api.endpoint}`);
    }
    
    results.push({
      name: api.name,
      configured: status.hasAny,
      required: api.required,
      status: status
    });
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  
  const totalRequired = API_KEYS.filter(a => a.required).length;
  const configuredRequired = results.filter(r => r.required && r.configured).length;
  const totalOptional = API_KEYS.filter(a => !a.required).length;
  const configuredOptional = results.filter(r => !r.required && r.configured).length;
  
  console.log(`\nRequired APIs: ${configuredRequired}/${totalRequired} configured`);
  console.log(`Optional APIs: ${configuredOptional}/${totalOptional} configured`);
  console.log(`Total APIs: ${configuredRequired + configuredOptional}/${API_KEYS.length} configured\n`);
  
  if (configuredRequired < totalRequired) {
    console.log('❌ ERROR: Some required APIs are not configured!');
    console.log('   Please configure missing required API keys to enable core functionality.\n');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS: All required APIs are configured!\n');
    
    if (configuredOptional < totalOptional) {
      console.log(`ℹ️  INFO: ${totalOptional - configuredOptional} optional API(s) not configured.`);
      console.log('   Configure them for enhanced features.\n');
    }
  }
  
  console.log('═'.repeat(70));
  console.log('\n📌 To test API connectivity, run the application and visit:');
  console.log('   /admin/api-tester\n');
  console.log('📌 For live API validation, use the utility:');
  console.log('   import { validateAllAPIKeys } from "@/utils/api-key-validator"\n');
}

// Run validation
try {
  validateAPIKeys();
} catch (error) {
  console.error('❌ Error during validation:', error.message);
  process.exit(1);
}
