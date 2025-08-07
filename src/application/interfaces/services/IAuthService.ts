import { User } from '../../../domain/entities/User';

export interface AuthResult {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface IAuthService {
  authenticate(email: string, password: string): Promise<AuthResult>;
  register(email: string, password: string, fullName: string, phone?: string): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}