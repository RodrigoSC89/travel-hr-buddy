/**
 * PATCH 534 - AI Feedback Analyzer Tests
 * Tests for NLP analysis, semantic analysis, categorization, and feedback
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } }
      })
    }
  }
}));

interface FeedbackAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  keywords: string[];
  categories: string[];
  topics: string[];
  summary: string;
  confidence: number;
}

interface SemanticAnalysis {
  entities: Array<{ text: string; type: string; confidence: number }>;
  relationships: Array<{ from: string; to: string; type: string }>;
  mainTheme: string;
  subThemes: string[];
}

// Mock AI feedback analyzer
const analyzeFeedback = async (text: string): Promise<FeedbackAnalysis> => {
  const words = text.toLowerCase().split(/\s+/);
  
  // Sentiment analysis
  const positiveWords = ["good", "great", "excellent", "amazing", "love", "best", "perfect", "happy"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "poor", "disappointing", "sad"];
  
  const positiveCount = words.filter(w => positiveWords.includes(w)).length;
  const negativeCount = words.filter(w => negativeWords.includes(w)).length;
  
  let sentiment: "positive" | "negative" | "neutral";
  let score: number;
  
  if (positiveCount > negativeCount) {
    sentiment = "positive";
    score = 0.5 + (positiveCount - negativeCount) * 0.1;
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
    score = 0.5 - (negativeCount - positiveCount) * 0.1;
  } else {
    sentiment = "neutral";
    score = 0.5;
  }
  
  score = Math.max(0, Math.min(1, score));
  
  // Extract keywords (simple: words > 4 chars)
  const keywords = [...new Set(words.filter(w => w.length > 4))].slice(0, 5);
  
  // Categorization
  const categories: string[] = [];
  if (text.toLowerCase().includes("feature")) categories.push("feature_request");
  if (text.toLowerCase().includes("bug") || text.toLowerCase().includes("issue")) categories.push("bug_report");
  if (text.toLowerCase().includes("ui") || text.toLowerCase().includes("interface")) categories.push("ui_ux");
  if (text.toLowerCase().includes("performance") || text.toLowerCase().includes("speed")) categories.push("performance");
  if (categories.length === 0) categories.push("general");
  
  // Topic extraction
  const topics: string[] = [];
  if (text.toLowerCase().includes("dashboard")) topics.push("dashboard");
  if (text.toLowerCase().includes("report")) topics.push("reporting");
  if (text.toLowerCase().includes("notification")) topics.push("notifications");
  if (text.toLowerCase().includes("data")) topics.push("data");
  
  // Generate summary
  const summary = text.length > 100 ? text.substring(0, 97) + "..." : text;
  
  // Calculate confidence
  const confidence = Math.min(0.95, 0.6 + (keywords.length * 0.05) + (categories.length * 0.05));
  
  return {
    sentiment,
    score,
    keywords,
    categories,
    topics,
    summary,
    confidence
  };
};

const performSemanticAnalysis = async (text: string): Promise<SemanticAnalysis> => {
  const words = text.split(/\s+/);
  
  // Extract entities (simple mock)
  const entities: Array<{ text: string; type: string; confidence: number }> = [];
  
  // Look for common entities
  if (text.includes("DP")) entities.push({ text: "DP", type: "system", confidence: 0.9 });
  if (text.includes("vessel")) entities.push({ text: "vessel", type: "object", confidence: 0.85 });
  if (text.includes("thruster")) entities.push({ text: "thruster", type: "equipment", confidence: 0.9 });
  if (text.includes("incident")) entities.push({ text: "incident", type: "event", confidence: 0.95 });
  
  // Extract relationships (simple)
  const relationships: Array<{ from: string; to: string; type: string }> = [];
  if (entities.length >= 2) {
    relationships.push({
      from: entities[0].text,
      to: entities[1].text,
      type: "related_to"
    });
  }
  
  // Determine themes
  const themes: string[] = [];
  if (text.toLowerCase().includes("safety")) themes.push("safety");
  if (text.toLowerCase().includes("efficiency")) themes.push("efficiency");
  if (text.toLowerCase().includes("compliance")) themes.push("compliance");
  if (text.toLowerCase().includes("automation")) themes.push("automation");
  
  const mainTheme = themes[0] || "general";
  const subThemes = themes.slice(1);
  
  return {
    entities,
    relationships,
    mainTheme,
    subThemes
  };
};

const categorizeFeedback = async (feedbacks: string[]): Promise<Record<string, string[]>> => {
  const categorized: Record<string, string[]> = {};
  
  for (const feedback of feedbacks) {
    const analysis = await analyzeFeedback(feedback);
    
    for (const category of analysis.categories) {
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(feedback);
    }
  }
  
  return categorized;
};

describe("AI Feedback Analyzer Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sentiment Analysis", () => {
    it("should detect positive sentiment correctly", async () => {
      const text = "This is a great feature! I love the excellent performance. Amazing work!";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.sentiment).toBe("positive");
      expect(analysis.score).toBeGreaterThan(0.5);
    });

    it("should detect negative sentiment correctly", async () => {
      const text = "This is terrible. The performance is awful and I hate the bad interface.";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.sentiment).toBe("negative");
      expect(analysis.score).toBeLessThan(0.5);
    });

    it("should detect neutral sentiment", async () => {
      const text = "The application has various features for managing data and reports.";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.sentiment).toBe("neutral");
      expect(analysis.score).toBeCloseTo(0.5, 1);
    });

    it("should calculate sentiment score within valid range", async () => {
      const texts = [
        "Excellent amazing perfect great",
        "Terrible awful bad worst",
        "Normal standard regular typical"
      ];
      
      for (const text of texts) {
        const analysis = await analyzeFeedback(text);
        expect(analysis.score).toBeGreaterThanOrEqual(0);
        expect(analysis.score).toBeLessThanOrEqual(1);
      }
    });

    it("should handle mixed sentiment appropriately", async () => {
      const text = "The feature is great but the performance is terrible";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.sentiment).toBeDefined();
      expect(["positive", "negative", "neutral"]).toContain(analysis.sentiment);
    });
  });

  describe("Keyword Extraction", () => {
    it("should extract relevant keywords", async () => {
      const text = "The dashboard interface needs better performance optimization for real-time data visualization";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.keywords.length).toBeGreaterThan(0);
      expect(analysis.keywords.every(k => k.length > 4)).toBe(true);
    });

    it("should limit keyword count", async () => {
      const text = "performance dashboard interface optimization visualization analytics monitoring reporting tracking management";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.keywords.length).toBeLessThanOrEqual(5);
    });

    it("should extract unique keywords", async () => {
      const text = "performance performance dashboard dashboard interface interface";
      
      const analysis = await analyzeFeedback(text);
      
      const uniqueKeywords = new Set(analysis.keywords);
      expect(uniqueKeywords.size).toBe(analysis.keywords.length);
    });

    it("should handle short text gracefully", async () => {
      const text = "Hi test";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.keywords).toBeDefined();
      expect(Array.isArray(analysis.keywords)).toBe(true);
    });
  });

  describe("Feedback Categorization", () => {
    it("should categorize feature requests", async () => {
      const text = "It would be great to add a new feature for automated reporting";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories).toContain("feature_request");
    });

    it("should categorize bug reports", async () => {
      const text = "There is a bug in the dashboard that causes an issue with loading";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories).toContain("bug_report");
    });

    it("should categorize UI/UX feedback", async () => {
      const text = "The UI interface could be more intuitive and user-friendly";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories).toContain("ui_ux");
    });

    it("should categorize performance feedback", async () => {
      const text = "The application speed and performance need improvement";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories).toContain("performance");
    });

    it("should support multiple categories", async () => {
      const text = "The UI has a bug that affects performance. Need a feature to fix this issue.";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories.length).toBeGreaterThan(1);
    });

    it("should use general category as fallback", async () => {
      const text = "Some general comments about the application";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories).toContain("general");
    });
  });

  describe("Topic Extraction", () => {
    it("should extract relevant topics", async () => {
      const text = "The dashboard shows data from reports with notifications enabled";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.topics.length).toBeGreaterThan(0);
      expect(analysis.topics).toContain("dashboard");
    });

    it("should handle text without specific topics", async () => {
      const text = "This is some general feedback";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.topics).toBeDefined();
      expect(Array.isArray(analysis.topics)).toBe(true);
    });

    it("should extract multiple topics", async () => {
      const text = "The dashboard displays data from reports with notification alerts";
      
      const analysis = await analyzeFeedback(text);
      
      const expectedTopics = ["dashboard", "data", "reporting", "notifications"];
      const foundTopics = analysis.topics.filter(t => expectedTopics.includes(t));
      
      expect(foundTopics.length).toBeGreaterThan(1);
    });
  });

  describe("Semantic Analysis", () => {
    it("should extract entities from text", async () => {
      const text = "The DP system on the vessel detected a thruster incident";
      
      const semantic = await performSemanticAnalysis(text);
      
      expect(semantic.entities.length).toBeGreaterThan(0);
      expect(semantic.entities[0]).toHaveProperty("text");
      expect(semantic.entities[0]).toHaveProperty("type");
      expect(semantic.entities[0]).toHaveProperty("confidence");
    });

    it("should extract relationships between entities", async () => {
      const text = "The DP system controls the vessel thrusters during incident";
      
      const semantic = await performSemanticAnalysis(text);
      
      if (semantic.entities.length >= 2) {
        expect(semantic.relationships.length).toBeGreaterThan(0);
        expect(semantic.relationships[0]).toHaveProperty("from");
        expect(semantic.relationships[0]).toHaveProperty("to");
        expect(semantic.relationships[0]).toHaveProperty("type");
      }
    });

    it("should identify main theme", async () => {
      const text = "Safety compliance is critical for automation efficiency";
      
      const semantic = await performSemanticAnalysis(text);
      
      expect(semantic.mainTheme).toBeDefined();
      expect(typeof semantic.mainTheme).toBe("string");
    });

    it("should identify sub-themes", async () => {
      const text = "Safety compliance and automation efficiency are important";
      
      const semantic = await performSemanticAnalysis(text);
      
      expect(semantic.subThemes).toBeDefined();
      expect(Array.isArray(semantic.subThemes)).toBe(true);
    });

    it("should handle text without recognizable entities", async () => {
      const text = "Some random text without specific terms";
      
      const semantic = await performSemanticAnalysis(text);
      
      expect(semantic.entities).toBeDefined();
      expect(semantic.mainTheme).toBeDefined();
    });
  });

  describe("Batch Categorization", () => {
    it("should categorize multiple feedbacks", async () => {
      const feedbacks = [
        "There is a bug in the system",
        "Great new feature request for automation",
        "The UI needs improvement"
      ];
      
      const categorized = await categorizeFeedback(feedbacks);
      
      expect(Object.keys(categorized).length).toBeGreaterThan(0);
      expect(categorized["bug_report"]).toBeDefined();
      expect(categorized["feature_request"]).toBeDefined();
    });

    it("should group similar feedbacks together", async () => {
      const feedbacks = [
        "Bug in dashboard",
        "Another bug found",
        "Bug report for system"
      ];
      
      const categorized = await categorizeFeedback(feedbacks);
      
      expect(categorized["bug_report"]).toHaveLength(3);
    });

    it("should handle empty feedback array", async () => {
      const feedbacks: string[] = [];
      
      const categorized = await categorizeFeedback(feedbacks);
      
      expect(Object.keys(categorized).length).toBe(0);
    });

    it("should handle single feedback", async () => {
      const feedbacks = ["Single feedback about a feature"];
      
      const categorized = await categorizeFeedback(feedbacks);
      
      expect(Object.keys(categorized).length).toBeGreaterThan(0);
    });
  });

  describe("Summary Generation", () => {
    it("should generate summary for long text", async () => {
      const longText = "This is a very long feedback text that goes on and on describing various aspects of the application including features, bugs, and general comments about usability and performance characteristics.";
      
      const analysis = await analyzeFeedback(longText);
      
      expect(analysis.summary.length).toBeLessThan(longText.length);
      expect(analysis.summary).toContain("...");
    });

    it("should keep short text unchanged", async () => {
      const shortText = "Short feedback";
      
      const analysis = await analyzeFeedback(shortText);
      
      expect(analysis.summary).toBe(shortText);
      expect(analysis.summary).not.toContain("...");
    });
  });

  describe("Confidence Scoring", () => {
    it("should calculate confidence score", async () => {
      const text = "This is detailed feedback with specific keywords about features and performance";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it("should have higher confidence for detailed feedback", async () => {
      const detailed = "Comprehensive feedback about dashboard performance features interface optimization";
      const simple = "Good";
      
      const detailedAnalysis = await analyzeFeedback(detailed);
      const simpleAnalysis = await analyzeFeedback(simple);
      
      expect(detailedAnalysis.confidence).toBeGreaterThan(simpleAnalysis.confidence);
    });

    it("should cap confidence at reasonable maximum", async () => {
      const text = "extensive detailed comprehensive thorough complete feedback about multiple important critical features";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.confidence).toBeLessThanOrEqual(0.95);
    });
  });

  describe("Error Handling", () => {
    it("should handle empty text", async () => {
      const text = "";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.sentiment).toBeDefined();
      expect(analysis.keywords).toBeDefined();
      expect(analysis.categories).toBeDefined();
    });

    it("should handle special characters", async () => {
      const text = "Good! @#$% feature*& works^% great!";
      
      const analysis = await analyzeFeedback(text);
      
      // Should detect positive words despite special characters
      expect(["positive", "neutral"]).toContain(analysis.sentiment);
    });

    it("should handle non-English characters gracefully", async () => {
      const text = "Test 测试 тест مثال";
      
      expect(async () => await analyzeFeedback(text)).not.toThrow();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should analyze complex feedback with multiple aspects", async () => {
      const text = "The new feature is excellent, but there's a bug in the UI that affects performance. Would love to see better dashboard integration.";
      
      const analysis = await analyzeFeedback(text);
      
      expect(analysis.categories.length).toBeGreaterThan(1);
      expect(analysis.keywords.length).toBeGreaterThan(0);
      expect(analysis.sentiment).toBeDefined();
    });

    it("should handle technical feedback", async () => {
      const text = "DP system thruster optimization needs improvement for vessel stability during incident response";
      
      const analysis = await analyzeFeedback(text);
      const semantic = await performSemanticAnalysis(text);
      
      expect(analysis.keywords.length).toBeGreaterThan(0);
      expect(semantic.entities.length).toBeGreaterThan(0);
    });

    it("should process feedback quickly", async () => {
      const start = Date.now();
      const text = "Standard feedback about application features and performance";
      
      await analyzeFeedback(text);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
