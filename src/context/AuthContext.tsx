import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL, api } from '../services/api';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

// Get token from localStorage
const getStoredSession = (): AuthSession | null => {
  const sessionStr = localStorage.getItem('auth_session');
  if (sessionStr) {
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      console.error('Error parsing auth session:', e);
      localStorage.removeItem('auth_session');
    }
  }
  return null;
};

// Store token in localStorage
const storeSession = (session: AuthSession) => {
  localStorage.setItem('auth_session', JSON.stringify(session));
};

// Remove token from localStorage
const clearSession = () => {
  localStorage.removeItem('auth_session');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a session in localStorage
    const storedSession = getStoredSession();
    if (storedSession) {
      setSession(storedSession);
      setUser(storedSession.user);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.signIn(email, password);
      
      if (error) return { error };
      
      // Create session object
      const newSession: AuthSession = {
        accessToken: data.accessToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        }
      };
      
      // Save to state and localStorage
      setSession(newSession);
      setUser(newSession.user);
      storeSession(newSession);
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await api.signUp(email, password, firstName, lastName);
      
      if (error) return { error };
      
      // After signup, we auto-login the user
      return await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    // Clear session from state and localStorage
    setSession(null);
    setUser(null);
    clearSession();
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
