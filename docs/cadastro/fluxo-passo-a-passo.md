# Fluxo de Cadastro - Passo a Passo com Exemplos Práticos

## Visão Geral

Este documento detalha o fluxo completo de cadastro de usuários com exemplos práticos de cada etapa, incluindo dados reais e códigos SQL/TypeScript.

## Cenário de Exemplo

**Dados do Usuário:**
- Email: `joao.silva@email.com`
- Senha: `minhasenha123`
- Nome: `João Silva`
- Telefone: `+5511999887766`
- Endereço:
  ```json
  {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "country": "Brasil"
  }
  ```

## Passo 1: Chamada do Frontend

### Código Frontend (React Native)
```typescript
// Componente de registro
const handleRegister = async () => {
  try {
    const result = await authService.register(
      'joao.silva@email.com',
      'minhasenha123',
      'João Silva',
      '+5511999887766',
      {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      }
    );
    
    console.log('Usuário registrado:', result.user);
  } catch (error) {
    console.error('Erro no registro:', error);
  }
};
```

## Passo 2: SupabaseAuthService.register

### 2.1 Entrada do Método
```typescript
// SupabaseAuthService.ts - linha 58
async register(
  email: 'joao.silva@email.com',
  password: 'minhasenha123',
  fullName: 'João Silva',
  phone: '+5511999887766',
  addressData: { street: 'Rua das Flores', ... }
): Promise<AuthResult>
```

### 2.2 Log Inicial
```typescript
console.log('[SupabaseAuthService] Iniciando registro de usuário:', {
  email: 'joao.silva@email.com',
  fullName: 'João Silva',
  hasPhone: true,
  phone: '+5511999887766',
  hasAddress: true,
  timestamp: '2025-01-21T10:30:00.000Z'
});
```

### 2.3 Criação via Admin (Fluxo Principal)
```typescript
// Como telefone foi fornecido e supabaseAdmin está disponível
const adminResult = await supabaseAdmin.auth.admin.createUser({
  email: 'joao.silva@email.com',
  password: 'minhasenha123',
  phone: '+5511999887766',
  phone_confirm: true,
  user_metadata: {
    full_name: 'João Silva',
    phone_verified: true,
    phone: '+5511999887766'
  },
  app_metadata: {
    pending_address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil'
    },
    provider_type: 'email' // Será sobrescrito pelo Supabase para 'phone'
  }
});
```

## Passo 3: Estado em auth.users

### 3.1 Dados Inseridos
```sql
-- Resultado em auth.users após admin.createUser
SELECT 
  id,
  email,
  phone,
  email_confirmed_at,
  phone_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'joao.silva@email.com';
```

### 3.2 Resultado Esperado
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao.silva@email.com",
  "phone": "5511999887766", // Sem o '+'
  "email_confirmed_at": null,
  "phone_confirmed_at": "2025-01-21T10:30:00.000Z",
  "raw_user_meta_data": {
    "full_name": "João Silva",
    "phone_verified": true,
    "phone": "+5511999887766",
    "provider_type": "phone" // Supabase sobrescreve
  },
  "raw_app_meta_data": {
    "pending_address": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "country": "Brasil"
    },
    "provider_type": "phone" // Supabase sobrescreve
  }
}
```

## Passo 4: Criação Imediata via RPC

### 4.1 Chamada create_user_with_address
```typescript
// SupabaseAuthService.ts - linha 189
const { error: createError } = await supabaseAdmin.rpc('create_user_with_address', {
  p_user_id: '550e8400-e29b-41d4-a716-446655440000',
  p_email: 'joao.silva@email.com',
  p_full_name: 'João Silva',
  p_phone: '+5511999887766',
  p_address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil'
  }
});
```

### 4.2 Execução da RPC
```sql
-- Função create_user_with_address executa:

-- 1. Inserir em public.users
INSERT INTO public.users (id, email, full_name, phone, country_code, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'joao.silva@email.com',
  'João Silva',
  '+5511999887766',
  '+55',
  'member'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 2. Inserir em public.addresses
INSERT INTO public.addresses (
  user_id,
  street,
  number,
  neighborhood,
  city,
  state,
  zip_code,
  country,
  is_default
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Rua das Flores',
  '123',
  'Centro',
  'São Paulo',
  'SP',
  '01234-567',
  'Brasil',
  true
)
ON CONFLICT DO NOTHING;
```

### 4.3 Estado das Tabelas Públicas
```sql
-- public.users após RPC
SELECT * FROM public.users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao.silva@email.com",
  "full_name": "João Silva",
  "phone": "+5511999887766",
  "country_code": "+55",
  "role": "member",
  "created_at": "2025-01-21T10:30:01.000Z",
  "updated_at": "2025-01-21T10:30:01.000Z"
}
```

```sql
-- public.addresses após RPC
SELECT * FROM public.addresses WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
```

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01234-567",
  "country": "Brasil",
  "is_default": true,
  "created_at": "2025-01-21T10:30:01.000Z",
  "updated_at": "2025-01-21T10:30:01.000Z"
}
```

## Passo 5: Salvamento de Dados Pendentes

### 5.1 Chamada save_pending_address_data
```typescript
// SupabaseAuthService.ts - linha 205
const { error: metadataError } = await supabaseAdmin.rpc('save_pending_address_data', {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  address_data: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil'
  }
});
```

### 5.2 Execução da RPC
```sql
-- Função save_pending_address_data executa:
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('pending_address', $2)
WHERE id = $1;
```

**Nota:** Esta RPC é redundante neste caso, pois os dados já foram salvos no `admin.createUser`.

## Passo 6: Retorno do Resultado

### 6.1 Objeto User Retornado
```typescript
const resultUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'joao.silva@email.com',
  fullName: 'João Silva',
  phone: '+5511999887766',
  role: 'member' as UserRole,
  createdAt: new Date('2025-01-21T10:30:00.000Z'),
  updatedAt: new Date('2025-01-21T10:30:00.000Z'),
};

return {
  user: resultUser,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'v1.MjAyNS0wMS0yMVQxMDozMDowMC4wMDBa...',
};
```

## Passo 7: Confirmação de Email (Futuro)

### 7.1 Usuário Clica no Link de Confirmação
```sql
-- Supabase atualiza automaticamente
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### 7.2 Trigger handle_email_confirmation
```sql
-- Trigger verifica se usuário já existe em public.users
SELECT EXISTS(SELECT 1 FROM public.users WHERE id = '550e8400-e29b-41d4-a716-446655440000');
-- Resultado: true (já existe devido à criação imediata)

-- Trigger verifica se endereço padrão já existe
SELECT EXISTS(
  SELECT 1 FROM public.addresses 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND is_default = true
);
-- Resultado: true (já existe devido à criação imediata)

-- Trigger não faz nada (dados já existem)
```

## Verificação Final

### Consulta Completa
```sql
SELECT 
  au.id,
  au.email,
  au.phone as auth_phone,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'full_name' as user_meta_full_name,
  au.raw_user_meta_data->>'provider_type' as user_meta_provider_type,
  au.raw_app_meta_data->>'provider_type' as app_meta_provider_type,
  u.full_name as public_full_name,
  u.phone as public_phone,
  u.role,
  a.street,
  a.city,
  a.is_default
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.addresses a ON au.id = a.user_id
WHERE au.email = 'joao.silva@email.com';
```

### Resultado Esperado
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao.silva@email.com",
  "auth_phone": "5511999887766",
  "email_confirmed_at": null, // Até confirmação
  "user_meta_full_name": "João Silva",
  "user_meta_provider_type": "phone",
  "app_meta_provider_type": "phone",
  "public_full_name": "João Silva",
  "public_phone": "+5511999887766",
  "role": "member",
  "street": "Rua das Flores",
  "city": "São Paulo",
  "is_default": true
}
```

## Pontos de Atenção

### 1. Diferenças de Formato de Telefone
- `auth.users.phone`: `"5511999887766"` (sem +)
- `user_metadata.phone`: `"+5511999887766"` (com +)
- `public.users.phone`: `"+5511999887766"` (com +)

### 2. Provider Type
- Código define: `'email'`
- Supabase sobrescreve: `'phone'` (quando telefone presente)

### 3. Criação Dupla
- RPC `create_user_with_address`: Cria imediatamente
- Trigger `handle_email_confirmation`: Tentaria criar na confirmação
- Proteção: `ON CONFLICT DO NOTHING` evita duplicação

### 4. Dependências
- `public.addresses` depende de `public.users`
- Trigger só executa se email for confirmado
- RPC executa independentemente de confirmação

---

**Última atualização:** 2025-01-21  
**Responsável:** Assistente AI  
**Status:** Documentação completa do fluxo atual