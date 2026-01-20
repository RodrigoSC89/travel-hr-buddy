/**
 * Maritime-specific Training Datasets for Multilingual AI
 * STCW/MLC 2006 terminology and maritime operations vocabulary
 */

import type { SupportedLanguage } from "@/core/i18n/translator";

export interface MaritimeTermEntry {
  term_id: string;
  category: 'stcw' | 'mlc' | 'navigation' | 'safety' | 'operations' | 'engineering' | 'documentation';
  translations: Record<SupportedLanguage, string>;
  context?: string;
  abbreviation?: string;
}

export interface MaritimePhrase {
  phrase_id: string;
  category: string;
  translations: Record<SupportedLanguage, string>;
  formal_level: 'informal' | 'standard' | 'formal' | 'legal';
}

// STCW (Standards of Training, Certification and Watchkeeping) terminology
export const STCW_TERMS: MaritimeTermEntry[] = [
  {
    term_id: "stcw_001",
    category: "stcw",
    abbreviation: "COC",
    translations: {
      en: "Certificate of Competency",
      pt: "Certificado de Competência",
      es: "Certificado de Competencia",
      fr: "Certificat de Compétence",
      de: "Befähigungszeugnis",
    },
    context: "Official document certifying seafarer qualification",
  },
  {
    term_id: "stcw_002",
    category: "stcw",
    abbreviation: "GMDSS",
    translations: {
      en: "Global Maritime Distress and Safety System",
      pt: "Sistema Global de Socorro e Segurança Marítima",
      es: "Sistema Mundial de Socorro y Seguridad Marítimos",
      fr: "Système Mondial de Détresse et de Sécurité en Mer",
      de: "Weltweites Seenot- und Sicherheitsfunksystem",
    },
    context: "International distress communication system",
  },
  {
    term_id: "stcw_003",
    category: "stcw",
    translations: {
      en: "Watchkeeping",
      pt: "Serviço de Quarto",
      es: "Guardia de Navegación",
      fr: "Quart de Navigation",
      de: "Brückenwache",
    },
    context: "Bridge duty supervision",
  },
  {
    term_id: "stcw_004",
    category: "stcw",
    abbreviation: "OOW",
    translations: {
      en: "Officer of the Watch",
      pt: "Oficial de Quarto",
      es: "Oficial de Guardia",
      fr: "Officier de Quart",
      de: "Wachoffizier",
    },
  },
  {
    term_id: "stcw_005",
    category: "stcw",
    translations: {
      en: "Proficiency in Survival Craft",
      pt: "Proficiência em Embarcações de Sobrevivência",
      es: "Competencia en Embarcaciones de Supervivencia",
      fr: "Aptitude aux Embarcations de Sauvetage",
      de: "Befähigung für Überlebensfahrzeuge",
    },
  },
  {
    term_id: "stcw_006",
    category: "stcw",
    abbreviation: "ECDIS",
    translations: {
      en: "Electronic Chart Display and Information System",
      pt: "Sistema de Visualização de Cartas Eletrônicas",
      es: "Sistema de Visualización de Cartas Electrónicas",
      fr: "Système de Visualisation des Cartes Électroniques",
      de: "Elektronisches Kartenanzeige- und Informationssystem",
    },
  },
  {
    term_id: "stcw_007",
    category: "stcw",
    translations: {
      en: "Basic Safety Training",
      pt: "Treinamento Básico de Segurança",
      es: "Formación Básica en Seguridad",
      fr: "Formation de Base à la Sécurité",
      de: "Grundausbildung in Sicherheit",
    },
  },
  {
    term_id: "stcw_008",
    category: "stcw",
    translations: {
      en: "Advanced Fire Fighting",
      pt: "Combate Avançado a Incêndio",
      es: "Lucha Contra Incendios Avanzada",
      fr: "Lutte Avancée Contre l'Incendie",
      de: "Fortgeschrittene Brandbekämpfung",
    },
  },
];

// MLC 2006 (Maritime Labour Convention) terminology
export const MLC_TERMS: MaritimeTermEntry[] = [
  {
    term_id: "mlc_001",
    category: "mlc",
    translations: {
      en: "Seafarer Employment Agreement",
      pt: "Contrato de Trabalho Marítimo",
      es: "Acuerdo de Empleo del Marino",
      fr: "Contrat d'Engagement Maritime",
      de: "Seearbeitsvertrag",
    },
    context: "MLC Title 2 - Conditions of Employment",
  },
  {
    term_id: "mlc_002",
    category: "mlc",
    translations: {
      en: "Hours of Work and Rest",
      pt: "Horas de Trabalho e Descanso",
      es: "Horas de Trabajo y Descanso",
      fr: "Heures de Travail et de Repos",
      de: "Arbeits- und Ruhezeiten",
    },
  },
  {
    term_id: "mlc_003",
    category: "mlc",
    translations: {
      en: "Repatriation",
      pt: "Repatriação",
      es: "Repatriación",
      fr: "Rapatriement",
      de: "Heimschaffung",
    },
    context: "Right to return to home country",
  },
  {
    term_id: "mlc_004",
    category: "mlc",
    translations: {
      en: "Maritime Labour Certificate",
      pt: "Certificado de Trabalho Marítimo",
      es: "Certificado de Trabajo Marítimo",
      fr: "Certificat de Travail Maritime",
      de: "Seearbeitszeugnis",
    },
  },
  {
    term_id: "mlc_005",
    category: "mlc",
    translations: {
      en: "Declaration of Maritime Labour Compliance",
      pt: "Declaração de Conformidade do Trabalho Marítimo",
      es: "Declaración de Conformidad Laboral Marítima",
      fr: "Déclaration de Conformité du Travail Maritime",
      de: "Seearbeits-Konformitätserklärung",
    },
  },
  {
    term_id: "mlc_006",
    category: "mlc",
    translations: {
      en: "Flag State Inspection",
      pt: "Inspeção do Estado de Bandeira",
      es: "Inspección del Estado de Abanderamiento",
      fr: "Inspection de l'État du Pavillon",
      de: "Flaggenstaatskontrolle",
    },
  },
  {
    term_id: "mlc_007",
    category: "mlc",
    translations: {
      en: "Port State Control",
      pt: "Controle do Estado do Porto",
      es: "Control del Estado Rector del Puerto",
      fr: "Contrôle par l'État du Port",
      de: "Hafenstaatkontrolle",
    },
    abbreviation: "PSC",
  },
  {
    term_id: "mlc_008",
    category: "mlc",
    translations: {
      en: "Onboard Complaint Procedure",
      pt: "Procedimento de Reclamação a Bordo",
      es: "Procedimiento de Quejas a Bordo",
      fr: "Procédure de Plainte à Bord",
      de: "Beschwerdeverfahren an Bord",
    },
  },
];

// Navigation and Operations terminology
export const NAVIGATION_TERMS: MaritimeTermEntry[] = [
  {
    term_id: "nav_001",
    category: "navigation",
    translations: {
      en: "Voyage Planning",
      pt: "Planejamento de Viagem",
      es: "Planificación del Viaje",
      fr: "Planification du Voyage",
      de: "Reiseplanung",
    },
  },
  {
    term_id: "nav_002",
    category: "navigation",
    translations: {
      en: "Passage Plan",
      pt: "Plano de Navegação",
      es: "Plan de Travesía",
      fr: "Plan de Passage",
      de: "Fahrtplan",
    },
  },
  {
    term_id: "nav_003",
    category: "navigation",
    translations: {
      en: "Bridge Resource Management",
      pt: "Gerenciamento de Recursos do Passadiço",
      es: "Gestión de Recursos del Puente",
      fr: "Gestion des Ressources à la Passerelle",
      de: "Brückenressourcenmanagement",
    },
    abbreviation: "BRM",
  },
  {
    term_id: "nav_004",
    category: "navigation",
    translations: {
      en: "Dynamic Positioning",
      pt: "Posicionamento Dinâmico",
      es: "Posicionamiento Dinámico",
      fr: "Positionnement Dynamique",
      de: "Dynamische Positionierung",
    },
    abbreviation: "DP",
  },
  {
    term_id: "nav_005",
    category: "navigation",
    translations: {
      en: "Estimated Time of Arrival",
      pt: "Hora Estimada de Chegada",
      es: "Hora Estimada de Llegada",
      fr: "Heure d'Arrivée Prévue",
      de: "Voraussichtliche Ankunftszeit",
    },
    abbreviation: "ETA",
  },
  {
    term_id: "nav_006",
    category: "navigation",
    translations: {
      en: "Under Keel Clearance",
      pt: "Folga sob a Quilha",
      es: "Resguardo Bajo Quilla",
      fr: "Pied de Pilote",
      de: "Kielfreiheit",
    },
    abbreviation: "UKC",
  },
];

// Safety terminology
export const SAFETY_TERMS: MaritimeTermEntry[] = [
  {
    term_id: "safety_001",
    category: "safety",
    translations: {
      en: "Man Overboard",
      pt: "Homem ao Mar",
      es: "Hombre al Agua",
      fr: "Homme à la Mer",
      de: "Mann über Bord",
    },
    abbreviation: "MOB",
  },
  {
    term_id: "safety_002",
    category: "safety",
    translations: {
      en: "Emergency Muster Station",
      pt: "Estação de Reunião de Emergência",
      es: "Punto de Reunión de Emergencia",
      fr: "Poste de Rassemblement",
      de: "Sammelstation",
    },
  },
  {
    term_id: "safety_003",
    category: "safety",
    translations: {
      en: "Abandon Ship",
      pt: "Abandonar Navio",
      es: "Abandonar Buque",
      fr: "Abandonner le Navire",
      de: "Schiff Verlassen",
    },
  },
  {
    term_id: "safety_004",
    category: "safety",
    translations: {
      en: "Safety Management System",
      pt: "Sistema de Gestão de Segurança",
      es: "Sistema de Gestión de la Seguridad",
      fr: "Système de Gestion de la Sécurité",
      de: "Sicherheitsmanagementsystem",
    },
    abbreviation: "SMS",
  },
  {
    term_id: "safety_005",
    category: "safety",
    translations: {
      en: "Personal Protective Equipment",
      pt: "Equipamento de Proteção Individual",
      es: "Equipo de Protección Personal",
      fr: "Équipement de Protection Individuelle",
      de: "Persönliche Schutzausrüstung",
    },
    abbreviation: "PPE/EPI",
  },
  {
    term_id: "safety_006",
    category: "safety",
    translations: {
      en: "Risk Assessment",
      pt: "Avaliação de Riscos",
      es: "Evaluación de Riesgos",
      fr: "Évaluation des Risques",
      de: "Risikobewertung",
    },
  },
  {
    term_id: "safety_007",
    category: "safety",
    translations: {
      en: "Permit to Work",
      pt: "Permissão para Trabalho",
      es: "Permiso de Trabajo",
      fr: "Permis de Travail",
      de: "Arbeitserlaubnis",
    },
    abbreviation: "PTW",
  },
];

// Common maritime phrases for AI training
export const MARITIME_PHRASES: MaritimePhrase[] = [
  {
    phrase_id: "phrase_001",
    category: "crew_management",
    formal_level: "standard",
    translations: {
      en: "The crew member's certificate expires in 30 days",
      pt: "O certificado do tripulante expira em 30 dias",
      es: "El certificado del tripulante vence en 30 días",
      fr: "Le certificat du membre d'équipage expire dans 30 jours",
      de: "Das Zertifikat des Besatzungsmitglieds läuft in 30 Tagen ab",
    },
  },
  {
    phrase_id: "phrase_002",
    category: "compliance",
    formal_level: "formal",
    translations: {
      en: "The vessel is fully compliant with MLC 2006 requirements",
      pt: "A embarcação está em total conformidade com os requisitos da MLC 2006",
      es: "El buque cumple plenamente con los requisitos del MLC 2006",
      fr: "Le navire est entièrement conforme aux exigences de la MLC 2006",
      de: "Das Schiff erfüllt alle Anforderungen der MLC 2006",
    },
  },
  {
    phrase_id: "phrase_003",
    category: "scheduling",
    formal_level: "standard",
    translations: {
      en: "Schedule crew rotation for next embarkation",
      pt: "Agendar rotação de tripulação para próximo embarque",
      es: "Programar rotación de tripulación para próximo embarque",
      fr: "Planifier la rotation d'équipage pour le prochain embarquement",
      de: "Besatzungsrotation für nächste Einschiffung planen",
    },
  },
  {
    phrase_id: "phrase_004",
    category: "payroll",
    formal_level: "standard",
    translations: {
      en: "Process monthly payroll with overtime calculations",
      pt: "Processar folha de pagamento mensal com cálculo de horas extras",
      es: "Procesar nómina mensual con cálculos de horas extras",
      fr: "Traiter la paie mensuelle avec les calculs d'heures supplémentaires",
      de: "Monatliche Gehaltsabrechnung mit Überstundenberechnung verarbeiten",
    },
  },
  {
    phrase_id: "phrase_005",
    category: "training",
    formal_level: "standard",
    translations: {
      en: "Mandatory training refresher required before next voyage",
      pt: "Atualização de treinamento obrigatório necessária antes da próxima viagem",
      es: "Se requiere actualización de capacitación obligatoria antes del próximo viaje",
      fr: "Recyclage de formation obligatoire requis avant le prochain voyage",
      de: "Pflichtschulung erforderlich vor der nächsten Reise",
    },
  },
  {
    phrase_id: "phrase_006",
    category: "documentation",
    formal_level: "formal",
    translations: {
      en: "Generate Port State Control inspection report",
      pt: "Gerar relatório de inspeção de Controle do Estado do Porto",
      es: "Generar informe de inspección de Control del Estado Rector del Puerto",
      fr: "Générer le rapport d'inspection de l'État du Port",
      de: "Hafenstaatkontrollbericht erstellen",
    },
  },
  {
    phrase_id: "phrase_007",
    category: "alerts",
    formal_level: "standard",
    translations: {
      en: "Medical certificate renewal required within 14 days",
      pt: "Renovação de certificado médico necessária em 14 dias",
      es: "Renovación del certificado médico requerida en 14 días",
      fr: "Renouvellement du certificat médical requis sous 14 jours",
      de: "Erneuerung des ärztlichen Zeugnisses innerhalb von 14 Tagen erforderlich",
    },
  },
  {
    phrase_id: "phrase_008",
    category: "operations",
    formal_level: "standard",
    translations: {
      en: "Crew member assigned to vessel for 6-month rotation",
      pt: "Tripulante designado para embarcação por rotação de 6 meses",
      es: "Tripulante asignado al buque por rotación de 6 meses",
      fr: "Membre d'équipage affecté au navire pour une rotation de 6 mois",
      de: "Besatzungsmitglied für 6-monatige Rotation zum Schiff zugeteilt",
    },
  },
];

// Get all maritime terms combined
export function getAllMaritimeTerms(): MaritimeTermEntry[] {
  return [
    ...STCW_TERMS,
    ...MLC_TERMS,
    ...NAVIGATION_TERMS,
    ...SAFETY_TERMS,
  ];
}

// Get terms by category
export function getTermsByCategory(category: MaritimeTermEntry['category']): MaritimeTermEntry[] {
  return getAllMaritimeTerms().filter(term => term.category === category);
}

// Convert to training dataset format
export function toTrainingDataset(language: SupportedLanguage): {
  sentences: string[];
  translations: Record<SupportedLanguage, string[]>;
} {
  const terms = getAllMaritimeTerms();
  const phrases = MARITIME_PHRASES;
  
  const allItems = [
    ...terms.map(t => t.translations),
    ...phrases.map(p => p.translations),
  ];

  const sentences = allItems.map(item => item.en);
  const translations: Record<SupportedLanguage, string[]> = {
    en: allItems.map(item => item.en),
    pt: allItems.map(item => item.pt),
    es: allItems.map(item => item.es),
    fr: allItems.map(item => item.fr),
    de: allItems.map(item => item.de),
  };

  return { sentences, translations };
}

// Get dataset statistics
export function getDatasetStats(): {
  totalTerms: number;
  totalPhrases: number;
  categories: string[];
  languages: SupportedLanguage[];
} {
  return {
    totalTerms: getAllMaritimeTerms().length,
    totalPhrases: MARITIME_PHRASES.length,
    categories: ['stcw', 'mlc', 'navigation', 'safety', 'operations', 'engineering', 'documentation'],
    languages: ['en', 'pt', 'es', 'fr', 'de'],
  };
}
