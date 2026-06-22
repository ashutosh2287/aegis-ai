import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly defaultTemperature: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';
    this.defaultTemperature = this.configService.get<number>('AI_TEMPERATURE') || 0.7;
  }

  getName(): string {
    return 'openai';
  }

  getModel(): string {
    return this.model;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const temperature = request.temperature ?? this.defaultTemperature;

    const sdkMessages: OpenAI.ChatCompletionMessageParam[] = request.messages.map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content || '',
          tool_call_id: m.tool_call_id!,
        };
      }
      if (m.role === 'assistant' && m.tool_calls) {
        return {
          role: 'assistant' as const,
          content: m.content,
          tool_calls: m.tool_calls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
        };
      }
      return {
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content || '',
      };
    });

    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: sdkMessages,
      temperature,
      max_tokens: request.maxTokens || 4096,
    };

    if (request.responseFormat === 'json') {
      params.response_format = { type: 'json_object' };
    }

    if (request.tools && request.tools.length > 0) {
      params.tools = request.tools as OpenAI.ChatCompletionTool[];
      params.tool_choice = (request.toolChoice as OpenAI.ChatCompletionToolChoiceOption) || 'auto';
    }

    try {
      const response = await this.client.chat.completions.create(params);
      const choice = response.choices[0];

      return {
        content: choice.message.content,
        toolCalls: choice.message.tool_calls
          ? choice.message.tool_calls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.function.name, arguments: tc.function.arguments },
            }))
          : undefined,
        finishReason: choice.finish_reason,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error(`OpenAI completion failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
