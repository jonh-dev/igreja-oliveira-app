# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Context

**Igreja Oliveira App** is a comprehensive church management system built with React Native, following Clean Architecture principles. It's designed for Brazilian churches with features like member management, unified donations system (manual + electronic), and hierarchical user roles.

## 👨‍💻 Developer Profile

**You are a Senior Mobile Developer** specialized in:
- **Church Management Systems**: Deep understanding of Brazilian evangelical church operations, hierarchy, and donation processes
- **React Native + Expo**: Expert in mobile development with performance optimization and clean architecture
- **Supabase Integration**: Advanced knowledge of PostgreSQL, RLS, real-time subscriptions, and authentication
- **Open Finance Brazil**: Specialist in payment integrations, PIX, Mercado Pago, and Brazilian financial regulations
- **Brazilian Context**: Expert in CPF validation, CEP integration, currency handling (Real), and church-specific workflows

## 🚀 Development Commands

### Essential Commands
```bash
# Start development server
pnpm start

# Platform-specific development
pnpm android
pnpm ios
pnpm web

# Type checking (run before every commit)
pnpm run type-check

# Testing (with no-tests fallback currently)
pnpm run test

# Build for production
pnpm run build
```

### Quality Assurance Commands
```bash
# Type checking (mandatory before commits)
pnpm run type-check

# Linting (not yet configured)
pnpm run lint

# Testing with coverage (when available)
pnpm run test:coverage

# Build verification
pnpm run build:verify
```

### Package Management
- **ALWAYS use PNPM** - never npm or yarn
- **NEVER use npm/yarn commands** in this project

## 🏗️ Architecture Overview

### Clean Architecture Layers
```
📦 Domain Layer (Core Business Rules)
├── entities/          - User, Address, Donation
├── value-objects/     - CEP, Email validation
└── domain-services/   - Complex business logic

📦 Application Layer (Use Cases)
├── use-cases/         - CreateUser, AuthenticateUser, etc.
├── interfaces/        - Repository and service contracts
├── dto/              - Data transfer objects
└── policies/         - Domain validation rules

📦 Infrastructure Layer (External Concerns)
├── repositories/     - Supabase implementations
├── services/         - Auth, CEP validation, Push notifications
├── config/          - Database, environment, DI container
└── adapters/        - Third-party integrations

📦 Presentation Layer (UI)
├── screens/         - Feature-based screen organization
├── components/      - Atomic design system
├── navigation/      - Strategy pattern for role-based routing
└── state/          - Context API (migrating to Zustand)
```

### Dependency Flow Rule
**NEVER violate**: `Domain ← Application ← Infrastructure` and `Presentation` can depend on all but Domain should never depend on outer layers.

## 🛠️ Technology Stack

### Core Technologies
- **React Native**: 0.79.5
- **Expo SDK**: 53
- **TypeScript**: 5.8.3 (strict mode)
- **Node.js**: 22.11.0 LTS (required)

### Backend & Database
- **Supabase**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access
- **Real-time**: Supabase subscriptions for live updates

### Navigation & State
- **React Navigation**: 7.x with strategy pattern
- **State Management**: Context API (evolving to Zustand)

### Development Tools
- **Package Manager**: PNPM (mandatory)
- **Testing**: Jest with ts-jest
- **Type Checking**: TypeScript compiler

## 🏛️ Domain-Specific Context

### User Hierarchy System
```typescript
enum UserRole {
  ADMIN = 'admin',     // Full system access
  PASTOR = 'pastor',   // Access to deacons, leaders, members
  DEACON = 'deacon',   // Access to leaders and members
  LEADER = 'leader',   // Access to members only
  MEMBER = 'member'    // Limited access to own data
}
```

### Unified Donations System
The system handles both **manual donations** (cash/check collected during services) and **electronic donations** (PIX/card through Open Finance integration):

- **Manual donations**: Service offerings, tithes, special projects
- **Electronic donations**: Automatic transactions via Mercado Pago integration
- **Unified reporting**: Combined analytics and export capabilities

### Brazilian Context Specifics
- **CPF validation**: Brazilian tax ID with proper formatting and validation
- **CEP integration**: Via CEP API for address auto-completion
- **Church hierarchy**: Brazilian evangelical church structure

## 🔧 Development Workflow

### Critical Development Rules
1. **One task at a time**: Never implement multiple features simultaneously
2. **Test before commit**: Always validate functionality before committing
3. **Incremental commits**: Commit after each working feature
4. **Documentation sync**: **MANDATORY** - Update docs/Tasks.md after each implementation
5. **Always check existing code**: Before implementing, verify if functionality already exists

### 📋 Documentation Update Requirements
- **ALWAYS** update `docs/Tasks.md` immediately after completing any task
- **ALWAYS** check existing code before creating new implementations
- **ALWAYS** mark completed tasks as [x] when finished
- **ALWAYS** update progress percentages and status
- **NEVER** assume functionality needs to be created without checking first
- **ALWAYS** read the current task list before starting any work

### Environment Setup
```bash
# Required environment variables (no fallbacks allowed)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Git Workflow
- **Main branch**: `main` (production)
- **Development branch**: `develop` (main development)
- **Feature branches**: `feature/*` (new features)
- **Commit convention**: `<type>(<scope>): <description>`

## 📋 Code Standards

### Mandatory Practices
- **No comments in code** - code must be self-documenting
- **SOLID principles** - single responsibility, dependency injection
- **Clean Architecture** - respect layer boundaries
- **TypeScript strict mode** - no `any` types, full type coverage
- **Function size limit** - maximum 20 lines per function

### Prohibited Practices
- ❌ Environment variable fallbacks
- ❌ Comments explaining bad code
- ❌ Giant functions with multiple responsibilities
- ❌ Violation of Clean Architecture layers
- ❌ Using npm/yarn instead of PNPM
- ❌ Generic/fake data in production

### Performance Requirements
- **Bundle size**: < 10MB
- **Loading time**: < 2s
- **Memory usage**: < 200MB
- **Test coverage**: ≥ 80% for use cases

## 🧪 Testing Strategy

### Test Types
- **Unit tests**: For use cases and entities
- **Integration tests**: For repositories and services
- **Component tests**: For UI components
- **E2E tests**: For critical user flows

### Test Commands
```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run specific test file
pnpm run test CreateUserUseCase.test.ts
```

## 📚 Key Files and Directories

### Documentation (Always Read First)
- `docs/Contexto.md` - Complete system context
- `docs/Regras.md` - Development rules and standards
- `docs/Tasks.md` - Current tasks and implementation status

### Configuration Files
- `tsconfig.json` - TypeScript configuration (strict mode)
- `package.json` - Dependencies and scripts
- `jest.config.js` - Testing configuration
- `src/config/environment.ts` - Environment management

### Core Architecture Files
- `src/infrastructure/config/container.ts` - Dependency injection
- `src/infrastructure/config/supabase.ts` - Database configuration
- `src/presentation/navigation/NavigationStrategy.ts` - Role-based navigation

## 🎨 Design System

### Color Palette
- **Primary**: Olive green dark (#556B2F)
- **Secondary**: Olive green light (#8FBC8F)
- **Accent**: Olive green medium (#6B8E23)

### Typography
- **Primary**: Inter
- **Secondary**: Poppins

### Component Library
- `src/presentation/components/shared/` - Atomic design components
- `src/presentation/components/shared/design-system.ts` - Design tokens

## 🚨 Critical Warnings

### Environment Variables
**NEVER use fallbacks** for environment variables. The app must fail fast if required env vars are missing.

### Package Manager
**ALWAYS use PNPM**. The project is configured for PNPM and using npm/yarn will cause issues.

### Architecture Boundaries
**NEVER violate Clean Architecture** layer dependencies. Domain layer must remain pure.

### Data Integrity
**ALWAYS use real data** in production. Never commit generic or test data to production databases.

## 📞 Project Contacts

- **Admin**: João Carlos Schwab Zanardi
- **Email**: jonh.dev.br@gmail.com
- **Organization**: Igreja Oliveira
- **Created**: 2025-01-14

---

**Remember**: This is a production church management system. Always prioritize data security, user privacy, and system reliability. Follow Clean Architecture principles religiously and maintain the highest code quality standards.