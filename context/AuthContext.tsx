"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Role = "manager" | "storeKeeper" | null;

interface User {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: true; role: Exclude<Role, null> } | { success: false };
  logout: () => void;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("sloozeUser") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User;
      // sync state after mount
      queueMicrotask(() => setUser(parsed));
    }
    queueMicrotask(() => setReady(true));
  }, []);

  const login = (email: string, password: string): { success: true; role: Exclude<Role, null> } | { success: false } => {
    const users: { email: string; password: string; role: Role }[] = [
      { email: "manager@slooze.com", password: "123456", role: "manager" },
      { email: "store@slooze.com", password: "123456", role: "storeKeeper" }
    ];

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const loggedInUser: User = {
        email: foundUser.email,
        role: foundUser.role
      };

      setUser(loggedInUser);
      localStorage.setItem("sloozeUser", JSON.stringify(loggedInUser));
      return { success: true, role: foundUser.role as Exclude<Role, null> };
    }

    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sloozeUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
