// Script simples para verificar rotas do Nautilus One
// Pode ser executado em Node.js com fetch (node-fetch já está instalado)

import fetch from "node-fetch";

const baseURL = "https://seu-sistema.com"; // 🔁 Trocar pela URL do ambiente de staging ou produção

const routesToTest = [
  "/",
  "/auth",
  "/documents",
  "/checklists",
  "/ai-assistant",
  "/dashboard",
  "/logs",
  "/smart-workflow",
  "/templates",
  "/forecast",
  "/mmi",
  "/dp-intelligence-center",
  "/technical-audit-fmea",
  "/peo-dp"
];

(async () => {
  console.log("\n🔍 Verificando rotas do Nautilus One:\n");

  for (const route of routesToTest) {
    try {
      const res = await fetch(`${baseURL}${route}`);
      const status = res.status;
      const color = status === 200 ? "\x1b[32m" : "\x1b[33m";
      console.log(`${color}${route.padEnd(30)} => ${status}\x1b[0m`);
    } catch (err) {
      console.log(`\x1b[31m${route.padEnd(30)} => 404 NOT FOUND\x1b[0m`);
    }
  }
})();

