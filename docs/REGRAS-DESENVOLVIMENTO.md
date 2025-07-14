# 🔧 Regras de Desenvolvimento - Igreja Oliveira App

## 👤 Perfil do Desenvolvedor

**Especialista Mobile Senior para Igreja - Características:**
- 🏗️ **Arquitetura**: Clean Architecture, SOLID, DDD
- 📱 **Mobile**: React Native, TypeScript, Performance
- 🗄️ **Backend**: Supabase (especialista), PostgreSQL, RLS
- 🎯 **Visão**: Escalabilidade, abstração, manutenibilidade
- ⛪ **Domínio**: Sistemas de gestão eclesiástica

---

## 🎯 Princípios Fundamentais

### **1. Escalabilidade Primeiro**
- Código deve suportar crescimento de 50 → 50.000 usuários
- Arquitetura preparada para expansão de funcionalidades
- Performance otimizada desde o início
- Cache strategies e lazy loading por padrão

### **2. Abstração Inteligente**
- Interfaces bem definidas entre camadas
- Dependency Injection em todos os níveis
- Strategy Pattern para comportamentos variáveis
- Factory Pattern para criação de objetos complexos

### **3. Manutenibilidade Extrema**
- Código auto-documentado
- Separação clara de responsabilidades
- Testes obrigatórios para lógica crítica
- Refactoring contínuo

### **4. Performance Igreja-Focused**
- Otimizado para dispositivos Android básicos
- Bundle size mínimo (<10MB)
- Offline-first quando possível
- Sync inteligente de dados

---

## 🏗️ Padrões Arquiteturais Obrigatórios

### **Clean Architecture - Camadas Rigorosas**

```
📦 Domain Layer (Núcleo)
├── Entities (Regras de negócio da igreja)
├── Value Objects (CPF, Email, Money, etc.)
└── Domain Services (Lógicas complexas)

📦 Application Layer (Casos de Uso)
├── Use Cases (1 por ação específica)
├── Interfaces (Contratos)
├── DTOs (Entrada/Saída)
└── Policies (Validações de domínio)

📦 Infrastructure Layer (Externo)
├── Repositories (Supabase implementations)
├── Services (Auth, Storage, Push)
├── Config (Environment, Database)
└── Adapters (Third-party integrations)

📦 Presentation Layer (UI)
├── Screens (Feature-based)
├── Components (Atomic Design)
├── Navigation (Strategy Pattern)
└── State Management (Context/Zustand)
```

### **Dependências - Regra de Ouro**
```
Domain ← Application ← Infrastructure
   ↑         ↑
   └─── Presentation ←┘
```

**NUNCA quebrar esta hierarquia!**

---

## 📱 Padrões React Native + TypeScript

### **1. Componentes - Atomic Design**

```typescript
// ✅ CORRETO - Componente atômico
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false
}) => {
  // Implementação limpa e tipada
};
```

### **2. Hooks Customizados - Lógica Reutilizável**

```typescript
// ✅ CORRETO - Hook para Use Case
export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createUser = useCallback(async (data: CreateUserDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const userRepository = container.get<IUserRepository>('UserRepository');
      const useCase = new CreateUserUseCase(userRepository);
      return await useCase.execute(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { createUser, loading, error };
};
```

### **3. Navigation - Strategy Pattern**

```typescript
// ✅ CORRETO - Navegação baseada em papel
export class NavigationStrategy {
  static getStackForRole(role: UserRole): NavigationStack {
    switch (role) {
      case UserRole.ADMIN:
        return AdminNavigationStack;
      case UserRole.PASTOR:
        return PastorNavigationStack;
      case UserRole.MEMBER:
        return MemberNavigationStack;
      default:
        return GuestNavigationStack;
    }
  }
}
```

---

## 🗄️ Padrões Supabase - Expertise Aplicada

### **⚠️ REGRA CRÍTICA: VARIÁVEIS DE AMBIENTE**

#### **🚨 NUNCA usar fallbacks de variáveis de ambiente**
```typescript
// ❌ PROIBIDO - Fallbacks podem expor dados em produção
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://default.supabase.co';

// ✅ CORRETO - Falha rápida sem fallback
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL é obrigatório');
}
```

#### **📋 Processo de Setup Supabase Obrigatório:**

**1. Criar projeto no Supabase:**
```bash
# 1. Ir para https://database.new
# 2. Criar novo projeto: "igreja-oliveira-app"
# 3. Escolher região próxima (South America - São Paulo)
# 4. Definir senha forte para banco
# 5. Aguardar provisionamento (~2min)
```

**2. Configurar variáveis no Expo:**
```bash
# Criar arquivo .env na raiz do projeto
echo "EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here" >> .env

# Adicionar ao .gitignore (já feito)
# .env já está no .gitignore
```

**3. Configurar secrets para produção:**
```bash
# Via Supabase CLI (quando disponível)
supabase secrets set EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
supabase secrets set EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Via Dashboard: Project Settings > API > Project URL & API Keys
```

**4. Validação obrigatória:**
```typescript
// src/infrastructure/config/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validação rigorosa sem fallbacks
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente Supabase são obrigatórias');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### **🔐 Secrets Management - Tier Gratuito:**

**Supabase oferece gratuitamente:**
- ✅ **4 secrets padrão** (URL, ANON_KEY, SERVICE_ROLE_KEY, DB_URL)
- ✅ **Secrets customizados** via Dashboard/CLI
- ✅ **Vault para database secrets** (encrypted storage)
- ✅ **Environment variables** para Edge Functions
- ✅ **Local development** com .env files

**Limitações tier gratuito:**
- 💾 **500MB database storage**
- 🔄 **2GB bandwidth/mês**
- 👥 **50.000 monthly active users**
- ⏱️ **Edge Functions**: 500.000 invocations/mês

**Setup de desenvolvimento:**
```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Inicializar projeto local (opcional)
supabase init

# 4. Configurar secrets locais
echo "EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321" > .env.local
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=local_anon_key" >> .env.local
```

### **1. Row Level Security (RLS) - Hierarquia Igreja**

```sql
-- ✅ CORRETO - RLS para hierarquia eclesiástica
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
```

### **2. Repository Pattern - Supabase Optimized**

```typescript
// ✅ CORRETO - Repository com cache e offline
export class SupabaseUserRepository implements IUserRepository {
  private cache = new Map<string, User>();
  
  async findById(id: string): Promise<User | null> {
    // 1. Verifica cache primeiro
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    // 2. Busca no Supabase com RLS automático
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new RepositoryError(error.message);
    if (!data) return null;
    
    // 3. Converte para entidade de domínio
    const user = UserMapper.toDomain(data);
    
    // 4. Atualiza cache
    this.cache.set(id, user);
    
    return user;
  }
}
```

### **3. Real-time - Igreja Events**

```typescript
// ✅ CORRETO - Real-time para eventos da igreja
export class ChurchEventsService {
  subscribeToUserChanges(callback: (user: User) => void) {
    return this.supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `church_id=eq.${this.churchId}`
        },
        (payload) => {
          const user = UserMapper.toDomain(payload.new);
          callback(user);
        }
      )
      .subscribe();
  }
}
```

---

## 🎨 Padrões de Código - Qualidade Extrema

### **1. Nomenclatura - Igreja Context**

```typescript
// ✅ CORRETO - Nomes específicos do domínio
interface ChurchMemberDto {
  fullName: string;           // Nome completo
  membershipDate: Date;       // Data de membresia
  baptismDate?: Date;         // Data do batismo
  ministries: MinistryId[];   // Ministérios que participa
  titheAmount?: MoneyValue;   // Valor do dízimo
}

// ✅ CORRETO - Use Cases específicos
class RegisterNewMemberUseCase {
  async execute(data: RegisterMemberDto): Promise<Member> {
    // Validações específicas da igreja
    await this.validateMembershipRequirements(data);
    
    // Lógica de negócio
    const member = Member.create(data);
    
    return await this.memberRepository.save(member);
  }
}

// ✅ CORRETO - Entities da igreja
class Member extends User {
  private constructor(
    id: UserId,
    private membershipDate: Date,
    private baptismDate?: Date,
    private ministries: Ministry[] = []
  ) {
    super(id);
  }
  
  canAccessFinancialReports(): boolean {
    return this.hasRole(UserRole.TREASURER) || 
           this.hasRole(UserRole.PASTOR) ||
           this.hasRole(UserRole.ADMIN);
  }
}
```

### **2. Error Handling - Igreja Specific**

```typescript
// ✅ CORRETO - Errors específicos do domínio
export class ChurchDomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ChurchDomainError';
  }
}

export class InsufficientPermissionError extends ChurchDomainError {
  constructor(requiredRole: UserRole, currentRole: UserRole) {
    super(
      `Acesso negado. Necessário: ${requiredRole}, Atual: ${currentRole}`,
      'INSUFFICIENT_PERMISSION'
    );
  }
}

export class TitheValidationError extends ChurchDomainError {
  constructor(amount: number) {
    super(
      `Valor de dízimo inválido: R$ ${amount}. Deve ser maior que zero.`,
      'INVALID_TITHE_AMOUNT'
    );
  }
}
```

### **3. Validation - Igreja Rules**

```typescript
// ✅ CORRETO - Validações específicas da igreja
export class ChurchValidators {
  static validateCPF(cpf: string): boolean {
    // Lógica de validação de CPF brasileiro
    return CPFValidator.isValid(cpf);
  }
  
  static validateMembershipDate(date: Date): boolean {
    const today = new Date();
    const minDate = new Date('1900-01-01');
    return date >= minDate && date <= today;
  }
  
  static validateTitheAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000; // Limite razoável
  }
  
  static validateMinistryParticipation(
    member: Member, 
    ministry: Ministry
  ): boolean {
    // Regras específicas de participação em ministérios
    if (ministry.requiresBaptism && !member.isBaptized()) {
      return false;
    }
    
    if (ministry.minimumAge && member.age < ministry.minimumAge) {
      return false;
    }
    
    return true;
  }
}
```

---

## 🧪 Testes - Cobertura Obrigatória

### **1. Testes de Use Cases - 100%**

```typescript
// ✅ CORRETO - Teste de Use Case
describe('CreateMemberUseCase', () => {
  let useCase: CreateMemberUseCase;
  let mockRepository: jest.Mocked<IMemberRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new CreateMemberUseCase(mockRepository);
  });
  
  it('should create member with valid data', async () => {
    // Arrange
    const memberData = createValidMemberData();
    
    // Act
    const result = await useCase.execute(memberData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(memberData.email);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
  
  it('should throw error for invalid CPF', async () => {
    // Arrange
    const invalidData = { ...createValidMemberData(), cpf: 'invalid' };
    
    // Act & Assert
    await expect(useCase.execute(invalidData))
      .rejects
      .toThrow(InvalidCPFError);
  });
});
```

### **2. Testes de Repository - Supabase**

```typescript
// ✅ CORRETO - Teste de Repository
describe('SupabaseMemberRepository', () => {
  let repository: SupabaseMemberRepository;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    repository = new SupabaseMemberRepository(mockSupabase);
  });
  
  it('should find member by CPF', async () => {
    // Arrange
    const cpf = '12345678901';
    const mockData = { id: '1', cpf, name: 'João' };
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockData, error: null })
        })
      })
    } as any);
    
    // Act
    const result = await repository.findByCPF(cpf);
    
    // Assert
    expect(result).toBeDefined();
    expect(result!.cpf.value).toBe(cpf);
  });
});
```

---

## 🔒 Segurança - Igreja Standards

### **1. Autenticação Hierárquica**

```typescript
// ✅ CORRETO - Middleware de autenticação
export class ChurchAuthMiddleware {
  static requireRole(requiredRole: UserRole) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;
      
      if (!userRole) {
        throw new UnauthorizedError('Token inválido');
      }
      
      if (!this.hasPermission(userRole, requiredRole)) {
        throw new ForbiddenError('Permissão insuficiente');
      }
      
      next();
    };
  }
  
  private static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy = {
      [UserRole.ADMIN]: 4,
      [UserRole.PASTOR]: 3,
      [UserRole.DEACON]: 2,
      [UserRole.LEADER]: 1,
      [UserRole.MEMBER]: 0
    };
    
    return hierarchy[userRole] >= hierarchy[requiredRole];
  }
}
```

### **2. Dados Sensíveis - Proteção**

```typescript
// ✅ CORRETO - Proteção de dados sensíveis
export class SensitiveDataProtection {
  static sanitizeUserForRole(user: User, viewerRole: UserRole): Partial<User> {
    const baseData = {
      id: user.id,
      name: user.name,
      role: user.role
    };
    
    // Apenas admin e pastor podem ver dados pessoais completos
    if (viewerRole === UserRole.ADMIN || viewerRole === UserRole.PASTOR) {
      return {
        ...baseData,
        email: user.email,
        phone: user.phone,
        address: user.address,
        cpf: user.cpf?.masked // CPF mascarado
      };
    }
    
    return baseData;
  }
}
```

---

## 📊 Performance - Igreja Scale

### **1. Otimizações Obrigatórias**

```typescript
// ✅ CORRETO - Lazy loading e cache
export class OptimizedMemberService {
  private memberCache = new LRUCache<string, Member>(1000);
  
  // Lazy loading para listas grandes
  async getMembersPage(page: number, size: number = 50): Promise<Member[]> {
    const cacheKey = `members_${page}_${size}`;
    
    if (this.memberCache.has(cacheKey)) {
      return this.memberCache.get(cacheKey)!;
    }
    
    const members = await this.repository.findPaginated(page, size);
    this.memberCache.set(cacheKey, members);
    
    return members;
  }
  
  // Debounce para pesquisas
  searchMembers = debounce(async (term: string) => {
    return await this.repository.searchByTerm(term);
  }, 300);
}
```

### **2. Bundle Optimization**

```typescript
// ✅ CORRETO - Code splitting por feature
const DonationsScreen = lazy(() => import('../screens/donations/DonationsScreen'));
const MembersScreen = lazy(() => import('../screens/members/MembersScreen'));
const ReportsScreen = lazy(() => import('../screens/reports/ReportsScreen'));

// ✅ CORRETO - Barrel exports otimizados
// Evitar import de tudo
export { CreateMemberUseCase } from './CreateMemberUseCase';
export { UpdateMemberUseCase } from './UpdateMemberUseCase';
// Ao invés de export * from './index';
```

---

## 📝 Documentação - Igreja Context

### **1. JSDoc - Padrão Igreja**

```typescript
/**
 * Registra um novo membro na igreja com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * const useCase = new RegisterMemberUseCase(repository);
 * const member = await useCase.execute({
 *   name: 'João Silva',
 *   email: 'joao@email.com',
 *   cpf: '12345678901',
 *   membershipDate: new Date()
 * });
 * ```
 * 
 * @param data - Dados do novo membro
 * @returns Promise com o membro criado
 * @throws {InvalidCPFError} Quando CPF é inválido
 * @throws {EmailAlreadyExistsError} Quando email já existe
 * @throws {InvalidMembershipDateError} Quando data de membresia é inválida
 */
async execute(data: RegisterMemberDto): Promise<Member> {
  // Implementação
}
```

### **2. README por Feature**

```markdown
# 👥 Members Feature

## Responsabilidades
- Gerenciar membros da igreja
- Validar dados de membresia
- Controlar hierarquia de acesso

## Use Cases
- `RegisterMemberUseCase`: Registrar novo membro
- `UpdateMemberUseCase`: Atualizar dados do membro
- `DeactivateMemberUseCase`: Desativar membro

## Regras de Negócio
1. CPF obrigatório e único
2. Data de membresia não pode ser futura
3. Apenas pastor e admin podem registrar membros
4. Membro inativo não pode acessar sistema

## Validações
- CPF brasileiro válido
- Email único na igreja
- Telefone com DDD brasileiro
- Data de nascimento razoável (1900-hoje)
```

---

## 🔄 Processo de Atualização de Contexto

### **Regra Obrigatória: Atualização Automática**

Após **CADA ETAPA** completada, os seguintes documentos **DEVEM** ser atualizados:

1. **STATUS.md** - Atualizar progresso atual
2. **MESA-REDONDA.md** - Adicionar novas decisões/padrões
3. **REGRAS-DESENVOLVIMENTO.md** - Este arquivo com novas regras

### **Template de Atualização**

```markdown
## 📅 Atualização: [YYYY-MM-DD] - [Nome da Etapa]

### ✅ Completado
- [ ] Item 1
- [ ] Item 2

### 🔄 Em Andamento
- [ ] Item 3

### 📝 Novas Regras/Padrões
- Regra X adicionada
- Padrão Y modificado

### 🎯 Próximos Passos
1. Tarefa A
2. Tarefa B

---
```

### **Responsabilidade do Agente**

O agente desenvolvedor **DEVE**:
1. ✅ Completar a etapa/tarefa
2. ✅ Testar a implementação
3. ✅ Atualizar documentação relevante
4. ✅ Atualizar STATUS.md com novo contexto
5. ✅ Validar que tudo está funcionando

**NUNCA** considerar uma etapa completa sem atualizar o contexto!

---

## 🚀 Comandos de Qualidade Obrigatórios

### **⚠️ REGRA OBRIGATÓRIA: SEMPRE USE PNPM**
- **NUNCA** use npm ou yarn
- **SEMPRE** use pnpm para todos os comandos
- **VALIDAR** package manager antes de executar comandos

### **Pre-Commit Checklist**
```bash
# 1. Linting rigoroso
pnpm run lint:strict

# 2. Type checking
pnpm run type-check

# 3. Tests com coverage
pnpm run test:coverage

# 4. Build verification
pnpm run build:verify

# 5. Bundle size check
pnpm run bundle:analyze
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/quality.yml
name: Quality Gates
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Lint
        run: pnpm run lint:strict
      
      - name: Type Check
        run: pnpm run type-check
        
      - name: Test Coverage
        run: pnpm run test:coverage
        
      - name: Architecture Tests
        run: pnpm run test:architecture
        
      - name: Bundle Size
        run: pnpm run bundle:check
```

---

## 🎯 KPIs de Qualidade

### **Métricas Obrigatórias**
- **Cobertura de Testes**: ≥ 80%
- **Type Coverage**: 100%
- **Bundle Size**: < 10MB
- **Load Time**: < 2s
- **Crash Rate**: < 0.1%

### **Code Quality**
- **Cyclomatic Complexity**: < 10
- **Maintainability Index**: > 80
- **Technical Debt**: < 5%
- **Duplication**: < 3%

### **Performance**
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Memory Usage**: < 200MB
- **Battery Impact**: Minimal

---

**📋 Documento criado em**: 2025-01-14  
**🔄 Próxima revisão**: Após cada sprint  
**📊 Versão**: 1.0  
**👤 Responsável**: João Zanardi (jonh-dev)

**🎯 Objetivo**: Garantir código de qualidade enterprise para sistema de gestão eclesiástica escalável e mantível.