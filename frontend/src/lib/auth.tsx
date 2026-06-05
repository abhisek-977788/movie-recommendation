"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "./types";
import { api } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("cineai_token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (e) {
          console.error("Failed to load profile, token expired.", e);
          localStorage.removeItem("cineai_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      localStorage.setItem("cineai_token", response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.register(name, email, password);
      localStorage.setItem("cineai_token", response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("cineai_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
