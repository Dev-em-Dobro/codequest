// Simple authentication utilities for CodeQuest
export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
}

// In-memory session store for development
const sessions = new Map<string, User>();

export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const createSession = (user: User): string => {
  const sessionId = generateSessionId();
  sessions.set(sessionId, user);
  return sessionId;
};

export const getSession = (sessionId: string): User | null => {
  return sessions.get(sessionId) || null;
};

export const deleteSession = (sessionId: string): void => {
  sessions.delete(sessionId);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};