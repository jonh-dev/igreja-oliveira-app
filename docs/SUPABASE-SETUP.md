# 🗄️ Setup Supabase - Igreja Oliveira App

## 🎯 Objetivo
Documentar o processo completo de configuração do Supabase para desenvolvimento e produção seguindo as regras de segurança estabelecidas.

---

## ⚠️ REGRAS CRÍTICAS

### **🚨 NUNCA usar fallbacks de variáveis de ambiente**
- Fallbacks podem expor dados sensíveis em produção
- SEMPRE validar existência das variáveis
- Falha rápida se não configurado

### **🔐 NUNCA commitar secrets**
- Usar .env para desenvolvimento local
- Usar Supabase secrets para produção
- Sempre adicionar .env ao .gitignore

---

## 📋 Processo de Setup - Passo a Passo

### **1. Criar Projeto no Supabase**

```bash
# 1. Acessar https://database.new
# 2. Fazer login/cadastro com GitHub (jonh-dev)
# 3. Create new project:
#    - Name: igreja-oliveira-app
#    - Region: South America (São Paulo)
#    - Database Password: [senha forte - 16+ chars]
# 4. Aguardar provisionamento (~2 minutos)
```

### **2. Obter Credenciais do Projeto**

```bash
# Após criação, ir para Settings > API
# Copiar:
# - Project URL: https://[PROJECT_ID].supabase.co
# - anon public key: eyJ... (key pública)
# - service_role key: eyJ... (key administrativa - NUNCA expor)
```

### **3. Configurar Variáveis Locais**

```bash
# Criar arquivo .env na raiz do projeto
echo "EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=[sua_anon_key_aqui]" >> .env

# Verificar se .env está no .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

### **4. Instalar Supabase CLI (Opcional)**

```bash
# Instalar globalmente
npm install -g supabase

# Verificar instalação
supabase --version

# Login (será solicitado browser)
supabase login
```

### **5. Configurar Secrets para Produção**

#### **Via CLI:**
```bash
# Listar projetos
supabase projects list

# Conectar ao projeto
supabase link --project-ref [PROJECT_ID]

# Configurar secrets
supabase secrets set EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
supabase secrets set EXPO_PUBLIC_SUPABASE_ANON_KEY=[sua_anon_key]
```

#### **Via Dashboard:**
```bash
# 1. Ir para Project Settings > API
# 2. Copiar Project URL e anon key
# 3. Configurar no build system (Expo EAS, etc)
```

---

## 🏗️ Configuração do Database Schema

### **1. Criar Tabelas Base**

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'pastor', 'deacon', 'leader', 'member')),
  church_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de doações
CREATE TABLE donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('tithe', 'offering', 'special')),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_church_id ON users(church_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_date ON donations(date);
CREATE INDEX idx_donations_type ON donations(type);
```

### **2. Configurar Row Level Security (RLS)**

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas hierarquia adequada
CREATE POLICY "usuarios_podem_ver_subordinados" ON users
  FOR SELECT USING (
    CASE auth.jwt() ->> 'user_role'
      WHEN 'admin' THEN true
      WHEN 'pastor' THEN role IN ('deacon', 'leader', 'member')
      WHEN 'deacon' THEN role IN ('leader', 'member')
      WHEN 'leader' THEN role = 'member'
      ELSE id = auth.uid()
    END
  );

-- Política para doações - usuários veem apenas suas próprias
CREATE POLICY "usuarios_veem_proprias_doacoes" ON donations
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'pastor', 'deacon')
    )
  );

-- Política para criar doações
CREATE POLICY "usuarios_podem_criar_doacoes" ON donations
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

### **3. Trigger para updated_at**

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at 
  BEFORE UPDATE ON donations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 Teste de Conexão

### **1. Validar Configuração**

```typescript
// Criar arquivo test/supabase-connection.test.ts
import { supabase } from '../src/infrastructure/config/supabase';

async function testConnection() {
  try {
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão Supabase funcionando!');
    console.log('📊 Total de usuários:', data);
    return true;
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return false;
  }
}

testConnection();
```

### **2. Executar Teste**

```bash
# Instalar ts-node para testes (se necessário)
pnpm add -D ts-node

# Executar teste de conexão
npx ts-node test/supabase-connection.test.ts
```

---

## 📊 Monitoramento - Tier Gratuito

### **Limites do Plano Gratuito:**
- 💾 **Database**: 500MB storage
- 🔄 **Bandwidth**: 2GB/mês
- 👥 **Auth**: 50.000 monthly active users
- ⚡ **Edge Functions**: 500.000 invocations/mês
- 📈 **API Requests**: 2 milhões/mês

### **Dashboard de Monitoramento:**
```bash
# 1. Acessar Dashboard do projeto
# 2. Ir para Settings > Usage
# 3. Monitorar:
#    - Database size
#    - Bandwidth usage
#    - API requests
#    - Active users
```

### **Alertas Recomendados:**
- 🚨 80% do storage utilizado
- 🚨 80% do bandwidth mensal
- 🚨 Número alto de requisições falhando

---

## 🔐 Segurança - Boas Práticas

### **1. Proteção de Keys**

```bash
# ✅ CORRETO - Usar apenas anon key no frontend
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... (pública, protegida por RLS)

# ❌ NUNCA usar service_role key no frontend
# SERVICE_ROLE_KEY=eyJ... (bypass RLS - apenas backend)
```

### **2. Configuração de Auth**

```typescript
// Configurações de segurança recomendadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Evitar redirect loops no mobile
    flowType: 'pkce', // Mais seguro para mobile
  },
  global: {
    headers: {
      'X-Client-Info': 'igreja-oliveira-app@1.0.0',
    },
  },
});
```

### **3. RLS Testing**

```sql
-- Testar políticas RLS com diferentes usuários
-- Criar usuário teste
INSERT INTO auth.users (id, email) VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'admin@igreja.com');

-- Testar com contexto específico
SELECT auth.jwt();
SET LOCAL "request.jwt.claims" = '{"sub":"123e4567-e89b-12d3-a456-426614174000","user_role":"admin"}';

-- Verificar se RLS funciona
SELECT * FROM users; -- Deve respeitar políticas
```

---

## 🎯 Próximos Passos

### **Após Setup Completo:**
1. ✅ Criar projeto e configurar .env
2. ✅ Executar schema SQL
3. ✅ Testar conexão
4. ✅ Configurar RLS policies
5. ✅ Validar authentication flow
6. 🔄 **PRÓXIMO**: Implementar SupabaseDonationRepository

### **Troubleshooting Comum:**
- **Erro de CORS**: Verificar domain nas configurações
- **RLS negando acesso**: Verificar políticas e auth context
- **Connection timeout**: Verificar network e firewall

---

**📋 Documento criado em**: 2025-01-14  
**🔄 Próxima revisão**: Após setup real do Supabase  
**📊 Versão**: 1.0  
**👤 Responsável**: João Zanardi (jonh-dev)  

**🎯 Objetivo**: Configurar Supabase seguindo práticas de segurança enterprise para aplicação de gestão eclesiástica.