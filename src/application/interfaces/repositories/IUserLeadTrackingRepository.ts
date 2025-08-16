import {
  UserLeadTracking,
  CreateUserLeadTrackingData,
  UpdateUserLeadTrackingData,
  LeadAnalytics,
  PhoneAnalytics,
  ConversionAnalytics,
} from '../../../domain/entities/UserLeadTracking';

export interface IUserLeadTrackingRepository {
  // CRUD operations
  findById(id: string): Promise<UserLeadTracking | null>;
  findByUserId(userId: string): Promise<UserLeadTracking[]>;
  findPrimaryByUserId(userId: string): Promise<UserLeadTracking | null>;
  create(trackingData: CreateUserLeadTrackingData): Promise<UserLeadTracking>;
  update(
    id: string,
    trackingData: UpdateUserLeadTrackingData
  ): Promise<UserLeadTracking>;
  delete(id: string): Promise<void>;

  // Analytics queries
  getLeadAnalytics(filters?: {
    leadSource?: string;
    leadMedium?: string;
    utmSource?: string;
    utmCampaign?: string;
    conversionType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LeadAnalytics[]>;

  getPhoneAnalytics(): Promise<PhoneAnalytics[]>;

  getConversionAnalytics(filters?: {
    leadSource?: string;
    leadMedium?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ConversionAnalytics[]>;

  // Utility methods
  createTrackingRecord(
    data: CreateUserLeadTrackingData
  ): Promise<UserLeadTracking>;
  getPrimaryTrackingForUser(userId: string): Promise<UserLeadTracking | null>;

  // Batch operations
  createMultipleTrackingRecords(
    records: CreateUserLeadTrackingData[]
  ): Promise<UserLeadTracking[]>;
}
