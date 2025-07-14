import { UserRole } from '../../domain/entities/User';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  role?: UserRole;
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
}