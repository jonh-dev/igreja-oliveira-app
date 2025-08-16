import { IUserLeadTrackingRepository } from '../../interfaces/repositories/IUserLeadTrackingRepository';
import {
  CreateUserLeadTrackingData,
  UserLeadTracking,
} from '../../../domain/entities/UserLeadTracking';

export interface CreateUserLeadTrackingRequest {
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

export interface CreateUserLeadTrackingResponse {
  success: boolean;
  data?: UserLeadTracking;
  error?: string;
}

export class CreateUserLeadTrackingUseCase {
  constructor(
    private userLeadTrackingRepository: IUserLeadTrackingRepository
  ) {}

  async execute(
    request: CreateUserLeadTrackingRequest
  ): Promise<CreateUserLeadTrackingResponse> {
    try {
      const trackingData: CreateUserLeadTrackingData = {
        userId: request.userId,
        leadSource: request.leadSource,
        leadMedium: request.leadMedium,
        leadCampaign: request.leadCampaign,
        utmSource: request.utmSource,
        utmMedium: request.utmMedium,
        utmCampaign: request.utmCampaign,
        utmContent: request.utmContent,
        utmTerm: request.utmTerm,
        referrerUrl: request.referrerUrl,
        landingPage: request.landingPage,
        userAgent: request.userAgent,
        ipAddress: request.ipAddress,
        deviceType: request.deviceType,
        browser: request.browser,
        platform: request.platform,
        conversionType: request.conversionType || 'registration',
        conversionValue: request.conversionValue,
        trackingData: request.trackingData,
        isPrimary: request.isPrimary || false,
      };

      const tracking =
        await this.userLeadTrackingRepository.create(trackingData);

      return {
        success: true,
        data: tracking,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao criar registro de tracking',
      };
    }
  }
}
