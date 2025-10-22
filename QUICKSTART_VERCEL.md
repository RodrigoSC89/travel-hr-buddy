# 🚀 Quick Start: Vercel Deployment

## ⚡ Para Desenvolvedores

### Comandos Rápidos

```bash
# Desenvolvimento local
npm install
npm run dev

# Build de produção
npm run build

# Sincronização Vercel (limpa cache + valida env + build)
npm run sync:vercel
```

## 🔐 Variáveis de Ambiente Obrigatórias (Vercel)

Configure no **Vercel Dashboard → Settings → Environment Variables**:

```bash
VITE_APP_URL=https://travel-hr-buddy.vercel.app
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLC...
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

⚠️ **IMPORTANTE**: Use valores em texto simples, NÃO "Secret references"

## ✅ Status do Build

- **Build Time**: ~1.5 minutos
- **Módulos**: 5268 transformados
- **Status**: ✅ Sem erros
- **PWA**: ✅ Ativo (215 entries, 8.7 MB)

## 📁 Arquivos Modificados

1. **scripts/fix-vercel-preview.sh** - Script de sincronização
2. **package.json** - Novos comandos: `prebuild`, `sync:vercel`
3. **.gitignore** - Exclusão de `.vite` e `.vite-cache`
4. **VERCEL_BUILD_CONFIGURATION.md** - Documentação completa

## 🔧 Troubleshooting

### Erro: "Faltam variáveis"
→ Configure as variáveis no Vercel Dashboard

### Tela branca no preview
→ Verifique MQTT URL usa `wss://` (não `ws://`)

### Build falha
→ Execute: `npm run sync:vercel` localmente para testar

## 📚 Documentação Completa

Ver: [VERCEL_BUILD_CONFIGURATION.md](./VERCEL_BUILD_CONFIGURATION.md)

---

**Última atualização**: 22 de Outubro de 2025  
**Versão**: 2.0
