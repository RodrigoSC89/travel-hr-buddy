/**
 * Example Integration: Query Similar Jobs
 * 
 * This file demonstrates how to use the querySimilarJobs function
 * to perform RAG (Retrieval-Augmented Generation) queries for
 * maintenance jobs using semantic similarity search.
 */

import { querySimilarJobs } from "./querySimilarJobs";

/**
 * Example 1: Basic usage
 * Query for similar jobs with default limit (5)
 */
export async function exampleBasicQuery() {
  try {
    const results = await querySimilarJobs(
      "Gerador apresentando ruído anormal e aquecimento"
    );

    console.log("✅ Found similar jobs:");
    results.forEach((job, index) => {
      console.log(
        `${index + 1}. ${job.title} (${(job.similarity * 100).toFixed(1)}% similar)`
      );
    });

    return results;
  } catch (error) {
    console.error("❌ Error querying similar jobs:", error);
    throw error;
  }
}

/**
 * Example 2: Custom limit
 * Query for more or fewer results
 */
export async function exampleCustomLimit() {
  try {
    // Get only the top 3 most similar jobs
    const topThree = await querySimilarJobs(
      "Bomba hidráulica com vazamento",
      3
    );

    console.log("✅ Top 3 similar jobs:");
    topThree.forEach((job) => {
      console.log(`- ${job.title} (${job.similarity.toFixed(3)})`);
    });

    return topThree;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

/**
 * Example 3: Use results for AI context
 * Demonstrate how to use similar jobs as context for AI suggestions
 */
export async function exampleWithAIContext(userQuery: string) {
  try {
    // Get similar historical jobs
    const similarJobs = await querySimilarJobs(userQuery, 5);

    // Build context string from similar jobs
    const context = similarJobs
      .map(
        (job) =>
          `Job: ${job.title}\nDescription: ${job.description}\nStatus: ${job.status}\nSimilarity: ${(job.similarity * 100).toFixed(1)}%`
      )
      .join("\n\n---\n\n");

    console.log("🧠 Context for AI Copilot:");
    console.log(context);

    // This context can now be used with OpenAI GPT to provide
    // informed suggestions based on historical data
    return {
      query: userQuery,
      similarJobs,
      context,
    };
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

/**
 * Example 4: Pattern learning
 * Analyze patterns from similar jobs
 */
export async function examplePatternLearning(issue: string) {
  try {
    const similarJobs = await querySimilarJobs(issue, 10);

    // Analyze common patterns
    const patterns = {
      totalJobs: similarJobs.length,
      avgSimilarity:
        similarJobs.reduce((sum, job) => sum + job.similarity, 0) /
        similarJobs.length,
      completedJobs: similarJobs.filter((job) => job.status === "completed")
        .length,
      vessels: [...new Set(similarJobs.map((job) => job.metadata?.vessel))],
      components: [
        ...new Set(similarJobs.map((job) => job.metadata?.component)),
      ],
    };

    console.log("📈 Pattern Analysis:");
    console.log(`- Total similar jobs: ${patterns.totalJobs}`);
    console.log(
      `- Average similarity: ${(patterns.avgSimilarity * 100).toFixed(1)}%`
    );
    console.log(`- Completed jobs: ${patterns.completedJobs}`);
    console.log(`- Affected vessels: ${patterns.vessels.join(", ")}`);
    console.log(`- Components involved: ${patterns.components.join(", ")}`);

    return patterns;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

/**
 * Example 5: Vessel-specific learning
 * Query similar jobs for a specific vessel
 */
export async function exampleVesselSpecific(
  issue: string,
  vesselName: string
) {
  try {
    // Get all similar jobs
    const allSimilarJobs = await querySimilarJobs(issue, 20);

    // Filter for specific vessel
    const vesselJobs = allSimilarJobs.filter(
      (job) => job.metadata?.vessel === vesselName
    );

    console.log(`🚢 Similar jobs for ${vesselName}:`);
    vesselJobs.forEach((job) => {
      console.log(
        `- ${job.title} (${(job.similarity * 100).toFixed(1)}% similar)`
      );
    });

    return vesselJobs;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

/**
 * Example usage demonstrating all features
 */
export async function demonstrateAllFeatures() {
  console.log("🔍 RAG Query Demonstration\n");

  // Example 1: Basic query
  console.log("1️⃣ Basic Query:");
  await exampleBasicQuery();
  console.log("\n");

  // Example 2: Custom limit
  console.log("2️⃣ Custom Limit:");
  await exampleCustomLimit();
  console.log("\n");

  // Example 3: AI Context
  console.log("3️⃣ AI Context:");
  await exampleWithAIContext("Falha no sistema de resfriamento");
  console.log("\n");

  // Example 4: Pattern Learning
  console.log("4️⃣ Pattern Learning:");
  await examplePatternLearning("Sensor descalibrado");
  console.log("\n");

  // Example 5: Vessel-specific
  console.log("5️⃣ Vessel-Specific:");
  await exampleVesselSpecific("Manutenção preventiva", "Navio Atlantic Star");
}

// Export all examples
export const examples = {
  basic: exampleBasicQuery,
  customLimit: exampleCustomLimit,
  withAIContext: exampleWithAIContext,
  patternLearning: examplePatternLearning,
  vesselSpecific: exampleVesselSpecific,
  demonstrateAll: demonstrateAllFeatures,
};
