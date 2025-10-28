/**
 * PATCH 165.0 - Intent Parser
 * Detects user intent from voice/text input for offline AI assistance
 */

export interface Intent {
  type: "query" | "command" | "navigation" | "checklist" | "weather" | "status" | "unknown";
  confidence: number;
  entities: Record<string, any>;
  action?: string;
}

class IntentParser {
  private patterns = {
    // Mission/Status queries
    mission: [
      /what('?s| is) (the )?(current )?mission/i,
      /mission status/i,
      /show (me )?(the )?mission/i,
      /(what('?s| is) happening|update)/i
    ],
    
    // Route/Navigation queries
    route: [
      /where (are we|am i)/i,
      /current location/i,
      /(show|display) (the )?route/i,
      /(eta|arrival time|when will we arrive)/i,
      /navigate to/i,
      /direction/i
    ],
    
    // Weather queries
    weather: [
      /(what('?s| is) the )?(current )?weather/i,
      /weather (forecast|conditions?)/i,
      /is it (raining|stormy|windy)/i,
      /wind speed/i,
      /temperature/i
    ],
    
    // Checklist commands
    checklist: [
      /(show|display|open) checklist/i,
      /mark.*complete/i,
      /check.*off/i,
      /update checklist/i,
      /(complete|finish) (the )?checklist/i
    ],
    
    // Status queries
    status: [
      /system status/i,
      /how (is|are) (the )?(vessel|ship|boat)/i,
      /check.*status/i,
      /diagnostics/i
    ]
  };

  /**
   * Parse user input and extract intent
   */
  parse(input: string): Intent {
    const normalized = input.toLowerCase().trim();
    
    // Check for mission intent
    if (this.matchesPatterns(normalized, this.patterns.mission)) {
      return {
        type: "query",
        confidence: 0.9,
        entities: { subject: "mission" },
        action: "get_mission_status"
      };
    }
    
    // Check for route/navigation intent
    if (this.matchesPatterns(normalized, this.patterns.route)) {
      const hasNavigate = /navigate to (.+)/i.exec(input);
      if (hasNavigate) {
        return {
          type: "navigation",
          confidence: 0.95,
          entities: { destination: hasNavigate[1] },
          action: "navigate_to"
        };
      }
      
      return {
        type: "query",
        confidence: 0.85,
        entities: { subject: "route" },
        action: "get_route_info"
      };
    }
    
    // Check for weather intent
    if (this.matchesPatterns(normalized, this.patterns.weather)) {
      return {
        type: "query",
        confidence: 0.9,
        entities: { subject: "weather" },
        action: "get_weather"
      };
    }
    
    // Check for checklist intent
    if (this.matchesPatterns(normalized, this.patterns.checklist)) {
      const hasComplete = /complete|finish|mark.*complete/i.test(input);
      
      return {
        type: hasComplete ? "command" : "query",
        confidence: 0.85,
        entities: { subject: "checklist" },
        action: hasComplete ? "complete_checklist" : "show_checklist"
      };
    }
    
    // Check for status intent
    if (this.matchesPatterns(normalized, this.patterns.status)) {
      return {
        type: "query",
        confidence: 0.8,
        entities: { subject: "status" },
        action: "get_system_status"
      };
    }
    
    // Extract entities even if no pattern match
    const entities = this.extractEntities(input);
    
    return {
      type: "unknown",
      confidence: 0.3,
      entities,
      action: "general_query"
    };
  }

  /**
   * Check if input matches any pattern
   */
  private matchesPatterns(input: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(input));
  }

  /**
   * Extract entities from input
   */
  private extractEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract time references
    const timeMatch = /(\d+)\s*(hour|minute|day)s?/i.exec(input);
    if (timeMatch) {
      entities.timeValue = parseInt(timeMatch[1]);
      entities.timeUnit = timeMatch[2].toLowerCase();
    }
    
    // Extract numbers
    const numberMatch = /\b(\d+)\b/.exec(input);
    if (numberMatch) {
      entities.number = parseInt(numberMatch[1]);
    }
    
    // Extract location references
    if (/port|harbor|dock|shore/i.test(input)) {
      entities.locationType = "port";
    }
    
    // Extract severity/priority
    if (/critical|urgent|emergency/i.test(input)) {
      entities.priority = "high";
    } else if (/important|soon/i.test(input)) {
      entities.priority = "medium";
    }
    
    return entities;
  }

  /**
   * Get suggested actions based on intent
   */
  getSuggestedActions(intent: Intent): string[] {
    switch (intent.type) {
    case "query":
      if (intent.entities.subject === "mission") {
        return ["Show mission details", "View progress", "List tasks"];
      }
      if (intent.entities.subject === "route") {
        return ["Show map", "Get ETA", "View waypoints"];
      }
      if (intent.entities.subject === "weather") {
        return ["Current conditions", "Forecast", "Weather alerts"];
      }
      return ["View details", "Get more info"];
        
    case "command":
      return ["Execute command", "Confirm action", "Cancel"];
        
    case "navigation":
      return ["Calculate route", "Start navigation", "Set waypoint"];
        
    case "checklist":
      return ["Open checklist", "Mark complete", "Add note"];
        
    default:
      return ["Try again", "Help", "Cancel"];
    }
  }

  /**
   * Generate response template for intent
   */
  getResponseTemplate(intent: Intent): string {
    switch (intent.action) {
    case "get_mission_status":
      return "Current mission status: [MISSION_STATUS]. Progress: [PROGRESS]%. [NEXT_TASK]";
        
    case "get_route_info":
      return "Current location: [LOCATION]. Heading: [HEADING]. ETA: [ETA]. Distance remaining: [DISTANCE]nm.";
        
    case "get_weather":
      return "Current weather: [CONDITIONS]. Temperature: [TEMP]°C. Wind: [WIND_SPEED] knots from [WIND_DIR]. Visibility: [VISIBILITY]km.";
        
    case "show_checklist":
      return "Active checklists: [CHECKLIST_COUNT]. Completed: [COMPLETED]/[TOTAL]. [NEXT_ITEM]";
        
    case "get_system_status":
      return "All systems operational. [CRITICAL_ITEMS] critical items. Last update: [LAST_UPDATE].";
        
    default:
      return "I can help you with mission status, route information, weather updates, and checklists. What would you like to know?";
    }
  }
}

export const intentParser = new IntentParser();
