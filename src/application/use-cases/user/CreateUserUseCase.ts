import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAddressRepository } from '../../interfaces/repositories/IAddressRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';
import { ICEPValidationService } from '../../interfaces/services/ICEPValidationService';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { CEP } from '../../../domain/value-objects/CEP';
import { CreateUserLeadTrackingUseCase, CreateUserLeadTrackingRequest } from '../tracking/CreateUserLeadTrackingUseCase';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly authService: IAuthService,
    private readonly cepValidationService: ICEPValidationService,
    private readonly createUserLeadTrackingUseCase: CreateUserLeadTrackingUseCase
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const { email, password, fullName, phone, role, address, trackingData } = dto;

    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (address?.zipCode) {
      const cep = CEP.create(address.zipCode);
      const cepInfo = await this.cepValidationService.validateCEP(cep.getValue());
      
      if (!cepInfo) {
        throw new Error('CEP inválido ou não encontrado');
      }

      address.city = cepInfo.localidade;
      address.neighborhood = cepInfo.bairro;
      address.state = cepInfo.uf;
    }

    const authResult = await this.authService.register(email, password, fullName, phone);

    const userData = {
      id: authResult.user.id,
      email,
      fullName,
      phone,
      role: role || UserRole.MEMBER
    };

    const user = await this.userRepository.create(userData);

    if (address) {
      const addressData = {
        userId: user.id,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country || 'Brasil',
        isDefault: true
      };

      await this.addressRepository.create(addressData);
    }

    if (trackingData) {
      const trackingRequest: CreateUserLeadTrackingRequest = {
        userId: user.id,
        leadSource: trackingData.leadSource,
        leadMedium: trackingData.leadMedium,
        leadCampaign: trackingData.leadCampaign,
        utmSource: trackingData.utmSource,
        utmMedium: trackingData.utmMedium,
        utmCampaign: trackingData.utmCampaign,
        utmContent: trackingData.utmContent,
        utmTerm: trackingData.utmTerm,
        referrerUrl: trackingData.referrerUrl,
        landingPage: trackingData.landingPage,
        userAgent: trackingData.userAgent,
        deviceType: trackingData.deviceType,
        browser: trackingData.browser,
        platform: trackingData.platform,
        conversionType: 'registration',
        isPrimary: true
      };

      await this.createUserLeadTrackingUseCase.execute(trackingRequest);
    }

    return user;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}