import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { chatSuggestions } from '../../data/chatSuggestions';
import { useAppState } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { callChatAi } from '../../lib/chatAi';
import { createMessageId } from '../../lib/ids';
import { localChatResponse } from '../../lib/localChat';
import { selectCurrentRecord, selectEffectiveProvider } from '../../state/selectors';
import type { ChatMessage } from '../../types';
import { Button, Input } from '../ui';
import { MarkdownMessage } from './MarkdownMessage';
import { TypingIndicator } from './TypingIndicator';

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  at: 0,
  content:
    "Hello! I'm your **MediPulse AI Assistant**. I can explain your lab results, suggest which specialist to see, or help you prepare questions for your doctor.\n\nWhat would you like to know?",
};

export function ChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useAppState();
  const toast = useToast();
  const record = selectCurrentRecord(state);
  const provider = selectEffectiveProvider(state);

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the drawer, matching the dialogs.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        at: Date.now(),
      };
      const history = messages.filter((m) => m.id !== 'greeting');
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setPending(true);

      let reply: string;
      if (provider === 'offline') {
        reply = localChatResponse(trimmed, record);
      } else {
        try {
          reply = await callChatAi(trimmed, history, record, state.settings);
        } catch (err) {
          // Degrade quietly to the local assistant rather than dead-ending.
          reply = localChatResponse(trimmed, record);
          toast.info(
            'Answered offline',
            err instanceof Error ? err.message : 'The AI provider was unreachable.',
          );
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'assistant', content: reply, at: Date.now() },
      ]);
      setPending(false);
    },
    [messages, pending, provider, record, state.settings, toast],
  );

  if (!open) return null;

  const contextLabel = record
    ? `${record.date} — ${record.labs.length} marker${record.labs.length === 1 ? '' : 's'}, ${
        record.labs.filter((l) => l.status !== 'Normal').length
      } out of range`
    : 'No report processed yet';

  return (
    <div
      role="dialog"
      aria-label="MediPulse assistant"
      className={clsx(
        'fixed z-50 flex flex-col border-slate-800 bg-slate-900 shadow-2xl',
        // Full-screen sheet on mobile; floating card on desktop.
        'inset-0 border-t sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[540px] sm:w-96 sm:rounded-xl sm:border',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-1.5 text-white">
            <Bot className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">MediPulse Assistant</p>
            <p className="truncate text-[10px] text-slate-500">
              {provider === 'offline' ? 'Local assistant' : `Powered by ${provider}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([GREETING])}
            aria-label="Clear conversation"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <p className="border-b border-slate-800 bg-slate-950 px-3 py-1.5 text-[10px] text-slate-500">
        Context: {contextLabel}
      </p>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto p-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'px-3 py-2 text-[11.5px] leading-relaxed',
                message.role === 'user'
                  ? 'chat-bubble-user max-w-[85%]'
                  : 'chat-bubble-ai max-w-[88%]',
              )}
            >
              {message.role === 'assistant' ? (
                <MarkdownMessage content={message.content} />
              ) : (
                // Plain text node — never interpreted as markup.
                message.content
              )}
            </div>
          </div>
        ))}
        {pending && <TypingIndicator />}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-800 px-3 py-2">
          {chatSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="chat-chip"
              onClick={() => void send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex gap-2 border-t border-slate-800 p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask the assistant
        </label>
        <Input
          ref={inputRef}
          id="chat-input"
          value={input}
          disabled={pending}
          placeholder="Ask about your results…"
          onChange={(e) => setInput(e.target.value)}
          className="text-xs"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!input.trim() || pending}
          aria-label="Send message"
          icon={<Send className="h-4 w-4" aria-hidden />}
        />
      </form>
    </div>
  );
}
