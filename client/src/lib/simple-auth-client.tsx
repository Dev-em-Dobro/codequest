import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { setSentryUser } from "./sentry";

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Make auth client available globally for API requests
  useEffect(() => {
    (globalThis as any).__authClient = {
      getState: () => ({
        user,
        sessionId: user?.id || null,
        isLoading
      })
    };
  }, [user, isLoading]);

  // Save user session to localStorage when user changes
  useEffect(() => {
    // During bootstrap, keep persisted session until checkSession resolves.
    if (isLoading) {
      return;
    }

    if (user) {
      localStorage.setItem('codequest_user', JSON.stringify(user));
      localStorage.setItem('codequest_session_id', user.id);
    } else {
      localStorage.removeItem('codequest_user');
      localStorage.removeItem('codequest_session_id');
    }
  }, [user, isLoading]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // First, try to restore user from localStorage
    try {
      const savedUser = localStorage.getItem('codequest_user');
      const savedSessionId = localStorage.getItem('codequest_session_id');
      if (savedUser || savedSessionId) {
        const userData = savedUser ? JSON.parse(savedUser) : null;
        const sessionId = savedSessionId || userData?.id;

        if (!sessionId) {
          localStorage.removeItem('codequest_user');
          localStorage.removeItem('codequest_session_id');
          setSentryUser(null);
          setIsLoading(false);
          return;
        }

        // Verify session is still valid by calling backend
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (response.ok) {
          const currentUserData = await response.json();
          const updatedUser = {
            id: sessionId,
            name: currentUserData.name || userData?.name || "Usuário",
            email: currentUserData.email || userData?.email || "",
            points: currentUserData.totalPoints || 0,
            level: Math.floor((currentUserData.totalPoints || 0) / 100) + 1,
          };
          setUser(updatedUser);
          setSentryUser(updatedUser);
          // Update localStorage with latest data
          localStorage.setItem('codequest_user', JSON.stringify(updatedUser));
          setIsLoading(false);
          return;
        } else {
          // Session expired, clear localStorage
          localStorage.removeItem('codequest_user');
          localStorage.removeItem('codequest_session_id');
          setSentryUser(null);
        }
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
      localStorage.removeItem('codequest_user');
      localStorage.removeItem('codequest_session_id');
      setSentryUser(null);
    }

    setIsLoading(false);
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no login');
      }

      const data = await response.json();
      const authUser = {
        id: data.sessionId,
        name: data.user.name,
        email: data.user.email,
        points: data.user.points || 0,
        level: data.user.level || 1,
      };

      localStorage.setItem('codequest_session_id', data.sessionId);

      setUser(authUser);
      setSentryUser(authUser);
    } catch (error: any) {
      throw new Error(error.message || 'Falha no login');
    }
  };

  const signUp = async (credentials: { email: string; password: string; name: string }) => {
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no cadastro');
      }

      const data = await response.json();
      const authUser = {
        id: data.sessionId,
        name: data.user.name,
        email: data.user.email,
        points: data.user.points || 0,
        level: data.user.level || 1,
      };

      localStorage.setItem('codequest_session_id', data.sessionId);

      setUser(authUser);
      setSentryUser(authUser);
    } catch (error: any) {
      throw new Error(error.message || 'Falha no cadastro');
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    // Clear localStorage on sign out
    localStorage.removeItem('codequest_user');
    localStorage.removeItem('codequest_session_id');
    setUser(null);
    setSentryUser(null);
  };

  const forgotPassword = async (_email: string) => {
    throw new Error("Redefinição de senha indisponível no momento.");
  };

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut,
      forgotPassword,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
};