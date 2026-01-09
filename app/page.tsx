"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  // Matching the properties from your screenshot
  const { messages, sendMessage, status, stop, regenerate } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    // In v5/v6, we send a message object
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-zinc-100 p-4 font-sans">
      {/* 🟢 Status Indicator */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-zinc-900/50 rounded-full w-fit border border-zinc-800">
        <div
          className={`w-2 h-2 rounded-full ${
            status === "ready" ? "bg-green-500" : "bg-blue-500 animate-pulse"
          }`}
        />
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
          System {status}
        </span>
      </div>

      {/* 💬 Chat Display */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-2 custom-scrollbar"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-2xl ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[#121212] border border-zinc-800"
              }`}
            >
              {/* Correctly map parts for multimodal support */}
              {m.parts.map(
                (part, i) =>
                  part.type === "text" && (
                    <p key={i} className="text-[15px] leading-relaxed">
                      {part.text}
                    </p>
                  )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ⌨️ Input Section */}
      <form
        onSubmit={handleFormSubmit}
        className="mt-6 max-w-4xl mx-auto w-full relative"
      >
        <input
          className="w-full bg-[#111] border border-zinc-800 rounded-2xl py-5 px-6 pr-24 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          value={input}
          placeholder="Ask Qwen something..."
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* STOP button if it's currently streaming */}
          {status === "streaming" || status === "submitted" ? (
            <button
              type="button"
              onClick={stop}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-xl transition-all"
            >
              <div className="w-3 h-3 bg-current rounded-sm" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-xl transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* 🔄 Action Bar */}
      {messages.length > 0 && status === "ready" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => regenerate()}
            className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate Response
          </button>
        </div>
      )}
    </div>
  );
}
