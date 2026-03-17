"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { mockChatMessages, mockAIResponses } from "@/lib/mock/data";
import type { Agent, ChatMessage } from "@/types";

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
          className={`px-4 py-2.5 text-sm leading-relaxed ${
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
          {format(new Date(message.timestamp), "HH:mm")}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[var(--surface-card-alt,#f0f0ec)] px-4 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-muted)] animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-muted)] animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-muted)] animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-[11px] text-[var(--content-muted)]">
        {agentName} is typing...
      </span>
    </div>
  );
}

export function AgentChat({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    mockChatMessages.filter((m) => m.agentId === agent.id)
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      agentId: agent.id,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const responses = mockAIResponses[agent.id] || [
        "I've processed your request. Let me know if you need anything else.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        agentId: agent.id,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--content-muted)]">
              Send a message to start a conversation with {agent.name}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator agentName={agent.name} />}
        <div ref={scrollEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border-divider)] p-4">
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name}...`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2.5 text-sm text-[var(--content-primary)] placeholder:text-[var(--content-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
