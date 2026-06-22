import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, FunctionDeclaration } from '@google/generative-ai';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIToolCall,
  AIToolDefinition,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider, OnModuleInit {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: string;
  private readonly defaultTemperature: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

    this.logger.log(
      `Gemini key loaded: ${apiKey ? 'YES' : 'NO'} | Length: ${apiKey.length}`,
    );

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.configService.get<string>('AI_MODEL') || 'gemini-2.0-flash';
    this.logger.log(`Gemini model: ${this.model}`);
    this.defaultTemperature = this.configService.get<number>('AI_TEMPERATURE') || 0.7;
  }

  async onModuleInit() {
    await this.logAvailableModels();
  }

  private async logAvailableModels() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!apiKey) return;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      const data = await response.json() as { models?: Array<{ name: string; supportedGenerationMethods: string[] }> };

      if (data.models) {
        const generateModels = data.models
          .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
          .map((m) => m.name.replace('models/', ''));

        this.logger.log(`Gemini available generateContent models: ${generateModels.join(', ')}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to list Gemini models: ${(error as Error).message}`);
    }
  }

  getName(): string {
    return 'gemini';
  }

  getModel(): string {
    return this.model;
  }

  async listModels(): Promise<string[]> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!apiKey) return [];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      const data = await response.json() as { models?: Array<{ name: string; supportedGenerationMethods: string[] }> };

      if (data.models) {
        return data.models
          .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
          .map((m) => m.name.replace('models/', ''));
      }
      return [];
    } catch (error) {
      this.logger.warn(`Failed to list Gemini models: ${(error as Error).message}`);
      return [];
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const temperature = request.temperature ?? this.defaultTemperature;

    const modelConfig: Record<string, unknown> = {
      temperature,
      maxOutputTokens: request.maxTokens || 4096,
    };

    if (request.responseFormat === 'json') {
      modelConfig.responseMimeType = 'application/json';
    }

    const geminiTools = this.convertTools(request.tools);

    const model: GenerativeModel = this.genAI.getGenerativeModel({
      model: this.model,
      ...modelConfig,
      ...(geminiTools.length > 0 && { tools: geminiTools }),
    });

    const { history, systemInstruction, userContent } = this.buildHistory(request.messages);

    const chat = model.startChat({
      history,
      ...(systemInstruction && { systemInstruction }),
    });

    try {
      const result = await chat.sendMessage(userContent);
      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate) {
        return {
          content: '',
          finishReason: 'unknown',
          usage: this.extractUsage(response),
        };
      }

      const textParts = candidate.content.parts.filter(
        (p) => 'text' in p && p.text,
      );
      const functionCallParts = candidate.content.parts.filter(
        (p) => 'functionCall' in p && p.functionCall,
      );

      const textContent = textParts.length > 0
        ? textParts.map((p) => (p as { text: string }).text).join('')
        : null;

      const toolCalls: AIToolCall[] | undefined =
        functionCallParts.length > 0
          ? functionCallParts.map((p, index) => {
              const fc = (p as { functionCall: { name: string; args: Record<string, unknown> } }).functionCall;
              return {
                id: `gemini_call_${index}_${Date.now()}`,
                type: 'function' as const,
                function: {
                  name: fc.name,
                  arguments: JSON.stringify(fc.args),
                },
              };
            })
          : undefined;

      return {
        content: textContent,
        toolCalls,
        finishReason: this.mapFinishReason(candidate.finishReason),
        usage: this.extractUsage(response),
      };
    } catch (error) {
      this.logger.error(`Gemini completion failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private convertTools(
    tools?: AIToolDefinition[],
  ): { functionDeclarations: FunctionDeclaration[] }[] {
    if (!tools || tools.length === 0) return [];

    return [
      {
        functionDeclarations: tools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: {
            type: 'OBJECT',
            properties: tool.function.parameters.properties || {},
            required: (tool.function.parameters.required as string[]) || [],
          } as never,
        })),
      },
    ];
  }

  private buildHistory(
    messages: AICompletionRequest['messages'],
  ): {
    history: Array<{ role: string; parts: Array<{ text: string } | { functionCall: { name: string; args: Record<string, unknown> } } | { functionResponse: { name: string; response: Record<string, unknown> } }> }>;
    systemInstruction: string | null;
    userContent: string | Array<{ text: string } | { functionCall: { name: string; args: Record<string, unknown> } } | { functionResponse: { name: string; response: Record<string, unknown> } }>;
  } {
    let systemInstruction: string | null = null;
    const history: Array<{ role: string; parts: Array<{ text: string } | { functionCall: { name: string; args: Record<string, unknown> } } | { functionResponse: { name: string; response: Record<string, unknown> } }> }> = [];

    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role === 'system') {
        systemInstruction = msg.content || '';
        continue;
      }

      if (i === lastUserIndex) break;

      if (msg.role === 'user' && msg.content) {
        history.push({
          role: 'user',
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === 'assistant') {
        const parts: Array<{ text: string } | { functionCall: { name: string; args: Record<string, unknown> } }> = [];

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        if (msg.tool_calls) {
          for (const tc of msg.tool_calls) {
            parts.push({
              functionCall: {
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments),
              },
            });
          }
        }

        if (parts.length > 0) {
          history.push({ role: 'model', parts });
        }
      } else if (msg.role === 'tool' && msg.tool_call_id && msg.content) {
        const toolName = this.findToolNameForId(messages, msg.tool_call_id);
        if (toolName) {
          history.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: toolName,
                  response: JSON.parse(msg.content),
                },
              },
            ],
          });
        }
      }
    }

    const lastMsg = messages[lastUserIndex];
    let userContent: string | Array<{ text: string } | { functionCall: { name: string; args: Record<string, unknown> } } | { functionResponse: { name: string; response: Record<string, unknown> } }> = lastMsg?.content || '';

    return { history, systemInstruction, userContent };
  }

  private findToolNameForId(messages: AICompletionRequest['messages'], toolCallId: string): string | null {
    for (const msg of messages) {
      if (msg.role === 'assistant' && msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.id === toolCallId) return tc.function.name;
        }
      }
    }
    return null;
  }

  private mapFinishReason(reason?: string): string {
    switch (reason) {
      case 'STOP': return 'stop';
      case 'MAX_TOKENS': return 'length';
      case 'SAFETY': return 'content_filter';
      case 'RECITATION': return 'content_filter';
      default: return reason || 'unknown';
    }
  }

  private extractUsage(response: { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }) {
    const meta = response.usageMetadata;
    if (!meta) return undefined;
    return {
      promptTokens: meta.promptTokenCount || 0,
      completionTokens: meta.candidatesTokenCount || 0,
      totalTokens: meta.totalTokenCount || 0,
    };
  }
}
