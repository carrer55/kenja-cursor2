import { useState, useEffect } from 'react';
import { supabaseAuth, type AuthUser, type AuthState } from '../lib/supabaseAuth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(supabaseAuth.getAuthState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = supabaseAuth.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    position: string;
    phone: string;
    department: string;
  }) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const result = await supabaseAuth.logout();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.updateProfile(updates);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const result = await supabaseAuth.resetPassword(email);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: authState.user,
    profile: authState.user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: authState.isAuthenticated,
    isOnboardingComplete: authState.isOnboardingComplete
  };
}