/**
 * Voice Command Processor
 * Processes transcripts and executes matching commands
 */

import { logger } from "@/lib/logger";
import { VoiceCommand, VoiceCommandConfig } from "./types";
import { defaultCommands } from "./command-registry";
import { matchesCommand } from "./command-matcher";

export class VoiceCommandProcessor {
  private commands: Map<VoiceCommand, VoiceCommandConfig> = new Map();
  private onCommandExecuted?: (command: VoiceCommand, transcript: string) => void;

  constructor() {
    this.registerDefaultCommands();
  }

  /**
   * Register default commands from registry
   */
  private registerDefaultCommands(): void {
    for (const cmdDef of defaultCommands) {
      const config: VoiceCommandConfig = {
        ...cmdDef,
        action: this.createAction(cmdDef),
      };
      this.commands.set(cmdDef.command, config);
    }
  }

  /**
   * Create action for command
   */
  private createAction(
    cmdDef: (typeof defaultCommands)[number]
  ): () => void | Promise<void> {
    return () => {
      logger.debug(`Executing command: ${cmdDef.command}`);

      // Handle navigation commands
      if (cmdDef.route && typeof window !== "undefined") {
        window.location.hash = `#${cmdDef.route}`;
        return;
      }

      // Handle special commands
      if (cmdDef.command === "help") {
        this.showAvailableCommands();
        return;
      }

      // Default: just log
      logger.info(`Command executed: ${cmdDef.command}`);
    };
  }

  /**
   * Register a voice command
   */
  registerCommand(config: VoiceCommandConfig): void {
    this.commands.set(config.command, config);
  }

  /**
   * Process transcript and execute command
   */
  async processTranscript(transcript: string): Promise<VoiceCommand | null> {
    // Find matching command
    for (const [command, config] of this.commands.entries()) {
      if (matchesCommand(transcript, config)) {
        try {
          if (config.action) {
            await config.action();
          }

          if (this.onCommandExecuted) {
            this.onCommandExecuted(command, transcript);
          }

          return command;
        } catch (error) {
          logger.error("Error executing command", {
            command,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      }
    }

    logger.debug("No matching command found", { transcript });
    return null;
  }

  /**
   * Set command executed callback
   */
  onCommand(callback: (command: VoiceCommand, transcript: string) => void): void {
    this.onCommandExecuted = callback;
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): VoiceCommandConfig[] {
    return Array.from(this.commands.values());
  }

  /**
   * Show available commands
   */
  showAvailableCommands(): void {
    logger.info("Available voice commands:");
    this.commands.forEach((config) => {
      logger.info(`- ${config.description}: ${config.keywords.join(", ")}`);
    });
  }
}
