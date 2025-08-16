import {
  User,
  CreateUserData,
  UpdateUserData,
} from '../../../domain/entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(params?: { limit?: number; offset?: number }): Promise<User[]>;
}
