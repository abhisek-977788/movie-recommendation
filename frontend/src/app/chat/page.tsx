"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import { Send, Sparkles, Loader2, Film, Compass, Smile, Eye, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Welcome to CineAI Chat! I am your AI movie catalog assistant. Ask me to discover action blockbusters, find similar movies to your favorite films, or tell you what is popular right now. How can I help you today?",
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

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
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
          content: `Error: ${e.message || "Could not reach chat server."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      title: "Discover Genres",
      icon: Compass,
      prompts: [
        "Recommend action movies",
        "Suggest top-rated comedies",
        "Recommend emotional dramas",
        "Suggest sci-fi movies",
      ],
    },
    {
      title: "Find Similar",
      icon: Film,
      prompts: [
        "Movies like Inception",
        "Movies like The Dark Knight",
        "Suggest movies like Titanic",
        "Find films like Pulp Fiction",
      ],
    },
    {
      title: "Mood & Vibe",
      icon: Smile,
      prompts: [
        "Show me something scary",
        "Recommend mind-bending puzzles",
        "Show me lighthearted family films",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col md:flex-row gap-6 w-full text-left h-[calc(100vh-100px)] grad-hero noise overflow-hidden">
      
      {/* Left panel: Suggested prompt categories */}
      <div className="w-full md:w-72 flex flex-col gap-5 bg-surface/50 border border-white/5 backdrop-blur rounded-2xl p-5 overflow-y-auto shrink-0 h-fit md:h-full shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Sparkles size={16} className="text-primary fill-primary animate-pulse" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            Recommended Prompts
          </h2>
        </div>

        <div className="flex flex-col gap-6 select-none">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <cat.icon size={13} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {cat.title}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {cat.prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="flex items-center justify-between text-left bg-zinc-950 border border-white/5 hover:border-primary/30 transition-all rounded-xl px-3.5 py-2.5 text-[10px] text-text-secondary hover:text-white font-semibold cursor-pointer"
                  >
                    <span>{p}</span>
                    <ArrowRight size={10} className="text-text-muted hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Full screen conversation chatbox */}
      <div className="flex-1 flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden h-full shadow-2xl relative">
        
        {/* Chat header */}
        <div className="bg-[#0b0b0e] px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🤖</span>
            <div className="flex flex-col">
              <h2 className="text-xs font-black text-white uppercase tracking-widest">
                CineAI Chat Assistant
              </h2>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Assistant Online & Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Message streams bubble */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
          {messages.map((m, index) => {
            const isUser = m.role === "user";
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"} max-w-[80%] ${
                  isUser ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow ${
                    isUser
                      ? "bg-gradient-to-tr from-primary to-rose-600 text-white rounded-br-none font-semibold"
                      : "bg-zinc-900 border border-white/5 text-text-secondary rounded-bl-none font-medium"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex justify-start max-w-[80%] mr-auto">
              <div className="bg-zinc-900 border border-white/5 text-text-muted rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2.5 font-bold">
                <Loader2 size={13} className="animate-spin text-primary" />
                <span>CineAI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 bg-[#0c0c0e]/80 border-t border-white/5 flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder="Type your message, ask for suggestions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            className="flex-1 bg-zinc-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-semibold"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover flex items-center justify-center text-white cursor-pointer disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 shadow-lg glow-red"
          >
            <Send size={15} className="fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
