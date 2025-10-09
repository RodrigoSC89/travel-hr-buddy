// ✅ Mini Script — Generate README.md Template for All Modules
// Run this script with Node.js to create a README.md template in each module folder
//
// 📦 Usage:
//   node scripts/Generate-readmes.cjs
//
// This script does the following:
// 🗂️ Creates a README.md file with template in each module folder
// 📄 Uses the same standardized format for easy reading and maintenance
// 🧠 Automatically capitalizes module names in titles
// ✅ Ensures that even unstarted modules have a documented base

const fs = require("fs");
const path = require("path");

const modules = [
  "dashboard", "sistema-maritimo", "ia-inovacao", "portal-funcionario", "viagens",
  "alertas-precos", "hub-integracoes", "reservas", "comunicacao", "configuracoes",
  "otimizacao", "assistente-voz", "centro-notificacoes", "monitor-sistema", "documentos",
  "colaboracao", "otimizacao-mobile", "checklists-inteligentes", "peotram", "peo-dp",
  "sgso", "templates", "analytics-avancado", "analytics-tempo-real", "monitor-avancado",
  "documentos-ia", "assistente-ia", "business-intelligence", "smart-workflow",
  "centro-ajuda", "automacao-ia", "visao-geral"
];

const baseDir = path.join(__dirname, "../src/modules");

const template = moduleName => `# 📘 ${moduleName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}

## 🔍 Purpose
Describe the purpose of this module here.

## 📁 Folder Structure
\`\`\`
src/modules/${moduleName}/
├── components/
├── pages/
├── hooks/
└── services/
\`\`\`

## 🧩 Key Components
- \`ComponentName.tsx\` – Description

## 🔗 Integrations
- (List external services if any)

## ✅ Status
- [ ] Not started  
- [ ] In progress  
- [x] Functional  
- [ ] Requires testing  
- [ ] Needs refactor

## 🚧 TODOs
- (List next steps or improvements)
`;

modules.forEach(mod => {
  const modulePath = path.join(baseDir, mod);
  const readmePath = path.join(modulePath, "README.md");

  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
  }

  fs.writeFileSync(readmePath, template(mod), "utf-8");
});

console.log("✅ README.md templates generated for all modules.");
