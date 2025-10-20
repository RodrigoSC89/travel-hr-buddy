import { analyzeLogs } from "./analyzer.js";
import { suggestFix } from "./suggestFix.js";
import { createAutoPR } from "./createPR.js";
import { MemoryEngine } from "./memory/memoryEngine.js";

async function main() {
  console.log("🧠 Nautilus Intelligence Core iniciando análise...");

  const findings = await analyzeLogs();

  if (findings.some(f => f.includes("❌") || f.includes("⚠️"))) {
    console.log("⚙️ Problemas detectados, solicitando análise LLM...");
    const { title, body } = await suggestFix(findings);
    await createAutoPR(title, body);

    // 🧠 Registrar aprendizado no Nautilus Memory Engine
    const memory = new MemoryEngine();
    memory.store(findings, title);

    const patterns = memory.getRecurrentPatterns();
    if (patterns.length > 0) {
      console.log("📊 Padrões recorrentes detectados:");
      for (const p of patterns) {
        console.log(`   🔁 ${p.pattern} → ${p.occurrences} ocorrências`);
      }
    } else {
      console.log("🧩 Nenhum padrão recorrente encontrado até o momento.");
    }
  } else {
    console.log("✅ Nenhuma anomalia crítica detectada, encerrando execução.");
  }
}

main().catch(console.error);
