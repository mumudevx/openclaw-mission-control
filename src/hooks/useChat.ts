import { useState, useEffect, useCallback, useRef } from 'react';
import { gateway } from '@/lib/gateway';
import { useGateway } from '@/components/providers/gateway-provider';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatEventPayload {
  runId: string;
  sessionKey: string;
  state: 'delta' | 'final' | 'aborted' | 'error';
  message?: {
    role: string;
    content: Array<{ type: string; text?: string }> | string;
    timestamp: number;
  };
  errorMessage?: string;
}

interface ChatHistoryResponse {
  messages: Array<{
    role: string;
    content: Array<{ type: string; text?: string }> | string;
    timestamp?: number;
  }>;
  sessionKey: string;
}

interface SendResponse {
  runId: string;
  status: string;
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('');
  }
  return '';
}

export function useChat(agentId: string) {
  const { connectionState } = useGateway();
  const sessionKey = `agent:${agentId}:dashboard:mc`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef<string | null>(null);
  const historyLoadedRef = useRef(false);

  // Load chat history on mount
  useEffect(() => {
    if (connectionState !== 'connected' || historyLoadedRef.current) return;

    setIsLoading(true);
    gateway
      .rpc<{ sessionKey: string; limit: number }, ChatHistoryResponse>('chat.history', {
        sessionKey,
        limit: 200,
      })
      .then((res) => {
        const msgs: ChatMessage[] = (res.messages ?? []).map((m) => ({
          role: m.role as ChatMessage['role'],
          content: extractText(m.content),
          timestamp: m.timestamp ?? Date.now(),
        }));
        setMessages(msgs);
        historyLoadedRef.current = true;
      })
      .catch(() => {
        // Session might not exist yet — that's fine
      })
      .finally(() => setIsLoading(false));
  }, [connectionState, sessionKey]);

  // Listen for chat events
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const unsub = gateway.on('chat', (payload: unknown) => {
      const event = payload as ChatEventPayload;
      if (event.sessionKey !== sessionKey) return;

      if (event.state === 'delta') {
        const text = event.message ? extractText(event.message.content) : '';
        setStreamText(text);
      } else if (event.state === 'final') {
        const text = event.message ? extractText(event.message.content) : '';
        if (text) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: text,
              timestamp: event.message?.timestamp ?? Date.now(),
            },
          ]);
        }
        setStreamText(null);
        setIsSending(false);
        runIdRef.current = null;
      } else if (event.state === 'aborted') {
        setStreamText(null);
        setIsSending(false);
        runIdRef.current = null;
      } else if (event.state === 'error') {
        setError(event.errorMessage ?? 'Agent error');
        setStreamText(null);
        setIsSending(false);
        runIdRef.current = null;
      }
    });

    return unsub;
  }, [connectionState, sessionKey]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending || connectionState !== 'connected') return;

      const idempotencyKey = `mc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      runIdRef.current = idempotencyKey;

      // Optimistic user message
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text, timestamp: Date.now() },
      ]);
      setIsSending(true);
      setError(null);
      setStreamText('');

      try {
        await gateway.rpc<
          { sessionKey: string; message: string; idempotencyKey: string; deliver: boolean },
          SendResponse
        >('chat.send', {
          sessionKey,
          message: text,
          idempotencyKey,
          deliver: false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send');
        setIsSending(false);
        setStreamText(null);
        runIdRef.current = null;
      }
    },
    [isSending, connectionState, sessionKey],
  );

  const abort = useCallback(async () => {
    if (!runIdRef.current) return;
    try {
      await gateway.rpc('chat.abort', {
        sessionKey,
        runId: runIdRef.current,
      });
    } catch {
      // ignore
    }
  }, [sessionKey]);

  return {
    messages,
    streamText,
    isLoading,
    isSending,
    error,
    sendMessage,
    abort,
  };
}
