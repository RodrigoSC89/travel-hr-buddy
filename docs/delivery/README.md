# 🚀 Nautilus One - Maritime HR Management Platform

**Versão:** 3.2.0 Final  
**Release:** 2026-01-01  
**Status:** Production-Ready ✅

---

## 📋 Visão Geral

O **Nautilus One** é uma plataforma enterprise de gestão de RH marítimo, desenvolvida para atender às necessidades operacionais de companhias de navegação, operadores offshore e empresas de apoio marítimo.

### Principais Funcionalidades

- 🧠 **16 IAs Especializadas**: Command, PEOTRAM, PEO-DP, ARIA Voice, Bunker, Safety, Compliance, Fleet, Crew, Weather, Maintenance, Cargo, Training, Voyage, Charter, MLC
- 📊 **Compliance Completo**: MLC 2006, STCW, IMO, ANTAQ, ANP
- 🚢 **Gestão de Frota**: Rastreamento, manutenção, documentação
- 👥 **Gestão de Tripulação**: Escalas, certificações, treinamentos
- 💰 **Folha de Pagamento**: Cálculos marítimos, embarque/desembarque
- 📱 **PWA Offline-First**: Otimizado para redes de 2 Mbps

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| IA | OpenAI GPT-4o, Claude, Gemini 2.5 Flash |
| Voice | ElevenLabs HD |
| Charts | Recharts |
| PWA | Workbox + IndexedDB |

---

## 🚀 Instalação

### Requisitos

- Node.js 18+
- npm ou bun
- Conta Supabase

### Passos

```bash
# Clone o repositório
git clone https://github.com/nautilus-one/nautilus-app.git

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

---

## 📦 Módulos Principais

### Compliance & Auditoria
- **SGSO Avançado**: Sistema de Gestão de Segurança Operacional (ANP 46/2016)
- **PEOTRAM 2024**: 13 elementos Petrobras
- **PEO-DP**: Programa de Excelência em Operações DP

### Operações
- **Central de Comando**: Dashboard operacional unificado
- **Fleet Tracking**: Monitoramento AIS em tempo real
- **Bunker Management**: Gestão de combustível

### RH Marítimo
- **Crew Management**: Gestão completa de tripulação
- **Training Academy**: Treinamentos e certificações
- **Payroll**: Folha de pagamento marítima

### IA & Automação
- **AI Hub**: Central de 16 IAs especializadas
- **Voice Commands**: Comandos por voz com ElevenLabs
- **Predictive Engine**: Análises preditivas

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:coverage
```

**Cobertura atual:** 85%+  
**Lighthouse Score:** 92

---

## 📊 Arquitetura

```
src/
├── components/      # Componentes React
├── pages/           # Páginas e rotas
├── lib/             # Bibliotecas e utilities
│   ├── ai/          # Módulos de IA
│   └── utils/       # Funções auxiliares
├── hooks/           # Custom hooks
├── integrations/    # Integrações externas
└── config/          # Configurações
```

---

## 🔒 Segurança

- ✅ RLS (Row Level Security) em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Multi-tenant isolado
- ✅ Auditoria completa de acessos
- ✅ Criptografia em trânsito e repouso

---

## 📞 Suporte

- **Email**: support@nautilus.one
- **Docs**: https://docs.nautilus.one
- **Status**: https://status.nautilus.one

---

## 📄 Licença

Este software é licenciado sob termos comerciais.  
Veja `LICENSE.md` para detalhes.

---

**© 2026 Nautilus One - Maritime HR Management Platform**
