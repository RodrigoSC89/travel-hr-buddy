# Nautilus Preview Validation Script

## Overview

Script para validação completa do Nautilus One em ambiente Lovable + Vercel + Playwright.

## Localização

```
scripts/validate-nautilus-preview.sh
```

## Como usar

### 1. Tornar o script executável (se necessário)

```bash
chmod +x scripts/validate-nautilus-preview.sh
```

### 2. Executar o script

```bash
./scripts/validate-nautilus-preview.sh
```

## O que o script faz

### 1️⃣ Verificação de Branch
Confirma o PR e branch atual via `git branch`

### 2️⃣ Instalação de Dependências
Atualiza dependências usando `npm ci` (mais rápido e determinístico) ou `npm install` como fallback

### 3️⃣ Limpeza de Cache
Remove caches antigos:
- `node_modules/.vite`
- `dist`
- `.vercel_cache`

### 4️⃣ Build do Projeto
Compila o projeto com logs detalhados usando `npm run build --verbose`
- Inclui suporte para Vite + PWA
- Para com erro se o build falhar

### 5️⃣ Preview Server
Inicia servidor local do Vite na porta 5173 (porta padrão)
- Aguarda 15 segundos para garantir inicialização completa

### 6️⃣ Instalação do Playwright
Instala o Playwright e todas as suas dependências de sistema

### 7️⃣ Criação de Testes
Cria arquivo `tests/preview.spec.ts` com testes para as rotas:
- `/` (home)
- `/dashboard`
- `/dp-intelligence`
- `/bridgelink`
- `/forecast-global`
- `/control-hub`
- `/fmea-expert`
- `/peo-dp`
- `/documentos-ia`
- `/assistente-ia`
- `/analytics-avancado`

### 8️⃣ Execução dos Testes
Executa testes do Playwright validando que cada rota renderiza corretamente
- Usa seletores robustos: `main, header, h1`
- Timeout de 10 segundos por teste
- Para e encerra servidor se algum teste falhar

### 9️⃣ Encerramento do Servidor
Encerra o servidor local de preview de forma limpa

### 🔟 Simulação do Vercel (Opcional)
Se a CLI do Vercel estiver instalada:
- Simula build e deploy do Vercel localmente
- Se não estiver instalada, apenas exibe aviso e continua

### 11️⃣ Relatório Final
Exibe mensagem de sucesso quando todos os testes passam

## Melhorias Implementadas

| Tipo de ajuste | O que foi feito |
|----------------|-----------------|
| ✅ Porta ajustada | Alterado para 5173 (porta padrão do Vite) |
| ✅ Espera reforçada | sleep 15 para garantir o servidor ativo |
| ✅ Teste robusto | Usa locator('main, header, h1') em vez de título |
| ✅ Playwright integrado | Instala dependências antes dos testes |
| ✅ Fallback seguro | Pula simulação do Vercel se CLI não existir |
| ✅ Encerramento limpo | Mata o servidor mesmo em falha de teste |

## Requisitos

- Node.js 22.x
- npm >= 8.0.0
- Git
- Opcional: Vercel CLI para simulação de deploy

## Saída Esperada

O script fornece logs detalhados com emojis para facilitar o acompanhamento:
- 📦 Verificação de branch
- 🔄 Instalação de dependências
- 🧹 Limpeza de cache
- ⚙️ Build
- 🌐 Início do servidor
- ⏳ Aguardando servidor
- 🔍 Instalação do Playwright
- 🧭 Execução de testes
- 🧹 Encerramento
- 🚀 Simulação Vercel (se disponível)
- ✅ Sucesso final

## Tratamento de Erros

- Se o build falhar: para imediatamente com mensagem de erro
- Se os testes falharem: encerra o servidor e para com erro
- Se o Vercel build falhar: para com erro (apenas se CLI estiver instalada)

## Integração com CI/CD

Este script é ideal para:
- Pipeline de QA do Vercel
- GitHub Actions
- Validação de PRs
- Testes de integração contínua

## Comparação com Script Anterior

### Antes (validate-lovable-preview.sh)
- Usava `npm install` (mais lento)
- Porta 8080 (não padrão do Vite)
- Aguardava apenas 10 segundos
- Não incluía rota raiz `/`
- Usava teste de título (menos robusto)
- Sempre tentava executar Vercel build

### Depois (validate-nautilus-preview.sh)
- Usa `npm ci || npm install` (mais rápido e determinístico)
- Porta 5173 (padrão do Vite)
- Aguarda 15 segundos
- Inclui rota raiz `/`
- Usa seletores robustos `main, header, h1`
- Vercel build é opcional com fallback

## Troubleshooting

### Erro: "vite: not found"
- Execute `npm ci` ou `npm install` antes do script

### Testes falhando por timeout
- Aumente o `sleep 15` para `sleep 20` ou mais
- Verifique se a porta 5173 está livre

### Playwright não instalado
- O script instala automaticamente
- Em caso de erro, execute manualmente: `npx playwright install --with-deps`
