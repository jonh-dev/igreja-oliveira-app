import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAddressRepository } from '../../interfaces/repositories/IAddressRepository';
import { User, UserRole } from '../../../domain/entities/User';
import {
  CreateUserLeadTrackingUseCase,
  CreateUserLeadTrackingRequest,
} from '../tracking/CreateUserLeadTrackingUseCase';

export interface CompleteUserProfileRequest {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  address?: {
    street: string;
    number?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  trackingData?: Omit<
    CreateUserLeadTrackingRequest,
    'userId' | 'conversionType' | 'isPrimary'
  > & {
    conversionType?: CreateUserLeadTrackingRequest['conversionType'];
    isPrimary?: boolean;
  };
}

export class CompleteUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly createUserLeadTrackingUseCase: CreateUserLeadTrackingUseCase
  ) {}

  async execute(req: CompleteUserProfileRequest): Promise<User> {
    console.log('🏗️ DEBUG - CompleteUserProfileUseCase iniciado:', {
      userId: req.userId,
      email: req.email,
      fullName: req.fullName,
      phone: req.phone,
      hasAddress: !!req.address,
      address: req.address,
    });

    console.log('👤 DEBUG - Criando usuário na tabela public.users...');
    const user = await this.userRepository.create({
      id: req.userId,
      email: req.email,
      fullName: req.fullName,
      phone: req.phone,
      role: req.role || UserRole.MEMBER,
      countryCode: '+55',
    });
    console.log('✅ DEBUG - Usuário criado:', user);

    if (req.address) {
      console.log('🏠 DEBUG - Criando endereço...', req.address);
      const address = await this.addressRepository.create({
        userId: user.id,
        street: req.address.street,
        number: req.address.number,
        neighborhood: req.address.neighborhood,
        city: req.address.city,
        state: req.address.state,
        zipCode: req.address.zipCode,
        country: req.address.country || 'Brasil',
        isDefault: true,
      });
      console.log('✅ DEBUG - Endereço criado:', address);
    } else {
      console.log('⚠️ DEBUG - Nenhum endereço para criar');
    }

    if (req.trackingData) {
      await this.createUserLeadTrackingUseCase.execute({
        userId: user.id,
        leadSource: req.trackingData.leadSource,
        leadMedium: req.trackingData.leadMedium,
        leadCampaign: req.trackingData.leadCampaign,
        utmSource: req.trackingData.utmSource,
        utmMedium: req.trackingData.utmMedium,
        utmCampaign: req.trackingData.utmCampaign,
        utmContent: req.trackingData.utmContent,
        utmTerm: req.trackingData.utmTerm,
        referrerUrl: req.trackingData.referrerUrl,
        landingPage: (req.trackingData as any).landingPage,
        userAgent: req.trackingData.userAgent,
        deviceType: req.trackingData.deviceType,
        browser: req.trackingData.browser,
        platform: req.trackingData.platform,
        conversionType: req.trackingData.conversionType || 'registration',
        isPrimary: req.trackingData.isPrimary ?? true,
      });
    }

    return user;
  }
}
