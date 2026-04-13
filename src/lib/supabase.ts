import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          cep: string;
          street: string;
          number: string;
          complement: string;
          neighborhood: string;
          city: string;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          phone?: string;
          cep?: string;
          street?: string;
          number?: string;
          complement?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          cep?: string;
          street?: string;
          number?: string;
          complement?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          model: string;
          price: number;
          original_price: number | null;
          description: string;
          image_url: string;
          storage: string;
          color: string;
          in_stock: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          model?: string;
          price: number;
          original_price?: number | null;
          description?: string;
          image_url?: string;
          storage?: string;
          color?: string;
          in_stock?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          model?: string;
          price?: number;
          original_price?: number | null;
          description?: string;
          image_url?: string;
          storage?: string;
          color?: string;
          in_stock?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
