/**
 * Example: Using jobsForecastMock.ts for prototyping and testing
 * 
 * This file demonstrates how to import and use the mock job data
 * for local development, testing, and dashboard prototyping.
 */

import { mockJobs } from "../../../lib/dev/mocks/jobsForecastMock";

/**
 * Example 1: Transform mock data to trend format for JobsForecastReport
 */
export function getMockTrendData() {
  const jobsByMonth = mockJobs.reduce(
    (acc, job) => {
      const month = job.completed_at.substring(0, 7); // "2025-05"
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(jobsByMonth)
    .map(([date, jobs]) => ({ date, jobs }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Example 2: Get statistics by component
 */
export function getMockComponentStats() {
  return mockJobs.reduce(
    (acc, job) => {
      acc[job.component_id] = (acc[job.component_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Example 3: Get jobs for a specific component
 */
export function getMockJobsByComponent(componentId: string) {
  return mockJobs.filter((job) => job.component_id === componentId);
}

/**
 * Example 4: Get jobs for a specific month
 */
export function getMockJobsByMonth(yearMonth: string) {
  return mockJobs.filter((job) => job.completed_at.startsWith(yearMonth));
}

/**
 * Example 5: Calculate monthly growth rate
 */
export function calculateMockGrowthRate() {
  const trendData = getMockTrendData();
  
  if (trendData.length < 2) return 0;

  const lastMonth = trendData[trendData.length - 1];
  const previousMonth = trendData[trendData.length - 2];

  return (
    ((lastMonth.jobs - previousMonth.jobs) / previousMonth.jobs) *
    100
  ).toFixed(2);
}

/**
 * Example 6: Get date range of mock data
 */
export function getMockDateRange() {
  if (mockJobs.length === 0) return { start: null, end: null };

  const dates = mockJobs.map((job) => job.completed_at).sort();

  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}

// Export the raw mock data for direct use
export { mockJobs };

/**
 * Usage Examples:
 * 
 * // In a component:
 * import { getMockTrendData } from "./jobsForecastMock.examples";
 * import JobsForecastReport from "@/components/bi/JobsForecastReport";
 * 
 * function MyComponent() {
 *   const trendData = getMockTrendData();
 *   return <JobsForecastReport trend={trendData} />;
 * }
 * 
 * // For testing with Supabase function:
 * import { mockJobs, getMockTrendData } from "./jobsForecastMock.examples";
 * 
 * const { data, error } = await supabase.functions.invoke("bi-jobs-forecast", {
 *   body: { trend: getMockTrendData() }
 * });
 * 
 * // For displaying component statistics:
 * import { getMockComponentStats } from "./jobsForecastMock.examples";
 * 
 * const stats = getMockComponentStats();
 * console.log(stats); // { "GEN-BB": 5, "HID-P-01": 3, ... }
 */
