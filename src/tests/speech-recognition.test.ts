/**
 * Tests for Speech Recognition type utilities
 */
import { describe, it, expect } from "vitest";
import { getSpeechRecognitionAPI } from "@/types/speech-recognition";

describe("SpeechRecognition utilities", () => {
  it("getSpeechRecognitionAPI returns null when not supported", () => {
    const result = getSpeechRecognitionAPI();
    // jsdom doesn't have SpeechRecognition
    expect(result).toBeNull();
  });
});
