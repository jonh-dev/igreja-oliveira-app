# Task 002: Analisar Fluxo de Cadastro Real

## Status: CONCLUÍDA ✅

## Objetivo

Analisar o fluxo de cadastro real que registra dados nas tabelas `auth.users`, `users` e `addresses` para identificar diferenças com os testes funcionais e garantir que todos os campos necessários sejam preenchidos corretamente.

## Escopo da Análise

### Tabelas Envolvidas

1. **`auth.users`** - Todas as colunas devem ser preenchidas:
   - `id`, `email`, `phone`
   - `raw_app_meta_data` (incluindo `provider_type`)
   - `raw_user_meta_data` (incluindo `full_name`, etc.)
   - Outros campos de autenticação

2. **`users`** - Tabela pública de usuários:
   - Relacionamento com `auth.users.id`
   - Dados de perfil do usuário

3. **`addresses`** - Tabela de endereços:
   - Relacionamento com `users.id`
   - Dados de localização

### Arquivos a Investigar

1. **Serviços de Autenticação**:
   - `src/services/SupabaseAuthService.ts` (já analisado)
   - Outros serviços relacionados ao cadastro

2. **Testes de Integração**:
   - `test/__tests__/integration/` - verificar testes existentes
   - `test/__tests__/auth/user-registration.test.ts` - fluxo completo

3. **Componentes de UI**:
   - Formulários de cadastro
   - Fluxos de onboarding

4. **Funções RPC/Database**:
   - `create_user_with_address`
   - `save_pending_address_data`
   - Outras funções relacionadas

## Metodologia

### Fase 1: Mapeamento do Fluxo Atual

1. **Identificar pontos de entrada**:
   - Onde o cadastro é iniciado
   - Quais dados são coletados
   - Como os dados fluem entre as tabelas

2. **Analisar implementação atual**:
   - Código dos serviços
   - Funções de banco de dados
   - Validações existentes

3. **Mapear dependências**:
   - Ordem de criação dos registros
   - Relacionamentos entre tabelas
   - Tratamento de erros

### Fase 2: Comparação com Testes

1. **Identificar discrepâncias**:
   - Diferenças entre teste e implementação real
   - Campos não testados
   - Cenários não cobertos

2. **Validar comportamento esperado**:
   - O que deveria acontecer vs. o que acontece
   - Casos edge não tratados

### Fase 3: Documentação de Achados

1. **Estado atual detalhado**
2. **Problemas identificados**
3. **Recomendações de correção**

## Critérios de Sucesso

- [ ] Fluxo completo mapeado e documentado
- [ ] Diferenças com testes identificadas
- [ ] Problemas de persistência catalogados
- [ ] Plano de correção definido
- [ ] Validação via MCP dos dados atuais

## Achados Principais

### 1. Fluxo de Cadastro Real (SupabaseAuthService.register)

**Quando telefone é fornecido e supabaseAdmin disponível:**
```typescript
// Usa admin.createUser para garantir persistência do telefone
const adminResult = await supabaseAdmin.auth.admin.createUser({
  email, password, phone,
  phone_confirm: true,
  user_metadata: { full_name, phone_verified: true, phone },
  app_metadata: { pending_address: addressData, provider_type: 'email' }
});
```

**Fallback com signUp normal:**
```typescript
// SignUp normal + correção via admin.updateUserById
const signUpResult = await supabase.auth.signUp({
  email, password, phone,
  options: { data: { full_name, phone, provider_type: 'email' } }
});

// Normalização via admin
await supabaseAdmin.auth.admin.updateUserById(userId, {
  phone, phone_confirm: true,
  user_metadata: { full_name, phone, phone_verified: true },
  app_metadata: { provider_type: 'email', pending_address: addressData }
});
```

**Criação imediata nas tabelas públicas:**
```typescript
// Cria usuário e endereço imediatamente via RPC
await supabaseAdmin.rpc('create_user_with_address', {
  p_user_id: userId,
  p_email: email,
  p_full_name: fullName,
  p_phone: phone,
  p_address: addressData
});

// Salva dados de endereço no app_metadata para trigger
await supabaseAdmin.rpc('save_pending_address_data', {
  user_id: userId,
  address_data: addressData
});
```

### 2. Funções RPC Implementadas

**create_user_with_address:**
- Insere diretamente em `public.users` e `public.addresses`
- Usa UPSERT para evitar conflitos
- Funciona mesmo antes da confirmação de email

**save_pending_address_data:**
- Salva endereço em `auth.users.raw_app_meta_data.pending_address`
- Usado pelo trigger `handle_email_confirmation`

**handle_email_confirmation (trigger):**
- Ativado quando `email_confirmed_at` é definido
- Cria usuário em `public.users` se não existir
- Cria endereço em `public.addresses` usando dados de `pending_address`

### 3. Estado Atual das Tabelas (Verificação via MCP)

**Dados encontrados:**
- `auth.users`: ✅ Telefone persistido corretamente
- `auth.users.raw_user_meta_data.provider_type`: ✅ 'phone' (definido pelo Supabase)
- `auth.users.raw_app_meta_data.provider_type`: ✅ 'phone' (definido pelo Supabase)
- `public.users`: ❌ Vazio (usuários não confirmaram email)
- `public.addresses`: ❌ Vazio (usuários não confirmaram email)

### 4. Problemas Identificados

**A. Provider Type Inconsistente:**
- Código define `provider_type: 'email'` em metadados
- Supabase sobrescreve para `'phone'` quando telefone está presente
- Comportamento correto, mas documentação/testes devem refletir isso

**B. Dependência de Confirmação de Email:**
- Trigger `handle_email_confirmation` só executa após confirmação
- RPC `create_user_with_address` cria dados imediatamente
- Possível duplicação se ambos executarem

**C. Fluxo Duplo de Criação:**
- Criação imediata via RPC (linha 189-245 do SupabaseAuthService)
- Criação via trigger na confirmação de email
- Pode causar conflitos ou dados duplicados

### 5. Diferenças entre Testes e Fluxo Real

**Testes de Integração:**
- Simulam fluxo completo incluindo confirmação de email
- Testam RPCs isoladamente
- Verificam dados em todas as tabelas

**Fluxo Real:**
- Cria dados imediatamente via RPC
- Também configura trigger para confirmação
- Usuários reais podem não confirmar email imediatamente

## Recomendações

1. **Corrigir Documentação:** Atualizar para refletir que `provider_type` será 'phone' quando telefone fornecido
2. **Revisar Fluxo Duplo:** Decidir entre criação imediata OU trigger (não ambos)
3. **Melhorar Testes:** Adicionar testes que simulem usuários não confirmados
4. **Documentar Comportamento:** Criar documentação clara do fluxo completo

## Próximos Passos

1. [x] Examinar testes de integração existentes
2. [x] Analisar implementação do cadastro real
3. [x] Identificar funções RPC utilizadas
4. [x] Mapear fluxo de dados entre tabelas
5. [x] Documentar achados e criar plano de ação
6. [ ] Propor correções necessárias (próxima tarefa)

## Arquivos a Examinar

- `test/__tests__/integration/`
- `test/__tests__/auth/user-registration.test.ts`
- `src/services/` (serviços relacionados ao cadastro)
- Funções RPC no Supabase
- Componentes de UI de cadastro

## Notas

- Focar na consistência entre teste e implementação real
- Priorizar a completude dos dados nas três tabelas
- Considerar cenários de erro e rollback
- Validar integridade referencial entre tabelas