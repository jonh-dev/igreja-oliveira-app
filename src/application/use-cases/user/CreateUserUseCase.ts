import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';
import { CreateUserDto } from '../../dto/CreateUserDto';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const { email, password, fullName, phone, city, neighborhood, address, role } = dto;

    // Validações de negócio
    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Registrar no serviço de autenticação
    const authResult = await this.authService.register(email, password, fullName);

    // Criar usuário no repositório
    const userData = {
      email,
      fullName,
      phone,
      city,
      neighborhood,
      address,
      role: role || UserRole.MEMBER
    };

    return await this.userRepository.create(userData);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}