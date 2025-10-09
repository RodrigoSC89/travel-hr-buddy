/**
 * API Services Index
 * Central export for all API service test functions
 */

export { testMapbox, testMapboxConnection, getMapboxStatus } from './mapbox';
export { testOpenAI, testOpenAIConnection, getOpenAIStatus } from './openai';
export { testAmadeus, getAmadeusStatus } from './amadeus';
export { testOpenWeather, getOpenWeatherStatus } from './openweather';
export { testElevenLabs, getElevenLabsStatus } from './elevenlabs';
export { testWindy, testWindyConnection, getWindyStatus } from './windy';
export { testSkyscanner, testSkyscannerConnection, getSkyscannerStatus } from './skyscanner';
export { testStripe, getStripeStatus } from './stripe';
export { testSupabase, getSupabaseStatus } from './supabase';

export type { MapboxTestResponse, MapboxTestResult } from './mapbox';
export type { OpenAITestResponse, OpenAITestResult } from './openai';
export type { AmadeusTestResponse } from './amadeus';
export type { OpenWeatherTestResponse } from './openweather';
export type { ElevenLabsTestResponse } from './elevenlabs';
export type { WindyTestResponse, WindyTestResult } from './windy';
export type { SkyscannerTestResponse, SkyscannerTestResult } from './skyscanner';
export type { StripeTestResponse } from './stripe';
export type { SupabaseTestResponse } from './supabase';
