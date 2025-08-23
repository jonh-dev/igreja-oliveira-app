import { createTestAdminClient } from './test-helpers';

const supabaseAdmin = createTestAdminClient();

/**
 * Get user data from auth.users table
 */
export async function getAuthUser(userId: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_auth_user', { user_id: userId });

    if (error) {
      throw new Error(`Failed to get auth user: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Auth user not found: ${userId}`);
    }

    return data; // Return JSONB result directly
  } catch (error: any) {
    throw new Error(`Failed to get auth user: ${error.message}`);
  }
}

/**
 * Get user data from public.users table
 */
export async function getPublicUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw new Error(`Failed to get public user: ${error.message}`);
  return data;
}

/**
 * Get default address for user from public.addresses table
 */
export async function getDefaultAddress(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  
  if (error) throw new Error(`Failed to get default address: ${error.message}`);
  return data;
}

/**
 * Get all addresses for user from public.addresses table
 */
export async function getAllAddresses(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw new Error(`Failed to get addresses: ${error.message}`);
  return data || [];
}

/**
 * Get all user data from all three tables
 */
export async function getAllUserData(userId: string) {
  try {
    const [authUser, publicUser, addresses] = await Promise.all([
      getAuthUser(userId),
      getPublicUser(userId),
      getAllAddresses(userId)
    ]);
    
    const defaultAddress = addresses.find(addr => addr.is_default) || null;
    
    return { 
      authUser, 
      publicUser, 
      addresses,
      address: defaultAddress
    };
  } catch (error) {
    throw new Error(`Failed to get all user data: ${error.message}`);
  }
}

/**
 * Confirm email for user (simulates email confirmation)
 */
export async function confirmEmail(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  );
  
  if (error) throw new Error(`Failed to confirm email: ${error.message}`);
}

/**
 * Confirm phone for user (simulates phone confirmation)
 */
export async function confirmPhone(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { phone_confirm: true }
  );
  
  if (error) throw new Error(`Failed to confirm phone: ${error.message}`);
}

/**
 * Validate auth.users data structure and required fields
 */
export function validateAuthUser(authUser: any, expectedData: {
  email: string;
  phone?: string;
  fullName: string;
  providerType: 'email' | 'phone' | 'oauth';
}) {
  const errors: string[] = [];
  
  // Basic required fields
  if (!authUser.id) errors.push('ID is required');
  if (!authUser.email) errors.push('Email is required');
  if (!authUser.created_at) errors.push('Created_at is required');
  if (!authUser.aud || authUser.aud !== 'authenticated') errors.push('Aud should be "authenticated"');
  if (!authUser.role || authUser.role !== 'authenticated') errors.push('Role should be "authenticated"');
  
  // Email validation
  if (authUser.email !== expectedData.email) {
    errors.push(`Email mismatch: expected ${expectedData.email}, got ${authUser.email}`);
  }
  
  // Phone validation (if provided)
  if (expectedData.phone) {
    const normalizedPhone = expectedData.phone.replace('+', '');
    if (authUser.phone !== normalizedPhone) {
      errors.push(`Phone mismatch: expected ${normalizedPhone}, got ${authUser.phone}`);
    }
  }
  
  // User metadata validation
  if (!authUser.raw_user_meta_data?.full_name) {
    errors.push('full_name is required in user_metadata');
  } else if (authUser.raw_user_meta_data.full_name !== expectedData.fullName) {
    errors.push(`full_name mismatch: expected ${expectedData.fullName}, got ${authUser.raw_user_meta_data.full_name}`);
  }
  
  // App metadata validation
  if (!authUser.raw_app_meta_data?.provider) {
    errors.push('provider is required in app_metadata');
  }
  
  if (!authUser.raw_app_meta_data?.providers?.length) {
    errors.push('providers array is required in app_metadata');
  }
  
  if (!authUser.raw_app_meta_data?.provider_type) {
    errors.push('provider_type is required in app_metadata');
  } else if (authUser.raw_app_meta_data.provider_type !== expectedData.providerType) {
    errors.push(`provider_type mismatch: expected ${expectedData.providerType}, got ${authUser.raw_app_meta_data.provider_type}`);
  }
  
  // Provider consistency validation
  const { provider, provider_type } = authUser.raw_app_meta_data;
  
  if (provider_type === 'phone' && provider !== 'phone') {
    errors.push('Inconsistency: provider_type=phone but provider≠phone');
  }
  
  if (provider_type === 'email' && provider !== 'email') {
    errors.push('Inconsistency: provider_type=email but provider≠email');
  }
  
  if (provider_type === 'oauth' && !['google', 'apple', 'github', 'facebook'].includes(provider)) {
    errors.push('Inconsistency: provider_type=oauth but provider is not OAuth');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate public.users data structure and required fields
 */
export function validatePublicUser(publicUser: any, expectedData: {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
}) {
  const errors: string[] = [];
  
  // Basic required fields
  if (!publicUser.id) errors.push('ID is required');
  if (!publicUser.email) errors.push('Email is required');
  if (!publicUser.full_name) errors.push('Full name is required');
  if (!publicUser.role) errors.push('Role is required');
  if (!publicUser.created_at) errors.push('Created_at is required');
  if (!publicUser.updated_at) errors.push('Updated_at is required');
  
  // Data validation
  if (publicUser.id !== expectedData.id) {
    errors.push(`ID mismatch: expected ${expectedData.id}, got ${publicUser.id}`);
  }
  
  if (publicUser.email !== expectedData.email) {
    errors.push(`Email mismatch: expected ${expectedData.email}, got ${publicUser.email}`);
  }
  
  if (publicUser.full_name !== expectedData.fullName) {
    errors.push(`Full name mismatch: expected ${expectedData.fullName}, got ${publicUser.full_name}`);
  }
  
  if (expectedData.phone && publicUser.phone !== expectedData.phone) {
    errors.push(`Phone mismatch: expected ${expectedData.phone}, got ${publicUser.phone}`);
  }
  
  if (expectedData.role && publicUser.role !== expectedData.role) {
    errors.push(`Role mismatch: expected ${expectedData.role}, got ${publicUser.role}`);
  } else if (!expectedData.role && publicUser.role !== 'member') {
    errors.push(`Default role should be 'member', got ${publicUser.role}`);
  }
  
  // Country code validation for phone
  if (expectedData.phone && !publicUser.country_code) {
    errors.push('Country code is required when phone is provided');
  } else if (expectedData.phone && publicUser.country_code !== '+55') {
    errors.push(`Country code should be '+55' for Brazilian numbers, got ${publicUser.country_code}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate public.addresses data structure and required fields
 */
export function validateAddress(address: any, expectedData: {
  userId: string;
  street: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}) {
  const errors: string[] = [];
  
  // Basic required fields
  if (!address.id) errors.push('ID is required');
  if (!address.user_id) errors.push('User ID is required');
  if (!address.street) errors.push('Street is required');
  if (!address.neighborhood) errors.push('Neighborhood is required');
  if (!address.city) errors.push('City is required');
  if (!address.zip_code) errors.push('Zip code is required');
  if (!address.country) errors.push('Country is required');
  if (address.is_default === undefined || address.is_default === null) {
    errors.push('is_default is required');
  }
  if (!address.created_at) errors.push('Created_at is required');
  if (!address.updated_at) errors.push('Updated_at is required');
  
  // Data validation
  if (address.user_id !== expectedData.userId) {
    errors.push(`User ID mismatch: expected ${expectedData.userId}, got ${address.user_id}`);
  }
  
  if (address.street !== expectedData.street) {
    errors.push(`Street mismatch: expected ${expectedData.street}, got ${address.street}`);
  }
  
  if (address.neighborhood !== expectedData.neighborhood) {
    errors.push(`Neighborhood mismatch: expected ${expectedData.neighborhood}, got ${address.neighborhood}`);
  }
  
  if (address.city !== expectedData.city) {
    errors.push(`City mismatch: expected ${expectedData.city}, got ${address.city}`);
  }
  
  if (address.zip_code !== expectedData.zipCode) {
    errors.push(`Zip code mismatch: expected ${expectedData.zipCode}, got ${address.zip_code}`);
  }
  
  const expectedCountry = expectedData.country || 'Brasil';
  if (address.country !== expectedCountry) {
    errors.push(`Country mismatch: expected ${expectedCountry}, got ${address.country}`);
  }
  
  const expectedIsDefault = expectedData.isDefault !== undefined ? expectedData.isDefault : true;
  if (address.is_default !== expectedIsDefault) {
    errors.push(`is_default mismatch: expected ${expectedIsDefault}, got ${address.is_default}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate referential integrity between all tables
 */
export function validateReferentialIntegrity(userData: {
  authUser: any;
  publicUser: any;
  address?: any;
}) {
  const errors: string[] = [];
  const { authUser, publicUser, address } = userData;
  
  // ID consistency
  if (authUser.id !== publicUser.id) {
    errors.push(`ID inconsistency: auth.users.id=${authUser.id}, public.users.id=${publicUser.id}`);
  }
  
  if (address && address.user_id !== publicUser.id) {
    errors.push(`Address user_id inconsistency: address.user_id=${address.user_id}, public.users.id=${publicUser.id}`);
  }
  
  // Email consistency
  if (authUser.email !== publicUser.email) {
    errors.push(`Email inconsistency: auth.users.email=${authUser.email}, public.users.email=${publicUser.email}`);
  }
  
  // Full name consistency
  if (authUser.raw_user_meta_data?.full_name !== publicUser.full_name) {
    errors.push(`Full name inconsistency: auth metadata=${authUser.raw_user_meta_data?.full_name}, public.users=${publicUser.full_name}`);
  }
  
  // Phone consistency (if present)
  if (authUser.phone && publicUser.phone) {
    const authPhone = authUser.phone.startsWith('+') ? authUser.phone : `+${authUser.phone}`;
    if (authPhone !== publicUser.phone) {
      errors.push(`Phone inconsistency: auth.users.phone=${authPhone}, public.users.phone=${publicUser.phone}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Clean up all test data for a user
 */
export async function cleanupUserData(userId: string) {
  try {
    // Delete from auth.users (this should cascade to public.users and addresses)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.warn(`Warning: Failed to delete auth user ${userId}: ${error.message}`);
    }
  } catch (error) {
    console.warn(`Warning: Failed to cleanup user data for ${userId}:`, error);
  }
}

/**
 * Clean up all test data (for use in test teardown)
 */
export async function cleanupAllTestData() {
  try {
    // Get all test users (those with test email patterns)
    const { data: testUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .like('email', '%jonh.dev.br+%');
    
    if (testUsers && testUsers.length > 0) {
      console.log(`🧹 Cleaning up ${testUsers.length} test users...`);
      
      for (const user of testUsers) {
        await cleanupUserData(user.id);
      }
      
      console.log('✅ Test data cleanup completed');
    }
  } catch (error) {
    console.warn('Warning: Failed to cleanup all test data:', error);
  }
}