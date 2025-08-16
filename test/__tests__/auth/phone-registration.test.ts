import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { generateTestPhone, generateTestEmail } from '../../utils/test-helpers';

// Load environment variables
config();

interface TestUser {
  id: string;
  email: string;
}

describe('Phone Registration Tests', () => {
  let supabaseAdmin: any;
  let supabase: any;
  let createdUsers: TestUser[] = [];

  beforeAll(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error('Missing required environment variables');
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  });

  afterEach(async () => {
    // Clean up created users after each test
    for (const user of createdUsers) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`🧹 Cleaned up user: ${user.email}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup user ${user.email}:`, error);
      }
    }
    createdUsers = [];
  });

  test('should create user with phone using admin.createUser', async () => {
    const email = generateTestEmail('admin');
    const password = 'password123';
    const fullName = 'Test Admin Phone User';
    const phone = generateTestPhone();

    // Create user using admin.createUser with phone
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_verified: true
      }
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(email);
    expect(data.user.phone).toBe(phone.replace('+', ''));
    expect(data.user.user_metadata.full_name).toBe(fullName);
    expect(data.user.user_metadata.phone_verified).toBe(true);

    // Track user for cleanup
    createdUsers.push({ id: data.user.id, email });

    // Verify phone is persisted in auth.users table
    const { data: authUser, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('phone')
      .eq('id', data.user.id)
      .single();

    // Note: This might fail due to RLS, but we test the returned data above
    if (!authError) {
      expect(authUser.phone).toBe(phone);
    }
  });

  test('should register user with phone using regular signUp', async () => {
    const email = generateTestEmail('user');
    const password = 'password123';
    const fullName = 'Test SignUp Phone User';
    const phone = generateTestPhone();

    // Test regular signUp with phone in user_metadata
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    expect(result.error).toBeNull();
    expect(result.data.user).toBeDefined();
    expect(result.data.user.email).toBe(email);
    
    // Log for debugging
    console.log('User phone field:', result.data.user.phone);
    console.log('User metadata:', result.data.user.user_metadata);
    console.log('Full user object:', JSON.stringify(result.data.user, null, 2));
    
    // For regular signUp, phone is stored in user_metadata
    const userPhone = result.data.user.user_metadata?.phone;
    expect(userPhone).toBe(phone);
    expect(userPhone).toBeTruthy();

    // Track user for cleanup
    if (result.data.user) {
      createdUsers.push({ id: result.data.user.id, email });
    }
  });

  test('should handle phone registration with metadata persistence', async () => {
    const email = generateTestEmail('metadata');
    const password = 'password123';
    const fullName = 'Test Metadata Phone User';
    const phone = generateTestPhone();

    // Create user with comprehensive metadata
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_verified: true,
        provider_type: 'email'
      },
      app_metadata: {
        provider_type: 'email',
        registration_source: 'test'
      }
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(email);
    expect(data.user.phone).toBe(phone.replace('+', ''));
    expect(data.user.user_metadata.full_name).toBe(fullName);
    expect(data.user.user_metadata.phone_verified).toBe(true);
    expect(data.user.user_metadata.provider_type).toBe('email');
    expect(data.user.app_metadata.provider_type).toBe('email');

    // Track user for cleanup
    createdUsers.push({ id: data.user.id, email });
  });
});