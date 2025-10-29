/**
 * PATCH 531 - Natural Language Command Parser
 * Parses voice/text commands into actionable instructions
 */

import { logger } from "@/lib/logger";
import type { Coordinates } from "../index";

export interface ParsedCommand {
  action: 'navigate' | 'reroute' | 'find_port' | 'weather' | 'avoid_area' | 'optimize_route' | 'unknown';
  parameters: {
    destination?: Coordinates | string;
    reason?: string;
    location?: Coordinates | string;
    radius?: number;
    criteria?: string;
  };
  confidence: number;
  originalText: string;
  timestamp: number;
}

class NaturalLanguageParser {
  private commandPatterns = {
    navigate: [
      /navegar\s+para\s+(.+)/i,
      /ir\s+para\s+(.+)/i,
      /seguir\s+para\s+(.+)/i,
      /dirigir\s+para\s+(.+)/i,
    ],
    reroute: [
      /redirecionar\s+para\s+(.+)/i,
      /mudar\s+rota\s+para\s+(.+)/i,
      /nova\s+rota\s+para\s+(.+)/i,
      /recalcular\s+rota\s+para\s+(.+)/i,
    ],
    find_port: [
      /porto\s+mais\s+pr[oó]ximo/i,
      /encontrar\s+porto/i,
      /buscar\s+porto/i,
      /procurar\s+porto/i,
      /porto\s+seguro/i,
    ],
    weather: [
      /clima\s+em\s+(.+)/i,
      /tempo\s+em\s+(.+)/i,
      /previs[ãa]o\s+para\s+(.+)/i,
      /condi[çc][õo]es\s+clim[áa]ticas/i,
    ],
    avoid_area: [
      /evitar\s+(.+)/i,
      /desviar\s+de\s+(.+)/i,
      /n[ãa]o\s+passar\s+por\s+(.+)/i,
    ],
    optimize_route: [
      /otimizar\s+rota/i,
      /melhor\s+rota/i,
      /rota\s+mais\s+r[áa]pida/i,
      /rota\s+mais\s+curta/i,
      /economizar\s+combust[íi]vel/i,
    ],
  };

  private portDatabase: Record<string, Coordinates> = {
    'santos': { lat: -23.9614, lng: -46.3336 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'paranaguá': { lat: -25.5163, lng: -48.5108 },
    'salvador': { lat: -12.9714, lng: -38.5014 },
    'vitória': { lat: -20.3155, lng: -40.2849 },
    'são paulo': { lat: -23.5505, lng: -46.6333 },
  };

  public parseCommand(text: string): ParsedCommand {
    const lowerText = text.toLowerCase().trim();
    logger.info("Parsing command", { text: lowerText });

    // Try to match against all command patterns
    for (const [action, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns) {
        const match = lowerText.match(pattern);
        if (match) {
          return this.buildCommand(action as ParsedCommand['action'], match, lowerText);
        }
      }
    }

    // No pattern matched
    return {
      action: 'unknown',
      parameters: {},
      confidence: 0,
      originalText: text,
      timestamp: Date.now(),
    };
  }

  private buildCommand(
    action: ParsedCommand['action'],
    match: RegExpMatchArray,
    originalText: string
  ): ParsedCommand {
    const command: ParsedCommand = {
      action,
      parameters: {},
      confidence: 0.85,
      originalText,
      timestamp: Date.now(),
    };

    switch (action) {
      case 'navigate':
      case 'reroute':
        if (match[1]) {
          const destination = this.resolveLocation(match[1]);
          command.parameters.destination = destination;
          command.confidence = destination ? 0.9 : 0.6;
        }
        break;

      case 'find_port':
        command.parameters.location = 'nearest';
        command.confidence = 0.95;
        break;

      case 'weather':
        if (match[1]) {
          const location = this.resolveLocation(match[1]);
          command.parameters.location = location || match[1];
          command.confidence = location ? 0.9 : 0.7;
        } else {
          command.parameters.location = 'current';
          command.confidence = 0.9;
        }
        break;

      case 'avoid_area':
        if (match[1]) {
          command.parameters.location = match[1];
          command.parameters.radius = 50; // nautical miles
          command.confidence = 0.85;
        }
        break;

      case 'optimize_route':
        // Check for specific optimization criteria in the text
        if (originalText.includes('rápida')) {
          command.parameters.criteria = 'fastest';
        } else if (originalText.includes('curta')) {
          command.parameters.criteria = 'shortest';
        } else if (originalText.includes('combustível') || originalText.includes('economia')) {
          command.parameters.criteria = 'fuel_efficient';
        } else {
          command.parameters.criteria = 'balanced';
        }
        command.confidence = 0.9;
        break;
    }

    logger.info("Command parsed", command);
    return command;
  }

  private resolveLocation(locationName: string): Coordinates | null {
    const normalized = locationName.toLowerCase().trim();
    
    // Check if it's in our port database
    if (this.portDatabase[normalized]) {
      return this.portDatabase[normalized];
    }

    // Check for partial matches
    for (const [port, coords] of Object.entries(this.portDatabase)) {
      if (port.includes(normalized) || normalized.includes(port)) {
        return coords;
      }
    }

    return null;
  }

  public addLocation(name: string, coordinates: Coordinates): void {
    this.portDatabase[name.toLowerCase()] = coordinates;
    logger.info("Location added to database", { name, coordinates });
  }

  public getKnownLocations(): string[] {
    return Object.keys(this.portDatabase);
  }
}

export const naturalLanguageParser = new NaturalLanguageParser();
