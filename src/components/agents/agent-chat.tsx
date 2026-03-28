"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Loader2, WifiOff, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { useGateway } from "@/components/providers/gateway-provider";
import type { Agent } from "@/types";

interface AgentChatProps {
  agent: Agent;
  selectedSessionKey?: string | null;
  onClearSession?: () => void;
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-1">
        <p className="text-[11px] text-[var(--content-muted)] italic">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}>
      <div className="max-w-[80%]">
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-[var(--accent-primary)] text-white rounded-2xl rounded-br-md"
              : "bg-[var(--surface-card-alt,#f0f0ec)] text-[var(--content-primary)] rounded-2xl rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        <p
          className={`mt-1 text-[11px] text-[var(--content-muted)] ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function StreamBubble({ text, agentName }: { text: string; agentName: string }) {
  return (
    <div className="flex justify-start px-4">
      <div className="max-w-[80%]">
        <div className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-[var(--surface-card-alt,#f0f0ec)] text-[var(--content-primary)] rounded-2xl rounded-bl-md">
          {text || (
            <span className="flex items-center gap-2 text-[var(--content-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {agentName} is thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AgentChat({ agent, selectedSessionKey, onClearSession }: AgentChatProps) {
  const { connectionState } = useGateway();
  const { messages, streamText, isLoading, isSending, isReadOnly, error, sendMessage, abort, sessionKey } = useChat(agent.id, selectedSessionKey);
  const [input, setInput] = useState("");
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, scrollToBottom]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    sendMessage(trimmed);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const isConnected = connectionState === "connected";

  return (
    <div className="flex flex-col h-full">
      {/* Session header when viewing a past session */}
      {isReadOnly && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-divider)] bg-[var(--surface-bg)]">
          <button
            onClick={onClearSession}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--content-muted)] hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[var(--content-secondary)]">
              Viewing session history
            </p>
            <p className="text-[11px] text-[var(--content-muted)] font-mono truncate">
              {sessionKey}
            </p>
          </div>
        </div>
      )}

      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-primary)]" />
          </div>
        )}
        {!isLoading && messages.length === 0 && streamText === null && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--content-muted)]">
                {isReadOnly
                  ? "No messages found in this session"
                  : `Send a message to start a conversation with ${agent.name}`}
              </p>
              <p className="text-[11px] text-[var(--content-muted)] font-mono">
                {sessionKey}
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={`${msg.timestamp}-${i}`} message={msg} />
        ))}
        {streamText !== null && (
          <StreamBubble text={streamText} agentName={agent.name} />
        )}
        {error && (
          <div className="flex justify-center px-4">
            <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
              {error}
            </p>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border-divider)] p-4">
        {isReadOnly ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <p className="text-sm text-[var(--content-muted)]">
              Viewing past session &mdash;{" "}
              <button
                onClick={onClearSession}
                className="text-[var(--accent-primary)] hover:underline"
              >
                back to live chat
              </button>
            </p>
          </div>
        ) : !isConnected ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--content-muted)]">
            <WifiOff className="h-4 w-4" strokeWidth={1.5} />
            Gateway disconnected
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              rows={1}
              disabled={isSending}
              className="flex-1 resize-none rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2.5 text-sm text-[var(--content-primary)] placeholder:text-[var(--content-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] disabled:opacity-50"
            />
            {isSending ? (
              <button
                type="button"
                onClick={abort}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-600"
              >
                <Square className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
