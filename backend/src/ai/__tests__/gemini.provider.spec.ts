import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from '../providers/gemini.provider';

jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockStartChat = jest.fn();
  const mockSendMessage = jest.fn();

  mockStartChat.mockReturnValue({
    sendMessage: mockSendMessage,
  });

  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        startChat: mockStartChat,
      }),
    })),
    __mockSendMessage: mockSendMessage,
    __mockStartChat: mockStartChat,
  };
});

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockSendMessage: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const geminiModule = require('@google/generative-ai');
    mockSendMessage = geminiModule.__mockSendMessage;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                GEMINI_API_KEY: 'test-gemini-key',
                AI_MODEL: 'gemini-2.0-flash',
                AI_TEMPERATURE: 0.7,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<GeminiProvider>(GeminiProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getName', () => {
    it('should return gemini', () => {
      expect(provider.getName()).toBe('gemini');
    });
  });

  describe('getModel', () => {
    it('should return the configured model', () => {
      expect(provider.getModel()).toBe('gemini-2.0-flash');
    });
  });

  describe('complete', () => {
    it('should return content when model finishes without tool calls', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                role: 'model',
                parts: [{ text: 'Hello from Gemini!' }],
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 5,
            totalTokenCount: 15,
          },
        },
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.content).toBe('Hello from Gemini!');
      expect(result.finishReason).toBe('stop');
      expect(result.usage?.totalTokens).toBe(15);
    });

    it('should return tool calls when model requests them', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                role: 'model',
                parts: [
                  {
                    functionCall: {
                      name: 'getUserProfile',
                      args: { userId: 'user-1' },
                    },
                  },
                ],
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: null,
        },
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
    });

    it('should handle mixed text and tool call responses', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                role: 'model',
                parts: [
                  { text: 'Let me check that for you.' },
                  {
                    functionCall: {
                      name: 'getUserProfile',
                      args: { userId: 'user-1' },
                    },
                  },
                ],
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 8,
            totalTokenCount: 18,
          },
        },
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

      expect(result.content).toBe('Let me check that for you.');
      expect(result.toolCalls?.length).toBe(1);
    });

    it('should convert tool definitions to Gemini format', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: 'OK' }] },
              finishReason: 'STOP',
            },
          ],
        },
      });

      const geminiModule = require('@google/generative-ai');
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({ sendMessage: mockSendMessage }),
      });
      geminiModule.GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, any> = {
                  GEMINI_API_KEY: 'test-key',
                  AI_MODEL: 'gemini-2.0-flash',
                  AI_TEMPERATURE: 0.7,
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const provider2 = module2.get<GeminiProvider>(GeminiProvider);

      await provider2.complete({
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'test',
              description: 'test function',
              parameters: { type: 'object', properties: {} },
            },
          },
        ],
      });

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({
              functionDeclarations: expect.arrayContaining([
                expect.objectContaining({ name: 'test' }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('should handle MAX_TOKENS finish reason', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: 'Partial' }] },
              finishReason: 'MAX_TOKENS',
            },
          ],
          usageMetadata: null,
        },
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.finishReason).toBe('length');
    });

    it('should handle empty candidates', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [],
        },
      });

      const result = await provider.complete({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.content).toBe('');
    });

    it('should throw error when API call fails', async () => {
      mockSendMessage.mockRejectedValue(new Error('Gemini API failed'));

      await expect(
        provider.complete({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow('Gemini API failed');
    });

    it('should handle JSON response format', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: '{"key":"value"}' }] },
              finishReason: 'STOP',
            },
          ],
        },
      });

      const geminiModule = require('@google/generative-ai');
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({ sendMessage: mockSendMessage }),
      });
      geminiModule.GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, any> = {
                  GEMINI_API_KEY: 'test-key',
                  AI_MODEL: 'gemini-2.0-flash',
                  AI_TEMPERATURE: 0.7,
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const provider2 = module2.get<GeminiProvider>(GeminiProvider);

      await provider2.complete({
        messages: [{ role: 'user', content: 'Return JSON' }],
        responseFormat: 'json',
      });

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          responseMimeType: 'application/json',
        }),
      );
    });

    it('should build history from messages', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: 'Response' }] },
              finishReason: 'STOP',
            },
          ],
        },
      });

      await provider.complete({
        messages: [
          { role: 'system', content: 'You are a coach.' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'Follow up' },
        ],
      });

      expect(mockSendMessage).toHaveBeenCalledWith('Follow up');
    });

    it('should include system instruction', async () => {
      mockSendMessage.mockResolvedValue({
        response: {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: 'OK' }] },
              finishReason: 'STOP',
            },
          ],
        },
      });

      const geminiModule = require('@google/generative-ai');
      const mockStartChat = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({ startChat: mockStartChat });
      geminiModule.GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, any> = {
                  GEMINI_API_KEY: 'test-key',
                  AI_MODEL: 'gemini-2.0-flash',
                  AI_TEMPERATURE: 0.7,
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const provider2 = module2.get<GeminiProvider>(GeminiProvider);

      await provider2.complete({
        messages: [
          { role: 'system', content: 'You are a coach.' },
          { role: 'user', content: 'Hello' },
        ],
      });

      expect(mockStartChat).toHaveBeenCalledWith(
        expect.objectContaining({
          systemInstruction: 'You are a coach.',
        }),
      );
    });
  });
});
