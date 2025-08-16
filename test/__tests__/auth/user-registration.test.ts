import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { generateTestPhone, generateTestEmail } from '../../utils/test-helpers';

// Load environment variables
config();

interface TestUser {
  id: string;
  email: string;
}

interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

describe('User Registration with Phone and Address', () => {
  let supabaseAdmin: any;
  let createdUsers: TestUser[] = [];

  beforeAll(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
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

  test('should create user with phone and address data', async () => {
    const email = generateTestEmail('address');
    const password = 'password123';
    const fullName = 'Test User Complete';
    const phone = generateTestPhone();
    const addressData: AddressData = {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80010-000',
      country: 'Brasil'
    };

    // Create user with admin.createUser
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
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
        pending_address: addressData,
        provider_type: 'email'
      }
    });

    expect(userError).toBeNull();
    expect(userData.user).toBeDefined();
    expect(userData.user.email).toBe(email);
    expect(userData.user.phone).toBe(phone.replace('+', ''));

    // Track user for cleanup
    createdUsers.push({ id: userData.user.id, email });

    // Call create_user_with_address RPC function
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('create_user_with_address', {
      p_user_id: userData.user.id,
      p_email: email,
      p_full_name: fullName,
      p_phone: phone,
      p_address: {
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zipCode,
        country: addressData.country
      }
    });

    expect(rpcError).toBeNull();

    // Verify user exists in public.users
    const { data: publicUser, error: publicUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    expect(publicUserError).toBeNull();
    expect(publicUser).toBeDefined();
    expect(publicUser.email).toBe(email);
    expect(publicUser.phone).toBe(phone);

    // Verify address exists in public.addresses
    const { data: address, error: addressError } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    expect(addressError).toBeNull();
    expect(address).toBeDefined();
    expect(address.street).toBe(addressData.street);
    expect(address.city).toBe(addressData.city);
  });

  test('should save pending address data in app_metadata', async () => {
    const email = generateTestEmail('pending');
    const password = 'password123';
    const fullName = 'Test Pending User';
    const phone = generateTestPhone();
    const addressData: AddressData = {
      street: 'Rua das Palmeiras',
      number: '456',
      neighborhood: 'Jardim',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil'
    };

    // Create user first
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_verified: true
      }
    });

    expect(userError).toBeNull();
    expect(userData.user).toBeDefined();

    // Track user for cleanup
    createdUsers.push({ id: userData.user.id, email });

    // Call save_pending_address_data RPC function
    const { error: saveError } = await supabaseAdmin.rpc('save_pending_address_data', {
      user_id: userData.user.id,
      address_data: {
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zipCode,
        country: addressData.country
      }
    });

    expect(saveError).toBeNull();

    // Verify pending address data is saved in app_metadata
    const { data: updatedUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userData.user.id);

    expect(fetchError).toBeNull();
    expect(updatedUser.user.app_metadata.pending_address).toBeDefined();
    expect(updatedUser.user.app_metadata.pending_address.street).toBe(addressData.street);
    expect(updatedUser.user.app_metadata.pending_address.city).toBe(addressData.city);
  });
});