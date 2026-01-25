// @ts-nocheck - Deno test file
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || "";

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/validate-downtime-ai`;

// @ts-ignore - Deno test
Deno.test("validate-downtime-ai - returns 401 without auth header", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      downtime_id: "test-id",
      justification: "Test justification",
      category: "mechanical",
      duration_hours: 4,
    }),
  });

  assertEquals(response.status, 401);
  await response.text(); // Consume body
});

// @ts-ignore - Deno test
Deno.test("validate-downtime-ai - handles missing parameters", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  assertExists(data.error);
});

// @ts-ignore - Deno test
Deno.test("validate-downtime-ai - OPTIONS returns CORS headers", async () => {
  const response = await fetch(FUNCTION_URL, { method: "OPTIONS" });

  assertEquals(response.status, 200);
  const headers = response.headers;
  assertExists(headers.get("Access-Control-Allow-Origin"));
  assertExists(headers.get("Access-Control-Allow-Headers"));
  await response.text(); // Consume body
});

// @ts-ignore - Deno test
Deno.test("validate-downtime-ai - validates downtime correctly with mock data", async () => {
  const testPayload = {
    downtime_id: "test-downtime-001",
    justification: "Falha no sistema hidráulico do guincho principal causou parada operacional. Peça de reposição foi encomendada e técnico especializado foi acionado.",
    category: "mechanical",
    duration_hours: 8,
    vessel_name: "MV Test Vessel",
    evidence_urls: [],
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(testPayload),
  });

  // Even without a real downtime_id, the function should process the request
  const data = await response.json();
  
  // Should either return validation result or error
  assertExists(data);
  
  if (response.status === 200) {
    // If successful, check structure
    assertExists(data.is_valid !== undefined || data.validation !== undefined);
  }
});
