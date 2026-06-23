export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: AIToolCall[];
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIToolResult {
  tool_call_id: string;
  name: string;
  content: string;
}

export interface AICompletionRequest {
  messages: AIChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  tools?: AIToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  model?: string;
}

export interface AICompletionResponse {
  content: string | null;
  toolCalls?: AIToolCall[];
  finishReason: string | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  getName(): string;
  getModel(): string;
  listModels?(): Promise<string[]>;
}
