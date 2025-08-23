# Testes Necessários para Cadastro Completo

## Visão Geral

Este documento especifica os testes que devem ser implementados para garantir cobertura completa do fluxo de cadastro, incluindo validações individuais e testes de integração.

## Categorias de Testes

### 1. Testes Unitários

#### 1.1 SupabaseAuthService.register

**Arquivo:** `test/__tests__/auth/supabase-auth-service.test.ts`

```typescript
describe('SupabaseAuthService.register', () => {
  describe('Fluxo com Admin Client', () => {
    test('should use admin.createUser when phone provided and admin available', async () => {
      // Testa se usa admin.createUser quando telefone fornecido
    });
    
    test('should set correct metadata in admin.createUser', async () => {
      // Verifica user_metadata e app_metadata corretos
    });
    
    test('should handle admin.createUser errors gracefully', async () => {
      // Testa tratamento de erros do admin.createUser
    });
  });
  
  describe('Fluxo com SignUp Normal', () => {
    test('should fallback to signUp when admin not available', async () => {
      // Testa fallback para signUp normal
    });
    
    test('should normalize metadata via admin.updateUserById', async () => {
      // Verifica normalização de metadados após signUp
    });
    
    test('should handle updateUserById errors', async () => {
      // Testa tratamento de erros na normalização
    });
  });
  
  describe('Criação de Dados Públicos', () => {
    test('should call create_user_with_address RPC', async () => {
      // Verifica chamada da RPC de criação
    });
    
    test('should call save_pending_address_data RPC when address provided', async () => {
      // Verifica salvamento de endereço pendente
    });
    
    test('should handle RPC errors without failing registration', async () => {
      // Verifica que erros de RPC não falham o registro
    });
  });
  
  describe('Validações de Entrada', () => {
    test('should validate email format', async () => {
      // Testa validação de email
    });
    
    test('should validate phone format', async () => {
      // Testa validação de telefone
    });
    
    test('should validate required fields', async () => {
      // Testa campos obrigatórios
    });
  });
});
```

#### 1.2 Funções RPC

**Arquivo:** `test/__tests__/database/rpc-functions.test.ts`

```typescript
describe('RPC Functions', () => {
  describe('create_user_with_address', () => {
    test('should create user in public.users', async () => {
      // Testa criação em public.users
    });
    
    test('should create address in public.addresses when provided', async () => {
      // Testa criação em public.addresses
    });
    
    test('should handle upsert conflicts gracefully', async () => {
      // Testa comportamento de UPSERT
    });
    
    test('should work without address data', async () => {
      // Testa criação apenas de usuário
    });
  });
  
  describe('save_pending_address_data', () => {
    test('should update app_metadata with pending_address', async () => {
      // Testa salvamento em app_metadata
    });
    
    test('should merge with existing app_metadata', async () => {
      // Testa merge com metadados existentes
    });
  });
  
  describe('handle_email_confirmation', () => {
    test('should create user when email confirmed and user not exists', async () => {
      // Testa criação via trigger
    });
    
    test('should skip creation when user already exists', async () => {
      // Testa proteção contra duplicação
    });
    
    test('should create address from pending_address', async () => {
      // Testa criação de endereço via trigger
    });
  });
});
```

### 2. Testes de Integração

#### 2.1 Cadastro Completo

**Arquivo:** `test/__tests__/integration/complete-registration.test.ts`

```typescript
describe('Complete Registration Integration', () => {
  describe('Cadastro com Telefone e Endereço', () => {
    test('should complete full registration flow', async () => {
      const userData = {
        email: generateTestEmail('complete'),
        password: 'password123',
        fullName: 'Usuário Completo',
        phone: generateTestPhone(),
        addressData: generateTestAddress()
      };
      
      // 1. Registrar usuário
      const result = await authService.register(
        userData.email,
        userData.password,
        userData.fullName,
        userData.phone,
        userData.addressData
      );
      
      // 2. Verificar dados em auth.users
      const authUser = await getAuthUser(result.user.id);
      expect(authUser.email).toBe(userData.email);
      expect(authUser.phone).toBe(userData.phone.replace('+', ''));
      expect(authUser.raw_user_meta_data.full_name).toBe(userData.fullName);
      expect(authUser.raw_user_meta_data.provider_type).toBe('phone');
      expect(authUser.raw_app_meta_data.provider_type).toBe('phone');
      
      // 3. Verificar dados em public.users
      const publicUser = await getPublicUser(result.user.id);
      expect(publicUser.email).toBe(userData.email);
      expect(publicUser.full_name).toBe(userData.fullName);
      expect(publicUser.phone).toBe(userData.phone);
      expect(publicUser.role).toBe('member');
      
      // 4. Verificar dados em public.addresses
      const address = await getDefaultAddress(result.user.id);
      expect(address.street).toBe(userData.addressData.street);
      expect(address.city).toBe(userData.addressData.city);
      expect(address.is_default).toBe(true);
      
      // 5. Verificar integridade referencial
      expect(address.user_id).toBe(publicUser.id);
      expect(publicUser.id).toBe(authUser.id);
    });
    
    test('should handle registration without address', async () => {
      // Testa cadastro apenas com dados básicos
    });
    
    test('should handle registration without phone', async () => {
      // Testa cadastro apenas com email
    });
  });
  
  describe('Confirmação de Email', () => {
    test('should not duplicate data when email confirmed after immediate creation', async () => {
      // 1. Registrar usuário (criação imediata)
      const result = await authService.register(email, password, fullName, phone, address);
      
      // 2. Verificar dados existem
      const beforeConfirmation = await getAllUserData(result.user.id);
      expect(beforeConfirmation.publicUser).toBeDefined();
      expect(beforeConfirmation.address).toBeDefined();
      
      // 3. Confirmar email (trigger)
      await confirmEmail(result.user.id);
      
      // 4. Verificar que não houve duplicação
      const afterConfirmation = await getAllUserData(result.user.id);
      expect(afterConfirmation.publicUser.id).toBe(beforeConfirmation.publicUser.id);
      expect(afterConfirmation.address.id).toBe(beforeConfirmation.address.id);
      
      // 5. Verificar que email_confirmed_at foi atualizado
      const authUser = await getAuthUser(result.user.id);
      expect(authUser.email_confirmed_at).not.toBeNull();
    });
    
    test('should create data via trigger when immediate creation fails', async () => {
      // Simula falha na criação imediata e sucesso via trigger
    });
  });
});
```

#### 2.2 Cenários de Erro

**Arquivo:** `test/__tests__/integration/error-scenarios.test.ts`

```typescript
describe('Error Scenarios Integration', () => {
  describe('Conflitos de Dados', () => {
    test('should handle duplicate email registration', async () => {
      // Testa registro com email duplicado
    });
    
    test('should handle duplicate phone registration', async () => {
      // Testa registro com telefone duplicado
    });
  });
  
  describe('Falhas de Rede/Banco', () => {
    test('should handle auth.users creation failure', async () => {
      // Simula falha na criação em auth.users
    });
    
    test('should handle public.users creation failure', async () => {
      // Simula falha na criação em public.users
    });
    
    test('should handle address creation failure', async () => {
      // Simula falha na criação de endereço
    });
  });
  
  describe('Dados Inválidos', () => {
    test('should reject invalid email format', async () => {
      // Testa rejeição de email inválido
    });
    
    test('should reject invalid phone format', async () => {
      // Testa rejeição de telefone inválido
    });
    
    test('should reject incomplete address data', async () => {
      // Testa rejeição de endereço incompleto
    });
  });
});
```

### 3. Testes de Performance

#### 3.1 Tempo de Resposta

**Arquivo:** `test/__tests__/performance/registration-performance.test.ts`

```typescript
describe('Registration Performance', () => {
  test('should complete registration within acceptable time', async () => {
    const startTime = Date.now();
    
    await authService.register(
      generateTestEmail('perf'),
      'password123',
      'Performance Test User',
      generateTestPhone(),
      generateTestAddress()
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Deve completar em menos de 5 segundos
    expect(duration).toBeLessThan(5000);
  });
  
  test('should handle concurrent registrations', async () => {
    // Testa múltiplos registros simultâneos
    const promises = Array.from({ length: 10 }, (_, i) => 
      authService.register(
        generateTestEmail(`concurrent-${i}`),
        'password123',
        `Concurrent User ${i}`,
        generateTestPhone(),
        generateTestAddress()
      )
    );
    
    const results = await Promise.all(promises);
    
    // Todos devem ter sucesso
    results.forEach(result => {
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });
});
```

### 4. Testes de Validação Individual

#### 4.1 Validação de Tabelas

**Arquivo:** `test/__tests__/validation/table-validation.test.ts`

```typescript
describe('Table Validation', () => {
  describe('auth.users Validation', () => {
    test('should have all required fields populated', async () => {
      const result = await authService.register(
        generateTestEmail('auth-validation'),
        'password123',
        'Auth Validation User',
        generateTestPhone(),
        generateTestAddress()
      );
      
      const authUser = await getAuthUser(result.user.id);
      
      // Campos obrigatórios
      expect(authUser.id).toBeDefined();
      expect(authUser.email).toBeDefined();
      expect(authUser.phone).toBeDefined();
      expect(authUser.created_at).toBeDefined();
      
      // Metadados
      expect(authUser.raw_user_meta_data.full_name).toBeDefined();
      expect(authUser.raw_user_meta_data.provider_type).toBe('phone');
      expect(authUser.raw_app_meta_data.provider_type).toBe('phone');
      expect(authUser.raw_app_meta_data.pending_address).toBeDefined();
    });
  });
  
  describe('public.users Validation', () => {
    test('should have all required fields populated', async () => {
      const result = await authService.register(
        generateTestEmail('public-validation'),
        'password123',
        'Public Validation User',
        generateTestPhone(),
        generateTestAddress()
      );
      
      const publicUser = await getPublicUser(result.user.id);
      
      // Campos obrigatórios
      expect(publicUser.id).toBe(result.user.id);
      expect(publicUser.email).toBeDefined();
      expect(publicUser.full_name).toBeDefined();
      expect(publicUser.phone).toBeDefined();
      expect(publicUser.country_code).toBe('+55');
      expect(publicUser.role).toBe('member');
      expect(publicUser.created_at).toBeDefined();
      expect(publicUser.updated_at).toBeDefined();
    });
  });
  
  describe('public.addresses Validation', () => {
    test('should have all required fields populated', async () => {
      const addressData = generateTestAddress();
      const result = await authService.register(
        generateTestEmail('address-validation'),
        'password123',
        'Address Validation User',
        generateTestPhone(),
        addressData
      );
      
      const address = await getDefaultAddress(result.user.id);
      
      // Campos obrigatórios
      expect(address.id).toBeDefined();
      expect(address.user_id).toBe(result.user.id);
      expect(address.street).toBe(addressData.street);
      expect(address.neighborhood).toBe(addressData.neighborhood);
      expect(address.city).toBe(addressData.city);
      expect(address.zip_code).toBe(addressData.zipCode);
      expect(address.country).toBe(addressData.country || 'Brasil');
      expect(address.is_default).toBe(true);
      expect(address.created_at).toBeDefined();
      expect(address.updated_at).toBeDefined();
    });
  });
});
```

### 5. Testes de Integridade Referencial

**Arquivo:** `test/__tests__/validation/referential-integrity.test.ts`

```typescript
describe('Referential Integrity', () => {
  test('should maintain referential integrity between all tables', async () => {
    const result = await authService.register(
      generateTestEmail('integrity'),
      'password123',
      'Integrity Test User',
      generateTestPhone(),
      generateTestAddress()
    );
    
    // Verificar que IDs são consistentes
    const authUser = await getAuthUser(result.user.id);
    const publicUser = await getPublicUser(result.user.id);
    const address = await getDefaultAddress(result.user.id);
    
    expect(authUser.id).toBe(result.user.id);
    expect(publicUser.id).toBe(result.user.id);
    expect(address.user_id).toBe(result.user.id);
    
    // Verificar que dados são consistentes
    expect(authUser.email).toBe(publicUser.email);
    expect(authUser.raw_user_meta_data.full_name).toBe(publicUser.full_name);
    
    // Verificar foreign keys
    const addressUser = await supabase
      .from('users')
      .select('*')
      .eq('id', address.user_id)
      .single();
    
    expect(addressUser.data).toBeDefined();
    expect(addressUser.data.id).toBe(publicUser.id);
  });
  
  test('should handle cascade deletes correctly', async () => {
    // Testa comportamento de deleção em cascata
  });
});
```

## Helpers de Teste

### Arquivo: `test/utils/database-helpers.ts`

```typescript
export async function getAuthUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('auth.users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPublicUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDefaultAddress(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllUserData(userId: string) {
  const [authUser, publicUser, address] = await Promise.all([
    getAuthUser(userId),
    getPublicUser(userId),
    getDefaultAddress(userId)
  ]);
  
  return { authUser, publicUser, address };
}

export async function confirmEmail(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  );
  
  if (error) throw error;
}
```

## Configuração de Testes

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: [
    '<rootDir>/test/__tests__/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Setup File

```typescript
// test/setup.ts
import { config } from 'dotenv';

// Carregar variáveis de ambiente de teste
config({ path: '.env.test' });

// Configurar timeout global para testes de integração
jest.setTimeout(30000);

// Configurar limpeza global
afterAll(async () => {
  // Limpar dados de teste
  await cleanupAllTestData();
});
```

## Critérios de Sucesso

### Cobertura de Código
- **Mínimo:** 80% de cobertura em todas as métricas
- **Ideal:** 90% de cobertura em funções críticas

### Performance
- **Registro completo:** < 5 segundos
- **Registros concorrentes:** Suporte a 10+ simultâneos

### Confiabilidade
- **Taxa de sucesso:** > 99% em condições normais
- **Recuperação de erro:** < 1% de falhas irrecuperáveis

### Integridade
- **Consistência:** 100% de integridade referencial
- **Atomicidade:** Rollback completo em caso de falha

---

**Última atualização:** 2025-01-21  
**Responsável:** Assistente AI  
**Status:** Especificação completa, pronto para implementação