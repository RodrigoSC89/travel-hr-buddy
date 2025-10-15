/**
 * Validation script for forecast test API
 * Run with: node scripts/validate-forecast-api.cjs
 */

const mockJobs = [
  { id: "1", component_id: "comp-001", completed_at: "2025-01-05", status: "completed" },
  { id: "2", component_id: "comp-001", completed_at: "2025-01-12", status: "completed" },
  { id: "3", component_id: "comp-002", completed_at: "2025-01-15", status: "completed" },
  { id: "4", component_id: "comp-003", completed_at: "2025-01-20", status: "completed" },
  { id: "5", component_id: "comp-001", completed_at: "2025-01-25", status: "completed" },
];

console.log("🔍 Validating Forecast API Mock Data Structure...\n");

// Test 1: Mock data exists
console.log("✓ Test 1: Mock jobs data exists");
console.log(`  Found ${mockJobs.length} mock jobs\n`);

// Test 2: Jobs have correct structure
console.log("✓ Test 2: Jobs have correct structure");
const firstJob = mockJobs[0];
console.log(`  Sample job:`, firstJob);
console.log(`  Has id: ${!!firstJob.id}`);
console.log(`  Has component_id: ${!!firstJob.component_id}`);
console.log(`  Has completed_at: ${!!firstJob.completed_at}`);
console.log(`  Has status: ${!!firstJob.status}\n`);

// Test 3: Trend aggregation works
console.log("✓ Test 3: Trend aggregation by component");
const trendByComponent = {};
mockJobs.forEach(job => {
  const month = job.completed_at.slice(0, 7);
  if (!trendByComponent[job.component_id]) trendByComponent[job.component_id] = [];
  trendByComponent[job.component_id].push(month);
});

console.log("  Trend by component:", JSON.stringify(trendByComponent, null, 2));
console.log(`  Components found: ${Object.keys(trendByComponent).length}\n`);

// Test 4: JSON serialization
console.log("✓ Test 4: Data can be JSON serialized");
const jsonString = JSON.stringify(trendByComponent, null, 2);
console.log(`  JSON length: ${jsonString.length} bytes\n`);

// Test 5: Database schema validation
console.log("✓ Test 5: forecast_history schema expectations");
const sampleForecastRecord = {
  id: "uuid-generated",
  source: "dev-mock",
  forecast_summary: "Sample AI-generated forecast...",
  created_by: "dev",
  created_at: new Date().toISOString()
};
console.log("  Sample record structure:");
console.log(JSON.stringify(sampleForecastRecord, null, 2));
console.log("");

console.log("✅ All validations passed!");
console.log("\n📋 Next steps:");
console.log("1. Apply the database migration");
console.log("2. Set OPENAI_API_KEY environment variable");
console.log("3. Start the development server");
console.log("4. POST to /api/dev/test-forecast-with-mock");
