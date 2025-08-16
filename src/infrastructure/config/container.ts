import { IUserRepository } from '../../application/interfaces/repositories/IUserRepository';
import { IAddressRepository } from '../../application/interfaces/repositories/IAddressRepository';
import { IDonationRepository } from '../../application/interfaces/repositories/IDonationRepository';
import { IUserLeadTrackingRepository } from '../../application/interfaces/repositories/IUserLeadTrackingRepository';
import { IAuthService } from '../../application/interfaces/services/IAuthService';
import { ICEPValidationService } from '../../application/interfaces/services/ICEPValidationService';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository';
import { SupabaseAddressRepository } from '../repositories/SupabaseAddressRepository';
import { SupabaseDonationRepository } from '../repositories/SupabaseDonationRepository';
import { SupabaseUserLeadTrackingRepository } from '../repositories/SupabaseUserLeadTrackingRepository';
import { SupabaseAuthService } from '../services/SupabaseAuthService';
import { LeadTrackingService } from '../services/LeadTrackingService';
import { ViaCEPService } from '../services/ViaCEPService';
import { PhoneService } from '../services/PhoneService';
import { IPhoneService } from '../../application/interfaces/services/IPhoneService';
import { CreateUserUseCase } from '../../application/use-cases/user/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../application/use-cases/user/AuthenticateUserUseCase';
import { CreateUserLeadTrackingUseCase } from '../../application/use-cases/tracking/CreateUserLeadTrackingUseCase';
import { supabase } from './supabase';
import { CompleteUserProfileUseCase } from '../../application/use-cases/user/CompleteUserProfileUseCase';

class Container {
  private instances = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.instances.set(key, factory);
  }

  get<T>(key: string): T {
    const factory = this.instances.get(key);
    if (!factory) {
      throw new Error(`Service not registered: ${key}`);
    }
    return factory();
  }

  resolve<T>(key: string): T {
    return this.get<T>(key);
  }
}

export const container = new Container();

container.register<IUserRepository>(
  'UserRepository',
  () => new SupabaseUserRepository(supabase)
);
container.register<IAddressRepository>(
  'AddressRepository',
  () => new SupabaseAddressRepository()
);
container.register<IDonationRepository>(
  'DonationRepository',
  () => new SupabaseDonationRepository()
);
container.register<IUserLeadTrackingRepository>(
  'UserLeadTrackingRepository',
  () => new SupabaseUserLeadTrackingRepository(supabase)
);
container.register<IAuthService>(
  'AuthService',
  () => new SupabaseAuthService()
);
container.register<ICEPValidationService>(
  'CEPValidationService',
  () => new ViaCEPService()
);
container.register<IPhoneService>('PhoneService', () => new PhoneService());
container.register<LeadTrackingService>('LeadTrackingService', () => {
  const trackingRepository = container.get<IUserLeadTrackingRepository>(
    'UserLeadTrackingRepository'
  );
  return new LeadTrackingService(trackingRepository);
});
container.register<CreateUserLeadTrackingUseCase>(
  'CreateUserLeadTrackingUseCase',
  () => {
    const trackingRepository = container.get<IUserLeadTrackingRepository>(
      'UserLeadTrackingRepository'
    );
    return new CreateUserLeadTrackingUseCase(trackingRepository);
  }
);
container.register<CreateUserUseCase>('CreateUserUseCase', () => {
  const userRepository = container.get<IUserRepository>('UserRepository');
  const addressRepository =
    container.get<IAddressRepository>('AddressRepository');
  const authService = container.get<IAuthService>('AuthService');
  const cepService = container.get<ICEPValidationService>(
    'CEPValidationService'
  );
  const phoneService = container.get<IPhoneService>('PhoneService');
  const createUserLeadTrackingUseCase =
    container.get<CreateUserLeadTrackingUseCase>(
      'CreateUserLeadTrackingUseCase'
    );
  return new CreateUserUseCase(
    userRepository,
    addressRepository,
    authService,
    cepService,
    createUserLeadTrackingUseCase,
    phoneService
  );
});
container.register<CompleteUserProfileUseCase>(
  'CompleteUserProfileUseCase',
  () => {
    const userRepository = container.get<IUserRepository>('UserRepository');
    const addressRepository =
      container.get<IAddressRepository>('AddressRepository');
    const createUserLeadTrackingUseCase =
      container.get<CreateUserLeadTrackingUseCase>(
        'CreateUserLeadTrackingUseCase'
      );
    return new CompleteUserProfileUseCase(
      userRepository,
      addressRepository,
      createUserLeadTrackingUseCase
    );
  }
);
container.register<AuthenticateUserUseCase>('AuthenticateUserUseCase', () => {
  const authService = container.get<IAuthService>('AuthService');
  return new AuthenticateUserUseCase(authService);
});
