import { IUserLeadTrackingRepository } from '../../application/interfaces/repositories/IUserLeadTrackingRepository';
import { CreateUserLeadTrackingData } from '../../domain/entities/UserLeadTracking';
import { Platform } from 'react-native';

export interface TrackingContext {
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
}

export class LeadTrackingService {
  constructor(
    private userLeadTrackingRepository: IUserLeadTrackingRepository
  ) {}

  /**
   * Captura dados de tracking da URL atual
   */
  captureUrlTrackingData(url: string): Partial<TrackingContext> {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');

      return {
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
        utmContent: urlParams.get('utm_content') || undefined,
        utmTerm: urlParams.get('utm_term') || undefined,
        referrerUrl:
          Platform.OS === 'web'
            ? typeof document !== 'undefined'
              ? document.referrer
              : undefined
            : undefined,
        landingPage: url.split('?')[0] || undefined,
      };
    } catch (error) {
      console.error('Error capturing URL tracking data:', error);
      return {};
    }
  }

  /**
   * Detecta o tipo de dispositivo e plataforma
   */
  detectDeviceInfo(): {
    deviceType: string;
    browser: string;
    platform: string;
  } {
    try {
      let deviceType = 'mobile';
      let browser = 'react-native';
      let platform = Platform.OS;

      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.userAgent
      ) {
        const userAgent = navigator.userAgent;

        deviceType = 'desktop';
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
          deviceType = 'mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
          deviceType = 'tablet';
        }

        browser = 'unknown';
        if (userAgent.includes('Chrome')) browser = 'chrome';
        else if (userAgent.includes('Firefox')) browser = 'firefox';
        else if (userAgent.includes('Safari')) browser = 'safari';
        else if (userAgent.includes('Edge')) browser = 'edge';

        if (/Android/.test(userAgent)) platform = 'android';
        else if (/iPhone|iPad|iPod/.test(userAgent)) platform = 'ios';
        else platform = 'web';
      }

      return { deviceType, browser, platform };
    } catch (error) {
      console.error('Error detecting device info:', error);
      return {
        deviceType: 'mobile',
        browser: 'react-native',
        platform: Platform.OS,
      };
    }
  }

  /**
   * Cria um registro de tracking para registro de usuário
   */
  async trackUserRegistration(context: TrackingContext): Promise<void> {
    try {
      const deviceInfo = this.detectDeviceInfo();

      const trackingData: CreateUserLeadTrackingData = {
        userId: context.userId,
        leadSource: context.leadSource,
        leadMedium: context.leadMedium,
        leadCampaign: context.leadCampaign,
        utmSource: context.utmSource,
        utmMedium: context.utmMedium,
        utmCampaign: context.utmCampaign,
        utmContent: context.utmContent,
        utmTerm: context.utmTerm,
        referrerUrl: context.referrerUrl,
        landingPage: context.landingPage,
        userAgent:
          context.userAgent ||
          (Platform.OS === 'web' && typeof navigator !== 'undefined'
            ? navigator.userAgent
            : 'React Native App'),
        ipAddress: context.ipAddress,
        deviceType: context.deviceType || deviceInfo.deviceType,
        browser: context.browser || deviceInfo.browser,
        platform: context.platform || deviceInfo.platform,
        conversionType: 'registration',
        conversionValue: context.conversionValue,
        trackingData: context.trackingData,
        isPrimary: true, // Primeiro registro do usuário
      };

      await this.userLeadTrackingRepository.create(trackingData);
    } catch (error) {
      console.error('Error tracking user registration:', error);
    }
  }

  /**
   * Cria um registro de tracking para primeiro login
   */
  async trackFirstLogin(context: TrackingContext): Promise<void> {
    try {
      const deviceInfo = this.detectDeviceInfo();

      const trackingData: CreateUserLeadTrackingData = {
        userId: context.userId,
        leadSource: context.leadSource,
        leadMedium: context.leadMedium,
        leadCampaign: context.leadCampaign,
        utmSource: context.utmSource,
        utmMedium: context.utmMedium,
        utmCampaign: context.utmCampaign,
        utmContent: context.utmContent,
        utmTerm: context.utmTerm,
        referrerUrl: context.referrerUrl,
        landingPage: context.landingPage,
        userAgent:
          context.userAgent ||
          (Platform.OS === 'web' && typeof navigator !== 'undefined'
            ? navigator.userAgent
            : 'React Native App'),
        ipAddress: context.ipAddress,
        deviceType: context.deviceType || deviceInfo.deviceType,
        browser: context.browser || deviceInfo.browser,
        platform: context.platform || deviceInfo.platform,
        conversionType: 'first_login',
        conversionValue: context.conversionValue,
        trackingData: context.trackingData,
        isPrimary: false,
      };

      await this.userLeadTrackingRepository.create(trackingData);
    } catch (error) {
      console.error('Error tracking first login:', error);
    }
  }

  /**
   * Cria um registro de tracking genérico para leads
   */
  async trackLead(context: TrackingContext): Promise<void> {
    try {
      const deviceInfo = this.detectDeviceInfo();

      const trackingData: CreateUserLeadTrackingData = {
        userId: context.userId,
        leadSource: context.leadSource,
        leadMedium: context.leadMedium,
        leadCampaign: context.leadCampaign,
        utmSource: context.utmSource,
        utmMedium: context.utmMedium,
        utmCampaign: context.utmCampaign,
        utmContent: context.utmContent,
        utmTerm: context.utmTerm,
        referrerUrl: context.referrerUrl,
        landingPage: context.landingPage,
        userAgent:
          context.userAgent ||
          (Platform.OS === 'web' && typeof navigator !== 'undefined'
            ? navigator.userAgent
            : 'React Native App'),
        ipAddress: context.ipAddress,
        deviceType: context.deviceType || deviceInfo.deviceType,
        browser: context.browser || deviceInfo.browser,
        platform: context.platform || deviceInfo.platform,
        conversionType: context.conversionType || 'lead_capture',
        conversionValue: context.conversionValue,
        trackingData: context.trackingData,
        isPrimary: false,
      };

      await this.userLeadTrackingRepository.create(trackingData);
    } catch (error) {
      console.error('Error tracking lead:', error);
    }
  }

  /**
   * Obtém o tracking primário de um usuário
   */
  async getPrimaryTracking(userId: string): Promise<TrackingContext | null> {
    try {
      const tracking =
        await this.userLeadTrackingRepository.getPrimaryTrackingForUser(userId);

      if (!tracking) return null;

      return {
        userId: tracking.userId,
        leadSource: tracking.leadSource,
        leadMedium: tracking.leadMedium,
        leadCampaign: tracking.leadCampaign,
        utmSource: tracking.utmSource,
        utmMedium: tracking.utmMedium,
        utmCampaign: tracking.utmCampaign,
        utmContent: tracking.utmContent,
        utmTerm: tracking.utmTerm,
        referrerUrl: tracking.referrerUrl,
        landingPage: tracking.landingPage,
        userAgent: tracking.userAgent,
        ipAddress: tracking.ipAddress,
        deviceType: tracking.deviceType,
        browser: tracking.browser,
        platform: tracking.platform,
        conversionType: tracking.conversionType,
        conversionValue: tracking.conversionValue,
        trackingData: tracking.trackingData,
      };
    } catch (error) {
      console.error('Error getting primary tracking:', error);
      return null;
    }
  }

  /**
   * Verifica se é o primeiro login do usuário
   */
  async isFirstLogin(userId: string): Promise<boolean> {
    try {
      const trackingRecords =
        await this.userLeadTrackingRepository.findByUserId(userId);
      return !trackingRecords.some(
        record => record.conversionType === 'first_login'
      );
    } catch (error) {
      console.error('Error checking first login:', error);
      return false;
    }
  }
}
