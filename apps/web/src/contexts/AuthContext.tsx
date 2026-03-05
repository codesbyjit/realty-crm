"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse } from "@/lib/types";
import api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    // API returns accessToken, frontend expects token
    const userData = response.data.user;
    const authToken = response.data.accessToken || response.data.token;

    if (!authToken) {
      throw new Error("No token received from server");
    }

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set cookie for middleware
    document.cookie = `token=${authToken}; path=/; max-age=2592000`;

    setToken(authToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    // API returns accessToken, frontend expects token
    const userData = response.data.user;
    const authToken = response.data.accessToken || response.data.token;

    if (!authToken) {
      throw new Error("No token received from server");
    }

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set cookie for middleware
    document.cookie = `token=${authToken}; path=/; max-age=2592000`;

    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
