"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

export const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! I am CineAI, your personalized movie assistant. Ask me to recommend action movies, comedies, or films similar to Inception!",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: new Date() },
        { role: "assistant", content: "Please sign in to chat with CineAI and get personalized recommendations.", timestamp: new Date() },
      ]);
      setInput("");
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e.message || "Could not connect to CineAI assistant."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const quickPrompts = [
    "Recommend action movies",
    "Best comedy movies",
    "Suggest movies like Inception",
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white cursor-pointer shadow-2xl relative select-none hover:scale-105 active:scale-95 transition-all"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -45 }} animate={{ rotate: 0 }} exit={{ rotate: 45 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="relative">
              <MessageSquare size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-16 right-0 w-[330px] sm:w-[380px] h-[480px] rounded-xl overflow-hidden glass shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-[#101010] px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={13} className="fill-primary animate-pulse" />
                </div>
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  CineAI Assistant
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scroll-smooth">
              {messages.map((m, index) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} max-w-[85%] ${
                      isUser ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                        isUser
                          ? "bg-primary text-white rounded-br-none font-semibold shadow"
                          : "bg-surface-light border border-white/5 text-text-secondary rounded-bl-none shadow-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start max-w-[80%] mr-auto">
                  <div className="bg-surface-light border border-white/5 text-text-muted rounded-xl rounded-bl-none px-3 py-2 text-xs flex items-center gap-2">
                    <Loader size={12} className="animate-spin text-primary" />
                    <span>CineAI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-2 flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  Suggested Questions:
                </span>
                <div className="flex flex-col gap-1">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleQuickPrompt(p)}
                      className="text-left bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all rounded px-2.5 py-1.5 text-[10px] text-text-secondary hover:text-white font-medium cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="px-3 py-2.5 bg-[#101010]/80 border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                className="flex-1 bg-zinc-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover flex items-center justify-center text-white cursor-pointer disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 shadow-lg"
              >
                <Send size={13} className="fill-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
