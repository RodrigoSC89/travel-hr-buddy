/**
 * Collective Intelligence System - Integration Example
 * 
 * This example shows how to integrate and use the collective intelligence system
 * in your application.
 */

import { 
  initializeCollectiveIntelligence,
  contextMesh,
  type ContextMessage 
} from "@/core";
import { 
  distributedDecisionCore,
  type DecisionContext 
} from "@/ai/distributedDecisionCore";
import { 
  consciousCore,
  type ModuleHealth 
} from "@/ai/consciousCore";
import { 
  collectiveLoopEngine 
} from "@/ai/feedback/collectiveLoop";
import { logger } from "@/lib/logger";

/**
 * Example 1: Basic Setup and Initialization
 */
export async function example1_BasicSetup() {
  console.log("=== Example 1: Basic Setup ===\n");

  try {
    // Initialize all systems
    await initializeCollectiveIntelligence();
    console.log("✅ All systems initialized\n");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
}

/**
 * Example 2: Publishing and Subscribing to Context
 */
export async function example2_ContextMesh() {
  console.log("=== Example 2: Context Mesh ===\n");

  // Subscribe to context updates
  const subscriptionId = contextMesh.subscribe({
    moduleName: "ExampleModule",
    contextTypes: ["mission", "risk"],
    handler: (message: ContextMessage) => {
      console.log("📨 Received context update:", {
        type: message.contextType,
        module: message.moduleName,
        data: message.contextData
      });
    }
  });

  // Publish some context
  await contextMesh.publish({
    moduleName: "PaymentProcessor",
    contextType: "mission",
    contextData: {
      status: "processing",
      transactionId: "TXN-12345",
      amount: 150.00
    },
    source: "PaymentService"
  });

  await contextMesh.publish({
    moduleName: "PaymentProcessor",
    contextType: "risk",
    contextData: {
      riskLevel: 0.25,
      factors: ["amount_normal", "verified_user"]
    },
    source: "RiskAnalyzer"
  });

  // Get context history
  const history = await contextMesh.getContextHistory("PaymentProcessor", "mission", 10);
  console.log(`\n📚 Found ${history.length} context messages in history\n`);

  // Cleanup
  contextMesh.unsubscribe(subscriptionId);
}

/**
 * Example 3: Distributed Decision Making
 */
export async function example3_DecisionMaking() {
  console.log("=== Example 3: Decision Making ===\n");

  // Register a decision rule
  distributedDecisionCore.registerRule({
    id: "high-amount-alert",
    name: "High Amount Transaction Alert",
    moduleName: "PaymentProcessor",
    priority: "high",
    condition: async (context: DecisionContext) => {
      return context.contextData.amount > 1000;
    },
    action: async (context: DecisionContext) => {
      return "notify_human";
    },
    requiresEscalation: false,
    timeoutMs: 5000
  });

  // Make a decision
  const decision = await distributedDecisionCore.makeDecision({
    moduleName: "PaymentProcessor",
    decisionType: "transaction_review",
    contextData: {
      amount: 1500,
      userId: "user-123",
      transactionId: "TXN-67890"
    }
  });

  console.log("🎯 Decision made:", {
    level: decision.decisionLevel,
    action: decision.action,
    success: decision.success,
    status: decision.status
  });

  // Get decision history
  const decisionHistory = await distributedDecisionCore.getDecisionHistory("PaymentProcessor", 5);
  console.log(`\n📊 Found ${decisionHistory.length} decisions in history\n`);
}

/**
 * Example 4: System Monitoring
 */
export async function example4_SystemMonitoring() {
  console.log("=== Example 4: System Monitoring ===\n");

  // Update module health
  const healthUpdate: ModuleHealth = {
    moduleName: "PaymentProcessor",
    status: "healthy",
    lastCheck: new Date(),
    errorCount: 0,
    responseTime: 120,
    memoryUsage: 45.5,
    cpuUsage: 23.1
  };

  consciousCore.updateModuleHealth(healthUpdate);
  console.log("✅ Module health updated");

  // Get system state
  const systemState = await consciousCore.getSystemState();
  console.log("\n🏥 System State:", {
    overallHealth: systemState.overallHealth,
    activeModules: `${systemState.activeModules}/${systemState.totalModules}`,
    activeIssues: systemState.activeObservations,
    criticalIssues: systemState.criticalIssues
  });

  // Get active observations
  const observations = consciousCore.getActiveObservations();
  console.log(`\n👁️ Active observations: ${observations.length}\n`);
}

/**
 * Example 5: Feedback and Learning
 */
export async function example5_FeedbackLoop() {
  console.log("=== Example 5: Feedback Loop ===\n");

  // Submit human feedback
  await collectiveLoopEngine.submitHumanFeedback(
    "DocumentGenerator",
    "accuracy",
    4,
    "Document was well-formatted but had minor typos",
    {
      documentType: "invoice",
      typoCount: 2,
      processingTime: 1200
    }
  );
  console.log("✅ Human feedback submitted");

  // Submit AI feedback
  await collectiveLoopEngine.submitAIFeedback(
    "TextClassifier",
    {
      precision: 0.92,
      recall: 0.88,
      f1Score: 0.90,
      accuracy: 0.89,
      latency: 150,
      successRate: 0.95
    }
  );
  console.log("✅ AI feedback submitted");

  // Get feedback summary
  const summary = await collectiveLoopEngine.getFeedbackSummary(undefined, 7);
  console.log("\n📈 Feedback Summary (last 7 days):", {
    totalEvents: summary.totalEvents,
    averageRating: summary.averageRating.toFixed(2),
    processed: summary.processedCount,
    learningApplied: summary.learningAppliedCount,
    byType: summary.byType
  });

  // Get learning history
  const learningHistory = collectiveLoopEngine.getLearningHistory("TextClassifier");
  console.log(`\n🎓 Learning adjustments: ${learningHistory.length}\n`);
}

/**
 * Example 6: Complete Workflow
 */
export async function example6_CompleteWorkflow() {
  console.log("=== Example 6: Complete Workflow ===\n");

  // 1. Module reports health
  consciousCore.updateModuleHealth({
    moduleName: "OrderProcessor",
    status: "healthy",
    lastCheck: new Date(),
    errorCount: 0,
    responseTime: 200
  });

  // 2. Module publishes context
  await contextMesh.publish({
    moduleName: "OrderProcessor",
    contextType: "mission",
    contextData: {
      orderId: "ORD-001",
      status: "processing",
      items: 5,
      total: 299.99
    },
    source: "OrderService"
  });

  // 3. Decision is triggered based on context
  const decision = await distributedDecisionCore.makeDecision({
    moduleName: "OrderProcessor",
    decisionType: "priority_check",
    contextData: {
      orderId: "ORD-001",
      total: 299.99,
      customerTier: "premium"
    }
  });

  console.log("📋 Decision:", decision.action);

  // 4. Feedback is collected
  await collectiveLoopEngine.submitOperationalFeedback(
    "OrderProcessor",
    {
      processingTime: 850,
      successRate: 0.98,
      errorRate: 0.02
    }
  );

  // 5. System state is checked
  const state = await consciousCore.getSystemState();
  console.log("\n📊 Final System State:", {
    health: state.overallHealth,
    modules: state.activeModules,
    issues: state.activeObservations
  });
}

/**
 * Example 7: Error Handling and Resilience
 */
export async function example7_ErrorHandling() {
  console.log("=== Example 7: Error Handling ===\n");

  try {
    // Simulate a failing module
    consciousCore.updateModuleHealth({
      moduleName: "FailingService",
      status: "critical",
      lastCheck: new Date(),
      errorCount: 25,
      responseTime: 5000
    });

    console.log("⚠️ Critical module reported");

    // The conscious core will detect this and create observations
    await new Promise(resolve => setTimeout(resolve, 1000));

    const observations = consciousCore.getActiveObservations();
    const criticalObs = observations.filter(o => o.severity === "critical");
    
    console.log(`\n🚨 Critical observations: ${criticalObs.length}`);
    criticalObs.forEach(obs => {
      console.log(`   - ${obs.description}`);
      if (obs.suggestedAction) {
        console.log(`   Action: ${obs.suggestedAction}`);
      }
    });

  } catch (error) {
    console.error("Error during workflow:", error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log("\n🚀 Running Collective Intelligence Examples\n");
  console.log("=".repeat(50) + "\n");

  try {
    await example1_BasicSetup();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example2_ContextMesh();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example3_DecisionMaking();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example4_SystemMonitoring();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example5_FeedbackLoop();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example6_CompleteWorkflow();
    await new Promise(resolve => setTimeout(resolve, 500));

    await example7_ErrorHandling();

    console.log("\n" + "=".repeat(50));
    console.log("✅ All examples completed successfully!");
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("\n❌ Example execution failed:", error);
    throw error;
  }
}

// Uncomment to run examples
// runAllExamples();
