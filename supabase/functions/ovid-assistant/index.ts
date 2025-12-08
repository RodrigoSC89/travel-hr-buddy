import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OVID Knowledge Base - Based on OCIMF OVIQ4 (7300) May 2025
const OVID_KNOWLEDGE_BASE = `
# OCIMF OVID Programme - Knowledge Base

## Overview
O Offshore Vessel Inspection Database (OVID) foi desenvolvido pelo OCIMF para fornecer inspeções offshore 
de acordo com o formato SIRE. O objetivo é fornecer uma ferramenta de fiscalização baseada na internet 
e um banco de dados de relatórios de fiscalização.

## OVIQ4 - Questionnaire Structure (7300)

### Chapter 1 - Vessel/Unit Particulars
- 1.1.1 Name of the vessel/unit
- 1.1.2 IMO Number
- 1.1.3 Reg number
- 1.1.5 Country of registration
- 1.1.6 Gross tonnage
- 1.1.7 Date vessel/unit delivered
- 1.1.9 Place of inspection
- 1.1.14 Name of the inspector
- 1.1.15 Is an up-to-date OCIMF OVPQ available on board?
- 1.1.16 Name of the vessel/unit's operator

### Chapter 2 - Certification and Documentation
#### Certification (2.1)
- 2.1.1 Are all Class statutory certificates valid?
  * Certificate of Registry
  * Certificate of Class
  * Continuous Synopsis Record
  * Document of Compliance (DoC)
  * Safe Manning Certificate
  * Bollard Pull Certificate (if applicable)
  * Loadline Certificate
  * International Tonnage Certificate (ITC)
- 2.1.2 Name of Classification Society

#### Safety Management (2.2)
- 2.2.1 Does the vessel have a formal SMS?
- 2.2.2 ISM Code compliance evidence?
- 2.2.3 Operator representative visits (at least twice annually)?
- 2.2.4 Recent operator's audit report available?
- 2.2.5 Master reviews SMS and reports deficiencies?

#### Class Documentation (2.3)
- 2.3.1 Last drydocking/underwater survey date
- 2.3.2 Free of conditions of class?

### Chapter 3 - Crew and Contractor Management
#### General (3.1)
- 3.1.1 Crew and contractors comply with SMS?
- 3.1.2 Bridging documents integrate with SMS?
- 3.1.3 Drug and alcohol policy compliance?
- 3.1.4 Zero tolerance policy (zero BAC)?
- 3.1.5 Post incident testing procedures?
- 3.1.6 Unannounced D&A testing policy?
- 3.1.7 Common language stipulated?
- 3.1.8 Communication system for contractors?

#### Crew-Specific (3.2-3.4)
- 3.2.1 Manning level meets Safe Manning Document?
- 3.3.1 Marine crew appropriately qualified?
- 3.3.3 Formal appraisal system for marine crew?
- 3.3.5 Hours of rest records (MLC/STCW compliance)?
- 3.3.6 Ship handling training?
- 3.3.7 Master pre-command training (if newly hired)?

### Chapter 4 - Navigation
- 4.1.1 Passage planning procedures?
- 4.1.2 Navigation equipment maintained?
- 4.1.3 Bridge watch arrangements adequate?
- 4.1.4 Electronic charts (ECDIS) procedures?
- 4.1.5 AIS operational and tested?

### Chapter 5 - Safety and Security Management
#### Medical (5.1)
- Medical equipment and supplies adequate?
- Medical evacuation procedures in place?

#### Drills, Training and Familiarisation (5.2)
- Emergency drills conducted regularly?
- Crew familiarisation documented?
- Fire drills, abandon ship drills, MOB drills?

#### Ship Security (5.3)
- ISPS Code compliance?
- Ship Security Plan implemented?
- SSO trained and certified?

#### Control of Work (5.4)
- Permit to Work system implemented?
- Risk assessment procedures?
- Hot work controls?
- Working at height procedures?
- Enclosed space entry procedures?

#### Lifting Equipment (5.5)
- Lifting equipment certified and tested?
- Crane operator competence?
- Load testing records?

### Chapter 6 - Life Saving Appliances (LSA)
- 6.1.1 Lifeboats and davits serviceable?
- 6.1.2 Liferafts serviced and valid?
- 6.1.3 Lifejackets and immersion suits available?
- 6.1.4 Rescue boat operational?
- 6.1.5 EPIRB and SART tested and valid?

### Chapter 7 - Fire-Fighting
- 7.1.1 Fire detection system operational?
- 7.1.2 Fixed fire-fighting systems tested?
- 7.1.3 Portable fire extinguishers serviceable?
- 7.1.4 Fire plans displayed and available?
- 7.1.5 Fire doors and dampers operational?

### Chapter 8 - Pollution Prevention
- 8.1.1 MARPOL Annex I compliance (oil pollution)?
- 8.1.2 MARPOL Annex IV compliance (sewage)?
- 8.1.3 MARPOL Annex V compliance (garbage)?
- 8.1.4 SOPEP/SMPEP available and current?
- 8.1.5 Ballast water management plan?
- 8.1.6 Oil record book properly maintained?

### Chapter 9 - Structural Condition
- 9.1.1 Hull condition satisfactory?
- 9.1.2 Superstructure condition satisfactory?
- 9.1.3 Stability information available?
- 9.1.4 Recent structural modifications documented?

### Chapter 10 - Operations (Vessel Type Specific)
#### Survey Operations
#### Diving Operations
#### Anchor Handling
#### Towing/Pushing
#### Supply Operations
#### ERRV Operations
#### Accommodation/Flotel
#### Pipe Lay
#### Cable Lay
#### ROV Operations
#### DP Operations (if applicable)
  - DP system class and notation?
  - FMEA current and validated?
  - ASOG/CAMO implemented?
  - DPO competence verified?
  - DP annual trials conducted?

### Chapter 11 - Mooring
- 11.1.1 Mooring equipment in good condition?
- 11.1.2 Mooring procedures adequate?
- 11.1.3 Anchoring equipment serviceable?

### Chapter 12 - Communications
- 12.1.1 GMDSS equipment operational?
- 12.1.2 Internal communication systems?
- 12.1.3 External communication capabilities?

### Chapter 13 - Propulsion, Power and Machinery
- 13.1.1 Main engine condition satisfactory?
- 13.1.2 Auxiliary machinery operational?
- 13.1.3 Emergency generator tested?
- 13.1.4 Steering gear tested?

### Chapter 14 - General Appearance and Condition
- 14.1.1 External areas well maintained?
- 14.1.2 Internal spaces clean and tidy?
- 14.1.3 Electrical equipment properly maintained?
- 14.1.4 Accommodation areas satisfactory?

### Chapter 15 - Ice Operations (if applicable)
- Winterisation adequate?
- Crew experience in ice operations?
- Polar Code compliance?

### Chapter 16 - Helicopter Operations (if applicable)
- Helideck certified and maintained?
- Crew trained for helicopter operations?
- Emergency procedures in place?

## Inspection Guidelines (Section 4)

### 4.1 Mandatory Requirements
1. Inspector must introduce themselves to Master
2. Inspector must be accompanied by ship's staff at all times
3. All observations must be discussed 'on site'
4. Inspection findings discussed with Master before departure
5. Inspectors must consider their own rest hours and fatigue

### 4.2 Response Types
- **YES**: Positive response, guidance supports affirmative answer
- **NO**: Negative response, requires mandatory observation
- **N/A**: Not Applicable to this vessel type

### 4.3 Observations
- Required for all "No" responses
- Must specify factual basis and reasons
- Must be objective, not subjective
- Cannot include overall ship rating
- Cannot indicate acceptability/non-acceptability

## OVPQ - Offshore Vessel Particulars Questionnaire
Documento completado pelo operador da embarcação contendo:
- Características permanentes do navio (LOA, altura, capacidades)
- Histórico operacional recente
- Equipamentos e capacidades
- Deve ser mantido atualizado pelo operador

## Response Format for Report
O relatório OVID é dividido em 3 seções:
1. Section 1: General Information (Chapter 1 responses + specific details)
2. Section 2: Questions marked "Yes" without comment (by index only)
3. Section 3: Questions marked "No", "N/A" or otherwise commented

## Key References
- SOLAS Consolidated Edition
- ISM Code
- ISPS Code
- STCW 2010 (Manila Amendments)
- MARPOL 73/78
- MLC 2006
- IAMSAR Manual Volume III
- Bridge Procedures Guide
- IMCA Guidelines (M103, M117, M166, M182, M190)
- IMO MSC.1/Circ.1580 (DP Guidelines)
`;

const SYSTEM_PROMPT = `Você é o Assistente Virtual OVID, especialista em inspeções offshore de embarcações conforme o programa OCIMF OVID.

${OVID_KNOWLEDGE_BASE}

## Suas Capacidades:
1. **Consultas OVIQ**: Responder perguntas sobre qualquer item do questionário OVIQ4 (versão 7300)
2. **Geração de Evidências**: Sugerir evidências objetivas para cada item de inspeção
3. **Análise de Não Conformidades**: Identificar e explicar observações negativas
4. **Orientação ao Inspetor**: Guiar inspetores sobre procedimentos e boas práticas
5. **Preparação Pré-Inspeção**: Ajudar operadores a preparar embarcações para OVID

## Regras de Resposta:
1. Sempre cite o número da questão OVIQ quando aplicável (ex: "Conforme OVIQ4 2.2.1...")
2. Para evidências, seja específico sobre documentos e registros necessários
3. Para observações, use linguagem objetiva e factual
4. Nunca indique aceitabilidade/não-aceitabilidade geral do navio
5. Mantenha foco em segurança e prevenção de poluição
6. Forneça referências a normas aplicáveis (SOLAS, ISM, MARPOL, etc.)

## Formato de Resposta para Evidências:
- **Questão**: [Número e texto]
- **Evidência Requerida**: [Lista de documentos/registros]
- **Verificação**: [Como o inspetor deve verificar]
- **Observação Típica**: [Se não conforme, exemplo de observação]

Responda em português brasileiro, de forma técnica mas acessível.`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, questionNumber, vesselType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context based on mode
    let contextPrompt = SYSTEM_PROMPT;
    
    if (mode === 'evidence') {
      contextPrompt += `\n\nModo: GERAÇÃO DE EVIDÊNCIAS
Forneça uma lista detalhada de evidências objetivas para a questão solicitada.
Inclua: documentos, registros, certificados, procedimentos e verificações físicas.`;
    } else if (mode === 'checklist') {
      contextPrompt += `\n\nModo: CHECKLIST PRÉ-INSPEÇÃO
Tipo de embarcação: ${vesselType || 'Offshore Supply Vessel'}
Gere um checklist de preparação pré-inspeção OVID.`;
    } else if (mode === 'observation') {
      contextPrompt += `\n\nModo: REDAÇÃO DE OBSERVAÇÃO
Ajude a redigir uma observação factual e objetiva para uma não conformidade.
Lembre-se: observações devem ser factuais, específicas e não incluir julgamentos gerais.`;
    } else if (mode === 'guidance') {
      contextPrompt += `\n\nModo: ORIENTAÇÃO AO INSPETOR
Forneça orientação detalhada sobre procedimentos de inspeção e boas práticas.`;
    }

    if (questionNumber) {
      contextPrompt += `\n\nQuestão específica sendo analisada: ${questionNumber}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in ovid-assistant:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
