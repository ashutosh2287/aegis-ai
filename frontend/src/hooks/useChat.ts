import { useState, useCallback } from 'react';
import { aiService } from '../lib/ai.service';
import type { ChatMessage, ChatResponse } from '../lib/ai.types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.slice(-10);
      const response: ChatResponse = await aiService.chat(content.trim(), history);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to get response';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
