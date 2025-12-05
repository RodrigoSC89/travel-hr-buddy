/**
 * Testing Utilities Index
 * PATCH 838: Central export for all testing utilities
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
