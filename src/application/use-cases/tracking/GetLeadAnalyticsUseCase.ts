import { IUserLeadTrackingRepository } from '../../interfaces/repositories/IUserLeadTrackingRepository';
import {
  LeadAnalytics,
  PhoneAnalytics,
  ConversionAnalytics,
} from '../../../domain/entities/UserLeadTracking';

export interface GetLeadAnalyticsRequest {
  leadSource?: string;
  leadMedium?: string;
  utmSource?: string;
  utmCampaign?: string;
  conversionType?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetLeadAnalyticsResponse {
  success: boolean;
  data?: {
    leadAnalytics: LeadAnalytics[];
    phoneAnalytics: PhoneAnalytics[];
    conversionAnalytics: ConversionAnalytics[];
  };
  error?: string;
}

export class GetLeadAnalyticsUseCase {
  constructor(
    private userLeadTrackingRepository: IUserLeadTrackingRepository
  ) {}

  async execute(
    request: GetLeadAnalyticsRequest
  ): Promise<GetLeadAnalyticsResponse> {
    try {
      const filters = {
        leadSource: request.leadSource,
        leadMedium: request.leadMedium,
        utmSource: request.utmSource,
        utmCampaign: request.utmCampaign,
        conversionType: request.conversionType,
        startDate: request.startDate,
        endDate: request.endDate,
      };

      const [leadAnalytics, phoneAnalytics, conversionAnalytics] =
        await Promise.all([
          this.userLeadTrackingRepository.getLeadAnalytics(filters),
          this.userLeadTrackingRepository.getPhoneAnalytics(),
          this.userLeadTrackingRepository.getConversionAnalytics({
            leadSource: request.leadSource,
            leadMedium: request.leadMedium,
            startDate: request.startDate,
            endDate: request.endDate,
          }),
        ]);

      return {
        success: true,
        data: {
          leadAnalytics,
          phoneAnalytics,
          conversionAnalytics,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao obter analytics de leads',
      };
    }
  }
}
