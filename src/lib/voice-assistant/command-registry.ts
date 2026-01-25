/**
 * Voice Command Registry - Extracted from VoiceCommandProcessor
 * Defines all voice commands in a declarative registry pattern
 */

import { VoiceCommand, VoiceCommandConfig } from "./types";

/**
 * Default voice commands registry
 * Each command is defined declaratively for easy maintenance
 */
export const defaultCommands: Omit<VoiceCommandConfig, "action">[] = [
  {
    command: "start_psc_inspection",
    keywords: ["iniciar", "inspeção", "psc", "port state control"],
    alternativeKeywords: ["começar", "abrir", "psc"],
    description: "Iniciar inspeção PSC",
    route: "/psc-inspection",
  },
  {
    command: "open_ism_panel",
    keywords: ["abrir", "painel", "ism", "safety management"],
    alternativeKeywords: ["mostrar", "ism", "gestão", "segurança"],
    description: "Abrir painel ISM",
    route: "/ism-audit",
  },
  {
    command: "open_mlc_panel",
    keywords: ["abrir", "painel", "mlc", "maritime labour"],
    alternativeKeywords: ["mostrar", "mlc", "trabalho", "marítimo"],
    description: "Abrir painel MLC",
    route: "/mlc-inspection",
  },
  {
    command: "open_ovid_panel",
    keywords: ["abrir", "painel", "ovid", "vessel inspection"],
    alternativeKeywords: ["mostrar", "ovid", "embarcação"],
    description: "Abrir painel OVID",
    route: "/ovid",
  },
  {
    command: "open_lsa_panel",
    keywords: ["abrir", "painel", "lsa", "life saving", "salva-vidas"],
    alternativeKeywords: ["mostrar", "lsa", "equipamento", "salvamento"],
    description: "Abrir painel LSA",
    route: "/lsa-inspection",
  },
  {
    command: "record_non_conformity",
    keywords: ["registrar", "não conformidade", "deficiência"],
    alternativeKeywords: ["anotar", "documentar", "problema"],
    description: "Registrar não conformidade",
  },
  {
    command: "show_dashboard",
    keywords: ["mostrar", "dashboard", "painel", "principal"],
    alternativeKeywords: ["voltar", "início", "home"],
    description: "Mostrar dashboard",
    route: "/dashboard",
  },
  {
    command: "open_reports",
    keywords: ["abrir", "relatórios", "reports"],
    alternativeKeywords: ["mostrar", "ver", "relatórios"],
    description: "Abrir relatórios",
    route: "/reports",
  },
  {
    command: "help",
    keywords: ["ajuda", "help", "comandos"],
    description: "Mostrar ajuda",
  },
  {
    command: "cancel",
    keywords: ["cancelar", "parar", "cancel", "stop"],
    description: "Cancelar",
  },
];

/**
 * Unique identifiers for specific module commands
 * Used for matching validation
 */
export const uniqueModuleIdentifiers = ["psc", "ism", "mlc", "ovid", "lsa"];

/**
 * Get command by name
 */
export function getCommandDefinition(
  command: VoiceCommand
): (typeof defaultCommands)[number] | undefined {
  return defaultCommands.find((c) => c.command === command);
}

/**
 * Get all commands with routes
 */
export function getNavigationCommands(): (typeof defaultCommands)[number][] {
  return defaultCommands.filter((c) => c.route);
}
