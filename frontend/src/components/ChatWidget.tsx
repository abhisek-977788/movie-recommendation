"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";
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
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm CineAI, your cinematic virtual assistant. Ask me to recommend movies by genre, suggest matching titles, or describe films like Inception!",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: new Date() },
        {
          role: "assistant",
          content: "Please sign in to chat with CineAI and get personalized recommendations.",
          timestamp: new Date(),
        },
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
          content: `Error: ${e.message || "Failed to contact chat server."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Recommend action movies",
    "Best comedy movies",
    "Suggest movies like Inception",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Widget Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white cursor-pointer shadow-2xl relative hover:scale-105 active:scale-95 duration-200"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="msg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={20} />
              {/* Pulsing notification indicator */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent shadow-md" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expandable Chat Dialogue Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute bottom-18 right-0 w-[340px] sm:w-[400px] h-[520px] rounded-2xl overflow-hidden glass shadow-2xl flex flex-col z-50 border border-white/10"
          >
            {/* Window Header */}
            <div className="bg-[#0b0b0e] px-4.5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={14} className="fill-primary animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    CineAI Virtual
                  </span>
                  <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Assistant Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Conversation list area */}
            <div className="flex-1 overflow-y-auto px-4.5 py-4 flex flex-col gap-3.5 scroll-smooth">
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
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-lg ${
                        isUser
                          ? "bg-gradient-to-tr from-primary to-rose-600 text-white rounded-br-none font-semibold"
                          : "bg-surface border border-white/5 text-text-secondary rounded-bl-none font-medium"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex justify-start max-w-[80%] mr-auto">
                  <div className="bg-surface border border-white/5 text-text-muted rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2.5 font-bold">
                    <Loader2 size={13} className="animate-spin text-primary" />
                    <span>Analyzing matching films...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts helper overlay */}
            {messages.length === 1 && !loading && (
              <div className="px-4.5 pb-3.5 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">
                  Recommended prompts
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      className="flex items-center justify-between text-left bg-white/5 border border-white/5 hover:border-primary/30 transition-all rounded-lg px-3 py-2 text-[10px] text-text-secondary hover:text-white font-semibold cursor-pointer"
                    >
                      <span>{p}</span>
                      <ArrowRight size={10} className="text-text-muted hover:text-white" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="px-4 py-3 bg-[#0d0d12]/80 border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask CineAI something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                className="flex-1 bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-semibold"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover flex items-center justify-center text-white cursor-pointer disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 shadow-lg glow-red"
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
