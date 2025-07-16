import { UserRole } from '../../domain/entities/User';
import { CreateAddressDto } from './CreateAddressDto';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  address?: Omit<CreateAddressDto, 'userId'>;
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
}