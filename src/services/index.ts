/**
 * API Services Index
 * Central export for all API service test functions
 */

export { testMapbox, getMapboxStatus } from './mapbox';
export { testOpenAI, getOpenAIStatus } from './openai';
export { testAmadeus, getAmadeusStatus } from './amadeus';
export { testOpenWeather, getOpenWeatherStatus } from './openweather';
export { testElevenLabs, getElevenLabsStatus } from './elevenlabs';
export { testWindy, getWindyStatus } from './windy';
export { testSkyscanner, getSkyscannerStatus } from './skyscanner';
export { testStripe, getStripeStatus } from './stripe';
export { testSupabase, getSupabaseStatus } from './supabase';

export type { MapboxTestResponse } from './mapbox';
export type { OpenAITestResponse } from './openai';
export type { AmadeusTestResponse } from './amadeus';
export type { OpenWeatherTestResponse } from './openweather';
export type { ElevenLabsTestResponse } from './elevenlabs';
export type { WindyTestResponse } from './windy';
export type { SkyscannerTestResponse } from './skyscanner';
export type { StripeTestResponse } from './stripe';
export type { SupabaseTestResponse } from './supabase';
