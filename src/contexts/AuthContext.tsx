import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAdmin: (username: string, password: string) => Promise<{ error: any; adminData?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  adminData: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('isAdmin');
    return stored === 'true';
  });
  const [adminData, setAdminData] = useState<any>(() => {
    const stored = localStorage.getItem('adminData');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem('isAdmin');
    const storedAdminData = localStorage.getItem('adminData');

    if (storedAdmin === 'true' && storedAdminData) {
      setIsAdmin(true);
      setAdminData(JSON.parse(storedAdminData));
      setUser({ id: JSON.parse(storedAdminData).id, email: JSON.parse(storedAdminData).username } as User);
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!localStorage.getItem('isAdmin')) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('isAdmin');
    if (!storedAdmin && user) {
      checkAdminStatus();
    } else if (!storedAdmin && !user) {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInAdmin = async (username: string, password: string) => {
    console.log('Attempting admin login for:', username);

    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_username: username,
      p_password: password
    });

    console.log('Admin login response:', { data, error });

    if (error || !data) {
      return { error: error || new Error('Invalid credentials') };
    }

    const adminEmail = data.email || `${username}@starphoneadmin.local`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password
    });

    if (signInError) {
      console.error('Auth sign in error:', signInError);
      return { error: signInError };
    }

    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminData', JSON.stringify(data));

    setIsAdmin(true);
    setAdminData(data);

    console.log('Admin login successful, state updated');

    return { error: null, adminData: data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminData');
    setIsAdmin(false);
    setAdminData(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInAdmin,
    signOut,
    isAdmin,
    adminData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
