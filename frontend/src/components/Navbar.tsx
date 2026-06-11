"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SearchBar } from "./SearchBar";
import { User, LogOut, LayoutDashboard, Shield, Menu, X, ChevronDown } from "lucide-react";
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

  // Close dropdown and menu on path change
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-white/5 py-3 shadow-2xl backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xl md:text-2xl tracking-wider select-none hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">🎬</span>
            <span className="grad-text-red font-black">CineAI</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-xs font-semibold tracking-wider uppercase transition-colors py-1 px-1 ${
                    active ? "text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full glow-red"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side: Search, Auth Status */}
        <div className="hidden md:flex items-center gap-5 flex-1 justify-end max-w-lg">
          <div className="w-64">
            <SearchBar />
          </div>

          {user ? (
            <div className="relative">
              {/* Profile dropdown trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown
                  size={12}
                  className={`text-text-secondary group-hover:text-white transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-52 rounded-xl overflow-hidden glass-card shadow-2xl py-1 text-xs border border-white/10"
                  >
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="font-bold text-white truncate mt-0.5">{user.name}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-white font-semibold"
                      >
                        <LayoutDashboard size={14} className="text-violet-500" />
                        <span>My Dashboard</span>
                      </Link>
                      {user.is_admin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-white font-semibold"
                        >
                          <Shield size={14} className="text-emerald-500" />
                          <span>Admin Settings</span>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors text-primary hover:text-white w-full text-left cursor-pointer border-t border-white/5 mt-1 font-semibold"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-bold text-text-secondary hover:text-white transition-colors py-2 px-1">
                Sign In
              </Link>
              <Link href="/register">
                <button className="btn-primary py-1.5 px-5 text-xs rounded-full">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Action Triggers */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-background border-b border-white/5 px-6 py-5 flex flex-col gap-5 text-xs font-bold shadow-2xl backdrop-blur-xl"
          >
            {/* Search component on mobile */}
            <div className="w-full">
              <SearchBar />
            </div>

            <div className="flex flex-col gap-3.5 pt-2 border-t border-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors py-1 ${
                    pathname === link.href ? "text-primary font-black" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="flex flex-col gap-3.5 pt-3.5 border-t border-white/5">
                <Link
                  href="/dashboard"
                  className="text-text-secondary hover:text-white py-1 flex items-center gap-2.5 text-sm"
                >
                  <LayoutDashboard size={15} className="text-violet-500" />
                  <span>My Dashboard</span>
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className="text-text-secondary hover:text-white py-1 flex items-center gap-2.5 text-sm"
                  >
                    <Shield size={15} className="text-emerald-500" />
                    <span>Admin Settings</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-primary hover:text-primary-hover py-1 flex items-center gap-2.5 text-left cursor-pointer text-sm"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4 pt-3.5 border-t border-white/5">
                <Link href="/login" className="flex-1">
                  <button className="w-full text-center border border-white/10 py-2.5 rounded-lg text-white hover:bg-white/5 transition-colors cursor-pointer text-xs font-bold">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="btn-primary w-full py-2.5 rounded-lg text-xs">
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
