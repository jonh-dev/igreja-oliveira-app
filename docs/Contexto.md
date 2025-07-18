# 📚 Contexto do Sistema - Igreja Oliveira App

## 🎯 Visão Geral do Projeto

**Sistema de Gestão Eclesiástica** desenvolvido em React Native com Clean Architecture, focado em escalabilidade e manutenibilidade para igrejas brasileiras.

### **Stack Tecnológica Validada**
- **Frontend**: React Native 0.79.5 + Expo SDK 53 + TypeScript 5.8.3
- **Backend**: Supabase (PostgreSQL) + Row Level Security
- **Navegação**: React Navigation 7.x
- **Estado**: Context API (evoluir para Zustand)
- **Package Manager**: PNPM (obrigatório)

### **Arquitetura Clean Architecture**
```
📦 Domain Layer (Núcleo)
├── Entities (User, Address, Donation)
├── Value Objects (CEP, Email, Money)
└── Domain Services

📦 Application Layer (Casos de Uso)
├── Use Cases (CreateUser, AuthenticateUser, etc.)
├── Interfaces (IUserRepository, IAuthService)
├── DTOs (CreateUserDto, CreateDonationDto)
└── Policies (Validações de domínio)

📦 Infrastructure Layer (Externo)
├── Repositories (SupabaseUserRepository, etc.)
├── Services (SupabaseAuthService, ViaCEPService)
├── Config (Supabase client, Container DI)
└── Adapters (Third-party integrations)

📦 Presentation Layer (UI)
├── Screens (Auth, Dashboard, Donations)
├── Components (Atomic Design)
├── Navigation (Strategy Pattern)
└── State Management (Context/Zustand)
```

---

## 🏗️ Estrutura de Pastas Atual

```
src/
├── domain/
│   ├── entities/
│   │   ├── User.ts ✅
│   │   ├── Address.ts ✅
│   │   ├── Donation.ts ✅
│   │   └── index.ts ✅
│   └── value-objects/
│       ├── CEP.ts ✅
│       └── index.ts ✅
├── application/
│   ├── interfaces/
│   │   ├── repositories/
│   │   │   ├── IUserRepository.ts ✅
│   │   │   ├── IAddressRepository.ts ✅
│   │   │   └── IDonationRepository.ts ✅
│   │   └── services/
│   │       ├── IAuthService.ts ✅
│   │       └── ICEPValidationService.ts ✅
│   ├── use-cases/
│   │   ├── user/
│   │   │   ├── CreateUserUseCase.ts ✅
│   │   │   └── AuthenticateUserUseCase.ts ✅
│   │   └── donation/
│   │       ├── CreateDonationUseCase.ts ✅
│   │       └── GetDonationsUseCase.ts ✅
│   └── dto/
│       ├── CreateUserDto.ts ✅
│       ├── CreateAddressDto.ts ✅
│       └── CreateDonationDto.ts ✅
├── infrastructure/
│   ├── repositories/
│   │   ├── SupabaseUserRepository.ts ✅
│   │   ├── SupabaseAddressRepository.ts ✅
│   │   └── SupabaseDonationRepository.ts ✅
│   ├── services/
│   │   ├── SupabaseAuthService.ts ✅
│   │   └── ViaCEPService.ts ✅
│   └── config/
│       ├── supabase.ts ✅
│       └── container.ts ✅
└── presentation/
    ├── screens/
    │   ├── auth/
    │   ├── dashboard/
    │   └── donations/
    ├── components/
    │   ├── shared/
    │   └── feature-specific/
    └── navigation/
        └── NavigationStrategy.ts
```

---

## 👥 Hierarquia de Usuários

```typescript
enum UserRole {
  ADMIN = 'admin',     // Acesso total ao sistema
  PASTOR = 'pastor',   // Acesso a diáconos, líderes, membros
  DEACON = 'deacon',   // Acesso a líderes e membros
  LEADER = 'leader',   // Acesso a membros
  MEMBER = 'member'    // Acesso limitado
}
```

### **Controle de Acesso por Hierarquia**
- **Admin**: Acesso total a todos os dados
- **Pastor**: Pode ver diáconos, líderes e membros
- **Diácono**: Pode ver líderes e membros
- **Líder**: Pode ver apenas membros
- **Membro**: Acesso apenas aos próprios dados

---

## 🗄️ Configuração Supabase

### **Variáveis de Ambiente Obrigatórias**
```bash
# .env (NUNCA commitar)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... (publishable key)
```

### **Regras de Segurança**
- **NUNCA** usar fallbacks de variáveis de ambiente
- **SEMPRE** validar existência das variáveis
- **NUNCA** expor service_role key no frontend
- **SEMPRE** usar Row Level Security (RLS)

### **Schema do Banco**
```sql
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
```

## 💰 Contexto Real das Doações - Igreja Oliveira

### **Fluxo Atual de Doações**

#### **1. Cultos Dominicais - Gasofilaço (Dinheiro Vivo)**
- **Frequência**: Apenas aos domingos
- **Processo**: 
  - Pessoas fazem ofertas no gasofilaço durante o culto
  - Líderes e diáconos recolhem o gasofilaço
  - Contabilização manual em sala fechada
  - Registro de valores totais sem identificação individual
- **Características**:
  - Não há controle de quem doou especificamente
  - Valores são consolidados por culto
  - Processo manual sujeito a erros

#### **2. Doações Eletrônicas (PIX/Cartão)**
- **Frequência**: Diária (24/7)
- **Processo**:
  - Doações via PIX ou cartão de crédito/débito
  - Integração com sistema bancário da igreja
  - Captura automática de valores
  - Identificação do doador por transação
- **Características**:
  - Controle individual de doadores
  - Rastreabilidade completa
  - Processo automatizado

#### **3. Relatórios e Controle**
- **Consolidação**: Valores de gasofilaço + eletrônicos
- **Exportação**: PDF e CSV para análise
- **Métricas**: Por culto, período, tipo de doação
- **Acesso**: Hierárquico por role (admin, pastor, diáconos)

### **Requisitos Técnicos**

#### **Sistema de Gasofilaço**
- Interface para contabilização manual
- Registro de valores por culto/domingo
- Controle de quem registrou (liderança)
- Validações de valores e datas

#### **Integração Open Finance**
- Conexão com APIs bancárias
- Captura automática de transações
- Mapeamento de doadores
- Sincronização em tempo real

#### **Relatórios Consolidados**
- Geração de PDF profissionais
- Exportação CSV para Excel
- Filtros avançados
- Métricas e gráficos

---

## 🎯 Funcionalidades MVP

### **Fase 1: Setup e Core ✅**
- [x] Configurar Projeto Expo + TypeScript
- [x] Instalar dependências essenciais
- [x] Criar entidades do domínio
- [x] Implementar use cases básicos
- [x] Configurar Supabase com RLS
- [x] Implementar repositories
- [x] Configurar injeção de dependências

### **Fase 2: Interface do Usuário 🔄**
- [x] Criar componentes compartilhados
- [x] Implementar navegação com Strategy Pattern
- [x] Desenvolver telas principais
- [x] Integrar com Supabase

### **Fase 3: Sistema de Doações (Contexto Real)**
- [x] Implementar telas de doações básicas
- [ ] **Sistema de Gasofilaço (Dinheiro Vivo)**
  - [ ] Tela para contabilização manual de ofertas em dinheiro
  - [ ] Registro por líderes/diáconos após culto dominical
  - [ ] Controle de valores sem identificação individual
  - [ ] Relatórios consolidados por data/culto
- [ ] **Sistema de Doações Eletrônicas**
  - [ ] Integração com Open Finance da igreja
  - [ ] Captura automática de valores via PIX/cartão
  - [ ] Identificação de doadores por transação
  - [ ] Sincronização com relatórios consolidados
- [ ] **Relatórios e Exportação**
  - [ ] Geração de PDF com dados consolidados
  - [ ] Exportação CSV para análise externa
  - [ ] Filtros por período, tipo de doação
  - [ ] Métricas e estatísticas por culto

### **Fase 4: Testes e Qualidade**
- [ ] Implementar testes unitários
- [ ] Configurar CI/CD
- [ ] Setup de linting e formatação
- [ ] Documentação completa

### **Fase 5: Deploy e Monitoramento**
- [ ] Build para produção
- [ ] Deploy nas stores
- [ ] Monitoramento e analytics
- [ ] Feedback dos usuários

---

## 💰 Estimativas de Custo

### **Custo Mensal Estimado**
- **Supabase**: $0-25/mês (Free tier generoso)
- **Expo**: $0-29/mês (Free para desenvolvimento)
- **Google Play + App Store**: $25 + $99/ano
- **Total**: $0-54/mês inicialmente

### **Limites do Plano Gratuito Supabase**
- 💾 **Database**: 500MB storage
- 🔄 **Bandwidth**: 2GB/mês
- 👥 **Auth**: 50.000 monthly active users
- ⚡ **Edge Functions**: 500.000 invocations/mês
- 📈 **API Requests**: 2 milhões/mês

---

## 📊 Performance Esperada

### **Métricas de Qualidade**
- **Bundle Size**: <10MB
- **Loading Time**: <2s
- **Escalabilidade**: 10k+ usuários
- **Offline Support**: Futuro

### **Code Quality**
- **Cobertura de Testes**: ≥ 80%
- **Type Coverage**: 100%
- **Cyclomatic Complexity**: < 10
- **Maintainability Index**: > 80

---

## 🔄 Git Workflow - Desenvolvedor Solo

### **Estrutura de Branches**
```
main (produção)
├── develop (desenvolvimento)
├── feature/* (funcionalidades)
├── fix/* (correções)
└── release/* (versões)
```

### **Fluxo Simplificado**
```bash
# Fluxo principal (80% dos casos)
develop → main (quando pronto para release)

# Fluxo para features grandes (20% dos casos) 
feature/xyz → develop → main
```

### **Convenção de Commits**
```
<tipo>(<escopo>): <descrição>

<corpo detalhado>

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Tipos**: feat, fix, docs, style, refactor, test, chore
**Escopos**: domain, application, infrastructure, presentation, docs, config

---

## 🧪 Testes e Qualidade

### **Estratégia de Testes**
- **Unit Tests**: Para Use Cases e Entities
- **Integration Tests**: Para Repositories e Services
- **E2E Tests**: Para fluxos principais
- **Coverage**: Mínimo 80% para Use Cases

### **Quality Gates**
```bash
# Antes de cada commit
pnpm run type-check  # Sem erros
pnpm run lint        # Quando disponível
pnpm run test        # Quando disponível
```

---

## 🚨 Riscos Identificados

### **Riscos Técnicos**
1. **Complexity Overhead**: Clean Architecture pode ser over-engineering para MVP
2. **Supabase Learning Curve**: Primeira implementação com Supabase
3. **React Native Updates**: Versão recente pode ter instabilidades

### **Riscos de Cronograma**
1. **Perfectionism**: Tendência a over-engineer
2. **Scope Creep**: Adicionar funcionalidades não essenciais

---

## 📞 Contatos do Projeto

**👤 Admin Inicial**: João Carlos Schwab Zanardi  
**📧 Email**: jonh.dev.br@gmail.com  
**🏢 Organização**: Igreja Oliveira  
**📅 Criado em**: 2025-01-14  

---

**🎯 Objetivo**: Sistema de gestão eclesiástica escalável, mantível e seguro, seguindo boas práticas de desenvolvimento mobile.

---

## 🎨 Protótipo e Design System

### **Paleta de Cores - Igreja Oliveira**
```css
/* Cores Principais - Verde Oliveira */
--primary-color: #556B2F;         /* Verde oliveira escuro - tradição */
--secondary-color: #8FBC8F;       /* Verde oliveira claro - paz */
--accent-color: #6B8E23;          /* Verde oliveira médio - harmonia */

/* Cores Neutras */
--white: #ffffff;
--light-gray: #f8f9fa;
--gray: #6c757d;
--dark-gray: #343a40;
--black: #000000;

/* Cores de Status */
--success: #556B2F;               /* Verde oliveira escuro - sucesso */
--warning: #DAA520;               /* Dourado - aviso */
--danger: #DC143C;                /* Vermelho - erro */
--info: #4682B4;                  /* Azul aço - informação */

/* Gradientes */
--primary-gradient: linear-gradient(135deg, #556B2F 0%, #8FBC8F 100%);
--secondary-gradient: linear-gradient(135deg, #8FBC8F 0%, #6B8E23 100%);
```

### **Tipografia**
```css
/* Fontes */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-secondary: 'Poppins', sans-serif;

/* Tamanhos */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

/* Pesos */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### **Espaçamentos e Layout**
```css
/* Espaçamentos */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

### **Telas Principais - Wireframes**

#### **1. Tela de Login**
```
┌─────────────────────────────────┐
│                                 │
│        [Logo Igreja]            │
│                                 │
│    Bem-vindo à Igreja Oliveira │
│                                 │
│  ┌─────────────────────────────┐ │
│  │         📧 Email            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │         🔒 Senha            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │        [Entrar]             │ │
│  └─────────────────────────────┘ │
│                                 │
│        Esqueceu a senha?        │
│                                 │
│        Criar nova conta         │
│                                 │
└─────────────────────────────────┘
```

#### **2. Dashboard - Admin**
```
┌─────────────────────────────────┐
│ 🔔 [João Silva] [Logout]       │
├─────────────────────────────────┤
│                                 │
│    📊 Dashboard Administrativo  │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 👥 Membros  │ │ 💰 Doações │ │
│  │    150      │ │   R$ 15k   │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 📅 Eventos  │ │ 📋 Relatórios│ │
│  │     12      │ │     5       │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│    📈 Atividade Recente         │
│  ┌─────────────────────────────┐ │
│  │ • Novo membro: Maria Silva  │ │
│  │ • Doação: R$ 500 - João     │ │
│  │ • Evento: Culto Domingo     │ │
│  └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### **3. Dashboard - Pastor**
```
┌─────────────────────────────────┐
│ 🔔 [Pastor Silva] [Logout]     │
├─────────────────────────────────┤
│                                 │
│    📊 Dashboard Pastoral        │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 👥 Membros  │ │ 💰 Dízimos │ │
│  │    120      │ │   R$ 12k   │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 🎭 Ministérios│ │ 📅 Cultos  │ │
│  │     8       │ │    4/semana │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│    📈 Membros por Ministério    │
│  ┌─────────────────────────────┐ │
│  │ • Louvor: 25 membros        │ │
│  │ • Jovens: 30 membros        │ │
│  │ • Crianças: 20 membros      │ │
│  └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### **4. Dashboard - Membro**
```
┌─────────────────────────────────┐
│ 🔔 [Maria Silva] [Logout]      │
├─────────────────────────────────┤
│                                 │
│    📊 Meu Dashboard             │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 💰 Meus     │ │ 📅 Próximo  │ │
│  │ Dízimos     │ │ Evento      │ │
│  │ R$ 1.200    │ │ Culto 19h   │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│  ┌─────────────┐ ┌─────────────┐ │
│  │ 🎭 Meus     │ │ 📋 Minhas   │ │
│  │ Ministérios │ │ Doações     │ │
│  │ Louvor      │ │ R$ 500      │ │
│  └─────────────┘ └─────────────┘ │
│                                 │
│    📈 Minha Atividade           │
│  ┌─────────────────────────────┐ │
│  │ • Última doação: R$ 200     │ │
│  │ • Próximo evento: 15/01     │ │
│  │ • Ministério: Louvor        │ │
│  └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### **5. Tela de Doações**
```
┌─────────────────────────────────┐
│ ← [Doações] [➕ Nova]           │
├─────────────────────────────────┤
│                                 │
│  🔍 [Pesquisar doações...]     │
│                                 │
│  📅 Janeiro 2025               │
│  ┌─────────────────────────────┐ │
│  │ 💰 Dízimo - R$ 500          │ │
│  │ 📅 15/01/2025               │ │
│  │ 👤 João Silva               │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 💰 Oferta - R$ 200          │ │
│  │ 📅 12/01/2025               │ │
│  │ 👤 Maria Silva              │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 💰 Especial - R$ 1.000      │ │
│  │ 📅 10/01/2025               │ │
│  │ 👤 Pedro Santos             │ │
│  └─────────────────────────────┘ │
│                                 │
│  📊 Total: R$ 1.700            │
│                                 │
└─────────────────────────────────┘
```

#### **6. Formulário de Nova Doação**
```
┌─────────────────────────────────┐
│ ← [Nova Doação]                │
├─────────────────────────────────┤
│                                 │
│  💰 Nova Doação                │
│                                 │
│  Tipo de Doação:                │
│  ○ Dízimo  ○ Oferta  ● Especial│
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 💵 Valor (R$)               │ │
│  │        500,00               │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📅 Data                     │ │
│  │      15/01/2025            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📝 Descrição (opcional)     │ │
│  │                            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │        [Salvar]             │ │
│  └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### **Componentes UI - Especificações**

#### **Button Component**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}
```

#### **Input Component**
```typescript
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'cpf' | 'phone' | 'cep';
  error?: string;
  required?: boolean;
  mask?: string;
}
```

#### **Card Component**
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  icon?: React.ReactNode;
}
```

### **Navegação - Strategy Pattern**
```typescript
// Navegação baseada em role
enum NavigationStack {
  ADMIN_STACK = 'AdminStack',
  PASTOR_STACK = 'PastorStack',
  DEACON_STACK = 'DeaconStack',
  LEADER_STACK = 'LeaderStack',
  MEMBER_STACK = 'MemberStack',
  GUEST_STACK = 'GuestStack'
}

// Telas por stack
const AdminScreens = [
  'AdminDashboard',
  'MembersManagement',
  'DonationsManagement',
  'Reports',
  'Settings'
];

const PastorScreens = [
  'PastorDashboard',
  'MembersView',
  'DonationsView',
  'Ministries',
  'Settings'
];

const MemberScreens = [
  'MemberDashboard',
  'MyDonations',
  'MyProfile',
  'Events'
];
```

### **Estados de Loading e Error**
```typescript
// Estados globais
interface AppState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Estados específicos
interface AuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface DonationsState {
  isLoading: boolean;
  error: string | null;
  donations: Donation[];
  totalAmount: number;
}
```

### **Responsividade**
- **Mobile First**: Design otimizado para smartphones
- **Tablet Support**: Layout adaptativo para tablets
- **Accessibility**: Suporte a VoiceOver e TalkBack
- **Dark Mode**: Suporte futuro para modo escuro

### **Performance UI**
- **Lazy Loading**: Componentes carregados sob demanda
- **Image Optimization**: Imagens otimizadas e cacheadas
- **Smooth Animations**: Transições suaves (60fps)
- **Memory Management**: Limpeza automática de recursos

---

**🎯 Objetivo**: Sistema de gestão eclesiástica escalável, mantível e seguro, seguindo boas práticas de desenvolvimento mobile. 