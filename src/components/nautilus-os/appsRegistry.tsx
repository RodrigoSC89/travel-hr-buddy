import { Activity, Brain, Compass, FileText, Settings } from "lucide-react";
import { SystemMonitor } from "./apps/SystemMonitor";
import { LLMConsole } from "./apps/LLMConsole";
import { CopilotPanel } from "./apps/CopilotPanel";
import { LogsViewer } from "./apps/LogsViewer";
import { ModulesControl } from "./apps/ModulesControl";

export const appsRegistry = {
  SystemMonitor: {
    title: "Monitoramento do Sistema",
    icon: Activity,
    component: SystemMonitor,
  },
  LLMConsole: {
    title: "Console IA",
    icon: Brain,
    component: LLMConsole,
  },
  Copilot: {
    title: "Copiloto IA",
    icon: Compass,
    component: CopilotPanel,
  },
  LogsViewer: {
    title: "Logs em Tempo Real",
    icon: FileText,
    component: LogsViewer,
  },
  ModulesControl: {
    title: "Gerenciar Módulos",
    icon: Settings,
    component: ModulesControl,
  },
};
