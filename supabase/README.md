# 🏛️ Igreja Oliveira App - Supabase Configuration

Este diretório contém todos os arquivos necessários para configurar o Supabase para o aplicativo da Igreja Oliveira.

## 📋 Índice
- [Schema do Banco de Dados](#-schema-do-banco-de-dados)
- [Templates de Email](#-templates-de-email)
- [Configuração no Supabase](#-configuração-no-supabase)
- [Row Level Security (RLS)](#-row-level-security-rls)
- [Hierarquia de Usuários](#-hierarquia-de-usuários)

## 🗄️ Schema do Banco de Dados

### Arquivo: `schema.sql`

Execute este script no SQL Editor do Supabase para criar toda a estrutura do banco:

```sql
-- Execute no Supabase SQL Editor
-- Copia e cola todo o conteúdo do arquivo schema.sql
```

### Tabelas Criadas:

1. **`users`** - Usuários do sistema (estende auth.users)
2. **`addresses`** - Endereços dos usuários  
3. **`donations`** - Doações (dízimos, ofertas, especiais)

### Funcionalidades Incluídas:

- ✅ Triggers automáticos para `updated_at`
- ✅ Índices otimizados para performance
- ✅ Row Level Security (RLS) completo
- ✅ Funções para hierarquia da igreja
- ✅ Views estatísticas
- ✅ Validações de dados

## 📧 Templates de Email

### Arquivos de Template:

1. **`confirm-signup.html`** - Confirmação de cadastro
2. **`magic-link.html`** - Login sem senha
3. **`recovery.html`** - Recuperação de senha
4. **`invite.html`** - Convite para usuários
5. **`change-email.html`** - Alteração de endereço de email
6. **`reauthentication.html`** - Reautenticação por segurança

### Como Configurar no Supabase:

1. Acesse **Authentication → Email Templates**
2. Para cada template, selecione o tipo correspondente
3. Copie o HTML do arquivo e cole no editor
4. Ajuste as variáveis conforme necessário

### Variáveis Disponíveis:

- `{{ .ConfirmationURL }}` - URL de confirmação
- `{{ .CurrentYear }}` - Ano atual
- `{{ .InviterName }}` - Nome do convidador (apenas invite)
- `{{ .InviterRole }}` - Papel do convidador (apenas invite)
- `{{ .UserRole }}` - Papel do usuário (apenas invite)

## ⚙️ Configuração no Supabase

### 1. Executar Schema SQL

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Crie uma nova query
4. Copie todo o conteúdo de `schema.sql`
5. Execute o script
6. Verifique se todas as tabelas foram criadas

### 2. Configurar Templates de Email

1. Vá para **Authentication → Email Templates**
2. Configure cada template:

#### Confirm Signup
- Template Type: **Confirm signup**
- Subject: `Confirme seu cadastro - Igreja Oliveira`
- HTML: Conteúdo de `confirm-signup.html`

#### Magic Link
- Template Type: **Magic Link**  
- Subject: `Seu link de acesso - Igreja Oliveira`
- HTML: Conteúdo de `magic-link.html`

#### Reset Password
- Template Type: **Reset Password**
- Subject: `Recuperação de senha - Igreja Oliveira`
- HTML: Conteúdo de `recovery.html`

#### Invite User
- Template Type: **Invite user**
- Subject: `Você foi convidado - Igreja Oliveira`
- HTML: Conteúdo de `invite.html`

### 3. Configurar Variáveis de Ambiente

No arquivo `.env.local` do projeto:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configurar URL de Redirecionamento

Em **Authentication → URL Configuration**:

- **Site URL**: `https://your-app.com` (ou localhost para dev)
- **Redirect URLs**: 
  - `https://your-app.com/**`
  - `exp://localhost:8081/**` (para desenvolvimento)

## 🔒 Row Level Security (RLS)

### Políticas Implementadas:

#### Usuários (`users`)
- ✅ Usuários podem ver/editar próprio perfil
- ✅ Admins e pastores podem ver todos os usuários
- ✅ Admins podem gerenciar todos os usuários
- ✅ Novos usuários podem se registrar

#### Endereços (`addresses`)  
- ✅ Usuários podem gerenciar próprios endereços
- ✅ Liderança pode ver endereços dos membros

#### Doações (`donations`)
- ✅ Usuários podem gerenciar próprias doações
- ✅ Liderança pode ver/gerenciar todas as doações

### Hierarquia de Permissões:

```
ADMIN (👑)
├── Acesso total ao sistema
└── Pode gerenciar todos os usuários

PASTOR (⛪)
├── Pode ver/gerenciar: diáconos, líderes, membros
└── Acesso a relatórios financeiros

DEACON (🤝)
├── Pode ver/gerenciar: líderes, membros
└── Ajuda na administração

LEADER (📋)
├── Pode ver/gerenciar: membros
└── Lidera grupos específicos

MEMBER (👤)
├── Pode gerenciar próprios dados
└── Acesso básico ao sistema
```

## 📊 Views e Estatísticas

### Views Criadas:

1. **`donation_statistics`** - Estatísticas de doações por tipo/mês
2. **`user_statistics`** - Estatísticas de usuários por papel

### Exemplo de Consultas:

```sql
-- Doações por mês
SELECT * FROM donation_statistics 
ORDER BY month DESC, type;

-- Usuários por papel
SELECT * FROM user_statistics;

-- Total de doações do mês atual
SELECT 
  type,
  SUM(amount) as total
FROM donations 
WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())
GROUP BY type;
```

## 🚀 Primeiro Acesso

### Configurar Usuário Admin:

Após o primeiro usuário se cadastrar:

```sql
-- Atualizar primeiro usuário para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email-admin@domain.com';
```

### Testar Configuração:

1. ✅ Criar conta de teste
2. ✅ Verificar recebimento de email
3. ✅ Confirmar conta via email
4. ✅ Fazer login no app
5. ✅ Testar criação de doação
6. ✅ Verificar RLS funcionando

## 🔧 Troubleshooting

### Problemas Comuns:

1. **Templates não enviam emails**
   - Verificar configuração SMTP no Supabase
   - Confirmar templates estão salvos corretamente

2. **RLS bloqueia operações**
   - Verificar se usuário está autenticado
   - Confirmar políticas estão corretas

3. **Erro de permissão**
   - Verificar role do usuário
   - Confirmar hierarquia está funcionando

### Logs Úteis:

```sql
-- Ver políticas ativas
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Ver permissões de usuário  
SELECT auth.uid(), auth.role();

-- Debug RLS
SET rls.force_row_level_security = off; -- APENAS PARA DEBUG
```

## 📞 Suporte

Para problemas com a configuração do Supabase:

1. Verifique os logs no Dashboard do Supabase
2. Consulte a [documentação oficial](https://supabase.com/docs)
3. Entre em contato com a equipe de desenvolvimento

---

**Igreja Oliveira App** - Tecnologia a serviço da fé 🙏