import { SupabaseClient } from '@supabase/supabase-js';
import { IUserLeadTrackingRepository } from '../../application/interfaces/repositories/IUserLeadTrackingRepository';
import {
  UserLeadTracking,
  CreateUserLeadTrackingData,
  UpdateUserLeadTrackingData,
  LeadAnalytics,
  PhoneAnalytics,
  ConversionAnalytics,
} from '../../domain/entities/UserLeadTracking';
import { supabaseAdmin } from '../config/supabase';

export class SupabaseUserLeadTrackingRepository
  implements IUserLeadTrackingRepository
{
  constructor(private supabase: SupabaseClient) {}

  private mapDatabaseToEntity(dbRecord: any): UserLeadTracking {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      leadSource: dbRecord.lead_source,
      leadMedium: dbRecord.lead_medium,
      leadCampaign: dbRecord.lead_campaign,
      utmSource: dbRecord.utm_source,
      utmMedium: dbRecord.utm_medium,
      utmCampaign: dbRecord.utm_campaign,
      utmContent: dbRecord.utm_content,
      utmTerm: dbRecord.utm_term,
      referrerUrl: dbRecord.referrer_url,
      landingPage: dbRecord.landing_page,
      userAgent: dbRecord.user_agent,
      ipAddress: dbRecord.ip_address,
      deviceType: dbRecord.device_type,
      browser: dbRecord.browser,
      platform: dbRecord.platform,
      conversionType: dbRecord.conversion_type,
      conversionValue: dbRecord.conversion_value,
      trackingData: dbRecord.tracking_data,
      isPrimary: dbRecord.is_primary,
      trackedAt: new Date(dbRecord.tracked_at),
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
    };
  }

  private mapEntityToDatabase(entity: CreateUserLeadTrackingData): any {
    return {
      user_id: entity.userId,
      lead_source: entity.leadSource,
      lead_medium: entity.leadMedium,
      lead_campaign: entity.leadCampaign,
      utm_source: entity.utmSource,
      utm_medium: entity.utmMedium,
      utm_campaign: entity.utmCampaign,
      utm_content: entity.utmContent,
      utm_term: entity.utmTerm,
      referrer_url: entity.referrerUrl,
      landing_page: entity.landingPage,
      user_agent: entity.userAgent,
      ip_address: entity.ipAddress,
      device_type: entity.deviceType,
      browser: entity.browser,
      platform: entity.platform,
      conversion_type: entity.conversionType,
      conversion_value: entity.conversionValue,
      tracking_data: entity.trackingData,
      is_primary: entity.isPrimary,
    };
  }

  async findById(id: string): Promise<UserLeadTracking | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_lead_tracking')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapDatabaseToEntity(data);
    } catch (error) {
      console.error('Error finding tracking by ID:', error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<UserLeadTracking[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_lead_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('tracked_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseToEntity);
    } catch (error) {
      console.error('Error finding tracking by user ID:', error);
      return [];
    }
  }

  async findPrimaryByUserId(userId: string): Promise<UserLeadTracking | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_lead_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .order('tracked_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapDatabaseToEntity(data);
    } catch (error) {
      console.error('Error finding primary tracking by user ID:', error);
      return null;
    }
  }

  async create(
    trackingData: CreateUserLeadTrackingData
  ): Promise<UserLeadTracking> {
    try {
      const dbData = this.mapEntityToDatabase(trackingData);

      // Use service role client for create operations to bypass RLS
      const client = supabaseAdmin || this.supabase;
      const { data, error } = await client
        .from('user_lead_tracking')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tracking record:', error);
        throw new Error(`Error creating tracking record: ${JSON.stringify(error)}`);
      }

      return this.mapDatabaseToEntity(data);
    } catch (error) {
      console.error('Error creating tracking record:', error);
      throw error;
    }
  }

  async update(
    id: string,
    trackingData: UpdateUserLeadTrackingData
  ): Promise<UserLeadTracking> {
    try {
      const dbData = this.mapEntityToDatabase(
        trackingData as CreateUserLeadTrackingData
      );

      const { data, error } = await this.supabase
        .from('user_lead_tracking')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToEntity(data);
    } catch (error) {
      console.error('Error updating tracking record:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_lead_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tracking record:', error);
      throw error;
    }
  }

  async getLeadAnalytics(filters?: {
    leadSource?: string;
    leadMedium?: string;
    utmSource?: string;
    utmCampaign?: string;
    conversionType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LeadAnalytics[]> {
    try {
      let query = this.supabase.from('lead_analytics').select('*');

      if (filters?.leadSource) {
        query = query.eq('lead_source', filters.leadSource);
      }
      if (filters?.leadMedium) {
        query = query.eq('lead_medium', filters.leadMedium);
      }
      if (filters?.utmSource) {
        query = query.eq('utm_source', filters.utmSource);
      }
      if (filters?.utmCampaign) {
        query = query.eq('utm_campaign', filters.utmCampaign);
      }
      if (filters?.conversionType) {
        query = query.eq('conversion_type', filters.conversionType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((record: any) => ({
        leadSource: record.lead_source,
        leadMedium: record.lead_medium,
        utmSource: record.utm_source,
        utmCampaign: record.utm_campaign,
        conversionType: record.conversion_type,
        uniqueUsers: record.unique_users,
        totalEvents: record.total_events,
        eventsLast30Days: record.events_last_30_days,
        eventsLast7Days: record.events_last_7_days,
        totalConversionValue: record.total_conversion_value,
        firstEventDate: new Date(record.first_event_date),
        lastEventDate: new Date(record.last_event_date),
      }));
    } catch (error) {
      console.error('Error getting lead analytics:', error);
      return [];
    }
  }

  async getPhoneAnalytics(): Promise<PhoneAnalytics[]> {
    try {
      const { data, error } = await this.supabase
        .from('phone_analytics')
        .select('*');

      if (error) throw error;

      return data.map((record: any) => ({
        countryCode: record.country_code,
        totalUsers: record.total_users,
        usersWithPhone: record.users_with_phone,
        phoneCompletionRate: record.phone_completion_rate,
      }));
    } catch (error) {
      console.error('Error getting phone analytics:', error);
      return [];
    }
  }

  async getConversionAnalytics(filters?: {
    leadSource?: string;
    leadMedium?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ConversionAnalytics[]> {
    try {
      let query = this.supabase.from('conversion_analytics').select('*');

      if (filters?.leadSource) {
        query = query.eq('lead_source', filters.leadSource);
      }
      if (filters?.leadMedium) {
        query = query.eq('lead_medium', filters.leadMedium);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((record: any) => ({
        leadSource: record.lead_source,
        leadMedium: record.lead_medium,
        registrations: record.registrations,
        firstLogins: record.first_logins,
        loginConversionRate: record.login_conversion_rate,
      }));
    } catch (error) {
      console.error('Error getting conversion analytics:', error);
      return [];
    }
  }

  async createTrackingRecord(
    data: CreateUserLeadTrackingData
  ): Promise<UserLeadTracking> {
    return this.create(data);
  }

  async getPrimaryTrackingForUser(
    userId: string
  ): Promise<UserLeadTracking | null> {
    return this.findPrimaryByUserId(userId);
  }

  async createMultipleTrackingRecords(
    records: CreateUserLeadTrackingData[]
  ): Promise<UserLeadTracking[]> {
    try {
      const dbRecords = records.map(this.mapEntityToDatabase);

      const { data, error } = await this.supabase
        .from('user_lead_tracking')
        .insert(dbRecords)
        .select();

      if (error) throw error;

      return data.map(this.mapDatabaseToEntity);
    } catch (error) {
      console.error('Error creating multiple tracking records:', error);
      throw error;
    }
  }
}
