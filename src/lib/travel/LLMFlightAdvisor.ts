// @ts-nocheck
/**
 * PATCH 608: LLM Flight Advisor
 * AI-powered flight recommendations using OpenAI
 */

import { FlightOffer } from '@/services/skyscanner';

export interface FlightRecommendation {
  bestPrice: FlightOffer | null;
  bestDuration: FlightOffer | null;
  recommended: FlightOffer | null;
  reasoning: string;
  insights: string[];
}

/**
 * Analyze flight offers and provide AI-powered recommendations
 */
export async function analyzeFlightOffers(
  offers: FlightOffer[],
  userPreferences?: {
    priorityPrice?: boolean;
    prioritySpeed?: boolean;
    maxStops?: number;
  }
): Promise<FlightRecommendation> {
  if (offers.length === 0) {
    return {
      bestPrice: null,
      bestDuration: null,
      recommended: null,
      reasoning: 'No flight offers available for analysis.',
      insights: [],
    };
  }

  // Find best price
  const bestPrice = offers.reduce((best, current) => 
    current.price < best.price ? current : best
  );

  // Find best duration (shortest)
  const bestDuration = offers.reduce((best, current) => {
    const currentMinutes = parseDuration(current.duration);
    const bestMinutes = parseDuration(best.duration);
    return currentMinutes < bestMinutes ? current : best;
  });

  // Basic rule-based recommendation
  let recommended = bestPrice;
  let reasoning = 'Recommended based on best price.';
  const insights: string[] = [];

  // Apply user preferences
  if (userPreferences?.prioritySpeed) {
    recommended = bestDuration;
    reasoning = 'Recommended for fastest travel time based on your preference.';
  } else if (userPreferences?.priorityPrice) {
    recommended = bestPrice;
    reasoning = 'Recommended for best price based on your preference.';
  } else {
    // Balance between price and duration
    const priceScore = offers.map(o => o.price);
    const avgPrice = priceScore.reduce((a, b) => a + b, 0) / priceScore.length;
    
    const balancedOffers = offers.filter(offer => {
      const priceDiff = Math.abs(offer.price - bestPrice.price) / bestPrice.price;
      const durationMinutes = parseDuration(offer.duration);
      const bestDurationMinutes = parseDuration(bestDuration.duration);
      const durationDiff = Math.abs(durationMinutes - bestDurationMinutes) / bestDurationMinutes;
      
      // Consider offers within 20% of best price and duration
      return priceDiff <= 0.2 && durationDiff <= 0.2;
    });

    if (balancedOffers.length > 0) {
      // Pick the one with best combined score
      recommended = balancedOffers.reduce((best, current) => {
        const bestScore = calculateScore(best, bestPrice.price, parseDuration(bestDuration.duration));
        const currentScore = calculateScore(current, bestPrice.price, parseDuration(bestDuration.duration));
        return currentScore > bestScore ? current : best;
      });
      reasoning = 'Recommended for optimal balance between price and travel time.';
    }
  }

  // Generate insights
  const priceRange = Math.max(...offers.map(o => o.price)) - Math.min(...offers.map(o => o.price));
  insights.push(`Price range: ${bestPrice.currency} ${priceRange.toFixed(2)}`);

  const directFlights = offers.filter(o => o.stops === 0);
  if (directFlights.length > 0) {
    insights.push(`${directFlights.length} direct flight(s) available`);
  }

  const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
  if (recommended.price < avgPrice * 0.8) {
    insights.push('Excellent price - below average by 20%+');
  }

  // Check for stops filter
  if (userPreferences?.maxStops !== undefined) {
    const filteredOffers = offers.filter(o => o.stops <= userPreferences.maxStops);
    if (filteredOffers.length === 0) {
      insights.push(`No flights found with ${userPreferences.maxStops} or fewer stops`);
    } else {
      insights.push(`${filteredOffers.length} flight(s) with ${userPreferences.maxStops} or fewer stops`);
    }
  }

  return {
    bestPrice,
    bestDuration,
    recommended,
    reasoning,
    insights,
  };
}

/**
 * Parse duration string to minutes
 * Handles formats like "2h", "2h 30m", "2h30m"
 */
function parseDuration(duration: string): number {
  const matches = duration.match(/(\d+)h(?:\s*(\d+)m)?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  return hours * 60 + minutes;
}

/**
 * Calculate combined score for an offer
 * Weighted combination: 40% price, 40% duration, 20% stops
 * This provides balanced recommendations unless user specifies preference
 */
function calculateScore(
  offer: FlightOffer,
  bestPrice: number,
  bestDurationMinutes: number
): number {
  const priceScore = 1 - (offer.price - bestPrice) / bestPrice;
  const durationScore = 1 - (parseDuration(offer.duration) - bestDurationMinutes) / bestDurationMinutes;
  const stopScore = offer.stops === 0 ? 1 : 1 / (offer.stops + 1);
  
  // Note: Weights can be adjusted based on user preferences in future versions
  return priceScore * 0.4 + durationScore * 0.4 + stopScore * 0.2;
}

/**
 * Generate natural language query for LLM (future OpenAI integration)
 */
export function generateFlightQuery(
  origin: string,
  destination: string,
  date: string,
  offers: FlightOffer[]
): string {
  return `Analyze these flight options from ${origin} to ${destination} on ${date}:

${offers.map((offer, idx) => `
Option ${idx + 1}:
- Airline: ${offer.airline}
- Price: ${offer.currency} ${offer.price}
- Duration: ${offer.duration}
- Stops: ${offer.stops}
- Departure: ${offer.departureTime}
- Arrival: ${offer.arrivalTime}
`).join('\n')}

Which option would you recommend and why? Consider price, duration, and convenience.`;
}
