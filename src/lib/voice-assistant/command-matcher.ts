/**
 * Voice Command Matcher
 * Extracted matching logic for command recognition
 */

import { VoiceCommandConfig } from "./types";
import { uniqueModuleIdentifiers } from "./command-registry";

export interface MatchResult {
  matched: boolean;
  score: number;
  command: string | null;
}

/**
 * Normalize transcript for matching
 */
export function normalizeTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents
}

/**
 * Calculate match score for a command
 */
export function calculateMatchScore(
  transcript: string,
  config: VoiceCommandConfig
): number {
  const allKeywords = [
    ...config.keywords,
    ...(config.alternativeKeywords || []),
  ];

  return allKeywords.filter((keyword) =>
    transcript.includes(keyword.toLowerCase())
  ).length;
}

/**
 * Check if command requires unique identifier
 */
export function requiresUniqueIdentifier(config: VoiceCommandConfig): boolean {
  return uniqueModuleIdentifiers.some((id) => config.keywords.includes(id));
}

/**
 * Check if transcript has unique identifier for command
 */
export function hasUniqueIdentifier(
  transcript: string,
  config: VoiceCommandConfig
): boolean {
  return uniqueModuleIdentifiers.some(
    (id) => config.keywords.includes(id) && transcript.includes(id)
  );
}

/**
 * Match transcript against a command configuration
 * Returns true if the transcript matches the command
 */
export function matchesCommand(
  transcript: string,
  config: VoiceCommandConfig,
  minMatchScore: number = 2
): boolean {
  const normalizedTranscript = normalizeTranscript(transcript);
  const matchScore = calculateMatchScore(normalizedTranscript, config);

  // Must match at least minimum keywords
  const hasMinimumMatch = matchScore >= minMatchScore;

  // For specific module commands, check for unique identifier
  const needsUniqueId = requiresUniqueIdentifier(config);
  const hasUniqueId = hasUniqueIdentifier(normalizedTranscript, config);

  return hasMinimumMatch && (!needsUniqueId || hasUniqueId);
}

/**
 * Find best matching command from a list
 */
export function findBestMatch(
  transcript: string,
  commands: VoiceCommandConfig[]
): VoiceCommandConfig | null {
  const normalizedTranscript = normalizeTranscript(transcript);
  let bestMatch: VoiceCommandConfig | null = null;
  let bestScore = 0;

  for (const config of commands) {
    if (matchesCommand(normalizedTranscript, config)) {
      const score = calculateMatchScore(normalizedTranscript, config);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = config;
      }
    }
  }

  return bestMatch;
}
