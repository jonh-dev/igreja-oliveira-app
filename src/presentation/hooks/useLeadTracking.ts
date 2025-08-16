import { useEffect, useCallback } from 'react';
import { container } from '../../infrastructure/config/container';
import {
  LeadTrackingService,
  TrackingContext,
} from '../../infrastructure/services/LeadTrackingService';

export const useLeadTracking = () => {
  const trackingService = container.get<LeadTrackingService>(
    'LeadTrackingService'
  );

  const captureUrlTrackingData = useCallback(
    (url: string) => {
      return trackingService.captureUrlTrackingData(url);
    },
    [trackingService]
  );

  const detectDeviceInfo = useCallback(() => {
    return trackingService.detectDeviceInfo();
  }, [trackingService]);

  const trackUserRegistration = useCallback(
    async (context: TrackingContext): Promise<void> => {
      return trackingService.trackUserRegistration(context);
    },
    [trackingService]
  );

  const trackFirstLogin = useCallback(
    async (context: TrackingContext): Promise<void> => {
      return trackingService.trackFirstLogin(context);
    },
    [trackingService]
  );

  const trackLead = useCallback(
    async (context: TrackingContext): Promise<void> => {
      return trackingService.trackLead(context);
    },
    [trackingService]
  );

  const getPrimaryTracking = useCallback(
    async (userId: string) => {
      return trackingService.getPrimaryTracking(userId);
    },
    [trackingService]
  );

  const isFirstLogin = useCallback(
    async (userId: string) => {
      return trackingService.isFirstLogin(userId);
    },
    [trackingService]
  );

  return {
    captureUrlTrackingData,
    detectDeviceInfo,
    trackUserRegistration,
    trackFirstLogin,
    trackLead,
    getPrimaryTracking,
    isFirstLogin,
  };
};

export const useTrackingOnMount = (
  userId: string,
  conversionType: 'registration' | 'first_login' | 'lead_capture'
) => {
  const {
    trackUserRegistration,
    trackFirstLogin,
    trackLead,
    isFirstLogin,
    detectDeviceInfo,
    captureUrlTrackingData,
  } = useLeadTracking();

  useEffect(() => {
    const trackConversion = async () => {
      try {
        const deviceInfo = detectDeviceInfo();
        const urlData = captureUrlTrackingData(window.location.href);

        const context: TrackingContext = {
          userId,
          ...urlData,
          ...deviceInfo,
          conversionType,
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
          case 'lead_capture':
            await trackLead(context);
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
