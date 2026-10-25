import { getSupabase } from './supabase';
import { PatientProfile } from '../types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const authService = {
  async signUp({ email, password, fullName, phone, dateOfBirth, gender }: SignUpParams) {
    const supabase = getSupabase();
    if (!supabase) {
      // In offline/demo simulator mode:
      return {
        data: {
          user: {
            id: 'demo-user-' + Date.now(),
            email,
            user_metadata: { full_name: fullName, phone, date_of_birth: dateOfBirth, gender },
          },
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          date_of_birth: dateOfBirth || '1974-01-01',
          gender: gender || 'Not Specified',
        },
      },
    });

    // Ensure profile row exists in 'profiles' table
    if (!error && data?.user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim() || 'Patient',
          email,
          phone: phone || '',
          date_of_birth: dateOfBirth || '1974-01-01',
          gender: gender || 'Not Specified',
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not auto-insert profile into profiles table:', err);
      }
    }

    return { data, error };
  },

  async signIn(email: string, password: string) {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        data: {
          user: {
            id: `user-${Date.now()}`,
            email,
            user_metadata: { full_name: 'Patient' },
          },
          session: { access_token: 'mock-token' },
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  async signOut() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email: string) {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  },

  async getCurrentUser() {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) return user;
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    } catch {
      return null;
    }
  },

  async getCurrentSession() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabase();
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};
