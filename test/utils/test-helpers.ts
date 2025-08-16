import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

export interface TestUser {
  id: string;
  email: string;
}

export interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TestConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseAnonKey: string;
}

/**
 * Get test configuration from environment variables
 */
export function getTestConfig(): TestConfig {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    throw new Error(
      'Missing required environment variables: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    supabaseAnonKey
  };
}

/**
 * Create Supabase admin client for testing
 */
export function createTestAdminClient() {
  const config = getTestConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create Supabase client with anon key for testing
 */
export function createTestClient() {
  const config = getTestConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

/**
 * Generate unique test email
 * Uses example.org domain to avoid bounced emails (RFC 2606 reserved domain)
 */
export function generateTestEmail(prefix: string = 'test'): string {
  // Using an authorized email from the Supabase project to avoid "Email address not authorized" errors
  // Adding unique suffix with + addressing to create unique emails while using authorized domain
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `jonh.dev.br+${prefix}.${timestamp}.${random}@gmail.com`;
}

/**
 * Generate unique test phone number
 */
export function generateTestPhone(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  // Use test prefix 5599 to avoid conflicts with real numbers
  return `+5599${timestamp.slice(-6)}${random}`.slice(0, 15); // Limit to 15 chars total
}

/**
 * Clean up test users
 */
export async function cleanupTestUsers(supabaseAdmin: any, users: TestUser[]): Promise<void> {
  for (const user of users) {
    try {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      console.log(`🧹 Cleaned up user: ${user.email}`);
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup user ${user.email}:`, error);
    }
  }
}

/**
 * Generate test address data
 */
export function generateTestAddress(): AddressData {
  const streets = ['Rua das Flores', 'Avenida Brasil', 'Rua das Palmeiras', 'Rua do Sol'];
  const neighborhoods = ['Centro', 'Jardim', 'Vila Nova', 'Bairro Alto'];
  const cities = ['Curitiba', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
  const states = ['PR', 'SP', 'RJ', 'MG'];
  
  const randomIndex = Math.floor(Math.random() * 4);
  const randomNumber = Math.floor(Math.random() * 9999) + 1;
  const randomZip = Math.floor(Math.random() * 99999).toString().padStart(5, '0') + '-' + 
                   Math.floor(Math.random() * 999).toString().padStart(3, '0');

  return {
    street: streets[randomIndex],
    number: randomNumber.toString(),
    neighborhood: neighborhoods[randomIndex],
    city: cities[randomIndex],
    state: states[randomIndex],
    zipCode: randomZip,
    country: 'Brasil'
  };
}

/**
 * Wait for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verify user exists in public.users table
 */
export async function verifyUserInPublicTable(
  supabaseAdmin: any, 
  userId: string, 
  expectedEmail: string
): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user from public.users: ${error.message}`);
  }

  if (data.email !== expectedEmail) {
    throw new Error(`Email mismatch: expected ${expectedEmail}, got ${data.email}`);
  }

  return data;
}

/**
 * Verify address exists in public.addresses table
 */
export async function verifyAddressInPublicTable(
  supabaseAdmin: any, 
  userId: string, 
  expectedAddress: AddressData
): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch address from public.addresses: ${error.message}`);
  }

  if (data.street !== expectedAddress.street || data.city !== expectedAddress.city) {
    throw new Error(`Address mismatch: expected ${expectedAddress.street}, ${expectedAddress.city}`);
  }

  return data;
}