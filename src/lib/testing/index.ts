/**
 * Testing Utilities Index
 * PATCH 838: Central export for all testing utilities
 * PATCH P2: Added E2E test references for Health Check-in and PEOTRAM Upload
 */

// E2E Helpers
export { 
  networkSimulator, 
  testIds, 
  waitUtils, 
  storageUtils, 
  perfUtils 
} from './e2e-helpers';

// E2E Test Suite
export {
  E2ETestRunner,
  authTests,
  offlineTests,
  performanceTests,
  dataIntegrityTests,
  uiTests,
  runFullE2ETestSuite,
  type TestResult,
  type TestSuite,
} from './e2e-test-suite';

// Test Coverage Engine (aliased to avoid conflicts)
export {
  testCoverageEngine,
  type TestSuite as CoverageTestSuite,
  type Test as CoverageTest,
  type CoverageReport,
  type CoverageMetric,
  type TestPlan,
  type TestCase,
  type TestStep,
  type TestReport,
  type TestSummary,
  type TestTrend,
} from './test-coverage';

/**
 * E2E Test Files Reference (Playwright)
 * 
 * Health Check-in Tests:
 * - e2e/crew-wellbeing.spec.ts - Form validation, data persistence, UI elements
 * 
 * PEOTRAM Upload Tests:
 * - e2e/peotram-upload.spec.ts - File upload, evidence management, error handling
 * 
 * Run with: npx playwright test e2e/crew-wellbeing.spec.ts e2e/peotram-upload.spec.ts
 */
