# 🔀 Git Workflow - Igreja Oliveira App

## 🎯 Objetivo
Documentar o fluxo de trabalho Git para desenvolvimento organizado e rastreável, seguindo boas práticas para projetos de igreja.

---

## 📋 Configuração Inicial Realizada

### **Repositório Inicializado** ✅
```bash
git init
git config --local user.name "João Carlos Schwab Zanardi"
git config --local user.email "jonh.dev.br@gmail.com"
```

### **Estrutura de Branches**
```
main (produção)
├── develop (desenvolvimento)
├── feature/* (funcionalidades)
├── fix/* (correções)
└── release/* (versões)
```

---

## 🏗️ Convenção de Commits

### **Formato Padrão:**
```
<tipo>(<escopo>): <descrição>

<corpo detalhado>

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### **Tipos de Commit:**
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alteração na documentação
- **style**: Formatação, lint
- **refactor**: Refatoração de código
- **test**: Adição/alteração de testes
- **chore**: Tarefas de manutenção

### **Escopos Sugeridos:**
- **domain**: Entidades, value objects
- **application**: Use cases, interfaces
- **infrastructure**: Repositories, services, config
- **presentation**: UI, screens, components
- **docs**: Documentação
- **config**: Configurações gerais

### **Exemplos:**
```bash
# Funcionalidade nova
feat(infrastructure): configurar Supabase com types seguros

# Correção
fix(domain): validação de CPF brasileiro

# Documentação
docs(workflow): adicionar guia de commits

# Refatoração
refactor(application): aplicar Clean Architecture
```

---

## 🔄 Fluxo de Desenvolvimento

### **1. Setup Inicial Obrigatório**
```bash
# 1. Renomear master para main (padrão GitHub)
git branch -M main

# 2. Criar branch develop (desenvolvimento principal)
git checkout -b develop

# 3. Criar repositório remoto no GitHub
# Via GitHub web interface: https://github.com/jonh-dev/igreja-oliveira-app

# 4. Conectar repositório local ao remoto
git remote add origin https://github.com/jonh-dev/igreja-oliveira-app.git

# 5. Push inicial das branches principais
git push -u origin main
git push -u origin develop
```

### **2. Branch Strategy Rigorosa**
```bash
# SEMPRE trabalhar em features branches a partir de develop
git checkout develop
git pull origin develop

# Criar feature branch
git checkout -b feature/supabase-repositories

# Trabalhar na feature com commits incrementais
git add .
git commit -m "feat(infrastructure): implementar UserRepository"

# Push da feature para remote
git push -u origin feature/supabase-repositories

# Merge para develop (só quando feature completa)
git checkout develop
git merge feature/supabase-repositories

# Push develop atualizado
git push origin develop

# Cleanup da feature branch
git branch -d feature/supabase-repositories
git push origin --delete feature/supabase-repositories
```

### **3. Regras de Branch - DESENVOLVEDOR SOLO**

#### **📋 Estratégia Simplificada para Projeto Pequeno:**

**🎯 PRINCIPAL: Trabalhar diretamente em `develop`**
- ✅ Commits diretos em `develop` são permitidos
- ✅ `main` apenas para releases estáveis
- ✅ Feature branches opcionais para mudanças grandes

#### **🔄 Fluxo Simplificado:**
```bash
# Fluxo principal (80% dos casos)
develop → main (quando pronto para release)

# Fluxo para features grandes (20% dos casos) 
feature/xyz → develop → main
```

#### **📊 Quando usar cada abordagem:**

**✅ COMMIT DIRETO EM DEVELOP:**
- Correções pequenas (<50 linhas)
- Implementações simples
- Atualizações de documentação
- Configurações e ajustes

**✅ FEATURE BRANCH:**
- Implementações grandes (>100 linhas)
- Novas telas ou componentes
- Mudanças arquiteturais
- Experimentos que podem falhar

### **4. Workflow Diário - DESENVOLVEDOR SOLO**

#### **🌅 Início do Dia:**
```bash
# 1. Sempre começar em develop
git checkout develop
git pull origin develop
```

#### **💻 Durante o Desenvolvimento:**
```bash
# 1. Validar qualidade (SEMPRE obrigatório)
pnpm run type-check

# 2. Commit incremental em develop
git add .
git commit -m "feat(infrastructure): implementar UserRepository

- Adicionar CRUD operations
- Configurar RLS policies  
- Testes unitários básicos

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push para backup/sincronia
git push origin develop
```

#### **🏁 Processo de Release (develop → main):**
```bash
# 1. Finalizar e testar develop  
git checkout develop
pnpm run type-check
pnpm run build  # se disponível

# 2. Merge para main (release)
git checkout main
git merge develop

# 3. Tag da versão
git tag -a v1.0.0 -m "Release v1.0.0 - MVP Igreja

Features implementadas:
- Clean Architecture
- Configuração Supabase  
- Sistema de autenticação básico

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push main + tags
git push origin main
git push origin --tags

# 5. Voltar para develop
git checkout develop
```

### **3. Validação Pré-Commit**
```bash
# Checklist obrigatório antes de commit:
☐ pnpm run type-check (sem erros)
☐ pnpm run lint (quando disponível)
☐ pnpm run test (quando disponível)
☐ Documentação atualizada
☐ TESTES-E-COMMITS.md atualizado
```

---

## 📚 Commits por Camada Clean Architecture

### **Domain Layer**
```bash
# Entidades
feat(domain): adicionar entidade User com validações
feat(domain): implementar value object CPF
feat(domain): criar entidade Donation com regras de negócio

# Value Objects
feat(domain): implementar Email value object
feat(domain): adicionar Money value object brasileiro
```

### **Application Layer**
```bash
# Use Cases
feat(application): implementar CreateUserUseCase
feat(application): adicionar AuthenticateUserUseCase
feat(application): criar GetDonationsUseCase

# Interfaces
feat(application): definir IUserRepository interface
feat(application): implementar IAuthService interface

# DTOs
feat(application): criar CreateUserDto
feat(application): adicionar CreateDonationDto
```

### **Infrastructure Layer**
```bash
# Repositories
feat(infrastructure): implementar SupabaseUserRepository
feat(infrastructure): adicionar SupabaseDonationRepository
feat(infrastructure): configurar RLS policies

# Services
feat(infrastructure): implementar SupabaseAuthService
feat(infrastructure): adicionar NotificationService

# Config
feat(infrastructure): configurar Supabase client
feat(infrastructure): setup environment variables
```

### **Presentation Layer**
```bash
# Screens
feat(presentation): implementar LoginScreen
feat(presentation): criar DashboardScreen
feat(presentation): adicionar DonationsScreen

# Components
feat(presentation): criar Button component
feat(presentation): implementar Input component
feat(presentation): adicionar Card component

# Navigation
feat(presentation): configurar React Navigation
feat(presentation): implementar NavigationStrategy
```

---

## 🧪 Integração com Testes

### **Commits de Teste**
```bash
# Testes unitários
test(application): adicionar testes CreateUserUseCase
test(infrastructure): testar SupabaseUserRepository
test(domain): validar entidade User

# Testes de integração
test(infrastructure): testar conexão Supabase
test(presentation): testar navegação entre telas

# Setup de testes
chore(test): configurar Jest e testing-library
chore(test): adicionar setup de mocks Supabase
```

### **Coverage e Quality Gates**
```bash
# Antes de cada commit
pnpm run test:coverage  # quando disponível

# Quality gates
- Coverage mínimo: 80%
- Type coverage: 100%
- Lint errors: 0
- Build success: ✅
```

---

## 📊 Tags e Releases

### **Versionamento Semântico**
```
v1.0.0 - Release inicial (MVP)
v1.1.0 - Novas funcionalidades
v1.1.1 - Bug fixes
v2.0.0 - Breaking changes
```

### **Processo de Release**
```bash
# 1. Finalizar develop
git checkout develop
git pull origin develop

# 2. Criar release branch
git checkout -b release/v1.0.0

# 3. Atualizar version no package.json
# 4. Criar tag
git tag -a v1.0.0 -m "Release v1.0.0 - MVP Igreja Oliveira

Funcionalidades:
- Sistema de autenticação hierárquico
- Dashboard personalizado por papel
- Gestão de doações/dízimos
- Clean Architecture implementada

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Merge para main e develop
git checkout main
git merge release/v1.0.0
git checkout develop
git merge release/v1.0.0

# 6. Push tags
git push origin --tags
```

---

## 🔐 Hooks e Automação

### **Pre-commit Hook (Futuro)**
```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🔍 Executando validações pré-commit..."

# Type check
echo "📝 Verificando tipos..."
pnpm run type-check || exit 1

# Lint (quando disponível)
if command -v pnpm run lint >/dev/null 2>&1; then
  echo "🧹 Executando lint..."
  pnpm run lint || exit 1
fi

# Tests (quando disponível)
if command -v pnpm run test >/dev/null 2>&1; then
  echo "🧪 Executando testes..."
  pnpm run test || exit 1
fi

echo "✅ Todas as validações passaram!"
```

### **Commit Message Template**
```bash
# .gitmessage
# <tipo>(<escopo>): <descrição>
#
# <corpo detalhado explicando o QUE e POR QUE>
#
# 🧪 Generated with [Claude Code](https://claude.ai/code)
#
# Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 📈 Métricas de Qualidade Git

### **Commits por Sprint**
- Commits pequenos e frequentes
- Máximo 200 linhas alteradas por commit
- Mensagens descritivas e padronizadas
- Testes acompanhando features

### **Branch Hygiene**
- Feature branches de vida curta (max 3 dias)
- Merge regular para develop
- Cleanup de branches remotas
- Squash de commits quando necessário

### **Documentation Sync**
- Toda mudança arquitetural = commit de docs
- STATUS.md sempre atualizado
- TESTES-E-COMMITS.md para cada etapa
- README atualizado com mudanças

---

## 🚀 Integração com GitHub (Futuro)

### **Repository Setup - PROCESSO INICIAL COMPLETO**

#### **1. Criar Repositório no GitHub**
```bash
# 1. Ir para: https://github.com/new
# 2. Repository name: igreja-oliveira-app
# 3. Description: Sistema de Gestão para Igreja Oliveira - React Native
# 4. Public/Private: Escolher conforme necessidade
# 5. NÃO inicializar com README, .gitignore ou license (já temos local)
# 6. Create repository
```

#### **2. Conectar Local ao Remoto**
```bash
# Já foi feito o setup inicial:
# ✅ git branch -M main
# ✅ git checkout -b develop

# Conectar ao remoto
git remote add origin https://github.com/jonh-dev/igreja-oliveira-app.git

# Push inicial das branches principais
git push -u origin main
git push -u origin develop
```

#### **3. Configurar Branch Protection - DESENVOLVEDOR SOLO**
```bash
# No GitHub > Settings > Branches:
# 1. Proteger APENAS 'main':
#    - ✅ Restrict pushes that create files larger than 100MB
#    - ✅ Require signed commits (opcional)
#    - ❌ NÃO proteger 'develop' (precisamos push direto)
#    - ❌ NÃO require PR reviews (projeto solo)

# 2. Configurar merge protections (opcional):
#    - ✅ Allow merge commits  
#    - ✅ Allow squash merging
#    - ✅ Allow rebase merging
```

### **GitHub Actions (Futuro)**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run type-check
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build
```

### **Pull Request Template**
```markdown
## 📋 Descrição
Breve descrição das mudanças

## ✅ Checklist
- [ ] Type check passou
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Segue Clean Architecture
- [ ] Testado manualmente

## 🧪 Como testar
Passos para testar as mudanças

## 📸 Screenshots (se aplicável)
```

---

## 🎯 Próximos Passos

### **Imediato - STATUS ATUAL**
1. ✅ Primeiro commit com estrutura atual (839c455)
2. ✅ Setup de branches (main, develop)
3. ✅ Git workflow documentado
4. 🔄 **PRÓXIMO**: Criar repositório GitHub e push inicial
5. 📝 Configurar commit template
6. 🔧 Setup de pre-commit hooks

### **Futuro**
1. 🌐 Criar repositório GitHub
2. 🤖 Configurar GitHub Actions
3. 📊 Setup de code coverage
4. 🔍 Integrar SonarQube/CodeClimate

---

**📋 Documento criado em**: 2025-01-14  
**🔄 Próxima revisão**: Após setup do repositório remoto  
**📊 Versão**: 1.0  
**👤 Responsável**: João Zanardi (jonh-dev)  

**🎯 Objetivo**: Padronizar workflow Git para desenvolvimento profissional e rastreável do sistema de gestão eclesiástica.