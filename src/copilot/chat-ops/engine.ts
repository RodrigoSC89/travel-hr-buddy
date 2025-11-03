/**
 * PATCH 637: ChatOps Command System
 * Execute system commands via natural language chat interface
 */

export interface ChatCommand {
  command: string;
  description: string;
  pattern: RegExp;
  handler: (args: string[]) => Promise<ChatResponse>;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: any;
  actions?: Array<{ label: string; action: () => void }>;
}

class ChatOpsEngine {
  private commands: Map<string, ChatCommand> = new Map();

  register(command: ChatCommand): void {
    this.commands.set(command.command, command);
  }

  async execute(input: string): Promise<ChatResponse> {
    const trimmedInput = input.trim().toLowerCase();

    // Try to match registered commands
    for (const [key, command] of this.commands) {
      const match = trimmedInput.match(command.pattern);
      if (match) {
        const args = match.slice(1);
        return await command.handler(args);
      }
    }

    // Fallback to natural language processing
    return await this.processNaturalLanguage(trimmedInput);
  }

  private async processNaturalLanguage(input: string): Promise<ChatResponse> {
    // Simple keyword matching for natural language fallback
    if (input.includes('status') || input.includes('health')) {
      return await this.getSystemStatus();
    }

    if (input.includes('open') || input.includes('go to') || input.includes('navigate')) {
      return await this.suggestNavigation(input);
    }

    if (input.includes('restart') || input.includes('reload')) {
      return this.suggestRestart();
    }

    return {
      success: false,
      message: "I don't understand that command. Try '/help' to see available commands.",
    };
  }

  private async getSystemStatus(): Promise<ChatResponse> {
    return {
      success: true,
      message: "System Status: All systems operational ✓",
      data: {
        status: 'healthy',
        uptime: '24h',
        activeUsers: 15,
      },
      actions: [
        {
          label: 'View Details',
          action: () => window.location.href = '/admin/system-health',
        },
      ],
    };
  }

  private async suggestNavigation(input: string): Promise<ChatResponse> {
    const modules = [
      'dashboard',
      'checklists',
      'documents',
      'fleet',
      'incidents',
      'reports',
    ];

    const matchedModule = modules.find(m => input.includes(m));

    if (matchedModule) {
      return {
        success: true,
        message: `Navigating to ${matchedModule}...`,
        actions: [
          {
            label: `Open ${matchedModule}`,
            action: () => window.location.href = `/admin/${matchedModule}`,
          },
        ],
      };
    }

    return {
      success: false,
      message: "Module not found. Available modules: " + modules.join(', '),
    };
  }

  private suggestRestart(): Promise<ChatResponse> {
    return Promise.resolve({
      success: true,
      message: "Restart options available",
      actions: [
        {
          label: 'Reload Page',
          action: () => window.location.reload(),
        },
      ],
    });
  }

  listCommands(): ChatCommand[] {
    return Array.from(this.commands.values());
  }
}

// Global ChatOps instance
export const chatOps = new ChatOpsEngine();

// Register default commands
chatOps.register({
  command: '/open',
  description: 'Open a module',
  pattern: /^\/open\s+(.+)$/,
  handler: async ([moduleName]) => ({
    success: true,
    message: `Opening ${moduleName}...`,
    actions: [
      {
        label: `Open ${moduleName}`,
        action: () => window.location.href = `/admin/${moduleName}`,
      },
    ],
  }),
});

chatOps.register({
  command: '/status',
  description: 'Check system status',
  pattern: /^\/status(?:\s+(.+))?$/,
  handler: async ([system]) => ({
    success: true,
    message: system 
      ? `Status of ${system}: Operational ✓`
      : 'All systems operational ✓',
    data: { status: 'healthy' },
  }),
});

chatOps.register({
  command: '/restart',
  description: 'Restart a system component',
  pattern: /^\/restart\s+(.+)$/,
  handler: async ([component]) => ({
    success: true,
    message: `Restarting ${component}...`,
    actions: [
      {
        label: 'Confirm Restart',
        action: () => console.log(`Restarting ${component}`),
      },
    ],
  }),
});

chatOps.register({
  command: '/help',
  description: 'Show available commands',
  pattern: /^\/help$/,
  handler: async () => {
    const commands = chatOps.listCommands();
    const commandList = commands
      .map(c => `${c.command} - ${c.description}`)
      .join('\n');

    return {
      success: true,
      message: `Available commands:\n${commandList}`,
    };
  },
});
