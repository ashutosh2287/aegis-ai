import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useChat } from '../hooks/useChat';

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}{!done && <span className="inline-block w-0.5 h-4 bg-aegis-gold animate-pulse ml-0.5 align-middle" />}</span>;
}

export default function AIChatPage() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-aegis-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-aegis-gold/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-aegis-gold" />
          </div>
          <div>
            <h1 className="text-white font-semibold">AI Coach</h1>
            <p className="text-xs text-aegis-muted">Your personal fitness assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-2 text-aegis-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-aegis-gold/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-aegis-gold" />
            </div>
            <h2 className="text-white text-lg font-medium mb-2">How can I help you today?</h2>
            <p className="text-aegis-muted text-sm max-w-md">
              Ask me about workout plans, nutrition advice, exercise form, recovery tips, or anything fitness-related.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                'Create a chest workout',
                'What should I eat post-workout?',
                'How to improve my deadlift?',
                'Calculate my daily calories',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 text-xs text-aegis-muted border border-aegis-border rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-aegis-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-aegis-gold" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-aegis-gold text-aegis-black'
                    : 'bg-aegis-charcoal border border-aegis-border text-white'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <TypewriterText text={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-aegis-dark flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-aegis-muted" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-aegis-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-aegis-gold" />
            </div>
            <div className="bg-aegis-charcoal border border-aegis-border rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-aegis-gold animate-spin" />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-aegis-border">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI coach anything..."
            disabled={isLoading}
            className="flex-1 bg-aegis-dark border border-aegis-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-aegis-gold text-aegis-black p-3 rounded-xl hover:bg-aegis-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
