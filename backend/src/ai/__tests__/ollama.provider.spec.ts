import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OllamaProvider } from '../providers/ollama.provider';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OllamaProvider', () => {
  let provider: OllamaProvider;

  const mockConfig: Record<string, string | number> = {
    OLLAMA_BASE_URL: 'http://localhost:11434',
    AI_MODEL: 'qwen3:8b',
    AI_TEMPERATURE: 0.7,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OllamaProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    provider = module.get<OllamaProvider>(OllamaProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getName', () => {
    it('should return ollama', () => {
      expect(provider.getName()).toBe('ollama');
    });
  });

  describe('getModel', () => {
    it('should return the configured model', () => {
      expect(provider.getModel()).toBe('qwen3:8b');
    });
  });

  describe('listModels', () => {
    it('should return list of available models', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            models: [
              { name: 'qwen3:8b', size: 1000, digest: 'abc', modified_at: '2024-01-01' },
              { name: 'llama3:7b', size: 2000, digest: 'def', modified_at: '2024-01-02' },
            ],
          }),
      });

      const models = await provider.listModels();
      expect(models).toEqual(['qwen3:8b', 'llama3:7b']);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });

    it('should return empty array on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));
      const models = await provider.listModels();
      expect(models).toEqual([]);
    });

    it('should return empty array on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });
      const models = await provider.listModels();
      expect(models).toEqual([]);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when server and model are available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            models: [
              { name: 'qwen3:8b', size: 1000, digest: 'abc', modified_at: '2024-01-01' },
            ],
          }),
      });

      const result = await provider.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.availableModels).toContain('qwen3:8b');
    });

    it('should return unhealthy when model is not available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            models: [
              { name: 'llama3:7b', size: 2000, digest: 'def', modified_at: '2024-01-02' },
            ],
          }),
      });

      const result = await provider.healthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.error).toContain('not available');
    });

    it('should return unhealthy when server is unreachable', async () => {
      mockFetch.mockRejectedValue(new Error('fetch failed'));

      const result = await provider.healthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.error).toContain('Cannot reach Ollama server');
    });

    it('should return unhealthy on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });

      const result = await provider.healthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.error).toContain('500');
    });
  });

  describe('complete', () => {
    it('should return content when model finishes without tool calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'Hello from Ollama!' },
            done: true,
            prompt_eval_count: 10,
            eval_count: 5,
          }),
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.content).toBe('Hello from Ollama!');
      expect(result.finishReason).toBe('stop');
      expect(result.usage?.promptTokens).toBe(10);
      expect(result.usage?.completionTokens).toBe(5);
      expect(result.usage?.totalTokens).toBe(15);
    });

    it('should return tool calls when model requests them', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  function: {
                    name: 'getUserProfile',
                    arguments: { userId: 'user-1' },
                  },
                },
              ],
            },
            done: true,
          }),
      });

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
      expect(result.toolCalls?.[0].function.arguments).toBe('{"userId":"user-1"}');
      expect(result.finishReason).toBe('tool_calls');
    });

    it('should send tool definitions in Ollama format', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'test',
              description: 'test function',
              parameters: { type: 'object', properties: { x: { type: 'string' } } },
            },
          },
        ],
        toolChoice: 'auto',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0].function.name).toBe('test');
    });

    it('should set format to json when responseFormat is json', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: '{"key":"value"}' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [{ role: 'user', content: 'Return JSON' }],
        responseFormat: 'json',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.format).toBe('json');
    });

    it('should map assistant tool_calls to Ollama format', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [
          { role: 'user', content: 'Get analytics' },
          {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_1',
                type: 'function',
                function: { name: 'getAnalytics', arguments: '{"userId":"u1"}' },
              },
            ],
          },
          { role: 'tool', content: '{"trend":"UPWARD"}', tool_call_id: 'call_1' },
        ],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[1].tool_calls[0].function.name).toBe('getAnalytics');
      expect(body.messages[1].tool_calls[0].function.arguments).toEqual({ userId: 'u1' });
    });

    it('should set stream to false', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.stream).toBe(false);
    });

    it('should pass temperature and maxTokens in options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
        maxTokens: 2048,
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.options.temperature).toBe(0.5);
      expect(body.options.num_predict).toBe(2048);
    });

    it('should use default temperature when not specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.options.temperature).toBe(0.7);
    });

    it('should throw error when Ollama API call fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal error'),
      });

      await expect(
        provider.complete({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow('Ollama API error 500');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('fetch failed'));

      await expect(
        provider.complete({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow('fetch failed');
    });

    it('should handle done=false as length finish reason', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'Partial response' },
            done: false,
          }),
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.finishReason).toBe('length');
    });

    it('should handle missing usage gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'OK' },
            done: true,
          }),
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.usage).toBeUndefined();
    });

    it('should handle tool message role', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: 'qwen3:8b',
            message: { role: 'assistant', content: 'Got it' },
            done: true,
          }),
      });

      await provider.complete({
        messages: [
          { role: 'user', content: 'Get profile' },
          {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_1',
                type: 'function',
                function: { name: 'getUserProfile', arguments: '{"userId":"u1"}' },
              },
            ],
          },
          { role: 'tool', content: '{"name":"John"}', tool_call_id: 'call_1' },
        ],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[2].role).toBe('tool');
      expect(body.messages[2].content).toBe('{"name":"John"}');
    });
  });
});
