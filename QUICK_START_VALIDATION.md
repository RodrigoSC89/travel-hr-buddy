# Quick Start: Nautilus Preview Validation

## 🚀 Executar o Script de Validação

### Opção 1: Execução Direta
```bash
./scripts/validate-nautilus-preview.sh
```

### Opção 2: Via Bash
```bash
bash scripts/validate-nautilus-preview.sh
```

### Opção 3: Tornar Executável Primeiro
```bash
chmod +x scripts/validate-nautilus-preview.sh
./scripts/validate-nautilus-preview.sh
```

## 📋 Pré-requisitos

- Node.js 22.x instalado
- npm >= 8.0.0
- Git configurado
- Espaço em disco para build (~500 MB)

## ⏱️ Tempo Estimado

- **Build completo**: ~2-5 minutos
- **Testes Playwright**: ~1-2 minutos
- **Total**: ~3-7 minutos

## 📊 O Que Esperar

### Saída Normal (Sucesso)
```
⚙️ Iniciando Validação Completa do Nautilus One (Lovable Preview + Build + Routes)
-------------------------------------------------------------
📦 Verificando branch...
* copilot/run-validation-script

🔄 Atualizando dependências...
added 1523 packages in 45s

🧹 Limpando cache anterior...

⚙️ Rodando build de teste (Vite + PWA)...
vite v5.4.19 building for production...
✓ 2847 modules transformed.
dist/index.html                   2.08 kB │ gzip:  1.23 kB
dist/assets/index-AbC123dE.css   45.67 kB │ gzip: 12.34 kB
dist/assets/index-XyZ789qW.js   234.56 kB │ gzip: 78.90 kB
✓ built in 23.45s

🌐 Iniciando preview local (porta 5173)...

⏳ Aguardando inicialização do servidor...

🔍 Instalando Playwright...
Playwright 1.56.1 installed successfully

🧭 Executando testes de rotas com Playwright...

Running 11 tests using 4 workers
  11 passed (15.2s)

🧹 Encerrando servidor local...

⚠️ CLI do Vercel não instalada — pulando simulação local

✅ Validação completa do Lovable Preview concluída com sucesso!
Todos os módulos renderizados e rotas confirmadas.
```

### Saída de Erro (Build Falhou)
```
⚙️ Rodando build de teste (Vite + PWA)...
Error: Cannot find module '@/components/missing-component'
❌ Falha no build - verificar vite.config.ts ou paths
```

### Saída de Erro (Teste Falhou)
```
🧭 Executando testes de rotas com Playwright...
  ✓ Rota / deve renderizar corretamente (1234ms)
  ✓ Rota /dashboard deve renderizar corretamente (567ms)
  ✗ Rota /dp-intelligence deve renderizar corretamente (timeout)
❌ Alguns módulos não renderizaram no preview
```

## �� Troubleshooting Rápido

### Erro: "npm ci failed"
```bash
# Limpe node_modules e tente novamente
rm -rf node_modules package-lock.json
npm install
./scripts/validate-nautilus-preview.sh
```

### Erro: "Port 5173 already in use"
```bash
# Mate processos na porta 5173
npx kill-port 5173
# Ou encontre e mate manualmente
lsof -ti:5173 | xargs kill -9
```

### Erro: "Playwright timeout"
```bash
# Aumente o tempo de espera no script
# Edite: sleep 15 → sleep 20
sed -i 's/sleep 15/sleep 20/' scripts/validate-nautilus-preview.sh
```

### Erro: "Module not found"
```bash
# Reinstale dependências
npm ci
```

## 🔍 Verificar Resultados

### Arquivos Criados Durante Execução
```bash
# Arquivo de teste gerado
ls -lh tests/preview.spec.ts

# Build gerado
ls -lh dist/

# Relatórios do Playwright (se houver falhas)
ls -lh playwright-report/
```

### Ver Logs Detalhados
```bash
# Execute com verbose
bash -x scripts/validate-nautilus-preview.sh 2>&1 | tee validation.log
```

## 📈 Integração CI/CD

### GitHub Actions
```yaml
- name: Run Nautilus Validation
  run: |
    chmod +x scripts/validate-nautilus-preview.sh
    ./scripts/validate-nautilus-preview.sh
```

### Vercel Build Command
```json
{
  "buildCommand": "npm run build && ./scripts/validate-nautilus-preview.sh"
}
```

## ✅ Checklist Pós-Execução

- [ ] Script executou sem erros?
- [ ] Todos os 11 testes passaram?
- [ ] Build gerado em `dist/`?
- [ ] Servidor foi encerrado corretamente?
- [ ] Nenhum processo orphão restante?

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique `scripts/README_VALIDATE_NAUTILUS_PREVIEW.md`
2. Verifique `IMPLEMENTATION_SUMMARY_VALIDATION_SCRIPT.md`
3. Abra uma issue no repositório

---

**Última atualização**: 2025-10-21  
**Versão do script**: 1.0.0  
