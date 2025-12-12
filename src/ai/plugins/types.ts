
/**
 * PATCH 633: AI Plugin System Interface
 * Standardized interface for dynamically loadable AI plugins
 */

export interface AIPluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  enabled: boolean;
  requiredFeatureFlag?: string;
}

export interface AIPluginInput {
  context?: Record<string, any>;
  data?: any;
  parameters?: Record<string, any>;
}

export interface AIPluginOutput {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AIPlugin {
  metadata: AIPluginMetadata;
  run: (input: AIPluginInput) => Promise<AIPluginOutput>;
  validate?: (input: AIPluginInput) => boolean;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

/**
 * Base class for AI plugins
 */
export abstract class BaseAIPlugin implements AIPlugin {
  abstract metadata: AIPluginMetadata;
  abstract run(input: AIPluginInput): Promise<AIPluginOutput>;

  validate(input: AIPluginInput): boolean {
    return true;
  }

  async initialize(): Promise<void> {
    // Override if needed
  }

  async cleanup(): Promise<void> {
    // Override if needed
  }
}

/**
 * Plugin Registry
 */
class AIPluginRegistry {
  private plugins: Map<string, AIPlugin> = new Map();

  register(plugin: AIPlugin): void {
    if (this.plugins.has(plugin.metadata.name)) {
    }
    this.plugins.set(plugin.metadata.name, plugin);
  }

  unregister(pluginName: string): void {
    this.plugins.delete(pluginName);
  }

  get(pluginName: string): AIPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  list(): AIPlugin[] {
    return Array.from(this.plugins.values());
  }

  listEnabled(): AIPlugin[] {
    return this.list().filter(p => p.metadata.enabled);
  }

  async runPlugin(pluginName: string, input: AIPluginInput): Promise<AIPluginOutput> {
    const plugin = this.get(pluginName);
    
    if (!plugin) {
      return {
        success: false,
        error: `Plugin ${pluginName} not found`,
      };
    }

    if (!plugin.metadata.enabled) {
      return {
        success: false,
        error: `Plugin ${pluginName} is disabled`,
      };
    }

    if (plugin.validate) {
      try {
        const isValid = plugin.validate(input);
        if (!isValid) {
          return {
            success: false,
            error: `Plugin ${pluginName} input validation failed. Please check input parameters.`,
            metadata: { 
              providedInput: input,
              expectedFormat: "Refer to plugin documentation",
            },
          };
        }
      } catch (validationError) {
        return {
          success: false,
          error: `Plugin ${pluginName} validation error: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
        };
      }
    }

    try {
      return await plugin.run(input);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Global plugin registry instance
export const pluginRegistry = new AIPluginRegistry();
