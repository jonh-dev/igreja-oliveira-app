# Mesa Redonda: MVP Mobile First - Sistema de Gestão Igreja Oliveira

## Participantes da Mesa Redonda

**🎯 Moderador**: Especialista em Produto Digital
**👥 Debatedores**:
- **Robert C. Martin (Uncle Bob)**: Especialista em Clean Code, SOLID e Clean Architecture
- **Martin Fowler**: Especialista em Arquitetura de Software, Patterns e Refactoring
- **Kent Beck**: Criador do Extreme Programming, TDD e Simplicidade no Design

---

## CONSENSO FINAL DA MESA REDONDA

### 🎯 DECISÕES TÉCNICAS FINAIS:

#### **1. Stack Tecnológico**
- **Framework**: React Native + TypeScript + Expo
- **Estado**: Context API (evoluir para Zustand)
- **Navegação**: React Navigation
- **Justificativa**: Simplicidade, type safety, custo-benefício

#### **2. Arquitetura**
- **Padrão**: Clean Architecture
- **Organização**: Feature-Driven Design
- **Desenvolvimento**: TDD
- **Justificativa**: Testabilidade, manutenibilidade, escalabilidade

#### **3. Backend**
- **Banco**: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth + RLS
- **Controle de Acesso**: Hierárquico
- **Justificativa**: Baixo custo, managed service, segurança

#### **4. Funcionalidades MVP**
- **Auth**: Login/Cadastro com validação
- **Dashboard**: Boas-vindas personalizadas
- **Doações**: Form para registro de valores
- **Justificativa**: Foco no essencial, rápido time-to-market

---

## REGRAS DE DESENVOLVIMENTO - ATUALIZADO 2025

### **🔧 TypeScript Clean Architecture Best Practices**

#### **1. Separação de Camadas**
```
src/
├── domain/               # Entidades e Value Objects
│   ├── entities/
│   └── value-objects/
├── application/          # Use Cases e Interfaces
│   ├── use-cases/
│   └── interfaces/
├── infrastructure/       # Implementações externas
│   ├── repositories/
│   └── services/
└── presentation/         # UI e Controllers
    ├── screens/
    └── components/
```

#### **2. Princípios de Interface**
- **Interfaces DEVEM ser definidas na camada de aplicação**
- **Implementações DEVEM ficar na camada de infraestrutura**
- **Use Cases NUNCA devem conhecer implementações concretas**
- **Dependency Inversion Principle SEMPRE aplicado**

#### **3. Estrutura de Arquivos**
```typescript
// ✅ CORRETO - Interface na camada de aplicação
// src/application/interfaces/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User>;
  create(user: CreateUserData): Promise<User>;
}

// ✅ CORRETO - Use Case na camada de aplicação
// src/application/use-cases/user/CreateUserUseCase.ts
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  
  async execute(data: CreateUserData): Promise<User> {
    // Lógica de negócio pura
  }
}

// ✅ CORRETO - Implementação na camada de infraestrutura
// src/infrastructure/repositories/SupabaseUserRepository.ts
export class SupabaseUserRepository implements IUserRepository {
  // Implementação específica do Supabase
}
```

#### **4. Regras de Nomenclatura**
- **Interfaces**: Prefixo `I` + Nome descritivo
- **Use Cases**: Verbo + Substantivo + `UseCase`
- **Entities**: Substantivos em PascalCase
- **Repositories**: Nome + `Repository`

#### **5. Regras de Dependência**
- **Domain**: Não depende de nada
- **Application**: Depende apenas do Domain
- **Infrastructure**: Depende de Application e Domain
- **Presentation**: Depende de Application e Domain

---

## ESTRUTURA DE PASTAS ATUALIZADA

```
src/
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Donation.ts
│   │   └── index.ts
│   └── value-objects/
│       ├── Email.ts
│       ├── Money.ts
│       └── index.ts
├── application/
│   ├── interfaces/
│   │   ├── repositories/
│   │   │   ├── IUserRepository.ts
│   │   │   └── IDonationRepository.ts
│   │   └── services/
│   │       └── IAuthService.ts
│   ├── use-cases/
│   │   ├── user/
│   │   │   ├── CreateUserUseCase.ts
│   │   │   └── AuthenticateUserUseCase.ts
│   │   └── donation/
│   │       ├── CreateDonationUseCase.ts
│   │       └── GetDonationsUseCase.ts
│   └── dto/
│       ├── CreateUserDto.ts
│       └── CreateDonationDto.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── SupabaseUserRepository.ts
│   │   └── SupabaseDonationRepository.ts
│   ├── services/
│   │   └── SupabaseAuthService.ts
│   └── config/
│       └── supabase.ts
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

## REGRAS DE QUALIDADE DE CÓDIGO

### **🧪 Testes**
- **Unit Tests**: Para Use Cases e Entities
- **Integration Tests**: Para Repositories e Services
- **E2E Tests**: Para fluxos principais
- **Coverage**: Mínimo 80% para Use Cases

### **📝 Documentação**
- **JSDoc**: Para todas as interfaces públicas
- **README**: Para cada feature
- **CHANGELOG**: Para versioning
- **ADR**: Para decisões arquiteturais

### **🔍 Linting e Formatação**
- **ESLint**: Regras rigorosas
- **Prettier**: Formatação automática
- **TypeScript**: Strict mode habilitado
- **Husky**: Pre-commit hooks

---

## HIERARQUIA DE USUÁRIOS

```typescript
enum UserRole {
  ADMIN = 'admin',     // Acesso total
  PASTOR = 'pastor',   // Acesso a diáconos, líderes, membros
  DEACON = 'deacon',   // Acesso a líderes e membros
  LEADER = 'leader',   // Acesso a membros
  MEMBER = 'member'    // Acesso limitado
}
```

---

## FASES DE IMPLEMENTAÇÃO

### **✅ FASE 1: Setup e Core (ATUAL)**
- [x] Configurar Projeto Expo + TypeScript
- [x] Instalar dependências essenciais
- [x] Criar entidades do domínio
- [x] Implementar use cases básicos
- [x] Documentar regras de desenvolvimento

### **🔄 FASE 2: Refatoração da Arquitetura**
- [ ] Refatorar para estrutura correta de camadas
- [ ] Mover interfaces para camada de aplicação
- [ ] Criar implementações na infraestrutura
- [ ] Configurar injeção de dependências

### **📱 FASE 3: Interface do Usuário**
- [ ] Criar componentes compartilhados
- [ ] Implementar navegação com Strategy Pattern
- [ ] Desenvolver telas principais
- [ ] Integrar com Supabase

### **🧪 FASE 4: Testes e Qualidade**
- [ ] Implementar testes unitários
- [ ] Configurar CI/CD
- [ ] Setup de linting e formatação
- [ ] Documentação completa

### **🚀 FASE 5: Deploy e Monitoramento**
- [ ] Build para produção
- [ ] Deploy nas stores
- [ ] Monitoramento e analytics
- [ ] Feedback dos usuários

---

## TECNOLOGIAS VALIDADAS (2025)

### **📱 Frontend**
- **React Native**: 0.79.5 (Estável)
- **Expo**: SDK 53 (Compatível)
- **TypeScript**: 5.8.3 (Strict Mode)
- **React Navigation**: 7.x (Stable)

### **🔧 Backend**
- **Supabase**: 2.50.3 (Latest)
- **PostgreSQL**: 15+ (via Supabase)
- **Row Level Security**: Para controle de acesso

### **🛠️ Ferramentas**
- **pnpm**: Package manager
- **ESLint**: Linting
- **Prettier**: Formatação
- **Jest**: Testes
- **Husky**: Git hooks

---

## ESTIMATIVAS DE CUSTO

### **💰 Custo Mensal Estimado**
- **Supabase**: $0-25/mês (Free tier generoso)
- **Expo**: $0-29/mês (Free para desenvolvimento)
- **Google Play + App Store**: $25 + $99/ano
- **Total**: $0-54/mês inicialmente

### **📊 Performance Esperada**
- **Bundle Size**: <10MB
- **Loading Time**: <2s
- **Escalabilidade**: 10k+ usuários
- **Offline Support**: Futuro

---

## PRÓXIMOS PASSOS

1. **Refatorar arquitetura atual** seguindo as regras definidas
2. **Implementar injeção de dependências** para desacoplamento
3. **Configurar Supabase** com RLS e admin inicial
4. **Criar componentes UI** seguindo design system
5. **Implementar navegação** com Strategy Pattern

---

## COMANDOS ÚTEIS

```bash
# Desenvolvimento
pnpm start              # Iniciar Expo
pnpm run android        # Executar no Android
pnpm run ios           # Executar no iOS

# Qualidade
pnpm run lint          # Executar linting
pnpm run type-check    # Verificar tipos
pnpm run test          # Executar testes
pnpm run test:coverage # Cobertura de testes

# Build
pnpm run build         # Build para produção
pnpm run preview       # Preview da build
```

---

**📝 Documento atualizado em**: 2025-01-08  
**🔄 Próxima revisão**: Após cada fase completada  
**📋 Status atual**: Fase 1 completa, iniciando Fase 2