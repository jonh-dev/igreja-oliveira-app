import { IUserRepository } from '../../application/interfaces/repositories/IUserRepository';
import { User, CreateUserData, UpdateUserData, UserRole } from '../../domain/entities/User';
import { supabase, DatabaseUser } from '../config/supabase';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error finding user by id: ${error.message}`);
    }

    return data ? this.mapToUser(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }

    return data ? this.mapToUser(data) : null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.fullName,
        role: userData.role,
        church_id: 'default-church', // TODO: Pegar church_id do contexto
        phone: userData.phone,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const updateData: Partial<DatabaseUser> = {};
    
    if (userData.fullName !== undefined) updateData.name = userData.fullName;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.phone !== undefined) updateData.phone = userData.phone;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async findAll(params?: { limit?: number; offset?: number }): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }

    return data.map(user => this.mapToUser(user));
  }

  private mapToUser(databaseUser: DatabaseUser): User {
    return {
      id: databaseUser.id,
      email: databaseUser.email,
      fullName: databaseUser.name,
      phone: databaseUser.phone || undefined,
      role: databaseUser.role as UserRole,
      createdAt: new Date(databaseUser.created_at),
      updatedAt: new Date(databaseUser.updated_at),
    };
  }
}