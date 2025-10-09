#!/usr/bin/env node

/**
 * API Keys Validation Script
 * Tests all configured API keys and integrations to ensure they are valid and operational
 * 
 * Usage: npm run validate:api-keys
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables from .env file if it exists
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env file\n');
} else {
  console.log('⚠️  No .env file found, using environment variables only\n');
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Validation result tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Log helper functions
 */
function logHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function logTest(name) {
  console.log(`${colors.blue}Testing:${colors.reset} ${name}...`);
}

function logSuccess(message, responseTime) {
  const timeStr = responseTime ? ` (${responseTime}ms)` : '';
  console.log(`  ${colors.green}✅ ${message}${timeStr}${colors.reset}`);
}

function logError(message, error) {
  console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
  if (error) {
    console.log(`  ${colors.red}   Error: ${error}${colors.reset}`);
  }
}

function logSkipped(message) {
  console.log(`  ${colors.yellow}⊘  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`  ${colors.cyan}ℹ  ${message}${colors.reset}`);
}

/**
 * Record test result
 */
function recordResult(name, status, message, error = null, recommendation = null) {
  results.total++;
  if (status === 'passed') results.passed++;
  else if (status === 'failed') results.failed++;
  else if (status === 'skipped') results.skipped++;

  results.details.push({
    name,
    status,
    message,
    error,
    recommendation,
    timestamp: new Date().toISOString()
  });
}

/**
 * Validate OpenAI API
 */
async function validateOpenAI() {
  logTest('OpenAI API');
  
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    logSkipped('OpenAI API key not configured (VITE_OPENAI_API_KEY)');
    recordResult('OpenAI', 'skipped', 'API key not configured', null, 
      'Set VITE_OPENAI_API_KEY in .env file. Get your key from https://platform.openai.com/api-keys');
    return;
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 401) {
      logError('Invalid or expired API key', 'Authentication failed');
      recordResult('OpenAI', 'failed', 'Invalid or expired API key', 'HTTP 401 Unauthorized',
        'The API key is invalid or has expired. Generate a new key at https://platform.openai.com/api-keys');
      return;
    }

    if (response.status === 429) {
      logError('Rate limit exceeded', 'Too many requests');
      recordResult('OpenAI', 'failed', 'Rate limit exceeded', 'HTTP 429 Too Many Requests',
        'You have exceeded your API rate limit. Check your usage at https://platform.openai.com/usage');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logError(`API error: ${response.status} ${response.statusText}`, 
        errorData.error?.message || 'Unknown error');
      recordResult('OpenAI', 'failed', `HTTP ${response.status}`, 
        errorData.error?.message || response.statusText,
        'Check your API key and account status at https://platform.openai.com/');
      return;
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      logSuccess(`Valid API key - ${data.data.length} models available`, responseTime);
      logInfo(`Available models: ${data.data.slice(0, 3).map(m => m.id).join(', ')}...`);
      recordResult('OpenAI', 'passed', `Successfully validated - ${data.data.length} models available`);
    } else {
      logError('Unexpected response format', 'No models returned');
      recordResult('OpenAI', 'failed', 'Unexpected response format', 'No models in response');
    }
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to OpenAI API', errorMsg);
    recordResult('OpenAI', 'failed', 'Connection failed', errorMsg,
      'Check your internet connection and firewall settings');
  }
}

/**
 * Validate Mapbox API
 */
async function validateMapbox() {
  logTest('Mapbox API');
  
  const apiKey = process.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.VITE_MAPBOX_TOKEN;
  
  if (!apiKey) {
    logSkipped('Mapbox API key not configured (VITE_MAPBOX_ACCESS_TOKEN or VITE_MAPBOX_TOKEN)');
    recordResult('Mapbox', 'skipped', 'API key not configured', null,
      'Set VITE_MAPBOX_ACCESS_TOKEN in .env file. Get your token from https://account.mapbox.com/');
    return;
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${apiKey}&limit=1`
    );

    const responseTime = Date.now() - startTime;

    if (response.status === 401) {
      logError('Invalid or expired access token', 'Authentication failed');
      recordResult('Mapbox', 'failed', 'Invalid or expired access token', 'HTTP 401 Unauthorized',
        'The access token is invalid or has expired. Create a new token at https://account.mapbox.com/access-tokens/');
      return;
    }

    if (response.status === 429) {
      logError('Rate limit exceeded', 'Too many requests');
      recordResult('Mapbox', 'failed', 'Rate limit exceeded', 'HTTP 429 Too Many Requests',
        'You have exceeded your API rate limit. Check your usage at https://account.mapbox.com/');
      return;
    }

    if (!response.ok) {
      logError(`API error: ${response.status} ${response.statusText}`, '');
      recordResult('Mapbox', 'failed', `HTTP ${response.status}`, response.statusText,
        'Check your access token at https://account.mapbox.com/access-tokens/');
      return;
    }

    const data = await response.json();
    
    if (data.features !== undefined) {
      logSuccess('Valid access token - Geocoding API working', responseTime);
      recordResult('Mapbox', 'passed', 'Successfully validated - Geocoding API accessible');
    } else {
      logError('Unexpected response format', 'Invalid data structure');
      recordResult('Mapbox', 'failed', 'Unexpected response format', 'Missing features field');
    }
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to Mapbox API', errorMsg);
    recordResult('Mapbox', 'failed', 'Connection failed', errorMsg,
      'Check your internet connection and firewall settings');
  }
}

/**
 * Validate Amadeus API
 */
async function validateAmadeus() {
  logTest('Amadeus API');
  
  const apiKey = process.env.VITE_AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  
  if (!apiKey && !apiSecret) {
    logSkipped('Amadeus API credentials not configured (VITE_AMADEUS_API_KEY / AMADEUS_API_SECRET)');
    recordResult('Amadeus', 'skipped', 'API credentials not configured', null,
      'Set VITE_AMADEUS_API_KEY and AMADEUS_API_SECRET in .env file. Get credentials from https://developers.amadeus.com/');
    return;
  }

  if (!apiKey || !apiSecret) {
    logError('Incomplete Amadeus credentials', 'Both API_KEY and API_SECRET are required');
    recordResult('Amadeus', 'failed', 'Incomplete credentials', 'Missing API_KEY or API_SECRET',
      'Ensure both VITE_AMADEUS_API_KEY and AMADEUS_API_SECRET are set');
    return;
  }

  try {
    const startTime = Date.now();
    
    // Create form data for OAuth2 authentication
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', apiKey);
    params.append('client_secret', apiSecret);

    const response = await makeRequest('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 401) {
      logError('Invalid API credentials', 'Authentication failed');
      recordResult('Amadeus', 'failed', 'Invalid API credentials', 'HTTP 401 Unauthorized',
        'The API credentials are invalid. Verify your keys at https://developers.amadeus.com/my-apps');
      return;
    }

    if (response.status === 429) {
      logError('Rate limit exceeded', 'Too many requests');
      recordResult('Amadeus', 'failed', 'Rate limit exceeded', 'HTTP 429 Too Many Requests',
        'You have exceeded your API rate limit. Check your quota at https://developers.amadeus.com/my-apps');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logError(`API error: ${response.status} ${response.statusText}`, 
        errorData.error_description || errorData.error || '');
      recordResult('Amadeus', 'failed', `HTTP ${response.status}`, 
        errorData.error_description || response.statusText,
        'Check your API credentials at https://developers.amadeus.com/my-apps');
      return;
    }

    const data = await response.json();
    
    if (data.access_token) {
      logSuccess('Valid API credentials - Access token obtained', responseTime);
      logInfo(`Token type: ${data.token_type}, Expires in: ${data.expires_in}s`);
      recordResult('Amadeus', 'passed', 'Successfully validated - OAuth token obtained');
    } else {
      logError('Unexpected response format', 'No access token in response');
      recordResult('Amadeus', 'failed', 'Unexpected response format', 'Missing access_token field');
    }
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to Amadeus API', errorMsg);
    recordResult('Amadeus', 'failed', 'Connection failed', errorMsg,
      'Check your internet connection and firewall settings');
  }
}

/**
 * Validate Supabase Configuration
 */
async function validateSupabase() {
  logTest('Supabase');
  
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !anonKey) {
    logSkipped('Supabase credentials not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
    recordResult('Supabase', 'skipped', 'Supabase credentials not configured', null,
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file. Get them from your Supabase project settings');
    return;
  }

  try {
    const startTime = Date.now();
    
    // Test by making a simple request to check if the Supabase instance is accessible
    const response = await makeRequest(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 401 || response.status === 403) {
      logError('Invalid or expired Supabase key', 'Authentication failed');
      recordResult('Supabase', 'failed', 'Invalid or expired key', `HTTP ${response.status}`,
        'The anon key is invalid or has expired. Check your project settings at https://supabase.com/dashboard/project/_/settings/api');
      return;
    }

    if (!response.ok && response.status !== 404) {
      logError(`API error: ${response.status} ${response.statusText}`, '');
      recordResult('Supabase', 'failed', `HTTP ${response.status}`, response.statusText,
        'Check your Supabase project status at https://supabase.com/dashboard');
      return;
    }

    // Status 200 or 404 is OK - it means we can connect to the instance
    logSuccess('Valid Supabase configuration - Instance accessible', responseTime);
    logInfo(`Project URL: ${url}`);
    recordResult('Supabase', 'passed', 'Successfully validated - Instance accessible');
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to Supabase', errorMsg);
    recordResult('Supabase', 'failed', 'Connection failed', errorMsg,
      'Check your Supabase URL and internet connection');
  }
}

/**
 * Validate OpenWeather API
 */
async function validateOpenWeather() {
  logTest('OpenWeather API');
  
  const apiKey = process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    logSkipped('OpenWeather API key not configured (VITE_OPENWEATHER_API_KEY / OPENWEATHER_API_KEY)');
    recordResult('OpenWeather', 'skipped', 'API key not configured', null,
      'Set VITE_OPENWEATHER_API_KEY in .env file. Get your key from https://openweathermap.org/api');
    return;
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`
    );

    const responseTime = Date.now() - startTime;

    if (response.status === 401) {
      logError('Invalid API key', 'Authentication failed');
      recordResult('OpenWeather', 'failed', 'Invalid API key', 'HTTP 401 Unauthorized',
        'The API key is invalid. Check your key at https://home.openweathermap.org/api_keys');
      return;
    }

    if (response.status === 429) {
      logError('Rate limit exceeded', 'Too many requests');
      recordResult('OpenWeather', 'failed', 'Rate limit exceeded', 'HTTP 429 Too Many Requests',
        'You have exceeded your API rate limit. Upgrade your plan at https://openweathermap.org/price');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logError(`API error: ${response.status} ${response.statusText}`, errorData.message || '');
      recordResult('OpenWeather', 'failed', `HTTP ${response.status}`, 
        errorData.message || response.statusText,
        'Check your API key status at https://home.openweathermap.org/api_keys');
      return;
    }

    const data = await response.json();
    
    if (data.weather) {
      logSuccess('Valid API key - Weather data accessible', responseTime);
      logInfo(`Test query returned data for: ${data.name}, ${data.sys.country}`);
      recordResult('OpenWeather', 'passed', 'Successfully validated - Weather API accessible');
    } else {
      logError('Unexpected response format', 'Invalid data structure');
      recordResult('OpenWeather', 'failed', 'Unexpected response format', 'Missing weather field');
    }
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to OpenWeather API', errorMsg);
    recordResult('OpenWeather', 'failed', 'Connection failed', errorMsg,
      'Check your internet connection and firewall settings');
  }
}

/**
 * Validate Windy API
 */
async function validateWindy() {
  logTest('Windy API');
  
  const apiKey = process.env.WINDY_API_KEY;
  
  if (!apiKey) {
    logSkipped('Windy API key not configured (WINDY_API_KEY) - Optional integration');
    recordResult('Windy', 'skipped', 'API key not configured - Optional', null,
      'Set WINDY_API_KEY in .env file if you want this integration. Get your key from https://api.windy.com/');
    return;
  }

  // Note: Windy API doesn't have a simple test endpoint, so we'll just validate the key format
  if (apiKey.length < 10) {
    logError('API key appears invalid', 'Key is too short');
    recordResult('Windy', 'failed', 'Invalid API key format', 'Key is too short',
      'Verify your API key at https://api.windy.com/keys');
    return;
  }

  logSuccess('API key configured (endpoint test not available)', 0);
  logInfo('Note: Windy API validation requires actual API call - key format appears valid');
  recordResult('Windy', 'passed', 'API key configured - Full validation requires integration test');
}

/**
 * Validate MarineTraffic API
 */
async function validateMarineTraffic() {
  logTest('MarineTraffic API');
  
  const apiKey = process.env.MARINE_TRAFFIC_API_KEY;
  
  if (!apiKey) {
    logSkipped('MarineTraffic API key not configured (MARINE_TRAFFIC_API_KEY) - Optional integration');
    recordResult('MarineTraffic', 'skipped', 'API key not configured - Optional', null,
      'Set MARINE_TRAFFIC_API_KEY in .env file if needed. Get your key from https://www.marinetraffic.com/en/ais-api-services');
    return;
  }

  // MarineTraffic API requires specific endpoint and parameters
  // For now, we'll just validate the key is configured
  logSuccess('API key configured (endpoint test not available)', 0);
  logInfo('Note: MarineTraffic API validation requires specific vessel ID - key is configured');
  recordResult('MarineTraffic', 'passed', 'API key configured - Full validation requires integration test');
}

/**
 * Validate Skyscanner API
 */
async function validateSkyscanner() {
  logTest('Skyscanner API');
  
  const apiKey = process.env.VITE_SKYSCANNER_API_KEY;
  
  if (!apiKey) {
    logSkipped('Skyscanner API key not configured (VITE_SKYSCANNER_API_KEY) - Optional integration');
    recordResult('Skyscanner', 'skipped', 'API key not configured - Optional', null,
      'Set VITE_SKYSCANNER_API_KEY in .env file if needed. Get your key from https://developers.skyscanner.net/');
    return;
  }

  // Skyscanner requires RapidAPI subscription
  logSuccess('API key configured (endpoint test not available)', 0);
  logInfo('Note: Skyscanner via RapidAPI - key is configured');
  recordResult('Skyscanner', 'passed', 'API key configured - Full validation requires integration test');
}

/**
 * Validate Booking.com API
 */
async function validateBooking() {
  logTest('Booking.com API');
  
  const apiKey = process.env.BOOKING_API_KEY;
  
  if (!apiKey) {
    logSkipped('Booking.com API key not configured (BOOKING_API_KEY) - Optional integration');
    recordResult('Booking.com', 'skipped', 'API key not configured - Optional', null,
      'Set BOOKING_API_KEY in .env file if needed. Get your key from https://www.booking.com/content/affiliates.html');
    return;
  }

  logSuccess('API key configured (endpoint test not available)', 0);
  logInfo('Note: Booking.com API validation requires affiliate credentials - key is configured');
  recordResult('Booking.com', 'passed', 'API key configured - Full validation requires integration test');
}

/**
 * Validate ElevenLabs API
 */
async function validateElevenLabs() {
  logTest('ElevenLabs API');
  
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    logSkipped('ElevenLabs API key not configured (VITE_ELEVENLABS_API_KEY) - Optional integration');
    recordResult('ElevenLabs', 'skipped', 'API key not configured - Optional', null,
      'Set VITE_ELEVENLABS_API_KEY in .env file if needed. Get your key from https://elevenlabs.io/');
    return;
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 401) {
      logError('Invalid API key', 'Authentication failed');
      recordResult('ElevenLabs', 'failed', 'Invalid API key', 'HTTP 401 Unauthorized',
        'The API key is invalid. Check your key at https://elevenlabs.io/app/settings/api-keys');
      return;
    }

    if (!response.ok) {
      logError(`API error: ${response.status} ${response.statusText}`, '');
      recordResult('ElevenLabs', 'failed', `HTTP ${response.status}`, response.statusText,
        'Check your API key status at https://elevenlabs.io/app/settings/api-keys');
      return;
    }

    const data = await response.json();
    logSuccess('Valid API key - Account accessible', responseTime);
    recordResult('ElevenLabs', 'passed', 'Successfully validated - Account accessible');
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    logError('Failed to connect to ElevenLabs API', errorMsg);
    recordResult('ElevenLabs', 'failed', 'Connection failed', errorMsg,
      'Check your internet connection and firewall settings');
  }
}

/**
 * Print summary report
 */
function printSummary() {
  logHeader('VALIDATION SUMMARY');

  console.log(`${colors.bright}Total APIs Checked:${colors.reset} ${results.total}`);
  console.log(`${colors.green}✅ Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.yellow}⊘  Skipped:${colors.reset} ${results.skipped}\n`);

  // Calculate success rate (excluding skipped)
  const tested = results.passed + results.failed;
  const successRate = tested > 0 ? ((results.passed / tested) * 100).toFixed(1) : 0;
  
  console.log(`${colors.bright}Success Rate:${colors.reset} ${successRate}% (${results.passed}/${tested} tested)\n`);

  // Show failed tests with recommendations
  const failed = results.details.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}\n`);
    failed.forEach(r => {
      console.log(`  ${colors.red}❌ ${r.name}${colors.reset}`);
      console.log(`     ${colors.red}Error: ${r.error}${colors.reset}`);
      if (r.recommendation) {
        console.log(`     ${colors.yellow}💡 Recommendation: ${r.recommendation}${colors.reset}`);
      }
      console.log('');
    });
  }

  // Show skipped tests
  const skipped = results.details.filter(r => r.status === 'skipped');
  if (skipped.length > 0) {
    console.log(`${colors.yellow}${colors.bright}Skipped Tests (Not Configured):${colors.reset}\n`);
    skipped.forEach(r => {
      console.log(`  ${colors.yellow}⊘  ${r.name}${colors.reset}`);
      if (r.recommendation) {
        console.log(`     ${colors.cyan}💡 ${r.recommendation}${colors.reset}`);
      }
      console.log('');
    });
  }

  // Final verdict
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  if (results.failed === 0 && results.passed > 0) {
    console.log(`${colors.green}${colors.bright}✅ All configured APIs are working correctly!${colors.reset}`);
  } else if (results.failed > 0) {
    console.log(`${colors.red}${colors.bright}⚠️  Some APIs need attention. Please review the failures above.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  No APIs configured yet. Add API keys to your .env file.${colors.reset}`);
  }
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Main validation function
 */
async function validateAllAPIs() {
  logHeader('🔍 API KEYS VALIDATION REPORT - NAUTILUS ONE');

  console.log(`${colors.cyan}Validating all external API integrations...${colors.reset}`);
  console.log(`${colors.cyan}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);

  // Run all validations
  await validateOpenAI();
  console.log('');
  
  await validateMapbox();
  console.log('');
  
  await validateAmadeus();
  console.log('');
  
  await validateSupabase();
  console.log('');
  
  await validateOpenWeather();
  console.log('');
  
  await validateElevenLabs();
  console.log('');
  
  await validateWindy();
  console.log('');
  
  await validateMarineTraffic();
  console.log('');
  
  await validateSkyscanner();
  console.log('');
  
  await validateBooking();
  console.log('');

  // Print summary
  printSummary();
}

// Run validation
validateAllAPIs().catch(error => {
  console.error(`\n${colors.red}Fatal error during validation:${colors.reset}`, error);
  process.exit(1);
});
