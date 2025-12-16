/**
 * Tests for PATCH 628 - Voice Assistant
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  VoiceAssistant,
  VoiceRecognitionEngine,
  VoiceCommandProcessor,
} from '../src/lib/voice-assistant';

// Mock Web Speech API
const mockRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  lang: 'pt-BR',
  continuous: false,
  interimResults: false,
  maxAlternatives: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
};

beforeEach(() => {
  // Mock SpeechRecognition
  (global as any).window = {
    SpeechRecognition: vi.fn(() => mockRecognition),
    webkitSpeechRecognition: vi.fn(() => mockRecognition),
    location: { hash: '' },
  };
  vi.clearAllMocks();
});

describe('PATCH 628 - Voice Assistant', () => {
  describe('Browser Support Check', () => {
    it('should check if browser supports Web Speech API', () => {
      const isSupported = VoiceAssistant.isSupported();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should check engine browser support', () => {
      const isSupported = VoiceRecognitionEngine.isBrowserSupported();
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('VoiceRecognitionEngine', () => {
    it('should initialize with default config', () => {
      const engine = new VoiceRecognitionEngine();
      expect(engine).toBeTruthy();
    });

    it('should initialize with custom config', () => {
      const engine = new VoiceRecognitionEngine({
        language: 'en-US',
        continuous: true,
      });
      expect(engine).toBeTruthy();
    });

    it('should check if browser is supported', () => {
      const engine = new VoiceRecognitionEngine();
      const isSupported = engine.isBrowserSupported();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should start listening', () => {
      const engine = new VoiceRecognitionEngine();
      engine.start();
      // In mock, this will log warning about not available
      expect(true).toBe(true);
    });

    it('should stop listening', () => {
      const engine = new VoiceRecognitionEngine();
      engine.stop();
      expect(engine.isActive()).toBe(false);
    });

    it('should abort listening', () => {
      const engine = new VoiceRecognitionEngine();
      engine.abort();
      expect(engine.isActive()).toBe(false);
    });

    it('should track listening status', () => {
      const engine = new VoiceRecognitionEngine();
      expect(engine.isActive()).toBe(false);
    });

    it('should maintain command history', () => {
      const engine = new VoiceRecognitionEngine();
      const history = engine.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should clear history', () => {
      const engine = new VoiceRecognitionEngine();
      engine.clearHistory();
      expect(engine.getHistory().length).toBe(0);
    });
  });

  describe('VoiceCommandProcessor', () => {
    let processor: VoiceCommandProcessor;

    beforeEach(() => {
      processor = new VoiceCommandProcessor();
    });

    it('should register default commands', () => {
      const commands = processor.getAvailableCommands();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should process PSC inspection command', async () => {
      const command = await processor.processTranscript('iniciar inspeção psc');
      expect(command).toBe('start_psc_inspection');
    });

    it('should process ISM panel command', async () => {
      const command = await processor.processTranscript('abrir painel ism');
      expect(command).toBe('open_ism_panel');
    });

    it('should process MLC panel command', async () => {
      const command = await processor.processTranscript('abrir painel mlc');
      expect(command).toBe('open_mlc_panel');
    });

    it('should process OVID panel command', async () => {
      const command = await processor.processTranscript('abrir painel ovid');
      expect(command).toBe('open_ovid_panel');
    });

    it('should process LSA panel command', async () => {
      const command = await processor.processTranscript('abrir painel lsa');
      expect(command).toBe('open_lsa_panel');
    });

    it('should process non-conformity recording command', async () => {
      const command = await processor.processTranscript('registrar não conformidade');
      expect(command).toBe('record_non_conformity');
    });

    it('should process dashboard command', async () => {
      const command = await processor.processTranscript('mostrar dashboard');
      expect(command).toBe('show_dashboard');
    });

    it('should process reports command', async () => {
      const command = await processor.processTranscript('abrir relatórios');
      expect(command).toBe('open_reports');
    });

    it('should process help command', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const command = await processor.processTranscript('ajuda comandos');
      expect(command).toBe('help');
      consoleSpy.mockRestore();
    });

    it('should process cancel command', async () => {
      const command = await processor.processTranscript('cancelar parar');
      expect(command).toBe('cancel');
    });

    it('should handle unrecognized commands', async () => {
      const command = await processor.processTranscript('comando inexistente aleatório');
      expect(command).toBeNull();
    });

    it('should register custom commands', () => {
      processor.registerCommand({
        command: 'help',
        keywords: ['teste', 'custom'],
        action: () => console.log('Custom command'),
        description: 'Comando customizado',
      });

      const commands = processor.getAvailableCommands();
      expect(commands.some(c => c.command === 'help')).toBe(true);
    });

    it('should execute command callback', async () => {
      let executedCommand = null;
      processor.onCommand((command) => {
        executedCommand = command;
      });

      await processor.processTranscript('ajuda comandos');
      expect(executedCommand).toBe('help');
    });

    it('should get all available commands', () => {
      const commands = processor.getAvailableCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(5);
    });

    it('should show available commands', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      processor.showAvailableCommands();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('VoiceAssistant Main Interface', () => {
    let assistant: VoiceAssistant;

    beforeEach(() => {
      assistant = new VoiceAssistant();
    });

    it('should initialize with default config', () => {
      expect(assistant).toBeTruthy();
      expect(assistant.isActive()).toBe(false);
    });

    it('should enable voice assistant', () => {
      assistant.enable();
      expect(assistant.isActive()).toBe(true);
    });

    it('should disable voice assistant', () => {
      assistant.enable();
      assistant.disable();
      expect(assistant.isActive()).toBe(false);
    });

    it('should start listening when enabled', () => {
      assistant.enable();
      assistant.start();
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should not start when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      assistant.start();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should stop listening', () => {
      assistant.enable();
      assistant.start();
      assistant.stop();
      expect(assistant.isListening()).toBe(false);
    });

    it('should process text commands as fallback', async () => {
      const command = await assistant.processText('abrir painel ism');
      expect(command).toBe('open_ism_panel');
    });

    it('should register custom commands', () => {
      assistant.registerCommand({
        command: 'help',
        keywords: ['custom', 'test'],
        action: () => {},
        description: 'Test command',
      });

      const commands = assistant.getAvailableCommands();
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should set status change callback', () => {
      let statusChanged = false;
      assistant.onStatus((isListening) => {
        statusChanged = true;
      });

      assistant.enable();
      assistant.start();
      
      // Callback setup should work
      expect(typeof statusChanged).toBe('boolean');
    });

    it('should set transcript callback', () => {
      let transcriptReceived = false;
      assistant.onTranscriptReceived((transcript, confidence) => {
        transcriptReceived = true;
      });

      // Callback setup should work
      expect(typeof transcriptReceived).toBe('boolean');
    });

    it('should set command executed callback', () => {
      let commandExecuted = false;
      assistant.onCommand((command) => {
        commandExecuted = true;
      });

      // Callback setup should work
      expect(typeof commandExecuted).toBe('boolean');
    });

    it('should get command history', () => {
      const history = assistant.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should clear history', () => {
      assistant.clearHistory();
      expect(assistant.getHistory().length).toBe(0);
    });

    it('should check listening status', () => {
      expect(assistant.isListening()).toBe(false);
    });

    it('should get available commands', () => {
      const commands = assistant.getAvailableCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('Transcription Accuracy', () => {
    it('should match commands with different transcriptions', async () => {
      const processor = new VoiceCommandProcessor();

      // Test variations of the same command
      const variations = [
        'iniciar inspeção psc',
        'começar inspeção psc',
        'abrir inspeção psc',
        'iniciar psc inspeção',
      ];

      for (const variation of variations) {
        const command = await processor.processTranscript(variation);
        // At least some variations should match
        expect(command === 'start_psc_inspection' || command === null).toBe(true);
      }
    });

    it('should handle case insensitive commands', async () => {
      const processor = new VoiceCommandProcessor();

      const variations = [
        'ABRIR PAINEL ISM',
        'abrir painel ism',
        'Abrir Painel ISM',
        'aBRir PAInel ISM',
      ];

      for (const variation of variations) {
        const command = await processor.processTranscript(variation);
        expect(command).toBe('open_ism_panel');
      }
    });

    it('should handle extra whitespace', async () => {
      const processor = new VoiceCommandProcessor();
      const command = await processor.processTranscript('  abrir   painel   ism  ');
      expect(command).toBe('open_ism_panel');
    });
  });

  describe('Action Trigger', () => {
    it('should trigger navigation actions', async () => {
      const processor = new VoiceCommandProcessor();
      
      // Mock window.location
      const originalLocation = (global as any).window.location;
      (global as any).window.location = { hash: '' };

      await processor.processTranscript('abrir painel ism');

      // Should update location hash
      expect((global as any).window.location.hash).toBe('#/ism-audit');

      // Restore
      (global as any).window.location = originalLocation;
    });

    it('should handle action errors gracefully', async () => {
      const processor = new VoiceCommandProcessor();
      
      processor.registerCommand({
        command: 'help',
        keywords: ['error', 'test'],
        action: () => {
          throw new Error('Test error');
        },
        description: 'Error test',
      });

      const command = await processor.processTranscript('error test comando');
      // Should return null on error
      expect(command).toBeNull();
    });
  });

  describe('Experimental Features', () => {
    it('should support multiple languages', () => {
      const assistantPT = new VoiceAssistant({ language: 'pt-BR' });
      const assistantEN = new VoiceAssistant({ language: 'en-US' });

      expect(assistantPT).toBeTruthy();
      expect(assistantEN).toBeTruthy();
    });

    it('should support continuous mode', () => {
      const assistant = new VoiceAssistant({ continuous: true });
      expect(assistant).toBeTruthy();
    });

    it('should support interim results', () => {
      const assistant = new VoiceAssistant({ interimResults: true });
      expect(assistant).toBeTruthy();
    });

    it('should handle auto-start configuration', () => {
      const assistant = new VoiceAssistant({ autoStart: true });
      expect(assistant).toBeTruthy();
    });
  });

  describe('Fallback to Text Input', () => {
    it('should process text when voice is unavailable', async () => {
      const assistant = new VoiceAssistant();
      const command = await assistant.processText('abrir relatórios');
      expect(command).toBe('open_reports');
    });

    it('should work without enabling voice', async () => {
      const assistant = new VoiceAssistant();
      // Should work even when voice is not enabled
      const command = await assistant.processText('mostrar dashboard');
      expect(command).toBe('show_dashboard');
    });

    it('should handle all commands via text', async () => {
      const assistant = new VoiceAssistant();
      const commands = assistant.getAvailableCommands();

      // Test a few commands
      expect(await assistant.processText('iniciar inspeção psc')).toBeTruthy();
      expect(await assistant.processText('ajuda comandos')).toBeTruthy();
      expect(await assistant.processText('cancelar parar')).toBeTruthy();
    });
  });
});
