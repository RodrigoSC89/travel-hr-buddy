export interface AuditAgent {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  bgColor?: string;
  description: string;
  capabilities: string[];
  status: "active" | "idle" | "processing";
  compliance: string[];
  lastActivity?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
}
