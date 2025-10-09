/**
 * OpenAI API Service
 * Consolidates OpenAI GPT and Whisper integrations
 * 
 * Documentation: https://platform.openai.com/docs
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  functions?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface TranscriptionOptions {
  audioBlob: Blob;
  model?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
}

interface ImageGenerationOptions {
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  model?: 'dall-e-2' | 'dall-e-3';
}

export class OpenAIService {
  private baseUrl = 'https://api.openai.com/v1';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4',
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          functions: options.functions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices.map((choice: any) => ({
          index: choice.index,
          message: choice.message,
          finishReason: choice.finish_reason,
        })),
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI chat completion error:', error);
      throw error;
    }
  }

  /**
   * Simple chat - send a message and get a response
   */
  async chat(message: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });

    const response = await this.createChatCompletion({
      model: 'gpt-4',
      messages,
    });

    return response.choices[0].message.content;
  }

  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(options: TranscriptionOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', options.audioBlob, 'audio.webm');
      formData.append('model', options.model || 'whisper-1');
      
      if (options.language) {
        formData.append('language', options.language);
      }
      
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
      }

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw error;
    }
  }

  /**
   * Translate audio to English using Whisper
   */
  async translateAudio(audioBlob: Blob): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch(`${this.baseUrl}/audio/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper translation error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw error;
    }
  }

  /**
   * Generate image using DALL-E
   */
  async generateImage(options: ImageGenerationOptions): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'dall-e-3',
          prompt: options.prompt,
          n: options.n || 1,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DALL-E API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.url);
    } catch (error) {
      console.error('OpenAI image generation error:', error);
      throw error;
    }
  }

  /**
   * Get embeddings for text
   */
  async createEmbedding(text: string, model: string = 'text-embedding-ada-002'): Promise<number[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Embeddings API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embeddings error:', error);
      throw error;
    }
  }

  /**
   * Stream chat completion (for real-time responses)
   */
  async *streamChatCompletion(options: ChatCompletionOptions): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4',
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI stream error:', error);
      throw error;
    }
  }

  /**
   * Analyze document/text
   */
  async analyzeDocument(text: string, analysisType: string = 'general'): Promise<string> {
    const prompts: Record<string, string> = {
      general: 'Analise o seguinte documento e forneça um resumo detalhado com os pontos principais:',
      summary: 'Crie um resumo executivo conciso do seguinte documento:',
      keypoints: 'Extraia os pontos-chave e insights principais do seguinte documento:',
      sentiment: 'Analise o sentimento e tom do seguinte documento:',
      entities: 'Identifique e extraia todas as entidades importantes (pessoas, empresas, locais, datas) do seguinte documento:',
    };

    const prompt = prompts[analysisType] || prompts.general;
    return this.chat(`${prompt}\n\n${text}`);
  }

  /**
   * Generate predictions based on data
   */
  async generatePredictions(data: any, context: string): Promise<string> {
    const prompt = `
Com base nos seguintes dados e contexto, gere previsões e insights:

Contexto: ${context}

Dados:
${JSON.stringify(data, null, 2)}

Forneça:
1. Análise das tendências
2. Previsões para o próximo período
3. Recomendações baseadas em dados
4. Riscos e oportunidades identificados
`;

    return this.chat(prompt);
  }

  /**
   * Get available models
   */
  async listModels(): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('OpenAI list models error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();

// Backward compatibility - test function for api-tester.tsx
export interface OpenAITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}

export async function testOpenAIConnection(): Promise<OpenAITestResult> {
  const startTime = Date.now();
  
  if (!openaiService.isConfigured()) {
    return {
      success: false,
      message: 'OpenAI API key not configured',
      error: 'Missing VITE_OPENAI_API_KEY',
    };
  }

  try {
    // Test by listing models
    await openaiService.listModels();
    
    return {
      success: true,
      message: 'OpenAI API connection successful',
      responseTime: Date.now() - startTime,
      data: { configured: true },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to OpenAI API',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

