"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// ¡NUEVA LIBRERÍA!
import * as jose from 'jose';

interface UserPayload {
  userId: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const router = useRouter();

  const setupAuth = useCallback((jwtToken: string) => {
    try {
      // ¡NUEVA FORMA DE DECODIFICAR!
      const decoded = jose.decodeJwt(jwtToken);

      if (!decoded.sub || !decoded.email || !decoded.rol) {
        throw new Error("Token inválido o malformado");
      }

      const userData: UserPayload = {
        userId: decoded.sub,
        email: decoded.email as string,
        rol: decoded.rol as string,
      };
      setToken(jwtToken);

      setUser(userData);
      localStorage.setItem('authToken', jwtToken);
    } catch (error) {
      console.error("Fallo al decodificar el token:", error);
      logout(); // Si el token es inválido, cerramos sesión
    }
  }, []); // La función logout será definida más abajo, no hay problema de dependencia

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    router.push('/');
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setupAuth(storedToken);
    }
  }, [setupAuth]);

  const login = (newToken: string) => {
    setupAuth(newToken);
    router.push('/dashboard');
  };
  
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}