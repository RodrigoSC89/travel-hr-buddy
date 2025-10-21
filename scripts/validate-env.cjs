#!/usr/bin/env node
/**
 * Nautilus One - Environment Validation Script
 * Validates required environment variables and enforces secure configuration.
 */

const fs = require("fs");
const path = require("path");

const envFile = path.join(process.cwd(), ".env");
if (!fs.existsSync(envFile)) {
  console.error("❌ .env file not found. Please create one from .env.example");
  process.exit(1);
}

// Load environment variables from .env file
const envContent = fs.readFileSync(envFile, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    if (key) {
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  }
});

const required = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_OPENAI_API_KEY"
];

const recommended = [
  "VITE_MQTT_URL",
  "VITE_MQTT_BROKER_URL"
];

let missing = [];
let missingRecommended = [];

for (const key of required) {
  if (!envVars[key] || envVars[key] === "") {
    missing.push(key);
  }
}

for (const key of recommended) {
  if (!envVars[key] || envVars[key] === "") {
    missingRecommended.push(key);
  }
}

if (missing.length > 0) {
  console.error("⚠️ Missing required environment variables:");
  missing.forEach((m) => console.error(" - " + m));
  process.exit(1);
}

if (missingRecommended.length > 0) {
  console.warn("⚠️ Missing recommended environment variables:");
  missingRecommended.forEach((m) => console.warn(" - " + m));
}

console.log("✅ Environment validation passed. All required variables present.");

// Security checks
const mqttUrl = envVars.VITE_MQTT_URL || envVars.VITE_MQTT_BROKER_URL;
if (mqttUrl && mqttUrl.startsWith("ws://")) {
  console.warn("⚠️ Insecure MQTT protocol detected. Use 'wss://' for production.");
}

const nodeEnv = process.env.NODE_ENV || envVars.NODE_ENV || envVars.VITE_NODE_ENV;
if (nodeEnv === "production") {
  console.log("🔒 Running production security validation...");
  
  const jwtSecret = envVars.JWT_SECRET;
  if (!jwtSecret) {
    console.warn("⚠️ JWT_SECRET not set. This is recommended for production authentication.");
  }
  
  console.log("✅ Security configuration validated for production.");
}

console.log("\n📋 Environment Summary:");
console.log(`   Supabase URL: ${envVars.VITE_SUPABASE_URL ? '✓' : '✗'}`);
console.log(`   OpenAI API Key: ${envVars.VITE_OPENAI_API_KEY ? '✓' : '✗'}`);
console.log(`   MQTT Broker: ${mqttUrl ? '✓' : '✗'}`);
console.log(`   Environment: ${nodeEnv || 'development'}`);
