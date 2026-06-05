"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SearchBar } from "./SearchBar";
import { User, LogOut, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on path change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Recommendations", href: "/recommendations" },
    { name: "AI Chat", href: "/chat" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-[#070707]/90 backdrop-blur-md border-b border-white/5 py-3 shadow-lg" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5 font-black text-primary text-xl md:text-2xl tracking-wider select-none">
            <span>🎬</span>
            <span className="bg-clip-text bg-gradient-to-r from-primary to-rose-500">CineAI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold tracking-wide transition-colors ${
                    active ? "text-primary" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center/Right: Search Bar & Profile actions */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end max-w-md">
          <SearchBar />

          {user ? (
            <div className="relative">
              {/* Profile button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center cursor-pointer border border-white/10 text-white font-bold text-xs uppercase"
              >
                {user.name.charAt(0)}
              </button>

              {/* Profile dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-44 rounded-lg overflow-hidden glass shadow-2xl py-1 text-xs">
                  <div className="px-3 py-2 border-b border-white/5 font-semibold text-white/80">
                    Hello, {user.name}
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-text-secondary hover:text-white"
                  >
                    <LayoutDashboard size={13} />
                    <span>My Dashboard</span>
                  </Link>
                  {user.is_admin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-text-secondary hover:text-white"
                    >
                      <Shield size={13} />
                      <span>Admin Settings</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-primary hover:text-primary-hover w-full text-left cursor-pointer border-t border-white/5"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <button className="text-xs font-bold text-white hover:text-primary transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-primary hover:bg-primary-hover text-xs text-white font-bold px-4 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 shadow">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu triggers */}
        <div className="flex md:hidden items-center gap-3">
          <SearchBar />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:text-primary cursor-pointer"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-[#0d0d0d] border-b border-white/10 px-6 py-4 flex flex-col gap-4 text-xs font-bold"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-text-secondary hover:text-white py-1 block"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-text-secondary hover:text-white py-1 flex items-center gap-2"
                >
                  <LayoutDashboard size={14} />
                  <span>My Dashboard</span>
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className="text-text-secondary hover:text-white py-1 flex items-center gap-2"
                  >
                    <Shield size={14} />
                    <span>Admin Settings</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-primary hover:text-primary-hover py-1 flex items-center gap-2 text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex gap-4 pt-2 border-t border-white/5">
                <Link href="/login" className="flex-1">
                  <button className="w-full text-center border border-white/10 py-2 rounded-lg text-white hover:bg-white/5 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="w-full text-center bg-primary py-2 rounded-lg text-white hover:bg-primary-hover transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
