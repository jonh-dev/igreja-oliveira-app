import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../application/interfaces/repositories/IUserRepository';
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserRole,
} from '../../domain/entities/User';
import { supabase, supabaseAdmin, DatabaseUser } from '../config/supabase';

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

  async findByPhone(phone: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar usuário por telefone: ${error.message}`);
    }

    return data ? this.mapDatabaseUserToUser(data) : null;
  }

  async create(userData: CreateUserData): Promise<User> {
    console.log('[SupabaseUserRepository] Iniciando criação de usuário:', {
      userData,
      timestamp: new Date().toISOString()
    });

    const databaseUser = this.mapCreateUserDataToDatabase(userData);
    console.log('[SupabaseUserRepository] Dados mapeados para database:', databaseUser);

    // Use service role client for create operations to bypass RLS
    const client = supabaseAdmin || this.client;
    console.log('[SupabaseUserRepository] Usando client:', {
      isServiceRole: !!supabaseAdmin,
      clientType: supabaseAdmin ? 'supabaseAdmin' : 'regular'
    });

    console.log('[SupabaseUserRepository] Executando INSERT na tabela users...');
    const { data, error } = await client
      .from('users')
      .insert(databaseUser)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseUserRepository] ERRO ao inserir usuário:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        databaseUser
      });
      
      // Handle duplicate key error specifically
      if (error.code === '23505' && error.message.includes('users_pkey')) {
        throw new Error(`Erro ao criar usuário: duplicate key value violates unique constraint "users_pkey"`);
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    console.log('[SupabaseUserRepository] Usuário inserido com sucesso na tabela users:', {
      insertedData: data,
      hasId: !!data?.id,
      hasEmail: !!data?.email,
      hasPhone: !!data?.phone
    });

    const mappedUser = this.mapDatabaseUserToUser(data);
    console.log('[SupabaseUserRepository] Usuário mapeado para entidade:', {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      phone: mappedUser.phone,
      role: mappedUser.role
    });

    return mappedUser;
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
    const { error } = await this.client.from('users').delete().eq('id', id);

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
      query = query.range(
        params.offset,
        params.offset + (params.limit || 50) - 1
      );
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
      fullName: databaseUser.full_name,
      phone: databaseUser.phone,
      countryCode: databaseUser.country_code,
      role: this.mapDatabaseRoleToUserRole(databaseUser.role),
      createdAt: new Date(databaseUser.created_at),
      updatedAt: new Date(databaseUser.updated_at),
    };
  }

  private mapCreateUserDataToDatabase(
    userData: CreateUserData
  ): Omit<DatabaseUser, 'created_at' | 'updated_at'> {
    const baseData = {
      email: userData.email,
      full_name: userData.fullName,
      phone: userData.phone,
      country_code: userData.phone ? (userData.countryCode || '+55') : null,
      role: this.mapUserRoleToDatabaseRole(userData.role),
    };

    if (userData.id) {
      return {
        id: userData.id,
        ...baseData,
      };
    }

    return {
      id: crypto.randomUUID(),
      ...baseData,
    };
  }

  private mapUpdateUserDataToDatabase(
    userData: UpdateUserData
  ): Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>> {
    const updateData: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>> = {};

    if (userData.fullName !== undefined)
      updateData.full_name = userData.fullName;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.countryCode !== undefined)
      updateData.country_code = userData.countryCode;
    if (userData.role !== undefined)
      updateData.role = this.mapUserRoleToDatabaseRole(userData.role);

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

  private mapUserRoleToDatabaseRole(
    userRole: UserRole
  ): 'admin' | 'pastor' | 'deacon' | 'leader' | 'member' {
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
