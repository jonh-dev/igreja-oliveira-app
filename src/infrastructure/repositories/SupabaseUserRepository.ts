import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../application/interfaces/repositories/IUserRepository';
import { User, CreateUserData, UpdateUserData, UserRole } from '../../domain/entities/User';
import { supabase, DatabaseUser } from '../config/supabase';

export class SupabaseUserRepository implements IUserRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = supabase) {
    this.client = client;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar usuário por ID: ${error.message}`);
    }

    return data ? this.mapDatabaseUserToUser(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }

    return data ? this.mapDatabaseUserToUser(data) : null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const databaseUser = this.mapCreateUserDataToDatabase(userData);

    const { data, error } = await this.client
      .from('users')
      .insert(databaseUser)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return this.mapDatabaseUserToUser(data);
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const databaseUser = this.mapUpdateUserDataToDatabase(userData);

    const { data, error } = await this.client
      .from('users')
      .update(databaseUser)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return this.mapDatabaseUserToUser(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  async findAll(params?: { limit?: number; offset?: number }): Promise<User[]> {
    let query = this.client.from('users').select('*');

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, (params.offset + (params.limit || 50) - 1));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return data.map(this.mapDatabaseUserToUser);
  }

  private mapDatabaseUserToUser(databaseUser: DatabaseUser): User {
    return {
      id: databaseUser.id,
      email: databaseUser.email,
      fullName: databaseUser.name,
      phone: databaseUser.phone,
      role: this.mapDatabaseRoleToUserRole(databaseUser.role),
      createdAt: new Date(databaseUser.created_at),
      updatedAt: new Date(databaseUser.updated_at),
    };
  }

  private mapCreateUserDataToDatabase(userData: CreateUserData): Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'> {
    return {
      email: userData.email,
      name: userData.fullName,
      phone: userData.phone,
      role: this.mapUserRoleToDatabaseRole(userData.role),
      church_id: 'default', // TODO: Implementar lógica de church_id
      cpf: undefined,
    };
  }

  private mapUpdateUserDataToDatabase(userData: UpdateUserData): Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>> {
    const updateData: any = {};

    if (userData.fullName !== undefined) updateData.name = userData.fullName;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.role !== undefined) updateData.role = this.mapUserRoleToDatabaseRole(userData.role);

    return updateData;
  }

  private mapDatabaseRoleToUserRole(databaseRole: string): UserRole {
    switch (databaseRole) {
      case 'admin':
        return UserRole.ADMIN;
      case 'pastor':
        return UserRole.PASTOR;
      case 'deacon':
        return UserRole.DEACON;
      case 'leader':
        return UserRole.LEADER;
      case 'member':
        return UserRole.MEMBER;
      default:
        throw new Error(`Role inválida: ${databaseRole}`);
    }
  }

  private mapUserRoleToDatabaseRole(userRole: UserRole): 'admin' | 'pastor' | 'deacon' | 'leader' | 'member' {
    switch (userRole) {
      case UserRole.ADMIN:
        return 'admin';
      case UserRole.PASTOR:
        return 'pastor';
      case UserRole.DEACON:
        return 'deacon';
      case UserRole.LEADER:
        return 'leader';
      case UserRole.MEMBER:
        return 'member';
      default:
        throw new Error(`Role inválida: ${userRole}`);
    }
  }
}