import { UserRole } from '../../domain/entities/User';
import { CreateAddressDto } from './CreateAddressDto';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  address?: Omit<CreateAddressDto, 'userId'>;
  trackingData?: {
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
    deviceType?: string;
    browser?: string;
    platform?: string;
  };
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
}
