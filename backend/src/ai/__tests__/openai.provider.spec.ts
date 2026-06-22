import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from '../providers/openai.provider';

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                OPENAI_API_KEY: 'test-api-key',
                AI_MODEL: 'gpt-4o-mini',
                AI_TEMPERATURE: 0.7,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getName', () => {
    it('should return openai', () => {
      expect(provider.getName()).toBe('openai');
    });
  });

  describe('getModel', () => {
    it('should return the configured model', () => {
      expect(provider.getModel()).toBe('gpt-4o-mini');
    });
  });

  describe('complete', () => {
    it('should return content when model finishes without tool calls', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: { content: 'Hello!', role: 'assistant', tool_calls: null },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      });

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.content).toBe('Hello!');
      expect(result.finishReason).toBe('stop');
      expect(result.usage?.totalTokens).toBe(15);
    });

    it('should return tool calls when model requests them', async () => {
      const toolCalls = [
        {
          id: 'call_abc',
          type: 'function',
          function: { name: 'getUserProfile', arguments: '{"userId":"user-1"}' },
        },
      ];

      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: { content: null, role: 'assistant', tool_calls: toolCalls },
            finish_reason: 'tool_calls',
          },
        ],
        usage: null,
      });

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Get my profile' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'getUserProfile',
              description: 'Get user profile',
              parameters: { type: 'object', properties: { userId: { type: 'string' } } },
            },
          },
        ],
      });

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls?.length).toBe(1);
      expect(result.toolCalls?.[0].function.name).toBe('getUserProfile');
      expect(result.toolCalls?.[0].type).toBe('function');
      expect(result.finishReason).toBe('tool_calls');
    });

    it('should pass tools and tool_choice to OpenAI', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'OK', role: 'assistant' }, finish_reason: 'stop' }],
        usage: null,
      });

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'test',
              description: 'test',
              parameters: { type: 'object', properties: {} },
            },
          },
        ],
        toolChoice: 'auto',
      });

      const params = mockCreate.mock.calls[0][0];
      expect(params.tools).toHaveLength(1);
      expect(params.tool_choice).toBe('auto');
    });

    it('should set response_format for json responses', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{}', role: 'assistant' }, finish_reason: 'stop' }],
        usage: null,
      });

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      await provider.complete({
        messages: [{ role: 'user', content: 'Return JSON' }],
        responseFormat: 'json',
      });

      const params = mockCreate.mock.calls[0][0];
      expect(params.response_format).toEqual({ type: 'json_object' });
    });

    it('should map assistant tool_calls to AIToolCall format', async () => {
      const toolCalls = [
        {
          id: 'call_xyz',
          type: 'function' as const,
          function: { name: 'getAnalytics', arguments: '{"userId":"u1"}' },
        },
      ];

      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: { content: null, role: 'assistant', tool_calls: toolCalls },
            finish_reason: 'tool_calls',
          },
        ],
        usage: null,
      });

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      const result = await provider.complete({
        messages: [
          { role: 'user', content: 'Get analytics' },
          { role: 'assistant', content: null, tool_calls: toolCalls },
          { role: 'tool', content: '{"trend":"UPWARD"}', tool_call_id: 'call_xyz' },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'getAnalytics',
              description: 'Get analytics',
              parameters: { type: 'object', properties: {} },
            },
          },
        ],
      });

      const firstCall = mockCreate.mock.calls[0][0];
      expect(firstCall.messages[1].tool_calls).toEqual(toolCalls);
    });

    it('should throw error when OpenAI API call fails', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API request failed'));

      (provider as any).client = { chat: { completions: { create: mockCreate } } };

      await expect(
        provider.complete({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow('API request failed');
    });
  });
});
