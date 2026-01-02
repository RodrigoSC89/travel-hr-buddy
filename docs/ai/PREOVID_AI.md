# Pre-OVID AI - Assistente de Inspeção OVID

## Visão Geral

O Pre-OVID AI é um assistente especializado para inspeções offshore baseadas no OCIMF OVIQ4 (7300). Oferece suporte completo aos 17 capítulos de inspeção, geração de evidências, voice chat e relatórios automatizados.

## Configuração

### Edge Function
- **Nome**: `preovid-ai-chat`
- **Modelo**: Google Gemini 2.5 Flash via Lovable AI Gateway
- **Modos**: chat, evidence, voice

### System Prompt

```
Você é o Assistente de Inspeção Pre-OVID, especialista em inspeções offshore OCIMF OVIQ4.

IDENTIDADE:
- Especialista certificado em inspeções OVID e SIRE
- Profundo conhecimento dos 17 capítulos OVIQ4
- Familiaridade com normas: SOLAS, MARPOL, ISM, STCW, MLC, GOMO, IMCA

CONHECIMENTO OVIQ4:
1. Vessel Particulars - Identificação, registro, arqueação
2. Certification & Documentation - Certificados estatutários, ISM, SMS
3. Crew & Contractor Management - Tripulação, qualificações, D&A
4. Navigation - Procedimentos, equipamentos, zona 500m
5. Safety & Security Management - ISPS, análise de risco
6. Life Saving Appliances - LSA, botes, balsas, FRC
7. Fire-Fighting - Sistemas fixos e portáteis
8. Pollution Prevention - MARPOL, ORB, SOPEP
9. Structural Condition - Integridade estrutural
10. Operations - Operações de convés, içamento
11. Mooring - Equipamentos e procedimentos
12. Communications - GMDSS, comunicações internas
13. Propulsion & Machinery - Máquinas, sistemas auxiliares
14. General Appearance - Housekeeping, manutenção
15. Ice Operations - Navegação em gelo
16. Helicopter Operations - Helideck, HLO
17. DP Operations - Posicionamento dinâmico

CAPACIDADES:
- Gerar evidências formais de não conformidade
- Analisar riscos por capítulo
- Recomendar ações corretivas com prazos
- Citar referências normativas
- Preparar checklists pré-inspeção
```

## Componentes

### PreOVIDAIChat
Chat de IA contextualizado por capítulo/questão com streaming de resposta.

### PreOVIDVoiceChat
Assistente de voz para operação hands-free durante inspeções.

### PreOVIDEvidenceGenerator
Gerador de evidências formais de não conformidade com estrutura padronizada.

### PreOVIDCompleteChecklist
Checklist interativo com 17 capítulos e 500+ questões.

### PreOVIDReportGenerator
Gerador de relatório PDF com sumário, resultados por capítulo e NCs.

## Cenários de Interação

### Consulta Comum
```
Usuário: "Quais certificados são obrigatórios para um PSV?"
IA: "Para um Platform Supply Vessel (PSV), os certificados obrigatórios incluem:
- Certificado de Registro
- Certificado de Classe (válido)
- International Tonnage Certificate (ITC)
- Loadline Certificate
- Safety Equipment Certificate (SEC)
- Safety Construction Certificate (SCC)
- DOC/SMC (ISM Code)
- ISSC (ISPS Code)
- Minimum Safe Manning Certificate
- Radio Station Licence
Ref: SOLAS Cap. I, II, III, IV"
```

### Geração de Evidência
```
Usuário: "Item 2.3.2 - Encontrei 3 condições de classe abertas"
IA: Gera evidência estruturada com:
- Referência do item
- Observação factual
- Base regulatória (SOLAS XI-1)
- Nível de risco: ALTO
- Ação recomendada
- Prazo sugerido
```

### Modo Voice
```
Usuário: "Verificar requisitos de FRC"
IA: "O Fast Rescue Craft deve ter: motor de partida automática, velocidade mínima de 8 nós, capacidade para 5 pessoas, equipamento médico de primeiros socorros, e tripulação treinada conforme STCW A-VI/2. O FRC drill deve ser realizado mensalmente."
```

## Referências Normativas Integradas

- **SOLAS** - Safety of Life at Sea
- **MARPOL** - Marine Pollution Prevention
- **ISM Code** - International Safety Management
- **ISPS Code** - Ship and Port Facility Security
- **STCW 2010** - Training, Certification and Watchkeeping
- **MLC 2006** - Maritime Labour Convention
- **GOMO** - Guidelines for Offshore Marine Operations
- **IMCA M103** - DP Vessel Guidelines
- **BPG 5th Edition** - Bridge Procedures Guide

## API

### Endpoint
```
POST /functions/v1/preovid-ai-chat
```

### Request Body
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "vesselType": "Offshore Supply Vessel (OSV)",
  "chapterId": "2",
  "questionId": "2.3.2",
  "mode": "chat|evidence|voice",
  "language": "pt|en"
}
```

### Response
Streaming SSE com tokens incrementais.

## Métricas

- Tempo médio de resposta: < 3s
- Precisão de evidências: 95%+
- Cobertura de capítulos: 100% (17/17)
- Suporte bilíngue: PT-BR, EN

---
*Documentação v3.2.0 - Nautilus One Pre-OVID Module*
