# 📋 Regras de Desenvolvimento - Igreja Oliveira App

## 🎯 Princípios Fundamentais

### **1. Clean Architecture Rigorosa**
- **Dependências**: Apenas para dentro (Domain → Application → Infrastructure → Presentation)
- **Inversão**: Interfaces no Application Layer, implementações no Infrastructure
- **Independência**: Domain Layer não pode importar de outras camadas
- **Testabilidade**: Cada camada deve ser testável independentemente

### **2. TypeScript Strict Mode**
- **Configuração**: `strict: true` no tsconfig.json
- **Tipagem**: 100% das interfaces e funções tipadas
- **Sem any**: Evitar uso de `any`, preferir `unknown` ou tipos específicos
- **Null Safety**: Usar optional chaining e nullish coalescing

### **3. Supabase como Backend Principal**
- **RLS**: Row Level Security obrigatório em todas as tabelas
- **Políticas**: Hierarquia de usuários (admin > pastor > diácono > líder > membro)
- **Validação**: Sem fallbacks mockados, sempre dados reais
- **Performance**: Indexes otimizados para consultas frequentes

### **4. React Native + Expo**
- **Versão**: Expo SDK 53 + React Native 0.79.5
- **Package Manager**: PNPM obrigatório (nunca npm/yarn)
- **TypeScript**: 5.8.3 com configuração strict
- **Navegação**: React Navigation 7.x com Strategy Pattern

---

## 🏗️ Arquitetura de Camadas

### **Domain Layer (Núcleo)**
```typescript
// ✅ CORRETO - Domain Layer
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  countryCode?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLeadTracking {
  id: string;
  userId: string;
  leadSource?: string;
  leadMedium?: string;
  leadCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerUrl?: string;
  landingPage?: string;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  browser?: string;
  platform?: string;
  conversionType?: string;
  conversionValue?: number;
  trackingData?: Record<string, any>;
  isPrimary: boolean;
  trackedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ❌ INCORRETO - Domain Layer não pode importar de outras camadas
import { SupabaseClient } from '@supabase/supabase-js'; // ❌
```

### **Application Layer (Casos de Uso)**
```typescript
// ✅ CORRETO - Application Layer
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IUserLeadTrackingRepository {
  findById(id: string): Promise<UserLeadTracking | null>;
  findByUserId(userId: string): Promise<UserLeadTracking[]>;
  create(trackingData: CreateUserLeadTrackingData): Promise<UserLeadTracking>;
  getLeadAnalytics(filters?: AnalyticsFilters): Promise<LeadAnalytics[]>;
  getPhoneAnalytics(): Promise<PhoneAnalytics[]>;
  getConversionAnalytics(filters?: ConversionFilters): Promise<ConversionAnalytics[]>;
}

export class CreateUserLeadTrackingUseCase {
  constructor(private userLeadTrackingRepository: IUserLeadTrackingRepository) {}
  
  async execute(request: CreateUserLeadTrackingRequest): Promise<CreateUserLeadTrackingResponse> {
    // Lógica de negócio aqui
  }
}
```

### **Infrastructure Layer (Implementações)**
```typescript
// ✅ CORRETO - Infrastructure Layer
export class SupabaseUserLeadTrackingRepository implements IUserLeadTrackingRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async create(trackingData: CreateUserLeadTrackingData): Promise<UserLeadTracking> {
    const dbData = this.mapEntityToDatabase(trackingData);
    const { data, error } = await this.supabase
      .from('user_lead_tracking')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapDatabaseToEntity(data);
  }
  
  async getLeadAnalytics(filters?: AnalyticsFilters): Promise<LeadAnalytics[]> {
    let query = this.supabase.from('lead_analytics').select('*');
    
    if (filters?.leadSource) {
      query = query.eq('lead_source', filters.leadSource);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(this.mapAnalyticsRecord);
  }
}
```

### **Presentation Layer (UI)**
```typescript
// ✅ CORRETO - Presentation Layer
export const useLeadTracking = () => {
  const trackingService = container.get<LeadTrackingService>('LeadTrackingService');
  
  const trackUserRegistration = useCallback(async (context: TrackingContext) => {
    return trackingService.trackUserRegistration(context);
  }, [trackingService]);
  
  return {
    trackUserRegistration,
    trackFirstLogin,
    trackFirstDonation,
    getPrimaryTracking,
    isFirstLogin,
    isFirstDonation
  };
};

export const useTrackingOnMount = (userId: string, conversionType: 'registration' | 'first_login' | 'first_donation') => {
  const { trackUserRegistration, trackFirstLogin, trackFirstDonation } = useLeadTracking();
  
  useEffect(() => {
    const trackConversion = async () => {
      try {
        const deviceInfo = detectDeviceInfo();
        const urlData = captureUrlTrackingData(window.location.href);
        
        const context: TrackingContext = {
          userId,
          ...urlData,
          ...deviceInfo,
          conversionType
        };
        
        switch (conversionType) {
          case 'registration':
            await trackUserRegistration(context);
            break;
          case 'first_login':
            const shouldTrackFirstLogin = await isFirstLogin(userId);
            if (shouldTrackFirstLogin) {
              await trackFirstLogin(context);
            }
            break;
          case 'first_donation':
            const shouldTrackFirstDonation = await isFirstDonation(userId);
            if (shouldTrackFirstDonation) {
              await trackFirstDonation(context);
            }
            break;
        }
      } catch (error) {
        console.error('Error tracking conversion:', error);
      }
    };
    
    if (userId) {
      trackConversion();
    }
  }, [userId, conversionType]);
};
```

---

## 📊 Sistema de Tracking de Leads

### **1. Estrutura de Banco Escalável**
```sql
-- Tabela separada para tracking (não na users)
CREATE TABLE public.user_lead_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Primary tracking fields
    lead_source VARCHAR(100), -- 'organic', 'referral', 'social_media', 'event', 'paid_ads'
    lead_medium VARCHAR(100), -- 'website', 'whatsapp', 'instagram', 'facebook', 'google'
    lead_campaign VARCHAR(100), -- Specific campaign name
    
    -- UTM parameters (for detailed campaign tracking)
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100), 
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Additional tracking data
    referrer_url TEXT,
    landing_page VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45), -- IPv6 compatible
    device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
    browser VARCHAR(100),
    platform VARCHAR(100), -- 'ios', 'android', 'web'
    
    -- Lead tracking
    conversion_type VARCHAR(100), -- 'registration', 'first_login', 'lead_capture'
    conversion_value DECIMAL(10,2), -- For tracking monetary conversions (future use)
    
    -- Metadata
    tracking_data JSONB, -- Flexible field for additional tracking data
    is_primary BOOLEAN DEFAULT false, -- Mark the primary/first tracking record
    
    -- Timestamps
    tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Analytics Views**
```sql
-- Lead analytics view
CREATE VIEW lead_analytics AS
SELECT 
    lt.lead_source,
    lt.lead_medium,
    lt.utm_source,
    lt.utm_campaign,
    lt.conversion_type,
    COUNT(DISTINCT lt.user_id) as unique_users,
    COUNT(*) as total_events,
    COUNT(CASE WHEN lt.tracked_at >= NOW() - INTERVAL '30 days' THEN 1 END) as events_last_30_days,
    COUNT(CASE WHEN lt.tracked_at >= NOW() - INTERVAL '7 days' THEN 1 END) as events_last_7_days,
    SUM(lt.conversion_value) as total_conversion_value,
    MIN(lt.tracked_at) as first_event_date,
    MAX(lt.tracked_at) as last_event_date
FROM public.user_lead_tracking lt
GROUP BY lt.lead_source, lt.lead_medium, lt.utm_source, lt.utm_campaign, lt.conversion_type
ORDER BY unique_users DESC;

-- Phone analytics view
CREATE VIEW phone_analytics AS
SELECT 
    u.country_code,
    COUNT(*) as total_users,
    COUNT(CASE WHEN u.phone IS NOT NULL THEN 1 END) as users_with_phone,
    ROUND(
        (COUNT(CASE WHEN u.phone IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as phone_completion_rate
FROM public.users u
GROUP BY u.country_code
ORDER BY total_users DESC;

-- Conversion funnel analytics (focused on leads only)
CREATE VIEW conversion_analytics AS
SELECT 
    lt.lead_source,
    lt.lead_medium,
    COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END) as registrations,
    COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END) as first_logins,
    ROUND(
        COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END) * 100.0 
        / NULLIF(COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END), 0), 2
    ) as login_conversion_rate
FROM public.user_lead_tracking lt
WHERE lt.conversion_type IN ('registration', 'first_login')
GROUP BY lt.lead_source, lt.lead_medium
ORDER BY registrations DESC;
```

### **3. RLS Policies para Tracking**
```sql
-- Users can view their own tracking data
CREATE POLICY "Users can view own tracking data" ON public.user_lead_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins and pastors can view all tracking data (for analytics)
CREATE POLICY "Admins and pastors can view all tracking data" ON public.user_lead_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor')
        )
    );

-- System can create tracking records (usually via backend/API)
CREATE POLICY "System can create tracking records" ON public.user_lead_tracking
    FOR INSERT WITH CHECK (true);

-- Only admins can update/delete tracking records
CREATE POLICY "Only admins can manage tracking records" ON public.user_lead_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

### **4. Uso Interno da Igreja**
- **Análise de engajamento**: Como os membros descobrem e usam o app
- **Otimização de comunicação**: Quais canais são mais efetivos
- **Relatórios para liderança**: Métricas de crescimento da comunidade
- **Automação futura**: Base para comunicações personalizadas 