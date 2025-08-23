# Processo de Criação de Usuário de Autenticação (auth.users)

## 📋 Visão Geral

Este documento detalha o processo completo de criação de usuários na tabela `auth.users` do Supabase, incluindo preenchimento correto de todos os campos obrigatórios e metadados.

## 🔧 Campos Obrigatórios

### Campos Automáticos (Supabase)
- `id` (UUID) - Gerado automaticamente
- `aud` (audience) - Definido como "authenticated"
- `role` - Definido como "authenticated"
- `created_at` - Timestamp automático
- `updated_at` - Timestamp automático
- `instance_id` - ID da instância Supabase

### Campos Condicionais por Método de Autenticação

#### Autenticação por Email
```typescript
{
  email: string,                    // ✅ OBRIGATÓRIO
  password: string,                 // ✅ OBRIGATÓRIO (hash gerado)
  phone: null,                      // ❌ Não aplicável
  email_confirmed_at: Date | null,  // ⏳ Após confirmação
  phone_confirmed_at: null          // ❌ Não aplicável
}
```

#### Autenticação por Telefone
```typescript
{
  email: string,                    // ✅ OBRIGATÓRIO (mesmo para phone auth)
  password: string,                 // ✅ OBRIGATÓRIO (hash gerado)
  phone: string,                    // ✅ OBRIGATÓRIO
  email_confirmed_at: Date | null,  // ⏳ Após confirmação de email
  phone_confirmed_at: Date | null   // ⏳ Após confirmação de telefone
}
```

#### Autenticação OAuth (Social)
```typescript
{
  email: string,                    // ✅ OBRIGATÓRIO (do provedor)
  password: null,                   // ❌ Não aplicável
  phone: string | null,             // ⚠️ Opcional (se fornecido pelo provedor)
  email_confirmed_at: Date,         // ✅ Confirmado automaticamente
  phone_confirmed_at: Date | null   // ⏳ Se telefone fornecido
}
```

## 📊 Metadados (raw_user_meta_data)

### Estrutura Padrão
```typescript
interface UserMetadata {
  full_name: string;              // ✅ OBRIGATÓRIO
  phone?: string;                 // ⚠️ Opcional (duplicado para compatibilidade)
  phone_verified?: boolean;       // ⚠️ Se telefone fornecido
  avatar_url?: string;            // ⚠️ Opcional
  // Campos do OAuth provider (se aplicável)
  provider_id?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
}
```

### Exemplo por Método

#### Email/Senha
```json
{
  "full_name": "João Silva",
  "registration_source": "web"
}
```

#### Telefone
```json
{
  "full_name": "João Silva",
  "phone": "+5511999999999",
  "phone_verified": true,
  "registration_source": "app"
}
```

#### OAuth (Google)
```json
{
  "full_name": "João Silva",
  "email": "joao@gmail.com",
  "email_verified": true,
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "provider_id": "google_123456789",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

## 🏢 Metadados da Aplicação (raw_app_meta_data)

### Estrutura Obrigatória
```typescript
interface AppMetadata {
  provider: ProviderName;           // ✅ OBRIGATÓRIO - Primeiro provedor usado
  providers: ProviderName[];        // ✅ OBRIGATÓRIO - Lista de todos os provedores
  provider_type: ProviderType;      // ✅ OBRIGATÓRIO - Tipo de autenticação
  pending_address?: AddressData;    // ⚠️ Opcional - Endereço pendente
  role?: UserRole;                  // ⚠️ Opcional - Role da aplicação
}

type ProviderName = 'email' | 'phone' | 'google' | 'apple' | 'github' | 'facebook';
type ProviderType = 'email' | 'phone' | 'oauth';
type UserRole = 'admin' | 'pastor' | 'deacon' | 'leader' | 'member';
```

### Lógica de Preenchimento

#### Cadastro por Email
```json
{
  "provider": "email",
  "providers": ["email"],
  "provider_type": "email"
}
```

#### Cadastro por Telefone
```json
{
  "provider": "phone",
  "providers": ["email", "phone"],
  "provider_type": "phone"
}
```

**Nota**: Email é sempre incluído em `providers` pois é campo obrigatório no Supabase.

#### Cadastro OAuth
```json
{
  "provider": "google",
  "providers": ["google"],
  "provider_type": "oauth"
}
```

## 🔄 Fluxo de Criação no SupabaseAuthService

### 1. Preparação dos Dados
```typescript
// Determinar provider baseado no método de criação
const provider = phone ? 'phone' : 'email';
const providerType = phone ? 'phone' : 'email';

// Preparar user_metadata
const userMetadata = {
  full_name: fullName,
  ...(phone && { phone, phone_verified: true })
};

// Preparar app_metadata
const appMetadata = {
  provider: phone ? 'phone' : 'email',
  providers: phone ? ['email', 'phone'] : ['email'],
  provider_type: phone ? 'phone' : 'email',
  ...(addressData && { pending_address: addressData })
};
```

### 2. Criação via Admin (Preferencial)
```typescript
const adminResult = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  ...(phone && { phone, phone_confirm: true }),
  user_metadata: userMetadata,
  app_metadata: appMetadata
});
```

### 3. Fallback via SignUp + Update
```typescript
// 1. SignUp normal
const signUpResult = await supabase.auth.signUp({
  email,
  password,
  ...(phone && { phone }),
  options: { data: userMetadata }
});

// 2. Update app_metadata via Admin
if (signUpResult.data.user) {
  await supabaseAdmin.auth.admin.updateUserById(
    signUpResult.data.user.id,
    {
      user_metadata: userMetadata,
      app_metadata: appMetadata
    }
  );
}
```

## ✅ Validação de Campos

### Checklist de Validação
```typescript
function validateAuthUser(user: AuthUser): ValidationResult {
  const errors: string[] = [];
  
  // Campos obrigatórios básicos
  if (!user.id) errors.push('ID é obrigatório');
  if (!user.email) errors.push('Email é obrigatório');
  if (!user.created_at) errors.push('Created_at é obrigatório');
  
  // Metadados obrigatórios
  if (!user.raw_user_meta_data?.full_name) {
    errors.push('full_name é obrigatório em user_metadata');
  }
  
  if (!user.raw_app_meta_data?.provider) {
    errors.push('provider é obrigatório em app_metadata');
  }
  
  if (!user.raw_app_meta_data?.providers?.length) {
    errors.push('providers é obrigatório em app_metadata');
  }
  
  if (!user.raw_app_meta_data?.provider_type) {
    errors.push('provider_type é obrigatório em app_metadata');
  }
  
  // Validação de consistência
  const { provider, provider_type } = user.raw_app_meta_data;
  
  if (provider_type === 'phone' && provider !== 'phone') {
    errors.push('Inconsistência: provider_type=phone mas provider≠phone');
  }
  
  if (provider_type === 'email' && provider !== 'email') {
    errors.push('Inconsistência: provider_type=email mas provider≠email');
  }
  
  if (provider_type === 'oauth' && !['google', 'apple', 'github', 'facebook'].includes(provider)) {
    errors.push('Inconsistência: provider_type=oauth mas provider não é OAuth');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## 🧪 Testes de Validação

### Teste de Criação por Email
```typescript
test('deve criar usuário por email com todos os campos obrigatórios', async () => {
  const result = await authService.register({
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User'
  });
  
  expect(result.user).toBeDefined();
  expect(result.user.email).toBe('test@example.com');
  expect(result.user.raw_user_meta_data.full_name).toBe('Test User');
  expect(result.user.raw_app_meta_data.provider).toBe('email');
  expect(result.user.raw_app_meta_data.provider_type).toBe('email');
  expect(result.user.raw_app_meta_data.providers).toEqual(['email']);
});
```

### Teste de Criação por Telefone
```typescript
test('deve criar usuário por telefone com todos os campos obrigatórios', async () => {
  const result = await authService.register({
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    phone: '+5511999999999'
  });
  
  expect(result.user).toBeDefined();
  expect(result.user.phone).toBe('+5511999999999');
  expect(result.user.raw_user_meta_data.phone_verified).toBe(true);
  expect(result.user.raw_app_meta_data.provider).toBe('phone');
  expect(result.user.raw_app_meta_data.provider_type).toBe('phone');
  expect(result.user.raw_app_meta_data.providers).toEqual(['email', 'phone']);
});
```

## 🚨 Problemas Conhecidos

### 1. Inconsistência Provider vs Provider_Type
**Problema**: `provider` = "email" mas `provider_type` = "phone"
**Causa**: Lógica de preenchimento não considera telefone como método primário
**Solução**: ✅ **RESOLVIDO** - Corrigida lógica no `SupabaseAuthService.register`

### 2. Email Obrigatório para Phone Auth
**Problema**: Supabase exige email mesmo para autenticação por telefone
**Impacto**: `providers` sempre inclui "email"
**Solução**: Documentar comportamento e ajustar lógica de validação

### 3. Duplicação de Telefone
**Problema**: Telefone aparece tanto em `phone` quanto em `user_metadata.phone`
**Causa**: Compatibilidade com diferentes fluxos
**Solução**: Manter duplicação por segurança, documentar comportamento

## 📝 Próximas Implementações

- [x] Corrigir lógica do `provider` no `SupabaseAuthService`
- [x] Implementar função de validação completa
- [x] Criar testes de integração para todos os métodos
- [ ] Documentar fluxo OAuth quando implementado
- [ ] Adicionar validação de consistência em tempo real

---

**Última atualização**: 2025-01-22  
**Responsável**: Trae AI  
**Status**: ✅ **CONCLUÍDO** - Todos os problemas de inconsistência resolvidos