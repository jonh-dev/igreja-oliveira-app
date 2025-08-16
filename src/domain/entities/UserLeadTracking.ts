export interface UserLeadTracking {
  id: string;
  userId: string;

  // Primary tracking fields
  leadSource?: string; // 'organic', 'referral', 'social_media', 'event', 'paid_ads'
  leadMedium?: string; // 'website', 'whatsapp', 'instagram', 'facebook', 'google'
  leadCampaign?: string; // Specific campaign name

  // UTM parameters (for detailed campaign tracking)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;

  // Additional tracking data
  referrerUrl?: string;
  landingPage?: string;
  userAgent?: string;
  ipAddress?: string; // IPv6 compatible
  deviceType?: string; // 'mobile', 'desktop', 'tablet'
  browser?: string;
  platform?: string; // 'ios', 'android', 'web'

  // Lead tracking
  conversionType?: string; // 'registration', 'first_login', 'lead_capture'
  conversionValue?: number; // For tracking monetary conversions (future use)

  // Metadata
  trackingData?: Record<string, any>; // Flexible field for additional tracking data
  isPrimary: boolean; // Mark the primary/first tracking record

  // Timestamps
  trackedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserLeadTrackingData {
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
  isPrimary?: boolean;
}

export interface UpdateUserLeadTrackingData {
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
  isPrimary?: boolean;
}

// Analytics interfaces
export interface LeadAnalytics {
  leadSource?: string;
  leadMedium?: string;
  utmSource?: string;
  utmCampaign?: string;
  conversionType?: string;
  uniqueUsers: number;
  totalEvents: number;
  eventsLast30Days: number;
  eventsLast7Days: number;
  totalConversionValue: number;
  firstEventDate: Date;
  lastEventDate: Date;
}

export interface PhoneAnalytics {
  countryCode: string;
  totalUsers: number;
  usersWithPhone: number;
  phoneCompletionRate: number;
}

export interface ConversionAnalytics {
  leadSource?: string;
  leadMedium?: string;
  registrations: number;
  firstLogins: number;
  loginConversionRate: number;
}
