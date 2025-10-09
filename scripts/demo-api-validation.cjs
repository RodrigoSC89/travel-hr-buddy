#!/usr/bin/env node

/**
 * API Validation Demo Script
 * 
 * This script demonstrates the API validation capabilities
 * by simulating API responses and showing how the system
 * categorizes different types of errors.
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🧪 API Validation System Demo                       ║
║           Nautilus One Travel HR Buddy                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

This demo shows how the API validation system categorizes different
types of API responses and provides actionable recommendations.

`);

// Simulate different API response scenarios
const scenarios = [
  {
    name: "OpenAI API",
    scenario: "Valid API Key",
    response: {
      success: true,
      message: "OpenAI API connection successful",
      responseTime: 892,
      data: { model: "gpt-3.5-turbo", response: "API test successful" }
    },
    expectedStatus: "valid",
    expectedRecommendation: "API key is active and working correctly"
  },
  {
    name: "Mapbox API",
    scenario: "Invalid Token (401)",
    response: {
      success: false,
      message: "Mapbox API error: 401 Unauthorized",
      responseTime: 234,
      error: "HTTP 401"
    },
    expectedStatus: "unauthorized",
    expectedRecommendation: "Invalid API key - verify credentials and rotate if necessary"
  },
  {
    name: "Amadeus API",
    scenario: "Expired Credentials (403)",
    response: {
      success: false,
      message: "Amadeus API error: 403 Forbidden",
      responseTime: 456,
      error: "API credentials expired or forbidden"
    },
    expectedStatus: "expired",
    expectedRecommendation: "API key has expired - rotate immediately"
  },
  {
    name: "Skyscanner API",
    scenario: "Rate Limited (429)",
    response: {
      success: false,
      message: "Skyscanner API error: 429 Too Many Requests",
      responseTime: 123,
      error: "HTTP 429 - Rate limit exceeded"
    },
    expectedStatus: "rate_limited",
    expectedRecommendation: "Rate limit reached - consider upgrading plan or reducing usage"
  },
  {
    name: "Booking.com API",
    scenario: "Not Configured",
    response: {
      success: false,
      message: "Booking.com API key not configured",
      error: "Missing VITE_BOOKING_API_KEY or VITE_RAPIDAPI_KEY"
    },
    expectedStatus: "not_configured",
    expectedRecommendation: "Configure Booking.com API key in environment variables"
  },
  {
    name: "Supabase",
    scenario: "Connection Failed",
    response: {
      success: false,
      message: "Supabase database connection failed",
      responseTime: 5234,
      error: "Connection timeout"
    },
    expectedStatus: "invalid",
    expectedRecommendation: "API connection failed - check credentials and network connectivity"
  }
];

// Status icons mapping
const statusIcons = {
  valid: "✅",
  invalid: "❌",
  expired: "🔴",
  unauthorized: "🚫",
  rate_limited: "⏱️",
  not_configured: "⚠️",
  unknown: "❓"
};

console.log("═".repeat(70));
console.log("SIMULATED API VALIDATION RESULTS");
console.log("═".repeat(70));
console.log("");

scenarios.forEach((scenario, index) => {
  const icon = statusIcons[scenario.expectedStatus] || "❓";
  
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Scenario: ${scenario.scenario}`);
  console.log(`   Status: ${icon} ${scenario.expectedStatus.toUpperCase()}`);
  console.log(`   Message: ${scenario.response.message}`);
  
  if (scenario.response.responseTime) {
    console.log(`   Response Time: ${scenario.response.responseTime}ms`);
  }
  
  if (scenario.response.error) {
    console.log(`   Error: ${scenario.response.error}`);
  }
  
  if (scenario.response.data) {
    console.log(`   Data: ${JSON.stringify(scenario.response.data)}`);
  }
  
  console.log(`   Recommendation: ${scenario.expectedRecommendation}`);
  console.log("");
});

console.log("═".repeat(70));
console.log("ERROR CATEGORIZATION LOGIC");
console.log("═".repeat(70));
console.log(`
The validation system analyzes error messages and HTTP status codes
to automatically categorize issues:

1. "not configured" / "missing" → ⚠️  not_configured
   - Action: Add API key to .env file

2. "401" / "unauthorized" / "invalid" → 🚫 unauthorized
   - Action: Verify API key is correct, check for typos

3. "403" / "expired" / "forbidden" → 🔴 expired
   - Action: Generate new API key immediately

4. "429" / "rate limit" → ⏱️ rate_limited
   - Action: Wait or upgrade plan

5. Other errors → ❌ invalid
   - Action: Check network, credentials, and service status
`);

console.log("═".repeat(70));
console.log("ACTUAL VALIDATION TOOLS");
console.log("═".repeat(70));
console.log(`
To run actual API validation:

1. Configuration Check (Fast, No API Calls):
   $ npm run validate:api-keys
   
2. Live API Testing (UI):
   $ npm run dev
   Then navigate to: http://localhost:5173/admin/api-tester
   
3. Programmatic Testing:
   import { validateAllAPIKeys } from '@/utils/api-key-validator';
   const report = await validateAllAPIKeys();
   console.log(report.summary);
`);

console.log("═".repeat(70));
console.log("\n✨ Demo complete! Check the documentation for more details.\n");
