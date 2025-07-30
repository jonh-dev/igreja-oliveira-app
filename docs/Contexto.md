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

## 💰 Sistema Unificado de Doações

### **Visão Arquitetural**
O sistema de doações é **unificado** com duas fontes de dados:

#### **1. Doações Manuais** (Registradas pelos líderes/diáconos/pastores)
- **Doações de culto** - Contagem de cédulas/moedas OU valor total
- **Dízimos manuais** - Entregues fisicamente pelos membros
- **Doações especiais** - Projetos específicos, missões, etc.

#### **2. Doações Eletrônicas** (Via Open Finance)
- **Transferências automáticas** da conta do usuário
- **Integração com APIs bancárias** via Open Finance
- **Sincronização automática** com o sistema

### **Interface Unificada**
- **Uma única tela** para visualizar todas as doações
- **Filtros** por tipo (manual/eletrônico), período, membro
- **Relatórios consolidados** incluindo ambas as fontes
- **Dashboard unificado** com métricas totais

### **Fluxo de Dados**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Doações       │    │   Doações       │    │   Interface     │
│   Manuais       │    │   Eletrônicas   │    │   Unificada     │
│                 │    │                 │    │                 │
│ • Doações culto │    │ • Open Finance  │    │ • Lista Total   │
│ • Dízimos       │    │ • APIs Bancárias│    │ • Filtros       │
│ • Especiais     │    │ • Sincronização │    │ • Relatórios    │
│ • Contagem      │    │   Automática    │    │ • Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase      │
                    │   (PostgreSQL)  │
                    │                 │
                    │ • donations     │
                    │ • users         │
                    │ • RLS           │
                    └─────────────────┘
```

### **Estrutura de Dados**
```typescript
interface Donation {
  id: string;
  type: 'culto' | 'tithe' | 'special';
  amount: number;
  date: Date;
  userId: string;
  source: 'manual' | 'electronic'; // Fonte da doação
  description?: string;
  registeredBy: string; // Quem registrou (para manuais)
  electronicData?: {     // Dados específicos eletrônicos
    bankName: string;
    transactionId: string;
    accountInfo: string;
  };
  cultoData?: {          // Dados específicos de doações de culto
    billCounts: BillCount[];
    coinCounts: CoinCount[];
    notes?: string;
    countingMethod: 'detailed' | 'total'; // Contagem detalhada ou valor total
  };
}

interface BillCount {
  value: number; // 200, 100, 50, 20, 10, 5, 2
  count: number;
}

interface CoinCount {
  value: number; // 1, 0.5, 0.25, 0.1, 0.05, 0.01
  count: number;
}
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
│   │       ├── GetDonationsUseCase.ts ✅
│   │       ├── CreateCultoDonationUseCase.ts ✅
│   │       └── GetDonationReportsUseCase.ts ✅
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

## 💰 Contexto Real das Doações - Igreja Oliveira

### **Fluxo Atual de Doações**

#### **1. Cultos Dominicais - Doações de Culto**
- **Frequência**: Apenas aos domingos
- **Processo**: 
  - Pessoas fazem ofertas durante o culto
  - Líderes e diáconos recolhem as ofertas
  - **Opção A**: Contagem manual de cédulas e moedas
  - **Opção B**: Registro do valor total contabilizado
  - Registro de valores por culto
- **Características**:
  - Não há controle de quem doou especificamente
  - Valores são consolidados por culto
  - Flexibilidade na forma de contagem

#### **2. Dízimos Manuais**
- **Frequência**: Semanal/Mensal
- **Processo**:
  - Membro entrega dízimo fisicamente
  - Líder/diácono registra no sistema
  - Identificação do doador
- **Características**:
  - Controle individual de doadores
  - Rastreabilidade completa
  - Registro manual

#### **3. Doações Especiais**
- **Frequência**: Eventual
- **Processo**:
  - Projetos específicos (missões, reformas, etc.)
  - Registro manual por líderes
  - Identificação do doador
- **Características**:
  - Controle individual
  - Categorização por projeto
  - Registro manual

#### **4. Doações Eletrônicas (PIX/Cartão)**
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

#### **5. Relatórios e Controle**
- **Consolidação**: Valores manuais + eletrônicos
- **Exportação**: PDF e CSV para análise
- **Métricas**: Por culto, período, tipo de doação
- **Acesso**: Hierárquico por role (admin, pastor, diáconos)

---

## 🏦 Integração Open Finance - Análise Técnica

### **📊 Análise do Ecossistema Brasileiro**

#### **Open Finance (OF) - Regulamentação BCB**
- **Definição**: Sistema de compartilhamento de dados e serviços financeiros regulado pelo Banco Central do Brasil
- **Objetivo**: Permitir que clientes compartilhem dados bancários com terceiros autorizados
- **Regulamentação**: Resolução BCB nº 4.943/2021

#### **Participantes do Ecossistema**
1. **Iniciadores (TPP - Third Party Providers)**
   - Empresas que iniciam transações
   - Precisam de autorização do BCB
   - Exemplo: PagSeguro, Mercado Pago

2. **Instituições Financeiras**
   - Bancos tradicionais e digitais
   - Cooperativas de crédito
   - Sociedades de crédito

3. **Usuários Finais**
   - Pessoas físicas e jurídicas
   - Autorizam compartilhamento de dados

### **🔍 Opções de Implementação**

#### **Opção 1: Integração Direta com APIs Bancárias** ⚠️ **COMPLEXA**
- **Requisitos Legais**:
  - Autorização BCB: Necessário registro como TPP
  - Certificação: Processo longo e custoso
  - Compliance: Rigoroso controle de segurança
  - Custos: Alto investimento inicial (R$ 50k-200k)
- **Desvantagens**:
  - ❌ Custo Proibitivo: R$ 50k-200k para certificação
  - ❌ Tempo: 6-12 meses para aprovação
  - ❌ Complexidade: Infraestrutura robusta necessária
  - ❌ Manutenção: Equipe dedicada para compliance

#### **Opção 2: Integração via Processadores de Pagamento** ✅ **RECOMENDADA**

##### **Mercado Pago (Escolhido)**
- **Vantagens**:
  - ✅ API bem documentada
  - ✅ Suporte a PIX, cartão, boleto
  - ✅ Webhooks para notificações
  - ✅ Dashboard de gestão
  - ✅ Taxas competitivas (2.99% + R$ 0.60)

##### **PagSeguro (Alternativa)**
- **Vantagens**:
  - ✅ Tradição no mercado brasileiro
  - ✅ Suporte completo a PIX
  - ✅ API REST bem estruturada
  - ✅ Relatórios detalhados
  - ✅ Integração com principais bancos

##### **Stripe (Internacional)**
- **Vantagens**:
  - ✅ API muito bem documentada
  - ✅ SDKs para React Native
  - ✅ Suporte a PIX (recente)
  - ✅ Dashboard avançado
  - ✅ Webhooks robustos
- **Desvantagens**:
  - ❌ Taxas mais altas
  - ❌ Suporte limitado a PIX
  - ❌ Documentação em inglês

### **🎯 Arquitetura Proposta**

#### **Fluxo de Integração**
```
📱 App (React Native)
    ↓
🔗 API Gateway (Supabase Edge Functions)
    ↓
💳 Mercado Pago API
    ↓
📊 Webhook → Supabase Database
    ↓
📈 Relatórios Consolidados
```

#### **Estrutura Técnica**
```typescript
// Domain Layer
interface PaymentProcessor {
  createDonation(donation: CreateElectronicDonationData): Promise<PaymentResult>;
  getTransactionStatus(transactionId: string): Promise<PaymentStatus>;
  handleWebhook(notification: WebhookNotification): Promise<void>;
}

// Infrastructure Layer
class MercadoPagoService implements PaymentProcessor {
  async createDonation(donation: CreateElectronicDonationData): Promise<PaymentResult> {
    // Implementação específica do Mercado Pago
  }
  
  async handleWebhook(notification: WebhookNotification): Promise<void> {
    // Processar notificação e salvar no Supabase
  }
}
```

### **📋 Fases de Implementação**

#### **Fase 1: Configuração Mercado Pago**
- [ ] Criar conta business no Mercado Pago
- [ ] Configurar webhooks para notificações
- [ ] Testar API de pagamentos
- [ ] Documentar endpoints necessários

#### **Fase 2: Desenvolvimento Backend**
- [ ] Criar PaymentProcessor interface
- [ ] Implementar MercadoPagoService
- [ ] Criar webhook handlers
- [ ] Integrar com Supabase

#### **Fase 3: Interface Mobile**
- [ ] Implementar OpenFinanceScreen
- [ ] Criar formulário de doação
- [ ] Adicionar monitoramento de status
- [ ] Implementar notificações push

#### **Fase 4: Relatórios Consolidados**
- [ ] Integrar dados eletrônicos nos relatórios
- [ ] Criar métricas comparativas
- [ ] Implementar filtros por método de pagamento
- [ ] Adicionar exportação de dados

### **💰 Estimativas de Custo**

#### **Mercado Pago**
- **Taxa por transação**: 2.99% + R$ 0.60
- **Setup**: Gratuito
- **Webhooks**: Gratuito
- **Dashboard**: Gratuito

#### **Desenvolvimento**
- **Tempo estimado**: 2-3 semanas
- **Complexidade**: Média
- **Testes**: Necessários para webhooks

### **🚨 Considerações Legais**

#### **LGPD (Lei Geral de Proteção de Dados)**
- ✅ **Consentimento**: Usuário deve autorizar
- ✅ **Minimização**: Coletar apenas dados necessários
- ✅ **Segurança**: Criptografia e proteção
- ✅ **Transparência**: Política de privacidade clara

#### **Compliance Bancário**
- ✅ **PCI DSS**: Para dados de cartão
- ✅ **Criptografia**: Dados sensíveis
- ✅ **Auditoria**: Logs de transações
- ✅ **Backup**: Recuperação de dados

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

### **Fase 2: Interface do Usuário ✅**
- [x] Criar componentes compartilhados
- [x] Implementar navegação com Strategy Pattern
- [x] Desenvolver telas principais
- [x] Integrar com Supabase

### **Fase 3: Sistema de Doações Unificado**
- [x] Implementar telas de doações básicas
- [ ] **Sistema de Doações Manuais**
  - [ ] Tela unificada de criação de doações
  - [ ] Suporte a contagem de cédulas/moedas
  - [ ] Suporte a registro de valor total
  - [ ] Registro de dízimos manuais
  - [ ] Registro de doações especiais
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