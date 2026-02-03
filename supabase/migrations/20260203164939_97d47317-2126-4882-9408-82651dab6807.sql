-- =====================================================
-- PATCH 902: AI Agent Registry Population
-- Popula agent_registry com todos os 24 agentes
-- =====================================================

-- Inserir os 7 agentes CORE do model-registry
INSERT INTO agent_registry (agent_id, name, capabilities, status, metadata) VALUES
-- 1. Nauti Brain - Central AI
('nauti-brain', 'Nauti Brain', 
 '{"type": "central-ai", "skills": ["chat", "insights", "recommendations", "compliance-check"]}',
 'active',
 '{"model": "google/gemini-3-flash-preview", "fallback": "openai/gpt-5-mini", "description": "Central AI brain for decision-making and operational insights", "temperature": 0.7, "max_tokens": 2000}'
),
-- 2. MLC Assistant
('mlc-assistant', 'MLC Assistant',
 '{"type": "compliance", "skills": ["compliance-questions", "checklist-generation", "violation-detection", "remediation"]}',
 'active',
 '{"model": "openai/gpt-5-mini", "fallback": "google/gemini-3-flash-preview", "description": "Specialized compliance expert for MLC 2006 regulations", "temperature": 0.3, "max_tokens": 1500}'
),
-- 3. PEOTRAM AI
('peotram-ai', 'PEOTRAM AI',
 '{"type": "document-analysis", "skills": ["document-analysis", "ocr", "finding-extraction", "report-generation"]}',
 'active',
 '{"model": "google/gemini-2.5-pro", "fallback": "google/gemini-3-flash-preview", "description": "Document analysis and audit processing with vision capabilities", "temperature": 0.2, "max_tokens": 3000}'
),
-- 4. Crew Optimizer
('crew-optimizer', 'Crew Optimizer',
 '{"type": "optimization", "skills": ["crew-allocation", "constraint-validation", "cost-optimization", "scheduling"]}',
 'active',
 '{"model": "google/gemini-3-flash-preview", "fallback": "google/gemini-2.5-flash", "description": "AI-powered crew allocation and optimization", "temperature": 0.4, "max_tokens": 2000}'
),
-- 5. Predictive Maintenance
('predictive-maintenance', 'Predictive Maintenance',
 '{"type": "prediction", "skills": ["failure-prediction", "maintenance-scheduling", "cost-analysis", "alert-generation"]}',
 'active',
 '{"model": "custom/onnx-maintenance-v1", "fallback": "google/gemini-3-flash-preview", "description": "Equipment failure prediction and maintenance scheduling", "temperature": 0.2, "max_tokens": 1500}'
),
-- 6. Voice Assistant
('voice-assistant', 'Voice Assistant',
 '{"type": "interface", "skills": ["voice-commands", "transcription", "speech-synthesis", "hands-free-operation"]}',
 'active',
 '{"model": "whisper", "fallback": "google/gemini-2.5-flash", "description": "Voice-enabled interaction with speech-to-text and text-to-speech", "temperature": 0.5, "max_tokens": 500}'
),
-- 7. Document OCR
('document-ocr', 'Document OCR',
 '{"type": "ocr", "skills": ["ocr", "field-extraction", "document-classification", "data-validation"]}',
 'active',
 '{"model": "google/gemini-2.5-pro", "fallback": "tesseract", "description": "Optical character recognition and document field extraction", "temperature": 0.1, "max_tokens": 2000}'
),

-- 8 agentes SWARM do agent-orchestrator
-- 8. Captain AI
('captain-ai', 'Captain AI',
 '{"type": "command", "skills": ["route-planning", "emergency-response", "crew-assignment", "port-authorization", "cargo-handling", "weather-decisions"]}',
 'active',
 '{"model": "claude", "fallback": "gemini", "autonomy_level": 2, "description": "Vessel command & strategic decisions"}'
),
-- 9. Chief Engineer AI
('engineer-ai', 'Chief Engineer AI',
 '{"type": "maintenance", "skills": ["predictive-maintenance", "performance-optimization", "spare-parts-planning", "efficiency-tuning", "emergency-repairs"]}',
 'active',
 '{"model": "claude", "fallback": "gemini", "autonomy_level": 2, "description": "Equipment maintenance & performance"}'
),
-- 10. Safety Officer AI
('safety-ai', 'Safety Officer AI',
 '{"type": "compliance", "skills": ["peotram-compliance", "mlc-enforcement", "environmental-protection", "incident-investigation", "policy-enforcement"]}',
 'active',
 '{"model": "claude", "fallback": "gemini", "autonomy_level": 3, "description": "Compliance & regulations enforcement - ZERO TOLERANCE"}'
),
-- 11. Wellness Officer AI
('wellness-ai', 'Wellness Officer AI',
 '{"type": "health", "skills": ["fatigue-monitoring", "burnout-prediction", "health-alerts", "schedule-optimization", "mental-health-support"]}',
 'active',
 '{"model": "gemini", "fallback": "claude", "autonomy_level": 2, "description": "Crew health & wellbeing"}'
),
-- 12. Navigator AI
('navigator-ai', 'Navigator AI',
 '{"type": "navigation", "skills": ["route-planning", "weather-avoidance", "piracy-detection", "fuel-optimization", "eca-compliance", "sea-state-assessment"]}',
 'active',
 '{"model": "claude", "fallback": "gemini", "autonomy_level": 1, "description": "Route optimization & navigation"}'
),
-- 13. Economist AI
('economist-ai', 'Economist AI',
 '{"type": "finance", "skills": ["fuel-budgeting", "cost-optimization", "revenue-management", "bunker-trading", "port-economics", "crew-cost-optimization"]}',
 'active',
 '{"model": "claude", "fallback": "gemini", "autonomy_level": 2, "description": "Financial optimization"}'
),
-- 14. Predictor AI
('predictor-ai', 'Predictor AI',
 '{"type": "analytics", "skills": ["equipment-failure-prediction", "crew-issues-prediction", "weather-prediction", "market-prediction", "anomaly-detection"]}',
 'active',
 '{"model": "gemini", "fallback": "claude", "autonomy_level": 3, "description": "Predictive analytics & foresight"}'
),
-- 15. Communicator AI
('communicator-ai', 'Communicator AI',
 '{"type": "communication", "skills": ["alert-generation", "report-writing", "crew-messaging", "regulatory-reporting", "emergency-communication"]}',
 'active',
 '{"model": "gemini", "fallback": "claude", "autonomy_level": 2, "description": "Internal & external communication"}'
),

-- 10 agentes AUDIT do EnhancedAuditAgentsHub
-- 16. PEOTRAM Audit Agent
('peotram-audit', 'Agente PEOTRAM',
 '{"type": "audit", "skills": ["auditoria-13-elementos", "geracao-evidencias", "analise-ncs", "planos-acao", "relatorios-anp"]}',
 'active',
 '{"compliance": ["PEOTRAM", "ANP", "NORMAM"], "description": "Programa de Excelência Operacional Petrobras - 13 Elementos", "edge_function": "peotram-ai-chat"}'
),
-- 17. PEO-DP Agent
('peodp-audit', 'Agente PEO-DP',
 '{"type": "audit", "skills": ["verificacao-dp-classe", "checklist-imca", "analise-fmea", "requisitos-normam101", "relatorios-dp"]}',
 'active',
 '{"compliance": ["NORMAM-101", "IMCA M 117", "IMO MSC"], "description": "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117", "edge_function": "peodp-ai-chat"}'
),
-- 18. SGSO Agent
('sgso-audit', 'Agente SGSO',
 '{"type": "audit", "skills": ["17-praticas-obrigatorias", "dossie-anp", "tratamento-ncs", "capas-automaticas", "indicadores-sgso"]}',
 'active',
 '{"compliance": ["Resolução ANP 43/2007", "API RP 75"], "description": "Sistema de Gestão de Segurança Operacional - ANP", "edge_function": "sgso-assistant"}'
),
-- 19. MLC Audit Agent
('mlc-audit', 'Agente MLC 2006',
 '{"type": "audit", "skills": ["5-titulos-mlc", "inspecao-conformidade", "contratos-sea", "horas-descanso", "condicoes-trabalho"]}',
 'active',
 '{"compliance": ["MLC 2006", "ILO", "Flag State"], "description": "Maritime Labour Convention - Direitos dos Marítimos", "edge_function": "mlc-assistant"}'
),
-- 20. ISM Agent
('ism-audit', 'Agente ISM Code',
 '{"type": "audit", "skills": ["sms-safety-management", "auditoria-doc-smc", "gestao-emergencias", "controle-operacional", "melhoria-continua"]}',
 'active',
 '{"compliance": ["ISM Code", "SOLAS Cap IX", "IMO"], "description": "International Safety Management Code", "edge_function": "compliance-ai"}'
),
-- 21. ISPS Agent
('isps-audit', 'Agente ISPS Code',
 '{"type": "audit", "skills": ["ssp-ship-security", "niveis-seguranca", "drills-seguranca", "avaliacao-ameacas", "certificado-issc"]}',
 'active',
 '{"compliance": ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"], "description": "International Ship and Port Facility Security Code", "edge_function": "compliance-ai"}'
),
-- 22. MARPOL Agent
('marpol-audit', 'Agente MARPOL',
 '{"type": "audit", "skills": ["iopp-certificate", "orb-oil-record", "gestao-residuos", "emissoes-sox-nox", "ballast-water"]}',
 'active',
 '{"compliance": ["MARPOL 73/78", "BWM Convention"], "description": "Marine Pollution Prevention - Anexos I-VI", "edge_function": "environmental-ai"}'
),
-- 23. SOLAS Agent
('solas-audit', 'Agente SOLAS',
 '{"type": "audit", "skills": ["lsa-life-saving", "ffe-fire-fighting", "navegacao-segura", "estabilidade", "certificados-estatutarios"]}',
 'active',
 '{"compliance": ["SOLAS 1974", "IMO Resolutions"], "description": "Safety of Life at Sea - Segurança da Vida Humana", "edge_function": "safety-ai"}'
),
-- 24. STCW Agent
('stcw-audit', 'Agente STCW',
 '{"type": "audit", "skills": ["certificacao-tripulantes", "competencia-minima", "horas-descanso", "treinamentos-obrigatorios", "qualificacao-dp"]}',
 'active',
 '{"compliance": ["STCW 1978/2010", "Manila Amendments"], "description": "Standards of Training, Certification and Watchkeeping", "edge_function": "training-ai-assistant"}'
),
-- 25. ESG Agent
('esg-audit', 'Agente ESG Marítimo',
 '{"type": "audit", "skills": ["carbon-footprint", "cii-rating", "eexi-compliance", "diversidade-tripulacao", "relatorios-gri"]}',
 'active',
 '{"compliance": ["IMO 2050", "EU MRV", "GHG Strategy"], "description": "Environmental, Social and Governance para operações marítimas", "edge_function": "environmental-ai"}'
)
ON CONFLICT (agent_id) DO UPDATE SET
  name = EXCLUDED.name,
  capabilities = EXCLUDED.capabilities,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Criar métricas iniciais para os agentes
INSERT INTO agent_swarm_metrics (agent_id, task_count, success_count, error_count, avg_response_time_ms)
SELECT 
  agent_id,
  0,
  0,
  0,
  0
FROM agent_registry
WHERE NOT EXISTS (
  SELECT 1 FROM agent_swarm_metrics m WHERE m.agent_id = agent_registry.agent_id
)
ON CONFLICT DO NOTHING;