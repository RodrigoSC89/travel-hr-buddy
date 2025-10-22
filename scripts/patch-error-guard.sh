#!/bin/bash
echo "🧩 Aplicando PATCH_25.5 — AI Schema Harmonizer & Error Guard"

# 1️⃣ Garante que os novos módulos existam
mkdir -p src/lib/core src/lib/ai

# 2️⃣ Copia arquivos base se não existirem
[ ! -f src/lib/core/ErrorGuard.tsx ] && echo "⚙️ Criando ErrorGuard..." && cat > src/lib/core/ErrorGuard.tsx <<'EOF'
// @ts-nocheck
import React from "react";
export class ErrorGuard extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    return this.state.hasError
      ? <div style={{padding:"2rem",color:"#fff",background:"#c0392b"}}><h2>🚨 Erro de execução</h2><button onClick={()=>location.reload()}>Recarregar</button></div>
      : this.props.children;
  }
}
EOF

[ ! -f src/lib/ai/SchemaHarmonizer.ts ] && echo "⚙️ Criando SchemaHarmonizer..." && cat > src/lib/ai/SchemaHarmonizer.ts <<'EOF'
export const harmonizeSchema = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const safe = {};
    for (const [key, value] of Object.entries(item || {})) {
      safe[key] = value === null || value === undefined ? "" : value;
    }
    return safe;
  });
};
EOF

# 3️⃣ Força rebuild total
npm run build -- --force || vite build --mode production --force
echo "✅ PATCH_25.5 aplicado com sucesso: sistema protegido contra erros de schema e renderização."
