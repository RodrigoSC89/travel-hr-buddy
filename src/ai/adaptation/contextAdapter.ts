// @ts-nocheck
/**
 * PATCH 240 - Contextual Response Adapter
 * Adapts AI responses based on multimodal context
 * 
 * @module ai/adaptation/contextAdapter
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export type ResponseMode = 'voice' | 'text' | 'visual' | 'xr' | 'gesture';
export type ResponsePriority = 'low' | 'medium' | 'high' | 'critical';

export interface MultimodalContext {
  mode: ResponseMode;
  userIntent?: string;
  environment?: string;
  capabilities?: string[];
  constraints?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  mode: ResponseMode;
  priority: ResponsePriority;
  adaptations?: string[];
  metadata?: Record<string, any>;
}

export interface AdaptedResponse {
  original: AIResponse;
  adapted: string;
  mode: ResponseMode;
  reasoning: string;
  timestamp: string;
}

class ContextualResponseAdapter {
  private adaptationHistory: AdaptedResponse[] = [];

  /**
   * Process and adapt AI response based on context
   */
  async adaptResponse(
    aiResponse: AIResponse,
    context: MultimodalContext
  ): Promise<AdaptedResponse> {
    logger.info('[ContextAdapter] Adapting response for mode:', context.mode);

    try {
      let adapted = aiResponse.content;
      let reasoning = '';
      const adaptations: string[] = [];

      // Apply mode-specific adaptations
      switch (context.mode) {
        case 'voice':
          adapted = this.adaptForVoice(aiResponse.content);
          reasoning = 'Simplified for voice output, removed formatting';
          adaptations.push('voice_optimized');
          break;

        case 'xr':
          adapted = this.adaptForXR(aiResponse.content, context);
          reasoning = 'Formatted for XR overlay display';
          adaptations.push('xr_formatted', 'spatial_aware');
          break;

        case 'gesture':
          adapted = this.adaptForGesture(aiResponse.content);
          reasoning = 'Converted to gesture-friendly format';
          adaptations.push('gesture_commands');
          break;

        case 'visual':
          adapted = this.adaptForVisual(aiResponse.content);
          reasoning = 'Enhanced with visual elements';
          adaptations.push('visual_enhanced');
          break;

        case 'text':
        default:
          adapted = this.adaptForText(aiResponse.content, context);
          reasoning = 'Formatted for text display';
          adaptations.push('text_formatted');
      }

      // Apply priority-based adaptations
      if (aiResponse.priority === 'critical') {
        adapted = this.emphasizeCritical(adapted, context.mode);
        adaptations.push('priority_emphasized');
      }

      // Apply environment-specific adaptations
      if (context.environment) {
        adapted = this.adaptForEnvironment(adapted, context.environment);
        adaptations.push(`env_${context.environment}`);
      }

      const adaptedResponse: AdaptedResponse = {
        original: aiResponse,
        adapted,
        mode: context.mode,
        reasoning,
        timestamp: new Date().toISOString()
      };

      this.adaptationHistory.push(adaptedResponse);
      await this.logAdaptation(adaptedResponse, adaptations);

      logger.info('[ContextAdapter] ✓ Response adapted');
      return adaptedResponse;
    } catch (error) {
      logger.error('[ContextAdapter] Adaptation failed:', error);
      
      // Fallback to original
      return {
        original: aiResponse,
        adapted: aiResponse.content,
        mode: context.mode,
        reasoning: 'Fallback: adaptation failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Adapt for voice output
   */
  private adaptForVoice(content: string): string {
    let adapted = content;

    // Remove markdown formatting
    adapted = adapted.replace(/[*_~`#]/g, '');
    
    // Remove URLs
    adapted = adapted.replace(/https?:\/\/[^\s]+/g, '');
    
    // Simplify numbers
    adapted = adapted.replace(/(\d+)\.(\d+)/g, '$1 point $2');
    
    // Add pauses
    adapted = adapted.replace(/\. /g, '... ');
    
    // Limit length (voice should be concise)
    const sentences = adapted.split('. ');
    if (sentences.length > 3) {
      adapted = sentences.slice(0, 3).join('. ') + '.';
    }

    return adapted;
  }

  /**
   * Adapt for XR display
   */
  private adaptForXR(content: string, context: MultimodalContext): string {
    let adapted = content;

    // Split into chunks for spatial display
    const chunks = this.splitIntoChunks(adapted, 50);
    
    // Add spatial markers
    adapted = chunks.map((chunk, i) => `[Panel ${i + 1}]\n${chunk}`).join('\n\n');
    
    // Add interaction hints
    if (context.capabilities?.includes('gesture')) {
      adapted += '\n\n[Swipe to navigate]';
    }

    return adapted;
  }

  /**
   * Adapt for gesture control
   */
  private adaptForGesture(content: string): string {
    // Convert to action items
    const actions = this.extractActions(content);
    
    if (actions.length === 0) {
      return '👉 ' + content;
    }

    return actions.map((action, i) => `${i + 1}️⃣ ${action}`).join('\n');
  }

  /**
   * Adapt for visual display
   */
  private adaptForVisual(content: string): string {
    let adapted = content;

    // Add emoji for keywords
    adapted = this.addEmojis(adapted);
    
    // Format lists
    adapted = adapted.replace(/- /g, '• ');
    
    // Highlight important words
    adapted = adapted.replace(/\*\*(.*?)\*\*/g, '🔥 $1');

    return adapted;
  }

  /**
   * Adapt for text display
   */
  private adaptForText(content: string, context: MultimodalContext): string {
    let adapted = content;

    // Apply constraints if any
    if (context.constraints?.maxLength) {
      adapted = this.truncateText(adapted, context.constraints.maxLength);
    }

    // Format markdown properly
    adapted = this.formatMarkdown(adapted);

    return adapted;
  }

  /**
   * Emphasize critical content
   */
  private emphasizeCritical(content: string, mode: ResponseMode): string {
    switch (mode) {
      case 'voice':
        return `ATTENTION! ${content}`;
      case 'xr':
        return `⚠️ CRITICAL ⚠️\n\n${content}`;
      case 'text':
        return `🚨 **CRITICAL** 🚨\n\n${content}`;
      default:
        return `⚠️ ${content}`;
    }
  }

  /**
   * Adapt for specific environment
   */
  private adaptForEnvironment(content: string, environment: string): string {
    switch (environment) {
      case 'noisy':
        return content.toUpperCase();
      case 'bright':
        return `[High Contrast]\n${content}`;
      case 'dark':
        return `[Night Mode]\n${content}`;
      default:
        return content;
    }
  }

  /**
   * Split text into chunks
   */
  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let current = '';

    for (const word of words) {
      if ((current + ' ' + word).length > maxChunkSize) {
        chunks.push(current.trim());
        current = word;
      } else {
        current += (current ? ' ' : '') + word;
      }
    }

    if (current) {
      chunks.push(current.trim());
    }

    return chunks;
  }

  /**
   * Extract action items from text
   */
  private extractActions(text: string): string[] {
    const actionWords = ['click', 'press', 'swipe', 'tap', 'select', 'open', 'close', 'go'];
    const sentences = text.split(/[.!?]/);
    
    return sentences
      .filter(s => actionWords.some(word => s.toLowerCase().includes(word)))
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Add emojis to text
   */
  private addEmojis(text: string): string {
    const emojiMap: Record<string, string> = {
      'warning': '⚠️',
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️',
      'question': '❓',
      'ship': '🚢',
      'alert': '🚨',
      'check': '✔️'
    };

    let result = text;
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      result = result.replace(regex, `${emoji} $&`);
    }

    return result;
  }

  /**
   * Truncate text to max length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Format markdown properly
   */
  private formatMarkdown(text: string): string {
    // Ensure proper spacing
    let formatted = text;
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/([.!?])\s*\n/g, '$1\n\n');
    
    return formatted.trim();
  }

  /**
   * Log adaptation to database
   */
  private async logAdaptation(response: AdaptedResponse, adaptations: string[]): Promise<void> {
    try {
      await supabase.from('response_adaptation_log').insert({
        original_content: response.original.content,
        adapted_content: response.adapted,
        mode: response.mode,
        adaptations,
        reasoning: response.reasoning,
        timestamp: response.timestamp
      });
    } catch (error) {
      logger.error('[ContextAdapter] Failed to log adaptation:', error);
    }
  }

  /**
   * Get adaptation history
   */
  getHistory(limit: number = 20): AdaptedResponse[] {
    return this.adaptationHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats() {
    const modeBreakdown: Record<ResponseMode, number> = {
      voice: 0,
      text: 0,
      visual: 0,
      xr: 0,
      gesture: 0
    };

    this.adaptationHistory.forEach(a => {
      modeBreakdown[a.mode]++;
    });

    return {
      totalAdaptations: this.adaptationHistory.length,
      modeBreakdown,
      averageAdaptedLength: this.adaptationHistory.reduce(
        (sum, a) => sum + a.adapted.length, 0
      ) / this.adaptationHistory.length || 0
    };
  }
}

export const contextualResponseAdapter = new ContextualResponseAdapter();
