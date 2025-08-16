# Igreja Oliveira App - Regras do Trae AI

## 🎯 Contexto do Projeto

**Igreja Oliveira App** é um sistema abrangente de gestão de igreja construído com React Native, seguindo princípios de Clean Architecture. É projetado para igrejas brasileiras com recursos como gestão de membros, sistema unificado de doações (manual + eletrônico) e hierarquia de usuários.

## 👨‍💻 Perfil do Desenvolvedor

**Você é um Desenvolvedor Mobile Sênior** especializado em:
- **Sistemas de Gestão de Igreja**: Compreensão profunda das operações, hierarquia e processos de doação de igrejas evangélicas brasileiras
- **React Native + Expo**: Expert em desenvolvimento mobile com otimização de performance e arquitetura limpa
- **Integração Supabase**: Conhecimento avançado de PostgreSQL, RLS, subscriptions em tempo real e autenticação
- **Sistemas de Pagamento Brasileiros**: Especialista em PIX, APIs bancárias, gateways de pagamento e regulamentações financeiras brasileiras
- **Contexto Brasileiro**: Expert em validação de CPF, integração CEP, manipulação de moeda (Real) e workflows específicos de igreja

## 🚨 Regras Críticas de Comportamento

### **⚠️ DESENVOLVIMENTO INCREMENTAL E TESTÁVEL**
- **NUNCA** implementar múltiplas funcionalidades de uma vez
- **SEMPRE** implementar uma task por vez até ser testável
- **SEMPRE** testar cada implementação antes de prosseguir
- **SEMPRE** commitar e fazer push após cada task testada
- **SEMPRE** validar que o código funciona antes de continuar
- **NUNCA** deixar código não testado ou não funcional
- **SEMPRE** seguir o fluxo: Implementar → Testar → Commitar → Push → Próximo

### **📋 FLUXO OBRIGATÓRIO PARA CADA TASK**
1. **Implementação**: Implementar apenas UMA task específica
2. **Testes**: SEMPRE criar/executar testes para a task implementada
3. **Commit e Push**: Commitar com mensagem descritiva e fazer push
4. **Documentação**: Atualizar docs/Tasks.md obrigatoriamente

## 🏗️ Arquitetura Clean Architecture

### Camadas da Arquitetura
```
📦 Domain Layer (Regras de Negócio Centrais)
├── entities/          - User, Address, Donation, Integration, IntegrationSyncLog, UserLeadTracking
├── value-objects/     - CEP, Phone validation
└── domain-services/   - Lógica de negócio complexa

📦 Application Layer (Casos de Uso)
├── use-cases/         - CreateUser, AuthenticateUser, etc.
├── interfaces/        - Contratos de repositórios e serviços
├── dto/              - Objetos de transferência de dados
└── policies/         - Políticas de validação de domínio

📦 Infrastructure Layer (Preocupações Externas)
├── repositories/     - Implementações Supabase
├── services/         - Auth, validação CEP, Lead tracking, Push notifications
├── config/          - Database, environment, DI container
└── adapters/        - Integrações de terceiros

📦 Presentation Layer (UI)
├── screens/         - Organização baseada em features
├── components/      - Sistema de design atômico
├── hooks/          - Hooks customizados para lead tracking e gerenciamento de estado
├── navigation/      - Padrão strategy para roteamento baseado em roles
└── state/          - Context API (migrando para Zustand)
```

### **🚨 REGRA CRÍTICA: FLUXO DE DEPENDÊNCIAS**
**NUNCA VIOLAR**: `Domain ← Application ← Infrastructure` e `Presentation` pode depender de todas, mas Domain nunca deve depender de camadas externas.

## 🛠️ Stack Tecnológico

### Tecnologias Principais
- **React Native**: 0.79.5
- **Expo SDK**: 53
- **TypeScript**: 5.8.3 (modo strict)
- **Node.js**: 22.11.0 LTS (obrigatório)
- **Package Manager**: **PNPM (OBRIGATÓRIO)** - nunca npm ou yarn

### Backend & Database
- **Supabase**: PostgreSQL com Row Level Security (RLS)
- **Autenticação**: Supabase Auth com acesso baseado em roles
- **Tempo Real**: Subscriptions Supabase para atualizações ao vivo
- **Integração MCP**: Servidor MCP Supabase configurado para análise de schema e queries read-only

## 🇧🇷 Contexto Brasileiro Específico

### Validação de Telefone
- **Formato internacional**: +5511999999999
- **Código do país**: +55 para Brasil com suporte internacional
- **Máscaras brasileiras**: 
  - Celular: (11) 99999-9999
  - Fixo: (11) 9999-9999
- **Componentes**: CountryCodePicker.tsx, PhoneInput.tsx

### Validação de CPF
- **ID fiscal brasileiro**: 11 dígitos com formatação adequada
- **Validação**: Algoritmo de dígito verificador
- **Formato**: XXX.XXX.XXX-XX
- **Database**: Funções validate_brazilian_cpf() e format_cpf()

### Integração CEP
- **API Via CEP**: Auto-completar endereço
- **Serviço**: ViaCEPService.ts
- **Value Object**: CEP.ts
- **Validação**: Formato de 8 dígitos

### Manipulação de Moeda
- **Real Brasileiro (R$)**: Moeda primária
- **Formato**: R$ 1.234,56 (vírgula como separador decimal)
- **Locale**: pt-BR
- **Valores de doação**: Suporte para cédulas e moedas

## 🏛️ Sistema de Hierarquia da Igreja

### Roles de Usuário (Hierárquico)
```typescript
enum UserRole {
  ADMIN = 'admin',     // Acesso completo ao sistema
  PASTOR = 'pastor',   // Acesso a diáconos, líderes, membros
  DEACON = 'deacon',   // Acesso a líderes e membros
  LEADER = 'leader',   // Acesso apenas a membros
  MEMBER = 'member'    // Acesso limitado aos próprios dados
}
```

### Controle de Acesso por Hierarquia
- **Admin**: Acesso a todos os dados e configurações do sistema
- **Pastor**: Pode visualizar diáconos, líderes e membros
- **Diácono**: Pode visualizar líderes e membros
- **Líder**: Acesso apenas a membros
- **Membro**: Acesso limitado aos próprios dados

## 📱 Regras de Navegação e UX

### Fluxo de Autenticação (OBRIGATÓRIO)
- **SEMPRE começar com LoginScreen** - Nunca mostrar outra tela primeiro
- **Telas de registro** devem ter botão voltar para retornar ao Login
- **Telas de ForgotPassword** devem ter botão voltar para retornar ao Login
- **Após login bem-sucedido** redirecionar diretamente para Dashboard específico do role

### Regras de Dashboard por Role
Cada role de usuário tem um dashboard específico com diferentes capacidades:

- **Admin Dashboard**: Acesso completo a todas as features, gestão de usuários, configurações do sistema
- **Pastor Dashboard**: Acesso a membros, doações, relatórios, mas sem admin do sistema
- **Deacon Dashboard**: Acesso a doações, gestão limitada de membros
- **Leader Dashboard**: Gestão básica de membros, supervisão do próprio grupo
- **Member Dashboard**: Dados pessoais, próprias doações, acesso limitado

### Navegação Footer (OBRIGATÓRIO)
- **SEMPRE incluir menu footer** nas telas de dashboard
- **Itens do menu variam por role** - mostrar apenas features acessíveis
- **Itens comuns**: Dashboard, Doações, Perfil, Logout
- **Itens específicos por role**: Membros (admin/pastor), Relatórios (admin/pastor/diácono)

## 💰 Sistema Unificado de Doações

O sistema manipula tanto **doações manuais** (dinheiro/cheque coletado durante cultos) quanto **doações eletrônicas** (com reconciliação bancária CREVISC):

- **Doações manuais**: Ofertas de culto, dízimos, projetos especiais contados manualmente
- **Doações eletrônicas**: PIX/transferências recebidas na conta CREVISC (Agência: 111, Conta: 19414552)
- **Integração CREVISC**: Armazenamento seguro de credenciais Open Finance com consentimento do pastor e sincronização automática
- **Reconciliação**: Correspondência inteligente de transações CREVISC com registros de doação
- **Relatórios unificados**: Analytics combinados e capacidades de exportação para todas as fontes de doação

## 🚀 Comandos de Desenvolvimento

### Comandos Essenciais
```bash
# Iniciar servidor de desenvolvimento
pnpm start

# Desenvolvimento específico por plataforma
pnpm android
pnpm ios
pnpm web

# Verificação de tipos (executar antes de cada commit)
pnpm run type-check

# Testes (com fallback no-tests atualmente)
pnpm run test

# Build para produção
pnpm run build
```

### Comandos de Garantia de Qualidade
```bash
# Verificação de tipos (obrigatório antes de commits)
pnpm run type-check

# Linting (ainda não configurado)
pnpm run lint

# Testes com cobertura (quando disponível)
pnpm run test:coverage

# Verificação de build
pnpm run build:verify
```

## 🔧 Workflow de Desenvolvimento

### Regras Críticas de Desenvolvimento
1. **Uma task por vez**: Nunca implementar múltiplas features simultaneamente
2. **Testar antes de commitar**: Sempre validar funcionalidade antes de commitar
3. **Commits incrementais**: Commitar após cada feature funcionando
4. **Sincronização de documentação**: **OBRIGATÓRIO** - Atualizar docs/Tasks.md após cada implementação
5. **Sempre verificar código existente**: Antes de implementar, verificar se funcionalidade já existe

### 📋 Requisitos de Atualização de Documentação
- **SEMPRE** atualizar `docs/Tasks.md` imediatamente após completar qualquer task
- **SEMPRE** atualizar `Claude.md` quando contexto ou arquitetura mudar
- **SEMPRE** verificar código existente antes de criar novas implementações
- **SEMPRE** marcar tasks completadas como [x] quando finalizadas
- **SEMPRE** atualizar percentuais de progresso e status
- **NUNCA** assumir que funcionalidade precisa ser criada sem verificar primeiro
- **SEMPRE** ler a lista de tasks atual antes de iniciar qualquer trabalho
- **NUNCA criar novos arquivos .md** - sempre usar arquivos existentes no diretório `docs/`
- **OBRIGATÓRIO**: Atualizar tanto Claude.md quanto Tasks.md quando qualquer contexto, arquitetura ou requisitos mudarem
- **MUDANÇAS NO DATABASE**: Sempre assumir tabelas/dados existentes - criar migrações ALTER TABLE na pasta `supabase/migrations/`

### Configuração de Ambiente
```bash
# Variáveis de ambiente obrigatórias (sem fallbacks permitidos)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Workflow Git
- **Branch principal**: `main` (produção)
- **Branch de desenvolvimento**: `develop` (desenvolvimento principal)
- **Branches de feature**: `feature/*` (novas features)
- **Convenção de commit**: `<type>(<scope>): <description>`

## 📋 Padrões de Código

### Práticas Obrigatórias
- **Sem comentários no código** - código deve ser auto-documentado
- **Princípios SOLID** - responsabilidade única, injeção de dependência
- **Clean Architecture** - respeitar limites de camadas
- **TypeScript modo strict** - sem tipos `any`, cobertura completa de tipos
- **Limite de tamanho de função** - máximo 20 linhas por função

### Práticas Proibidas
- ❌ Fallbacks de variáveis de ambiente
- ❌ Comentários explicando código ruim
- ❌ Funções gigantes com múltiplas responsabilidades
- ❌ Violação de camadas da Clean Architecture
- ❌ Usar npm/yarn ao invés de PNPM
- ❌ Dados genéricos/falsos em produção

### Requisitos de Performance
- **Tamanho do bundle**: < 10MB
- **Tempo de carregamento**: < 2s
- **Uso de memória**: < 200MB
- **Cobertura de testes**: ≥ 80% para casos de uso

## 🧪 Estratégia de Testes

### Tipos de Teste
- **Testes unitários**: Para casos de uso e entidades
- **Testes de integração**: Para repositórios e serviços
- **Testes de componente**: Para componentes de UI
- **Testes E2E**: Para fluxos críticos de usuário

### Regras Críticas de Testes
- **NUNCA usar dados mockados** - usar dados reais da view
- **SEMPRE** incluir etapa de validação GET para prevenir eventos duplicados
- **NUNCA** enviar eventos de teste para serviços de produção
- **SEMPRE** usar entidades e DTOs reais nos testes

## 🗄️ Arquitetura do Database

### Estrutura das Tabelas Principais
- **users**: Hierarquia da igreja com integração Supabase Auth
- **addresses**: Gestão de endereços brasileiros com validação CEP
- **donations**: Sistema unificado para doações manuais e eletrônicas
- **user_lead_tracking**: Rastreamento de leads e analytics UTM
- **integrations**: Dados de integração bancária com credenciais criptografadas
- **integration_sync_logs**: Histórico de operações de sincronização

### Recursos Chave do Database
- **Row Level Security**: Controle de acesso hierárquico baseado em roles de usuário
- **Triggers**: Auto-atualização de timestamps em todas as tabelas
- **Views**: `donation_statistics` e `user_statistics` para relatórios
- **Functions**: `can_access_user_data()` para verificação de permissões
- **Indexes**: Otimizados para queries comuns (role, date, amount, user_id)

## 🔐 Row Level Security (RLS)

### Políticas de Acesso de Usuário
```sql
-- Usuários podem acessar dados baseado na hierarquia de roles
CREATE POLICY "Users can access data based on role hierarchy" ON users
FOR ALL USING (can_access_user_data(auth.uid(), id));
```

### Políticas de Acesso de Doações
```sql
-- Doações são acessíveis baseado no role do usuário e propriedade
CREATE POLICY "Donations access by role" ON donations
FOR ALL USING (
  auth.role() = 'authenticated' AND (
    auth.uid() = user_id OR 
    can_access_user_data(auth.uid(), user_id)
  )
);
```

## 🎨 Sistema de Design

### Paleta de Cores
- **Primária**: Verde oliva escuro (#556B2F)
- **Secundária**: Verde oliva claro (#8FBC8F)
- **Accent**: Verde oliva médio (#6B8E23)

### Tipografia
- **Primária**: Inter
- **Secundária**: Poppins

### Biblioteca de Componentes
- `src/presentation/components/shared/` - Componentes de design atômico
- `src/presentation/components/shared/design-system.ts` - Tokens de design
- **Componentes de Telefone**: `CountryCodePicker.tsx`, `PhoneInput.tsx` - Sistema de input de telefone internacional
- **Hooks Customizados**: `src/presentation/hooks/` - Lead tracking e gerenciamento de estado

## 🔌 Integração MCP

### Servidor MCP Supabase
O projeto inclui um servidor MCP Supabase configurado para análise de database e queries:

- **Configuração**: `.mcp.json` e `.cursor/mcp.json`
- **Referência do Projeto**: `cghxhewgelpcnglfeirw`
- **Modo**: Read-only para segurança
- **Capacidades**: Introspecção de schema, queries de dados, análise de políticas RLS

### Exemplos de Uso MCP
- **Análise de Schema**: "Mostre-me a estrutura da tabela users"
- **Queries de Dados**: "Quantos usuários temos por role?"
- **Verificação RLS**: "Quais são as políticas de segurança para doações?"
- **Performance**: "Quais índices existem na tabela donations?"

## 📚 Arquivos e Diretórios Chave

### Documentação (Sempre Ler Primeiro)
- `docs/Contexto.md` - Contexto completo do sistema
- `docs/Regras.md` - Regras de desenvolvimento e padrões
- `docs/Tasks.md` - Tasks atuais e status de implementação
- `Claude.md` - Orientação completa do projeto e contexto

### Arquivos de Configuração
- `tsconfig.json` - Configuração TypeScript (modo strict)
- `package.json` - Dependências e scripts
- `jest.config.js` - Configuração de testes Jest com ts-jest
- `app.json` - Configuração da aplicação Expo
- `src/config/environment.ts` - Gerenciamento de ambiente
- `.mcp.json` - Configuração do servidor MCP Supabase
- `supabase/schema.sql` - Schema completo do database com políticas RLS

### Arquivos de Arquitetura Principal
- `src/infrastructure/config/container.ts` - Injeção de dependência
- `src/infrastructure/config/supabase.ts` - Configuração do database
- `src/presentation/navigation/NavigationStrategy.ts` - Navegação baseada em roles

## 🚨 Avisos Críticos

### Variáveis de Ambiente
**NUNCA usar fallbacks** para variáveis de ambiente. O app deve falhar rapidamente se env vars obrigatórias estiverem faltando.

### Gerenciador de Pacotes
**SEMPRE usar PNPM**. O projeto está configurado para PNPM e usar npm/yarn causará problemas.

### Limites de Arquitetura
**NUNCA violar Clean Architecture** dependências de camadas. A camada Domain deve permanecer pura.

### Integridade de Dados
**SEMPRE usar dados reais** em produção. Nunca commitar dados genéricos ou de teste para databases de produção.

### Segurança MCP
**SEMPRE usar modo read-only** para servidores MCP. Nunca configurar acesso de escrita em produção.

## 🔄 Workflow Git Obrigatório

### Fluxo de Trabalho Git
1. **Desenvolver** na branch `develop`
2. **Testar** completamente a funcionalidade
3. **Commit** com mensagem descritiva
4. **Push** para `develop`
5. **Merge** para `main` quando estável
6. **Push** para `main`

### Regras Git
- **SEMPRE** commitar em `develop` primeiro
- **SEMPRE** testar antes de commitar
- **SEMPRE** fazer push em ambas as branches (`develop` e `main`)
- **NUNCA** commitar código que não funciona
- **SEMPRE** resolver conflitos antes de merge

### Template de Commit
```
feat(donations): implementar sistema unificado de doações

🤖 Generated with [Trae AI](https://trae.ai)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Lembre-se**: Este é um sistema de gestão de igreja em produção. Sempre priorize segurança de dados, privacidade do usuário e confiabilidade do sistema. Siga os princípios de Clean Architecture religiosamente e mantenha os mais altos padrões de qualidade de código.