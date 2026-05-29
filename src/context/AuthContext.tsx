import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string, metadata?: any) => {
    try {
      // Try to get profile from Supabase
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1);
      if (data && data.length > 0) {
        setUser({
          id: userId,
          email: data[0].email || email,
          full_name: data[0].full_name || metadata?.full_name || '',
          phone_number: data[0].phone_number || metadata?.phone_number || '',
        });
        return;
      }
    } catch (e) {
      // fallback
    }
    // Fallback to auth metadata
    setUser({
      id: userId,
      email: email,
      full_name: metadata?.full_name || email.split('@')[0],
      phone_number: metadata?.phone_number || '',
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await fetchProfile(authUser.id, authUser.email || '', authUser.user_metadata);
        }
      } catch (e) {
        console.warn('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone_number: phone } },
    });
    if (!error && data?.user) {
      await fetchProfile(data.user.id, data.user.email || email, { full_name: fullName, phone_number: phone });
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
