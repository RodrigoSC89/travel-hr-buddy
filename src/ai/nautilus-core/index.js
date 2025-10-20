import { analyzeLogs } from "./analyzer.js";
import { suggestFix } from "./suggestFix.js";
import { createAutoPR } from "./createPR.js";

async function main() {
  console.log("🧠 Nautilus Intelligence Core iniciando análise...");

  const findings = await analyzeLogs();

  if (findings.some(f => f.includes("❌") || f.includes("⚠️"))) {
    console.log("⚙️ Problemas detectados, solicitando análise LLM...");
    const { title, body } = await suggestFix(findings);
    await createAutoPR(title, body);
  } else {
    console.log("✅ Nenhuma anomalia crítica detectada, encerrando execução.");
  }
}

main().catch(err => console.error("Erro no Intelligence Core:", err));
