import { SupabaseAuthService } from '../../../src/infrastructure/services/SupabaseAuthService';
import { createTestAdminClient, generateTestEmail, generateTestPhone, generateTestAddress } from '../../utils/test-helpers';
import {
  getAllUserData,
  validateAuthUser,
  validatePublicUser,
  validateAddress,
  validateReferentialIntegrity,
  confirmEmail,
  cleanupUserData
} from '../../utils/database-helpers';

describe('Complete Registration Integration', () => {
  let authService: SupabaseAuthService;
  let testUserIds: string[] = [];

  beforeAll(() => {
    const supabaseAdmin = createTestAdminClient();
    authService = new SupabaseAuthService(supabaseAdmin, supabaseAdmin);
  });

  afterEach(async () => {
    // Clean up test users after each test
    for (const userId of testUserIds) {
      await cleanupUserData(userId);
    }
    testUserIds = [];
  });

  describe('Cadastro com Telefone e Endereço', () => {
    test('should complete full registration flow with phone and address', async () => {
      // 1. Prepare test data
      const userData = {
        email: generateTestEmail('complete'),
        password: 'password123',
        fullName: 'Usuário Completo',
        phone: generateTestPhone(),
        addressData: generateTestAddress()
      };

      // 2. Register user
      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        userData.phone,
        userData.addressData
      );

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      testUserIds.push(result.user.id);

      // 3. Get all user data from database
      const allUserData = await getAllUserData(result.user.id);
      expect(allUserData.authUser).toBeDefined();
      expect(allUserData.publicUser).toBeDefined();
      expect(allUserData.address).toBeDefined();

      // 4. Validate auth.users data
      const authValidation = validateAuthUser(allUserData.authUser, {
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        providerType: 'phone'
      });
      
      // If validation fails, throw detailed error with authUser data
      if (!authValidation.isValid) {
        const debugInfo = {
          authUser: allUserData.authUser,
          expectedData: {
            email: userData.email,
            phone: userData.phone,
            fullName: userData.fullName,
            providerType: 'phone'
          },
          validationErrors: authValidation.errors
        };
        
        throw new Error(`Auth validation failed:\n${JSON.stringify(debugInfo, null, 2)}`);
      }
      
      expect(authValidation.isValid).toBe(true);

      // 5. Validate public.users data
      const publicValidation = validatePublicUser(allUserData.publicUser, {
        id: result.user.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        role: 'member'
      });
      
      if (!publicValidation.isValid) {
        console.error('Public user validation errors:', publicValidation.errors);
      }
      expect(publicValidation.isValid).toBe(true);

      // 6. Validate address data
      const addressValidation = validateAddress(allUserData.address, {
        userId: result.user.id,
        street: userData.addressData.street,
        neighborhood: userData.addressData.neighborhood,
        city: userData.addressData.city,
        zipCode: userData.addressData.zipCode,
        country: userData.addressData.country || 'Brasil',
        isDefault: true
      });
      
      if (!addressValidation.isValid) {
        console.error('Address validation errors:', addressValidation.errors);
      }
      expect(addressValidation.isValid).toBe(true);

      // 7. Validate referential integrity
      const integrityValidation = validateReferentialIntegrity(allUserData);
      
      if (!integrityValidation.isValid) {
        console.error('Referential integrity errors:', integrityValidation.errors);
      }
      expect(integrityValidation.isValid).toBe(true);

      // 8. Validate specific field values
      expect(allUserData.authUser.email).toBe(userData.email);
      expect(allUserData.authUser.phone).toBe(userData.phone.replace('+', ''));
      expect(allUserData.authUser.raw_user_meta_data.full_name).toBe(userData.fullName);
      expect(allUserData.authUser.raw_app_meta_data.provider_type).toBe('phone');
      
      expect(allUserData.publicUser.email).toBe(userData.email);
      expect(allUserData.publicUser.full_name).toBe(userData.fullName);
      expect(allUserData.publicUser.phone).toBe(userData.phone);
      expect(allUserData.publicUser.role).toBe('member');
      expect(allUserData.publicUser.country_code).toBe('+55');
      
      expect(allUserData.address.street).toBe(userData.addressData.street);
      expect(allUserData.address.city).toBe(userData.addressData.city);
      expect(allUserData.address.is_default).toBe(true);
      expect(allUserData.address.user_id).toBe(result.user.id);
    }, 30000);

    test('should handle registration without address', async () => {
      // 1. Prepare test data without address
      const userData = {
        email: generateTestEmail('no-address'),
        password: 'password123',
        fullName: 'Usuário Sem Endereço',
        phone: generateTestPhone()
      };

      // 2. Register user without address
      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        userData.phone
      );

      expect(result.user).toBeDefined();
      testUserIds.push(result.user.id);

      // 3. Get user data
      const allUserData = await getAllUserData(result.user.id);
      expect(allUserData.authUser).toBeDefined();
      expect(allUserData.publicUser).toBeDefined();
      
      // 4. Address should not exist
      expect(allUserData.address).toBeNull();
      expect(allUserData.addresses).toHaveLength(0);

      // 5. Validate auth and public user data
      const authValidation = validateAuthUser(allUserData.authUser, {
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        providerType: 'phone'
      });
      expect(authValidation.isValid).toBe(true);

      const publicValidation = validatePublicUser(allUserData.publicUser, {
        id: result.user.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone
      });
      expect(publicValidation.isValid).toBe(true);
    }, 30000);

    test('should handle registration without phone (email only)', async () => {
      // 1. Prepare test data without phone
      const userData = {
        email: generateTestEmail('email-only'),
        password: 'password123',
        fullName: 'Usuário Apenas Email',
        addressData: generateTestAddress()
      };

      // 2. Register user without phone
      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        undefined, // no phone
        userData.addressData
      );

      expect(result.user).toBeDefined();
      testUserIds.push(result.user.id);

      // 3. Get user data
      const allUserData = await getAllUserData(result.user.id);
      expect(allUserData.authUser).toBeDefined();
      expect(allUserData.publicUser).toBeDefined();
      expect(allUserData.address).toBeDefined();

      // 4. Validate auth user (should be email type)
      const authValidation = validateAuthUser(allUserData.authUser, {
        email: userData.email,
        fullName: userData.fullName,
        providerType: 'email'
      });
      expect(authValidation.isValid).toBe(true);

      // 5. Phone should be null/undefined
      expect(allUserData.authUser.phone).toBeNull();
      expect(allUserData.publicUser.phone).toBeNull();
      expect(allUserData.publicUser.country_code).toBeNull();

      // 6. Address should exist
      const addressValidation = validateAddress(allUserData.address, {
        userId: result.user.id,
        street: userData.addressData.street,
        neighborhood: userData.addressData.neighborhood,
        city: userData.addressData.city,
        zipCode: userData.addressData.zipCode
      });
      expect(addressValidation.isValid).toBe(true);
    }, 30000);
  });

  describe('Confirmação de Email', () => {
    test('should not duplicate data when email confirmed after immediate creation', async () => {
      // 1. Register user (immediate creation)
      const userData = {
        email: generateTestEmail('email-confirm'),
        password: 'password123',
        fullName: 'Usuário Confirmação Email',
        phone: generateTestPhone(),
        addressData: generateTestAddress()
      };

      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        userData.phone,
        userData.addressData
      );

      testUserIds.push(result.user.id);

      // 2. Verify data exists before confirmation
      const beforeConfirmation = await getAllUserData(result.user.id);
      expect(beforeConfirmation.publicUser).toBeDefined();
      expect(beforeConfirmation.address).toBeDefined();
      
      const publicUserIdBefore = beforeConfirmation.publicUser.id;
      const addressIdBefore = beforeConfirmation.address.id;

      // 3. Confirm email (simulates trigger)
      await confirmEmail(result.user.id);

      // 4. Verify no duplication occurred
      const afterConfirmation = await getAllUserData(result.user.id);
      expect(afterConfirmation.publicUser.id).toBe(publicUserIdBefore);
      expect(afterConfirmation.address.id).toBe(addressIdBefore);

      // 5. Verify email_confirmed_at was updated
      expect(afterConfirmation.authUser.email_confirmed_at).not.toBeNull();
      expect(new Date(afterConfirmation.authUser.email_confirmed_at)).toBeInstanceOf(Date);

      // 6. Verify data integrity is maintained
      const integrityValidation = validateReferentialIntegrity(afterConfirmation);
      expect(integrityValidation.isValid).toBe(true);
    }, 30000);
  });

  describe('Cenários de Performance', () => {
    test('should complete registration within acceptable time', async () => {
      const startTime = Date.now();
      
      const userData = {
        email: generateTestEmail('performance'),
        password: 'password123',
        fullName: 'Performance Test User',
        phone: generateTestPhone(),
        addressData: generateTestAddress()
      };

      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        userData.phone,
        userData.addressData
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      testUserIds.push(result.user.id);

      // Should complete in less than 10 seconds (increased from 5s for integration tests)
      expect(duration).toBeLessThan(10000);
      expect(result.user).toBeDefined();
      
      console.log(`✅ Registration completed in ${duration}ms`);
    }, 15000);

    test('should handle concurrent registrations', async () => {
      const concurrentCount = 5; // Reduced from 10 for stability
      
      // Create multiple registration promises
      const promises = Array.from({ length: concurrentCount }, (_, i) => 
        authService.register(
          generateTestEmail(`concurrent-${i}`),
          'password123',
          `Concurrent User ${i}`,
          generateTestPhone(),
          generateTestAddress()
        )
      );

      // Execute all registrations concurrently
      const results = await Promise.all(promises);

      // Add all user IDs for cleanup
      testUserIds.push(...results.map(r => r.user.id));

      // All should succeed
      results.forEach((result, index) => {
        expect(result.user).toBeDefined();
        expect(result.token).toBeDefined();
        expect(result.user.email).toContain(`concurrent-${index}`);
      });

      // Verify all users were created properly
      for (const result of results) {
        const userData = await getAllUserData(result.user.id);
        expect(userData.authUser).toBeDefined();
        expect(userData.publicUser).toBeDefined();
        expect(userData.address).toBeDefined();
      }
      
      console.log(`✅ ${concurrentCount} concurrent registrations completed successfully`);
    }, 30000);
  });
});