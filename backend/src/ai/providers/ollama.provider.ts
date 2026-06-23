import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIToolCall,
  AIToolDefinition,
} from '../interfaces/ai-provider.interface';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: {
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }[];
  tool_call_id?: string;
}

interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

interface OllamaChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
    thinking?: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

interface OllamaTagsResponse {
  models: Array<{
    name: string;
    size: number;
    digest: string;
    modified_at: string;
  }>;
}

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly defaultTemperature: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.model = this.configService.get<string>('AI_MODEL') || 'qwen3:8b';
    this.defaultTemperature = this.configService.get<number>('AI_TEMPERATURE') || 0.7;
    this.logger.log(`Ollama provider initialized: baseUrl=${this.baseUrl}, model=${this.model}`);
  }

  getName(): string {
    return 'ollama';
  }

  getModel(): string {
    return this.model;
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        this.logger.warn(`Failed to list Ollama models: ${response.statusText}`);
        return [];
      }
      const data = (await response.json()) as OllamaTagsResponse;
      return data.models?.map((m) => m.name) || [];
    } catch (error) {
      this.logger.warn(`Failed to list Ollama models: ${(error as Error).message}`);
      return [];
    }
  }

  async healthCheck(): Promise<{ status: string; error?: string; availableModels?: string[] }> {
    try {
      const tagsResponse = await fetch(`${this.baseUrl}/api/tags`);
      if (!tagsResponse.ok) {
        return {
          status: 'unhealthy',
          error: `Ollama server responded with ${tagsResponse.status}: ${tagsResponse.statusText}`,
        };
      }

      const tagsData = (await tagsResponse.json()) as OllamaTagsResponse;
      const availableModels = tagsData.models?.map((m) => m.name) || [];

      if (!availableModels.includes(this.model)) {
        return {
          status: 'unhealthy',
          error: `Model '${this.model}' is not available on the Ollama server`,
          availableModels,
        };
      }

      return { status: 'healthy', availableModels };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: `Cannot reach Ollama server at ${this.baseUrl}: ${(error as Error).message}`,
      };
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || this.model;
    const temperature = request.temperature ?? this.defaultTemperature;
    const startTime = Date.now();
    console.log(`[OLLAMA] Starting completion: model=${model}, messages=${request.messages.length}, tools=${request.tools?.length || 0}`);

    const messages: OllamaMessage[] = request.messages.map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content || '',
          tool_call_id: m.tool_call_id,
        };
      }

      if (m.role === 'assistant' && m.tool_calls) {
        return {
          role: 'assistant' as const,
          content: m.content,
          tool_calls: m.tool_calls.map((tc) => ({
            function: {
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments),
            },
          })),
        };
      }

      return {
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content || '',
      };
    });

    const requestBody: Record<string, unknown> = {
      model,
      messages,
      stream: false,
      think: false,
      options: {
        temperature,
        num_predict: request.maxTokens || 4096,
      },
    };

    if (request.responseFormat === 'json') {
      requestBody.format = 'json';
    }

    if (request.tools && request.tools.length > 0) {
      requestBody.tools = request.tools.map((t) => this.convertToolDefinition(t));
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Ollama API error ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as OllamaChatResponse;

      const toolCalls: AIToolCall[] | undefined =
        data.message.tool_calls && data.message.tool_calls.length > 0
          ? data.message.tool_calls.map((tc, index) => ({
              id: `ollama_call_${index}_${Date.now()}`,
              type: 'function' as const,
              function: {
                name: tc.function.name,
                arguments: JSON.stringify(tc.function.arguments),
              },
            }))
          : undefined;

      const usage = data.prompt_eval_count || data.eval_count
        ? {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          }
        : undefined;

      const content = data.message.content || data.message.thinking || null;
      const elapsed = Date.now() - startTime;
      console.log(`[OLLAMA] Completed in ${elapsed}ms: toolCalls=${toolCalls?.length || 0}, tokens=${usage?.totalTokens || 'N/A'}`);

      return {
        content,
        toolCalls,
        finishReason: data.done ? (toolCalls ? 'tool_calls' : 'stop') : 'length',
        usage,
      };
    } catch (error) {
      this.logger.error(`Ollama completion failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private convertToolDefinition(tool: AIToolDefinition): {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  } {
    return {
      type: 'function',
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      },
    };
  }
}
