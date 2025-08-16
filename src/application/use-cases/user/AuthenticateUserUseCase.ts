import { User } from '../../../domain/entities/User';
import {
  IAuthService,
  AuthResult,
} from '../../interfaces/services/IAuthService';
import { AuthenticateUserDto } from '../../dto/CreateUserDto';

export class AuthenticateUserUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(dto: AuthenticateUserDto): Promise<AuthResult> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    return await this.authService.authenticate(email, password);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
