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

### **1. Branch Strategy**
```bash
# Criar feature branch
git checkout -b feature/supabase-repositories

# Trabalhar na feature
git add .
git commit -m "feat(infrastructure): implementar UserRepository"

# Merge para develop
git checkout develop
git merge feature/supabase-repositories

# Delete feature branch
git branch -d feature/supabase-repositories
```

### **2. Processo de Commit**
```bash
# 1. Verificar status
git status

# 2. Validar qualidade (OBRIGATÓRIO)
pnpm run type-check
pnpm run lint      # quando configurado
pnpm run test      # quando configurado

# 3. Adicionar arquivos
git add .

# 4. Commit com mensagem padrão
git commit -m "feat(infrastructure): configurar Supabase

- Adicionar cliente Supabase com configuração mobile
- Implementar interfaces TypeScript para Database
- Configurar autoRefresh e persistSession
- Adicionar types para User e Donation tables

🧪 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
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

### **Repository Setup**
```bash
# Quando criar repositório remoto
git remote add origin https://github.com/jonh-dev/igreja-oliveira-app.git
git branch -M main
git push -u origin main
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

### **Imediato**
1. ✅ Primeiro commit com estrutura atual
2. 🔄 Setup de branches (develop, feature/*)
3. 📝 Configurar commit template
4. 🔧 Setup de pre-commit hooks

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