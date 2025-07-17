import { IUserRepository } from '../../application/interfaces/repositories/IUserRepository';
import { IAddressRepository } from '../../application/interfaces/repositories/IAddressRepository';
import { IDonationRepository } from '../../application/interfaces/repositories/IDonationRepository';
import { IAuthService } from '../../application/interfaces/services/IAuthService';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository';
import { SupabaseAddressRepository } from '../repositories/SupabaseAddressRepository';
import { SupabaseDonationRepository } from '../repositories/SupabaseDonationRepository';
import { SupabaseAuthService } from '../services/SupabaseAuthService';

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

container.register<IUserRepository>('UserRepository', () => new SupabaseUserRepository());
container.register<IAddressRepository>('AddressRepository', () => new SupabaseAddressRepository());
container.register<IDonationRepository>('DonationRepository', () => new SupabaseDonationRepository());
container.register<IAuthService>('AuthService', () => new SupabaseAuthService()); 