import fs from "fs";

/**
 * Lê logs de CI/CD e identifica falhas conhecidas
 */
export async function analyzeLogs() {
  const findings = [];
  const paths = ["ci-build.log", "coverage/lcov.info", "dist/audit-report.pdf"];

  for (const path of paths) {
    if (!fs.existsSync(path)) continue;
    const log = fs.readFileSync(path, "utf-8");

    if (log.includes("ENOENT")) findings.push("❌ Arquivo ausente ou caminho inválido detectado.");
    if (log.includes("ReferenceError")) findings.push("❌ Referência indefinida detectada.");
    if (log.includes("contrast ratio")) findings.push("⚠️ Problema de contraste de acessibilidade.");
    if (log.includes("coverage <") || log.includes("0%")) findings.push("📉 Cobertura abaixo do mínimo aceitável.");
    if (log.includes("failed")) findings.push("⚙️ Falha geral de build/teste detectada.");
  }

  if (findings.length === 0) {
    findings.push("✅ Nenhum problema crítico identificado nos logs recentes.");
  }

  const output = { timestamp: new Date().toISOString(), findings };
  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync("dist/analysis.json", JSON.stringify(output, null, 2));

  return findings;
}
