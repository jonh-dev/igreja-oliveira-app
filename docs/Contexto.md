# Contexto Arquitetural - Igreja Oliveira App

## 🏗️ Visão Arquitetural

O projeto segue **Clean Architecture** com foco em **tracking de leads para uso interno da igreja**. A arquitetura é dividida em camadas bem definidas:

### Camadas Principais
- **Domain**: Entidades e regras de negócio puras
- **Application**: Use Cases e interfaces de repositórios
- **Infrastructure**: Implementações concretas (Supabase, serviços)
- **Presentation**: Componentes React Native e hooks

### Tecnologias Core
- **React Native + Expo**: Framework mobile
- **TypeScript**: Tipagem estrita em todo o projeto
- **Supabase**: Backend-as-a-Service (PostgreSQL + APIs)
- **Clean Architecture**: Separação clara de responsabilidades
- **Dependency Injection**: Container customizado para injeção

## 📊 Estrutura de Banco Escalável

### Tabelas Principais
- **`users`**: Usuários da igreja com hierarquia de roles
- **`user_lead_tracking`**: Sistema escalável de tracking de leads
- **`donations`**: Doações manuais e eletrônicas unificadas
- **`addresses`**: Endereços dos membros

### Sistema de Tracking
- **Tabela separada**: `user_lead_tracking` independente de `users`
- **Campos de lead**: `lead_source`, `lead_medium`, `lead_campaign`
- **UTM parameters**: `utm_source`, `utm_medium`, `utm_campaign`, etc.
- **Device info**: `device_type`, `browser`, `platform`
- **Leads para análise de engajamento interno**: `conversion_type`, `conversion_value`
- **Metadata flexível**: `tracking_data` (JSONB)

### Analytics Views
- **`lead_analytics`**: Análise de fontes de leads
- **`phone_analytics`**: Análise de telefones por país
- **`conversion_analytics`**: Funnel de leads (registro → login)

## 🔄 Fluxo de Dados

### Tracking de Leads
1. **Captura automática**: UTM parameters, device info, referrer
2. **Eventos de conversão**: Registro, primeiro login, captura de lead
3. **Armazenamento**: Tabela `user_lead_tracking` com RLS
4. **Analytics**: Views para análise de performance

### Autenticação e Autorização
- **Row Level Security (RLS)**: Políticas granulares por role
- **Hierarquia de roles**: Admin > Pastor > Líder > Membro
- **Proteção de dados**: Acesso baseado em role do usuário

## 🎯 Funcionalidades de Tracking

### Eventos Rastreados
- **`registration`**: Primeiro registro de usuário
- **`first_login`**: Primeiro login após registro
- **`lead_capture`**: Captura genérica de leads

### Captura Automática
- **UTM Parameters**: Extraídos da URL automaticamente
- **Device Information**: Browser, plataforma, tipo de dispositivo
- **Referrer Tracking**: URL de origem do usuário
- **IP Address**: Para análise geográfica (futuro)

## 🏛️ Uso Interno da Igreja

### Objetivo Principal
O sistema de tracking é **exclusivamente para uso interno da igreja**, não para vendas ou marketing externo. Foco em:

- **Análise de engajamento**: Como os membros interagem com o app
- **Otimização de comunicação**: Melhorar canais de comunicação interna
- **Gestão de membros**: Acompanhar crescimento e participação
- **Automação futura**: Base para comunicações automatizadas

### Diferencial
- **Não é um produto**: Não há tracking de conversões de vendas
- **Foco interno**: Analytics para gestão da igreja
- **Privacidade**: Dados protegidos por RLS rigoroso
- **Escalabilidade**: Estrutura preparada para crescimento

## 🔧 Correções Implementadas

### TypeScript e Linter
- ✅ Correção de erros de tipo em repositórios
- ✅ Atualização de interfaces de banco de dados
- ✅ Simplificação de componentes UI
- ✅ Estruturação do design system

### Testes e Build
- ✅ Correção de teste de conexão Supabase
- ✅ Tratamento de variáveis de ambiente
- ✅ Build bem-sucedido sem erros
- ✅ TypeScript check sem erros

### Documentação
- ✅ Atualização de regras do projeto
- ✅ Sincronização de documentação
- ✅ Refinamento do escopo de tracking

## 📈 Próximos Passos

### Integração de Tracking
1. **Integrar tracking nas telas** de registro e login
2. **Criar dashboard de analytics** para Admin/Pastor
3. **Implementar captura de UTM parameters** na aplicação
4. **Adicionar testes unitários** para o sistema de tracking

### Melhorias de UX/UI
5. **Implementar validação em tempo real** nos formulários
6. **Criar componentes de loading** e estados de erro
7. **Adicionar feedback visual** para ações do usuário

---

**Status**: Todos os erros resolvidos ✅ - Sistema pronto para integração de tracking 