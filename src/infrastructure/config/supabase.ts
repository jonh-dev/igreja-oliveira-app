import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente Supabase são obrigatórias:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL\n' +
    '- EXPO_PUBLIC_SUPABASE_ANON_KEY\n' +
    'Configure no arquivo .env na raiz do projeto'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface DatabaseUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pastor' | 'deacon' | 'leader' | 'member';
  phone?: string;
  country_code?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAddress {
  id: string;
  user_id: string;
  street: string;
  number?: string;
  neighborhood: string;
  city: string;
  state: string | null;
  zip_code: string;
  country: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDonation {
  id: string;
  user_id?: string;
  amount: number;
  type: 'gasofilaco' | 'pix' | 'cartao' | 'transferencia' | 'tithe' | 'offering' | 'special';
  source: 'manual' | 'automatic';
  description?: string;
  date: string;
  gasofilaco_data?: {
    cult_date: string;
    registered_by: string;
    notes?: string;
  };
  electronic_data?: {
    transaction_id: string;
    donor_id?: string;
    donor_name?: string;
    payment_method: 'pix' | 'cartao' | 'transferencia';
    bank_info?: string;
    transaction_date: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      addresses: {
        Row: DatabaseAddress;
        Insert: Omit<DatabaseAddress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseAddress, 'id' | 'created_at' | 'updated_at'>>;
      };
      donations: {
        Row: DatabaseDonation;
        Insert: Omit<DatabaseDonation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseDonation, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}