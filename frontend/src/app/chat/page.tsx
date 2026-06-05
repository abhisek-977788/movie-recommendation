"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import { Send, Sparkles, Loader, Film, Compass, Smile, Eye } from "lucide-react";
import { motion } from "framer-motion";

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
          content: "Welcome to CineAI! I am your AI movie catalog assistant. Ask me to find action movies, comedies, or movies similar to Inception. How can I help you today?",
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
        { role: "assistant", content: "Please sign in to chat with CineAI and get personalized recommendations.", timestamp: new Date() },
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
          content: `Error: ${e.message || "Could not connect to CineAI assistant."}`,
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col md:flex-row gap-6 w-full text-left h-[calc(100vh-100px)]">
      
      {/* Left panel: Suggested prompt categories */}
      <div className="w-full md:w-72 flex flex-col gap-5 bg-surface border border-white/5 rounded-xl p-5 overflow-y-auto shrink-0 h-fit md:h-full">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Suggested Prompts
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <cat.icon size={13} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {cat.title}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cat.prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-left bg-zinc-900 border border-white/5 hover:border-primary/20 transition-all rounded-lg px-3 py-2 text-[10px] text-text-secondary hover:text-white font-medium cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Full screen conversation box */}
      <div className="flex-1 flex flex-col bg-surface border border-white/5 rounded-xl overflow-hidden h-full">
        {/* Chat header */}
        <div className="bg-[#101010] px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                CineAI Chat Assistant
              </h2>
              <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online & Ready</span>
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
                  className={`rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow ${
                    isUser
                      ? "bg-primary text-white rounded-br-none font-semibold"
                      : "bg-zinc-900 border border-white/5 text-text-secondary rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start max-w-[80%] mr-auto">
              <div className="bg-zinc-900 border border-white/5 text-text-muted rounded-xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2.5">
                <Loader size={13} className="animate-spin text-primary" />
                <span>CineAI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form input bar */}
        <div className="p-4 bg-[#101010]/80 border-t border-white/5 flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder="Search movie details or recommendations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            className="flex-1 bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-4 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-semibold"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-lg bg-primary hover:bg-primary-hover flex items-center justify-center text-white cursor-pointer disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 shadow-lg"
          >
            <Send size={15} className="fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
