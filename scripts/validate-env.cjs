#!/usr/bin/env node

/**
 * Environment Validation Script
 * Pre-flight checks for required environment variables
 * Part of Nautilus One v3.5 - Security Hardening Module
 */

const requiredVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

const recommendedVars = [
  "VITE_OPENAI_API_KEY",
  "VITE_MQTT_URL",
  "JWT_SECRET",
];

const productionVars = [
  "VITE_MQTT_USER",
  "VITE_MQTT_PASS",
  "SENTRY_DSN",
];

console.log("🔍 Validando variáveis de ambiente...\n");

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log("📋 Variáveis Obrigatórias:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.error(`  ❌ ${varName}: NÃO DEFINIDA`);
    hasErrors = true;
  } else {
    console.log(`  ✅ ${varName}: OK`);
  }
});

// Check recommended variables
console.log("\n📋 Variáveis Recomendadas:");
recommendedVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.warn(`  ⚠️  ${varName}: NÃO DEFINIDA (funcionalidade reduzida)`);
    hasWarnings = true;
  } else {
    console.log(`  ✅ ${varName}: OK`);
  }
});

// Check production-specific variables
if (process.env.NODE_ENV === "production" || process.env.VITE_NODE_ENV === "production") {
  console.log("\n📋 Variáveis de Produção:");
  productionVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.warn(`  ⚠️  ${varName}: NÃO DEFINIDA (recomendado para produção)`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${varName}: OK`);
    }
  });

  // Security check: Ensure MQTT uses encryption in production
  const mqttUrl = process.env.VITE_MQTT_URL;
  if (mqttUrl && !mqttUrl.startsWith("wss://") && !mqttUrl.startsWith("mqtts://")) {
    console.error("\n  🔒 ERRO DE SEGURANÇA: MQTT não está usando conexão criptografada em produção!");
    console.error("     Use wss:// ou mqtts:// no VITE_MQTT_URL");
    hasErrors = true;
  }
}

// Summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.error("❌ Validação FALHOU - Corrija os erros acima antes de prosseguir");
  process.exit(1);
} else if (hasWarnings) {
  console.warn("⚠️  Validação com AVISOS - Algumas funcionalidades podem estar limitadas");
  process.exit(0);
} else {
  console.log("✅ Validação completa - Todas as variáveis configuradas corretamente");
  process.exit(0);
}
