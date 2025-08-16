import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAddressRepository } from '../../interfaces/repositories/IAddressRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';
import { ICEPValidationService } from '../../interfaces/services/ICEPValidationService';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { CEP } from '../../../domain/value-objects/CEP';
import {
  CreateUserLeadTrackingUseCase,
  CreateUserLeadTrackingRequest,
} from '../tracking/CreateUserLeadTrackingUseCase';
import { IPhoneService } from '../../interfaces/services/IPhoneService';
import { Phone } from '../../../domain/value-objects/Phone';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly authService: IAuthService,
    private readonly cepValidationService: ICEPValidationService,
    private readonly createUserLeadTrackingUseCase: CreateUserLeadTrackingUseCase,
    private readonly phoneService: IPhoneService
  ) { }

  async execute(dto: CreateUserDto): Promise<User> {
    console.log('[CreateUserUseCase] Iniciando criação de usuário:', {
      email: dto.email,
      fullName: dto.fullName,
      hasPhone: !!dto.phone,
      hasAddress: !!dto.address,
      role: dto.role,
      timestamp: new Date().toISOString()
    });

    const { email, password, fullName, phone, role, address, trackingData } =
      dto;

    if (!email || !password || !fullName) {
      console.log('[CreateUserUseCase] ERRO: Campos obrigatórios ausentes:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasFullName: !!fullName
      });
      throw new Error('Email, password, and full name are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('[CreateUserUseCase] Email normalizado:', {
      original: email,
      normalized: normalizedEmail
    });

    if (!this.isValidEmail(normalizedEmail)) {
      console.log('[CreateUserUseCase] ERRO: Formato de email inválido:', { email: normalizedEmail });
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      console.log('[CreateUserUseCase] ERRO: Senha muito curta:', { length: password.length });
      throw new Error('Password must be at least 6 characters long');
    }

    console.log('[CreateUserUseCase] Verificando se email já existe...');
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      console.log('[CreateUserUseCase] ERRO: Email já existe:', {
        email: normalizedEmail,
        existingUserId: existingUser.id
      });
      throw new Error('User with this email already exists');
    }
    console.log('[CreateUserUseCase] Email disponível para uso');

    let normalizedPhone: string | undefined = undefined;
    if (phone) {
      console.log('[CreateUserUseCase] Processando telefone:', { originalPhone: phone });
      const phoneVO = Phone.create(phone);
      if (!phoneVO) {
        console.log('[CreateUserUseCase] ERRO: Formato de telefone inválido:', { phone });
        throw new Error('Invalid phone format');
      }
      normalizedPhone = phoneVO.getValue();
      console.log('[CreateUserUseCase] Telefone normalizado:', {
        original: phone,
        normalized: normalizedPhone
      });

      console.log('[CreateUserUseCase] Verificando disponibilidade do telefone...');
      const available = await this.phoneService.isPhoneAvailable(normalizedPhone);
      if (!available) {
        console.log('[CreateUserUseCase] ERRO: Telefone já existe:', { phone: normalizedPhone });
        throw new Error('User with this phone already exists');
      }
      console.log('[CreateUserUseCase] Telefone disponível para uso');
    } else {
      console.log('[CreateUserUseCase] Nenhum telefone fornecido');
    }

    if (address?.zipCode) {
      console.log('[CreateUserUseCase] Validando CEP:', { zipCode: address.zipCode });
      const cep = CEP.create(address.zipCode);
      const cepInfo = await this.cepValidationService.validateCEP(
        cep.getValue()
      );

      if (!cepInfo) {
        console.log('[CreateUserUseCase] ERRO: CEP inválido:', { zipCode: address.zipCode });
        throw new Error('CEP inválido ou não encontrado');
      }

      console.log('[CreateUserUseCase] CEP válido, atualizando dados do endereço:', {
        zipCode: address.zipCode,
        cidade: cepInfo.localidade,
        bairro: cepInfo.bairro,
        estado: cepInfo.uf
      });

      address.city = cepInfo.localidade;
      address.neighborhood = cepInfo.bairro;
      address.state = cepInfo.uf;
    }

    console.log('[CreateUserUseCase] Criando usuário no sistema de autenticação...');

    let userData: {
      id: string;
      email: string;
      fullName: string;
      phone?: string;
      role: UserRole;
    };
    let user: User;

    try {
      const authResult = await this.authService.register(
        normalizedEmail,
        password,
        fullName,
        normalizedPhone
      );

      console.log('[CreateUserUseCase] Usuário criado no auth com sucesso:', {
        userId: authResult.user.id,
        email: authResult.user.email,
        fullName: authResult.user.fullName,
        phone: authResult.user.phone,
        hasToken: !!authResult.token
      });

      userData = {
        id: authResult.user.id,
        email: normalizedEmail,
        fullName,
        phone: normalizedPhone,
        role: role || UserRole.MEMBER,
      };

      console.log('[CreateUserUseCase] Dados para criação na tabela users:', userData);
      try {
        console.log('[CreateUserUseCase] Criando usuário na tabela public.users...');
        user = await this.userRepository.create(userData);
        console.log('[CreateUserUseCase] Usuário criado na tabela users com sucesso:', {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        });
      } catch (error: any) {
        console.log('[CreateUserUseCase] ERRO ao criar usuário na tabela users:', {
          error: error.message,
          userData
        });

        if (error.message.includes('duplicate key value violates unique constraint "users_pkey"')) {
          console.log('[CreateUserUseCase] Tentando encontrar usuário existente...');
          const existingUser = await this.userRepository.findById(authResult.user.id);
          if (existingUser) {
            console.log('[CreateUserUseCase] Usuário existente encontrado:', {
              id: existingUser.id,
              email: existingUser.email,
              phone: existingUser.phone
            });
            user = existingUser;
          } else {
            console.log('[CreateUserUseCase] ERRO: Usuário não encontrado após erro de chave duplicada');
            throw new Error('Erro ao criar usuário: usuário já existe mas não foi encontrado');
          }
        } else {
          throw error;
        }
      }

      if (address) {
        console.log('[CreateUserUseCase] Criando endereço do usuário...');
        const addressData = {
          userId: user.id,
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country || 'Brasil',
          isDefault: true,
        };

        console.log('[CreateUserUseCase] Dados para criação do endereço:', addressData);

        try {
          const createdAddress = await this.addressRepository.create(addressData);
          console.log('[CreateUserUseCase] Endereço criado com sucesso:', {
            id: createdAddress.id,
            userId: createdAddress.userId,
            street: createdAddress.street,
            city: createdAddress.city,
            zipCode: createdAddress.zipCode,
            isDefault: createdAddress.isDefault
          });
        } catch (addressError: any) {
          console.error('[CreateUserUseCase] ERRO ao criar endereço:', {
            error: addressError.message,
            addressData,
            userId: user.id
          });
          console.warn('Warning: Failed to create address for user:', addressError.message);
        }
      } else {
        console.log('[CreateUserUseCase] Nenhum endereço fornecido para criação');
      }
    } catch (authError: any) {
      console.error('[CreateUserUseCase] ERRO durante criação no sistema de autenticação:', {
        error: authError.message,
        email: normalizedEmail,
        phone: normalizedPhone
      });
      throw authError;
    }

    if (trackingData) {
      const trackingRequest: CreateUserLeadTrackingRequest = {
        userId: userData.id,
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
        isPrimary: true,
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
